## WebRTC (Web Real Time Communication)
---
### Contents
- [Introduction](#intro)
- [WebRTC Name Server](#wns)
- [STUN-TURN Server](#stun)
- [Wrapper](#wrapper)
	- [Server](#server)
	- [Client](#client)

---
<a name="intro"></a>
### Introduction
FrappeJS has a WebRTC wrapper that can be used to build applications that communicate peer-to-peer but disguised as if in a client-server architecture.

One of the client applications (called as the Master) acts as a server and hosts the database at it's local file system and the other client applications (Slaves) connect to this Master Client and use the Master Client's database. The Slaves do not have a database of their own in their local file system. It's like having a Client-Server architecture wherein all the clients share the same database hosted at the server. All communication between the Master and Slaves happen peer-to-peer via WebRTC.

---
<a name="wns"></a>
### WebRTC Name Server

FrappeJS uses a Socket-io based WebRTC signalling server for establishing a  WebRTC communication between two applications. 

A client that wants to act as a Master has to register itself with the signalling server using an unique 'Master Name'. A Slave that wants to connect to a particular Master has to use this 'Master Name' and request the signalling server to setup a WebRTC connection with the Master.

In actual sense, this signalling server acts as a **Name Server**. When a Slave sends a connection request to the signalling server with the 'Master Name', the signalling server actually maps this 'Master Name' to the socket-id of that Master and initiates a WebRTC connection. It's very similar to a DNS where a Domain Name (Master Name in our case) is mapped to the IP Address (socket-id in our case) in order to fetch and serve a website.

*A sample implementation of WebRTC Name Server can be found [here](https://github.com/anto-christo/WebRTCNameServer). (This Name Server has been implemented using FrappeJS as well :) )*

---
<a name="stun"></a>
### STUN-TURN Server

WebRTC requires a STUN-TURN server in order to locate clients. A STUN server generally does the job but when a client is located in complex networks, we require the help of a TURN server. Let's not go deep into what are STUN-TURN servers and how they work rather let's look how do we use them with FrappeJS.

All you require to connect a FrappeJS application with a STUN-TURN server is a `turn.config.json` . This JSON file needs to have your access credentials to the STUN-TURN server.

Here's a sample `turn.config.json`:
```javascript
{
	"iceServers": [{
		"url": "stun:stun.services.mozilla.com"
	},
	{
		"url": "stun:stun.l.google.com:19302"
	},
	{
		"url": "turn:xxx.xxx.x.xxx:xxxx",
		"username": "your_username",
		"credential": "your_password"
	}]
}
```
You can add multiple STUN-TURN server entries in the config file. The above config file has two STUN server entries and a TURN server entry.
There are publicly available STUN servers that can be used (above we use STUN servers provided by Mozilla and Google).

However, TURN servers are not publicly available and have to be privately implemented. Have a look [here](https://github.com/coturn/coturn) to know more about implementing your own TURN server.

---
<a name="wrapper"></a>
### Wrapper

The FrappeJS WebRTC wrapper has all the methods required to connect two or more applications in Master-Slave mode.

<a name="server"></a>
#### Setting up a Server (Master Client)

Import the WebRTC class and create a new object. You have to pass the url `Eg: 'http://your_ip_address:port'` of your Name Server.  

```javascript
import Webrtc from 'frappejs/webrtc/webrtc';
const webrtc = new Webrtc('http://localhost:8002');
```

To make a client available as Master Client (Server) and accept connections, you need to call the `startServer` method.

Every time the `startServer` method is called, it first check the local database of the client for a *Secret Key* provided by the Name Server. The presence of *Secret Key* indicates that the client has already been registered with the Name Server with some unique 'Master Name'. In this case, `startServer` method only starts the client as Master and makes it available for WebRTC connections.
If a *Secret Key* is not found, it means the client has not been registered earlier with a  unique 'Master Name' with the Name Server. In this case, `startServer` firsts registers the client with the Name Server using a unique 'Master Name' and assigns a *Secret Key* to the client provided by the Name Server.

To make a Master (Server) unavailable for connections and disconnect all existing connections, you need to call the `stopServer` method.

```javascript
webrtc.startServer(masterName).then(nameServerResponse  => {
	//Do something with nameServerResponse
});

webrtc.stopServer().then(nameServerResponse  => {
	//Do something with nameServerResponse
});
```
`startServer` method takes 'Master Name' as the parameter and both the methods return a variable that contains response from the Name Server. The response is a string with one of the following values:

| Response (string) | Description |
|--|--|
|registered|This response appears when you setup the client as Master for the first time. Indicates the client was successfully *registered* as a Master and has *started* running as a server (Master).|
|exists|Indicates that the Master Name that you are trying to register has already been taken by another client and hence it is not unique.|
|started|Indicates that the client has successfully *started* running as a server (Master).|
|stopped|Indicates that the client has successfully *stopped* running as a server (Master).|

<a name="client"></a>
#### Setting up a Client (Slave Client)

As mentioned earlier, a Slave does not have it's own local database, it uses the database of the Master. 
Hence, we first need to point the database object of FrappeJS to WebRTC Client backend. You have to pass the url `Eg: 'http://your_ip_address:port'` of your Name Server to the WebRTC Client backend.

```javascript
import  WebrtcClient  from  'frappejs/backends/webrtc';
frappe.db  =  new  WebrtcClient('http://localhost:8002');
```

To connect with a Master Client  (Server), you need to call the `frappe.db.connect` method and to disconnect, you need to call the `frappe.db.disconnect` method.

```javascript
frappe.db.connect(masterName).then(connectionStatus  => {
	//Do something with connectionStatus
});

frappe.db.disconnect().then(connectionStatus  => {
	//Do something with connectionStatus
});
```
`frappe.db.connect` takes 'Master Name' (the unique name of Master you want to connect with) as parameter and both methods return the connection status. 
The connection status is `true` if you are connected with the Master and `false` if you are disconnected with the Master.