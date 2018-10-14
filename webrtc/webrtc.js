const utils = require('frappejs/utils');
const frappe = require('frappejs');
const turnConfig = require('./turn.config');

module.exports = class WebRTC {
    constructor(socket) {
        this.dataChannels = {};
        this.connections = {};
        this.pendingRequests = {};
        this.masterNode;
        this.uniqueId;
        this.socket = socket;
        this.iceServers = {
            'iceServers': [{
                    'url': 'stun:stun.services.mozilla.com'
                }, 
                {
                    'url': 'stun:stun.l.google.com:19302'
                }, 
                {
                    url: turnConfig.url, 
                    username: turnConfig.username, 
                    credential: turnConfig.password
                }
            ]
        };
        this.connectionHandlers();
    }

    startServer(name) {
        frappe.getSingle('ServerSettings').then(serverSettings => {
            let key = undefined;
            if (serverSettings != undefined) {
                key = serverSettings.serverKey
            }
            this.socket.emit('startServer', { name:name, key:key, socketID:this.uniqueId });
        });
    }

    stopServer(name) {
        frappe.getSingle('ServerSettings').then(serverSettings => {
            let key = undefined;
            if (serverSettings != undefined) {
                key = serverSettings.serverKey
            }
            this.socket.emit('stopServer', { name:name, key:key, socketID:this.uniqueId });
        });
    }

    startConnection(masterName) {
        this.socket.emit('create', masterName);
    }

    stopConnection() {
        var stop = JSON.stringify({
            type: 'stop', 
            id: this.uniqueId
        });
        this.sendData(stop, this.masterNode);
        this.removeConnection(this.masterNode);
    }

    changeHandler() {
        frappe.db.on('change', data => {
            this.sendEvent(data[0].doctype, data[0].name);
        });
    }

    connectionStarted() {
        this.changeHandler();
        localStorage.serverStatus = 'on';
        if (typeof this.onServerResponse === 'function') {
            this.onServerResponse('on');
        }
    }

    connectionStopped() {
        localStorage.serverStatus = 'off';
        var stop = JSON.stringify({
            type: 'stop', 
            id: this.uniqueId
        });
        for (var clientID in this.connections) {
            if (this.connections.hasOwnProperty(clientID)) {
                this.sendData(stop, clientID);
                this.removeConnection(clientID);
            }
        }
        if (typeof this.onServerResponse === 'function') {
            this.onServerResponse('off');
        }
    }

    serverExists() {
        frappe.throw('The server name already exists.');
        if (typeof this.onServerResponse === 'function') {
            this.onServerResponse('exists');
        }
    }

    incorrectCredential() {
        frappe.throw('You are not authorized to perform this action.', 'ValidationError');
        if (typeof this.onServerResponse === 'function') {
            this.onServerResponse('incorrect');
        }
    }

    newConnection() {
        var settings = frappe.newDoc({
            doctype: 'ServerSettings', 
            serverName: event.name, 
            serverKey: event.key
        });
        settings.insert().then(doc => {
            this.changeHandler();
            localStorage.serverStatus = 'on';
            if (typeof this.onServerResponse === 'function') {
                this.onServerResponse('new');
            }
        });
    }

    serverResponseHandlers() {
        var that = this;
        this.socket.on('serverResponse', function(event) {
            if (event.res == 'started') {
                that.connectionStarted();
            } else if (event.res == 'stopped') {
                that.connectionStopped();
            } else if (event.res == 'exists') {
                that.serverExists();
            } else if (event.res == 'incorrect') {
                that.incorrectCredential();
            } else if (event.res == 'new') {
                that.newConnection();
            }
        });
    }

    connectionHandlers() {
        var that = this;
        this.serverResponseHandlers();
        
        this.socket.on('giveID', function(id) {
            that.uniqueId = id;
            if (typeof that.getUniqueId === "function") {
                that.getUniqueId(id);
            }
        });

        this.socket.on('created', function(creatorID) {
            if (creatorID == 'fail') {
                that.onConnectionResponse('fail');
                frappe.throw('The server is not live or does not exist.');
            } else {
                that.setupConnection(creatorID);
                that.socket.emit('join', creatorID);
            }
        });

        this.socket.on('joined', function(masterID) {
            that.masterNode = masterID;
            that.setupConnection(masterID);
            that.socket.emit('ready', masterID);
        });

        this.socket.on('createOffer', function(creatorID) {
            that.masterNode = creatorID;
            that.createOffer(creatorID).then(offer => {
                that.socket.emit('offer', {creatorID:creatorID, offer:offer});
            });
        });

        this.socket.on('sendOffer', function(event) {
            that.createAnswer(event.offer, event.id).then(answer => {
                that.socket.emit('answer', {masterID:event.id, answer: answer});
            });
        });

        this.socket.on('sendAnswer', function(event) {
            that.setHostRemote(event.answer, event.id);
        });

        this.socket.on('candidate', function(event) {
            var candidate = new RTCIceCandidate({
                sdpMLineIndex: event.event.label, 
                candidate: event.event.candidate
            });
            that.connections[event.id].addIceCandidate(candidate);
        });
    }

    setupConnection(id) {
        this.connections[id] = new RTCPeerConnection(this.iceServers);
        this.createDataChannel(id);
        this.onIceCandidate(id);
    }

    onIceCandidate(socketID) {
        this.connections[socketID].onicecandidate = event => {
            if (event.candidate) {
                this.socket.emit('candidate', {
                    label: event.candidate.sdpMLineIndex, 
                    id: event.candidate.sdpMid, 
                    candidate: event.candidate.candidate, 
                    socketID: socketID
                });
            }
        }
    }

    async createOffer(id) {
        return await this.connections[id].createOffer()
        .then(desc => {
            this.connections[id].setLocalDescription(desc);
            return desc;
        })
        .catch(e => console.log(e));
    }

    async createAnswer(offer, id) {
        this.connections[id].setRemoteDescription(new RTCSessionDescription(offer));
        return await this.connections[id].createAnswer()
            .then(desc => {
                this.connections[id].setLocalDescription(desc);
                return desc;
            })
            .catch(e => console.log(e));
    }

    setHostRemote(answer, id) {
        this.connections[id].setRemoteDescription(new RTCSessionDescription(answer));
    }

    createDataChannel(id) {
        var that = this;
        this.dataChannels[id] = this.connections[id].createDataChannel("myDataChannel");
        this.dataChannels[id].onerror = function (error) {
            frappe.throw(error);
            if (typeof that.onConnectionResponse === 'function') {
                that.onConnectionResponse(false);
            }
        };
        this.dataChannels[id].onopen = function () {
            if (typeof that.onConnectionResponse === 'function') {
                that.onConnectionResponse(true);
            }
        };
        this.dataChannels[id].onclose = function () {
            if (typeof that.onConnectionResponse === 'function') {
                that.onConnectionResponse(false);
            }
        };
        this.setupReceiver(id);
    }

    setupReceiver(id) {
        this.connections[id].ondatachannel = event => {
            const receiveChannel = event.channel;
            receiveChannel.onmessage = async packet => {
                try {
                    var message = JSON.parse(packet.data);
                } catch(e) {
                    var message = packet.data;
                }
                if (message.type === 'authReq') {
                    this.verifyClient(message.email, message.password, message.clientID);
                } else if (message.type === 'authRes') {
                    if (message.allow) {
                        if (typeof this.onAccessResponse === 'function') {
                            this.onAccessResponse(true);
                        }
                    } else {
                        frappe.throw('You are not authorized to connect with this server.', 'ValidationError');
                        if (typeof this.onAccessResponse === 'function') {
                            this.onAccessResponse(false);
                        }
                    }
                } else if (message.type == 'stop') {
                    this.removeConnection(message.id);
                } else if (message.type === 'request') {
                    const method = message.method;
                    const response = await frappe.db[method](...message.payload);
                    this.sendResponse(message.senderID, message._uid, response);
                } else if (message.type === 'response') {
                    frappe.events.trigger(`responseFor:${message._uid}`, message.payload);
                } else if (message.type === 'event') {
                    frappe.db.trigger(`change:${message.doctype}`, { name:message.name }, 500);
                    frappe.db.trigger(`change`, { doctype:message.doctype, name:message.name }, 500);
                } else {
                    if (typeof this.onDataReceive === 'function') {
                        this.onDataReceive(message);
                    }
                }
            }
        }
    }

    requestAccess(email, password) {
        var payload = JSON.stringify({
            type: 'authReq', 
            email: email, 
            password: password, 
            clientID: this.uniqueId
        });
        this.sendData(payload);
    }

    verifyClient(email, password, clientID) {
        var positive = JSON.stringify({
            type: 'authRes', 
            allow: true
        });
        var negative = JSON.stringify({
            type: 'authRes', 
            allow: false 
        });
        var stop = JSON.stringify({
            type: 'stop', 
            id: this.uniqueId
        });

        frappe.getDoc('User', email).then(userInfo => {
            if (userInfo.password == password) {
                this.sendData(positive, clientID);
            } else {
                this.sendData(negative, clientID);
                this.sendData(stop, clientID);
                this.removeConnection(clientID);
            }
        })
        .catch(error => {
            this.sendData(negative, clientID);
            this.sendData(stop, clientID);
            this.removeConnection(clientID);
        });
    }

    sendData(data, receiver = this.masterNode) {
        this.dataChannels[receiver].send(data);
    }

    sendRequest(obj) {
        const uid = utils.getRandomString();
        obj._uid = uid;
        obj.senderID = this.uniqueId;
        obj.type = 'request';
        const data = JSON.stringify(obj);
        return new Promise((resolve, reject) => {
            this.sendData(data);
            frappe.events.on(`responseFor:${uid}`, response => {
                resolve(response);
            });
        });
    }

    sendResponse(senderID, uid, response) {
        const data = JSON.stringify({
            payload: response, 
            _uid: uid, 
            type: 'response'
        });
        this.sendData(data, senderID);
    }

    sendEvent(doctype, name) {
        const data = JSON.stringify({
            doctype: doctype, 
            name: name, 
            type: 'event'
        });
        for (var clientID in this.connections) {
            if (this.connections.hasOwnProperty(clientID)) {
                this.sendData(data, clientID);
            }
        }
    }

    removeConnection(id) {
        if (this.dataChannels[id] && this.connections[id]) {
            this.dataChannels[id].close();
            this.connections[id].close();
            delete this.dataChannels[id];
            delete this.connections[id];
        }
    }
}