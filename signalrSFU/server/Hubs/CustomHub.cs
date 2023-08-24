using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace server.Hubs
{
    public class CustomHub : Hub
    {
        PeerManager _peerManager { get; set; }
        WebRTCPeerProvider _webRTCPeerProvider { get; set; }
        public CustomHub(PeerManager peerManager, WebRTCPeerProvider webRTCPeerProvider)
        {
            _peerManager = peerManager;
            _webRTCPeerProvider = webRTCPeerProvider;
        }
        public async Task register(string message)
        {
            Console.WriteLine("-------------------" + message + "-------------------");
            var deserializedMessage = JsonConvert.DeserializeObject<WebRTCMessage>(message);
            await Groups.AddToGroupAsync(Context.ConnectionId, deserializedMessage.userId);
        }

        public async Task newCall(string message)
        {
            var deserializedMessage = JsonConvert.DeserializeObject<WebRTCMessage>(message);

            var peer = await _webRTCPeerProvider.CreatePeerConnection(deserializedMessage);
            _peerManager.peers.Remove(deserializedMessage.userId);
            _peerManager.peers.Add(deserializedMessage.userId, peer);
            _peerManager.peers[deserializedMessage.userId].HandleNewCall(deserializedMessage);

            await Clients.Groups(deserializedMessage.otherUserId).SendAsync("wakeUpCall", message);
        }

        public async Task acceptCall(string message)
        {
            var deserializedMessage = JsonConvert.DeserializeObject<WebRTCMessage>(message);

            var peer = await _webRTCPeerProvider.CreatePeerConnection(deserializedMessage);
            _peerManager.peers.Remove(deserializedMessage.userId);
            _peerManager.peers.Add(deserializedMessage.userId, peer);
            _peerManager.peers[deserializedMessage.userId].HandleNewCall(deserializedMessage);

            var acceptMessagePeer1 = await _peerManager.peers[deserializedMessage.otherUserId].ProcessAccept(deserializedMessage.otherUserId);
            var serializedMessagePeer1 = JsonConvert.SerializeObject(acceptMessagePeer1);
            await Clients.Groups(deserializedMessage.otherUserId).SendAsync("acceptCall", serializedMessagePeer1);

            var acceptMessagePeer2 = await _peerManager.peers[deserializedMessage.userId].ProcessAccept(deserializedMessage.userId);
            var serializedMessagePeer2 = JsonConvert.SerializeObject(acceptMessagePeer2);
            await Clients.Groups(deserializedMessage.userId).SendAsync("acceptCall", serializedMessagePeer2);
        }

        public async Task ICEcandidate(string message)
        {
            var deserializedMessage = JsonConvert.DeserializeObject<WebRTCMessage>(message);
            _peerManager.peers[deserializedMessage.userId].HandleICECandidate(deserializedMessage);
        }

        public async Task cancelCall(string message)
        {
            var deserializedMessage = JsonConvert.DeserializeObject<WebRTCMessage>(message);
            _peerManager.peers[deserializedMessage.userId].HandleCancelCall(deserializedMessage);
            _peerManager.peers.Remove(deserializedMessage.userId);
            await Clients.Groups(deserializedMessage.otherUserId).SendAsync("cancelCall", message);
        }

        public async Task rejectCall(string message)
        {
            var deserializedMessage = JsonConvert.DeserializeObject<WebRTCMessage>(message);
            await Clients.Groups(deserializedMessage.otherUserId).SendAsync("rejectCall", message);
        }

        public async Task endCall(string message)
        {
            var deserializedMessage = JsonConvert.DeserializeObject<WebRTCMessage>(message);
            _peerManager.peers[deserializedMessage.userId].HandleEndCall(deserializedMessage);
            _peerManager.peers.Remove(deserializedMessage.userId);
            await Clients.Groups(deserializedMessage.otherUserId).SendAsync("endCall", message);
        }
    }
}
