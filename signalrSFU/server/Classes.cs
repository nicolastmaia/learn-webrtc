using Microsoft.AspNetCore.SignalR;
using SIPSorcery.Net;
using System;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace server
{
    public class WebRTCMessage
    {
        public string? type { get; set; }
        public string? userId { get; set; }
        public string? callerId { get; set; }
        public string? otherUserId { get; set; }
        public RTCSessionDescription? rtcMessage { get; set; }
        public IceCandidate? candidateMessage { get; set; }
    }

    public class RTCSessionDescription
    {
        public RTCSessionDescription(string type, string sdp)
        {
            this.type = type;
            this.sdp = sdp;
        }

        public string type { get; set; }
        public string sdp { get; set; }
    }

    public class IceCandidate
    {
        public ushort? label { get; set; }
        public string? id { get; set; }
        public string? candidate { get; set; }
    }

    // --------------------------------------------------
}