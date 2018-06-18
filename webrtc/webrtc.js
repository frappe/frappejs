module.exports = class WebRTC {

    constructor(){
        this.dataChannels = {};
        this.connections = {};
        this.masterNode;
        this.clientNode;
        this.iceServers = {
            'iceServers': [{
                    'url': 'stun:stun.services.mozilla.com'
                },
                {
                    'url': 'stun:stun.l.google.com:19302'
                }
            ]
        };
        this.setupSocketHandlers(this);
    }

    initConnection(masterID){
        this.masterNode = masterID;
        socket.emit('create', masterID);
    }

    setupSocketHandlers(that){
        socket.on('giveID',function(id){
            that.clientNode = id;
            if (typeof that.getUniqueId === "function"){
                that.getUniqueId(id);
            }
        });
        
        socket.on('created',function(creatorID){
            console.log('to master');
            that.setupConnection(creatorID);
            socket.emit('join',creatorID);
        });

        socket.on('joined', function(masterID) {
            console.log('to creator');
            that.setupConnection(masterID);
            socket.emit('ready',masterID);
        });

        socket.on('createOffer',function(creatorID){
            that.createOffer(that,creatorID).then(offer => {
                socket.emit('offer',{creatorID:creatorID, offer:offer});
            });
        });

        socket.on('sendOffer',function(event) {
            that.createAnswer(that,event.offer,event.id).then(answer => {
                socket.emit('answer',{masterID:event.id, answer: answer});
            });
        });

        socket.on('sendAnswer', function(event){
            that.setHostRemote(event.answer,event.id);
        });

        socket.on('candidate', function (event) {
            var candidate = new RTCIceCandidate({
                sdpMLineIndex: event.event.label,
                candidate: event.event.candidate
            });
            that.connections[event.id].addIceCandidate(candidate);
        });
    }

    setupConnection(id){
        this.connections[id] = new RTCPeerConnection(this.iceServers);
        this.createDataChannel(id);
        this.onIceCandidate(id);
    }

    onIceCandidate(socketID){
        this.connections[socketID].onicecandidate = event => {
            if (event.candidate) {
                socket.emit('candidate', {
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate,
                    socketID: socketID
                });
            }
        }
    }

    async createOffer(that,id) {
        return await this.connections[id].createOffer()
        .then(desc => {
            that.connections[id].setLocalDescription(desc);
            return desc;
        })
        .catch(e => console.log(e));
    }

    async createAnswer(that,offer,id) {
        this.connections[id].setRemoteDescription(new RTCSessionDescription(offer));
    
        return await this.connections[id].createAnswer()
            .then(desc => {
                that.connections[id].setLocalDescription(desc);
                return desc;
            })
            .catch(e => console.log(e));
    }

    setHostRemote(answer,id){
        this.connections[id].setRemoteDescription(new RTCSessionDescription(answer));
    }

    createDataChannel(id){
        this.dataChannels[id] = this.connections[id].createDataChannel("myDataChannel");
    
        this.dataChannels[id].onerror = function (error) {
            console.log("Data Channel Error:", error);
        };
        
        this.dataChannels[id].onopen = function () {
            console.log("The Data Channel is Open");
        };
        
        this.dataChannels[id].onclose = function () {
            console.log("The Data Channel is Closed");
        };

        this.setupReceiver(id);
    }

    setupReceiver(id){
        this.connections[id].ondatachannel = event => {
            const receiveChannel = event.channel;
            receiveChannel.onmessage = message => {
                try{
                    var data = JSON.parse(message.data);
                }
                catch(e){
                    var data = message.data;
                }                
                console.log(message.data);
                if(data.webrtcAuth){
                    var payload = data.webrtcAuth;
                    console.log(payload);
                    if(payload.type === 'req'){
                        this.verifyClient(payload.email, payload.password, payload.clientID);
                    }
                    else if(payload.type === 'res'){
                        if(payload.allow){
                            if(typeof this.onAccessResponse === 'function'){
                                this.onAccessResponse(true);
                            }
                        }
                        else{
                            if(typeof this.onAccessResponse === 'function'){
                                this.onAccessResponse(false);
                            }
                        }
                    }
                }
                else{
                    if(typeof this.onDataReceive === 'function'){
                        this.onDataReceive(message.data);
                    }
                }
            }
        }
    }

    requestAccess(email,password){
        var payload = JSON.stringify({
            webrtcAuth:{
                type: 'req',
                email: email,
                password: password,
                clientID: this.clientNode
            }
        });

        this.sendData(payload);
    }

    verifyClient(email, password, clientID){
        var positive = JSON.stringify({
            webrtcAuth:{
                type: 'res',
                allow: true 
            }
        });

        var negative = JSON.stringify({
            webrtcAuth:{
                type: 'res',
                allow: false 
            }
        });

        if(email && password) {
            frappe.session = {};
            frappe.login(email, password).then(() => {
                if (frappe.session.token) {
                    this.sendData(positive, clientID);
                }
    
                else{
                    this.sendData(negative, clientID);
                    delete this.connections[clientID];
                    delete this.dataChannels[clientID];
                }
            }); 
        }
        else{
            this.sendData(negative, clientID);
            delete this.connections[clientID];
            delete this.dataChannels[clientID];
        }
    }

    addClient(email, username, password){
        return frappe.signup(email, password, username).then(res => {
            if (res.status && res.status !== 200) {
                return false;
            }
            else{
                return true;
            }
        });
    }

    sendData(data,receiver = this.masterNode){
        this.dataChannels[receiver].send(data);
    }
}