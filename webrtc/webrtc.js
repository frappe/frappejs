module.exports = class WebRTC {

    constructor(){
        this.iceServers = {
            'iceServers': [{
                    'url': 'stun:stun.services.mozilla.com'
                },
                {
                    'url': 'stun:stun.l.google.com:19302'
                }
            ]
        };
        
        this.rtcPeerConnection = new RTCPeerConnection(this.iceServers);
    }   

    async createOffer() {      
        return await this.rtcPeerConnection.createOffer()
            .then(desc => {
                this.rtcPeerConnection.setLocalDescription(desc);
                return desc;
            })
            .catch(e => console.log(e));
    }

    async createAnswer(offer) { 
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
        return await this.rtcPeerConnection.createAnswer()
            .then(desc => {
                this.rtcPeerConnection.setLocalDescription(desc);
                return desc;
            })
            .catch(e => console.log(e));
    }
}