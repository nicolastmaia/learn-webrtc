using Microsoft.AspNetCore.SignalR;
using server.Hubs;
using SIPSorcery.Media;
using SIPSorcery.Net;
using SIPSorceryMedia.Abstractions;

namespace server
{
    public class PeerManager
    {
        public IDictionary<string, WebRTCPeer> peers { get; set; }
        private AudioEncoder _audioEncoder { get; set; }
        private MediaFormatManager<AudioFormat> _audioFormatManager;

        public PeerManager()
        {
            peers = new Dictionary<string, WebRTCPeer>();
            _audioEncoder = new AudioEncoder();
            _audioFormatManager = new MediaFormatManager<AudioFormat>(_audioEncoder.SupportedFormats);
        }

        public void SendAudio(RTPPacket rtpPkt, string otherUserId)
        {
            if(peers.ContainsKey(otherUserId))
            {
                // code to send raw RTPPackets to peers instead of decoding them and sending as streams
                peers[otherUserId].pc.SendRtpRaw(SDPMediaTypesEnum.audio, rtpPkt.Payload, rtpPkt.Header.Timestamp, rtpPkt.Header.MarkerBit, rtpPkt.Header.PayloadType);
            }
        }
    }
}
