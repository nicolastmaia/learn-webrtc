using Microsoft.AspNetCore.SignalR.Client;
using Newtonsoft.Json;
using SIPSorcery.Media;
using SIPSorcery.Net;
using System.Net;
using SIPSorceryMedia.Windows;
using Microsoft.AspNetCore.SignalR;
using server.Hubs;
using SIPSorceryMedia.Abstractions;
using SIPSorceryMedia.FFmpeg;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Imaging;
using SIPSorcery.SIP.App;
using Microsoft.AspNetCore.Hosting.Server;
using static vpxmd.VpxCodecCxPkt;
using System.Media;
using Org.BouncyCastle.Utilities;
using System.Collections.Concurrent;
using SIPSorcery.Sys;

namespace server
{
    public class WebRTCPeerProvider
    {
        PeerManager _peerManager { get; set; }
        IHubContext<CustomHub> _hubContext { get; set; }

        public WebRTCPeerProvider(PeerManager peerManager, IHubContext<CustomHub> hubContext)
        {
            _peerManager = peerManager;
            _hubContext = hubContext;
        }

        public Task<WebRTCPeer> CreatePeerConnection(WebRTCMessage data)
        {
            // enter ice configurations
            var config = new RTCConfiguration { iceServers = new List<RTCIceServer>() };

            //config.iceServers.Add(new RTCIceServer
            //{
            //    urls = "stun:yourserver.net.br", // stun URL here
            //});
            //
            //config.iceServers.Add(new RTCIceServer
            //{
            //    urls = "turn:yourserver.net.br", // turn URL here
            //
            //    // turn credentials below
            //    username = "",
            //    credentialType = RTCIceCredentialType.password,
            //    credential = ""
            //});

            // create RTC peer connection
            var webRTCPeer = new WebRTCPeer(data);
            var pc = new RTCPeerConnection(config);
            webRTCPeer.pc = pc;

            // config audio source info
            webRTCPeer.audioSource = new AudioExtrasSource(new AudioEncoder());
            webRTCPeer.audioSource.AudioSamplePeriodMilliseconds = 100;
            MediaStreamTrack audioTrack = new MediaStreamTrack(webRTCPeer.audioSource.GetAudioSourceFormats(), MediaStreamStatusEnum.SendRecv);
            webRTCPeer.pc.addTrack(audioTrack);
            webRTCPeer.pc.OnAudioFormatsNegotiated += (audioFormats) => webRTCPeer.audioSource.SetAudioSourceFormat(webRTCPeer.audioSource.GetAudioSourceFormats()[0]);
            webRTCPeer.audioSource.OnAudioSourceEncodedSample += webRTCPeer.pc.SendAudio;

            webRTCPeer.pc.onicecandidate += (candidate) =>
            {
                var message = new WebRTCMessage()
                {
                    type = "ICEcandidate",
                    userId = data.userId,
                    callerId = "",
                    otherUserId = data.userId,
                    candidateMessage = new IceCandidate { candidate = candidate.candidate, id = candidate.sdpMid, label = candidate.sdpMLineIndex }
                };

                var serializedMessage = JsonConvert.SerializeObject(message);
                _hubContext.Clients.Groups(data.userId).SendAsync("ICEcandidate", serializedMessage);
            };

            webRTCPeer.pc.oniceconnectionstatechange += (state) => Console.WriteLine($"ICE connection state changed to {state}.");
            webRTCPeer.pc.onconnectionstatechange += (state) =>
            {
                Console.WriteLine($"Peer connection state change to {state}.");

                switch (state)
                {
                    case RTCPeerConnectionState.connected:
                        Console.WriteLine("connected");
                        break;
                    case RTCPeerConnectionState.failed:
                        webRTCPeer.pc.Close("ice disconnection");
                        Console.WriteLine("failed");
                        break;
                    case RTCPeerConnectionState.closed:
                        Console.WriteLine("closed");
                        break;
                }
            };
            webRTCPeer.pc.OnAudioFormatsNegotiated += (formats) =>
                webRTCPeer.windowsAudioEP.SetAudioSinkFormat(formats.First());

            webRTCPeer.pc.OnRtpPacketReceived += (IPEndPoint rep, SDPMediaTypesEnum media, RTPPacket rtpPkt) =>
            {
                if (media == SDPMediaTypesEnum.audio)
                {
                    _peerManager.SendAudio(rtpPkt, webRTCPeer.otherUserId);

                    // Uncomment next lines to play received audio on this application's host's default audio device.
                    //webRTCPeer.windowsAudioEP.GotAudioRtp(rep, rtpPkt.Header.SyncSource, rtpPkt.Header.SequenceNumber, rtpPkt.Header.Timestamp, rtpPkt.Header.PayloadType, rtpPkt.Header.MarkerBit == 1, rtpPkt.Payload);
                    //webRTCPeer.windowsAudioEP.StartAudio();
                }
            };

            return Task.FromResult(webRTCPeer);
        }
    }
}