using Serilog;
using Serilog.Extensions.Logging;
using SIPSorcery.Media;
using SIPSorcery.Net;
using SIPSorceryMedia.Windows;
using System.Collections.Concurrent;
using System.Net;

namespace server
{
    public class WebRTCPeer
    {
        public Microsoft.Extensions.Logging.ILogger logger = null;
        public RTCPeerConnection pc { get; set; }
        public RTCOfferOptions OfferOptions { get; set; }
        public string userId { get; set; }
        public string otherUserId { get; set; }
        public WindowsAudioEndPoint windowsAudioEP { get; set; }
        public AudioExtrasSource audioSource { get; set; }

        public WebRTCPeer(WebRTCMessage data)
        {
            userId = data.userId;
            otherUserId = data.otherUserId;
            windowsAudioEP = new WindowsAudioEndPoint(new AudioEncoder(), -1, -1, true, false);
            audioSource = new AudioExtrasSource();
            logger = AddConsoleLogger();
        }

        public void HandleNewCall(WebRTCMessage data)
        {
            if (data.rtcMessage != null)
            {
                var sessionDescriptionSipSorcery = new RTCSessionDescriptionInit();
                sessionDescriptionSipSorcery.sdp = data.rtcMessage.sdp;

                switch (data.rtcMessage.type)
                {
                    case "answer":
                        sessionDescriptionSipSorcery.type = RTCSdpType.answer;
                        break;
                    case "offer":
                        sessionDescriptionSipSorcery.type = RTCSdpType.offer;
                        break;
                    case "pranswer":
                        sessionDescriptionSipSorcery.type = RTCSdpType.pranswer;
                        break;
                    case "rollback":
                        sessionDescriptionSipSorcery.type = RTCSdpType.rollback;
                        break;
                }

                pc.setRemoteDescription(sessionDescriptionSipSorcery);
            }
        }
        public void HandleAcceptCall(WebRTCMessage data)
        {

        }
        public void HandleICECandidate(WebRTCMessage data)
        {
            var cand = new RTCIceCandidateInit() { candidate = data.candidateMessage.candidate, sdpMid = data.candidateMessage.id, sdpMLineIndex = (ushort)data.candidateMessage.label };
            pc.addIceCandidate(cand);
        }
        public void HandleCancelCall(WebRTCMessage data)
        {
            if (pc != null) pc.close();
            pc = null;
        }
        public void HandleRejectCall(WebRTCMessage data)
        {
            if (pc != null) pc.close();
            pc = null;
        }
        public void HandleEndCall(WebRTCMessage data)
        {
            if (pc != null) pc.close();
            pc = null;
        }

        public async Task<WebRTCMessage> ProcessAccept(string otherUserId)
        {
            var sessionDescriptionSipSorcery = pc.createAnswer();
            await pc.setLocalDescription(sessionDescriptionSipSorcery);

            var sessionDescription = new RTCSessionDescription(sessionDescriptionSipSorcery.type.ToString(), sessionDescriptionSipSorcery.sdp);
            var message = new WebRTCMessage()
            {
                type = "acceptCall",
                callerId = "",
                otherUserId = otherUserId,
                rtcMessage = sessionDescription,
            };
            return message;
        }

        /// <summary>
        ///  Adds a console logger. Can be omitted if internal SIPSorcery debug and warning messages are not required.
        /// </summary>
        private Microsoft.Extensions.Logging.ILogger AddConsoleLogger()
        {
            var seriLogger = new LoggerConfiguration()
                .Enrich.FromLogContext()
                .MinimumLevel.Is(Serilog.Events.LogEventLevel.Debug)
                .WriteTo.Console()
                .CreateLogger();
            var factory = new SerilogLoggerFactory(seriLogger);
            SIPSorcery.LogFactory.Set(factory);
            return factory.CreateLogger<WebRTCPeer>();
        }
    }
}