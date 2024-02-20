using SIPSorcery.Media;
using SIPSorcery.Net;
using WebSocketSharp.Server;

namespace WebRtcLearn
{
    class Program
    {

        private const int WEBSOCKET_PORT = 8081;

        private const string TESTE_FILENAME = "G:\\nicolas.maia\\Downloads\\teste.WAV"; // your test file path
        private static string certificatePath = "C:\\nicolas.maia\\Downloads\\websocket-test.pfx"; //your certificate path if using ssl
        private static string certificatePassword = "123456";

        private static byte[] completeAudioBuffer = File.ReadAllBytes(TESTE_FILENAME);

        private static int numberOfChunks = 25;
        private static int chunkLength = completeAudioBuffer.Length / numberOfChunks;
        private static int restChunkLength = completeAudioBuffer.Length % numberOfChunks;

        private static byte[] miniBuffer1 = new byte[chunkLength];
        private static byte[] miniBuffer2 = new byte[chunkLength];
        private static byte[] restBuffer = new byte[restChunkLength];

        private static bool flipStream = false;

        static void Main()
        {
            Console.WriteLine("WebRTC Get Started");

            var webSocketServer = new WebSocketServer(WEBSOCKET_PORT, false); // change to true for ssl.
            var wssCertificate = new System.Security.Cryptography.X509Certificates.X509Certificate2(certificatePath, certificatePassword);

            if (webSocketServer.IsSecure)
            {
                webSocketServer.SslConfiguration.ServerCertificate = wssCertificate;
                webSocketServer.SslConfiguration.CheckCertificateRevocation = false;
                webSocketServer.SslConfiguration.EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12;
            }

            // Start web socket.
            Console.WriteLine("Starting web socket server...");
            webSocketServer.AddWebSocketService<WebRTCWebSocketPeer>("/", (peer) => peer.CreatePeerConnection = () => CreatePeerConnection());

            webSocketServer.Start();

            Console.WriteLine($"Waiting for web socket connections on {webSocketServer.Address}:{webSocketServer.Port}...");

            Console.WriteLine("Press any key exit.");
            Console.ReadLine();
        }

        private static void FillBuffer(byte[] destBuffer, int bufferPosition, int bufferSize)
        {
            Buffer.BlockCopy(completeAudioBuffer, bufferPosition, destBuffer, 0, bufferSize);
        }

        private static void SendAudio(AudioExtrasSource audioSource)
        {
            int i = 0;

            Stream audioStream = new MemoryStream(miniBuffer1);

            audioSource.OnSendFromAudioStreamComplete += () =>
            {
                if (i <= numberOfChunks)
                {
                    if (i == numberOfChunks)
                    {
                        audioStream = new MemoryStream(restBuffer);
                    }
                    else
                    {
                        audioStream = new MemoryStream(flipStream == true ? miniBuffer2 : miniBuffer1);
                    }

                    audioSource.SendAudioFromStream(audioStream, SIPSorceryMedia.Abstractions.AudioSamplingRatesEnum.Rate16KHz);

                    if (i == numberOfChunks - 1)
                    {
                        FillBuffer(restBuffer, i * chunkLength, restChunkLength);
                    }
                    else if (i < numberOfChunks)
                    {
                        FillBuffer(flipStream == true ? miniBuffer1 : miniBuffer2, i * chunkLength, chunkLength);
                    }

                    flipStream = !flipStream;
                    i++;
                }
            };

            audioSource.SendAudioFromStream(audioStream, SIPSorceryMedia.Abstractions.AudioSamplingRatesEnum.Rate16KHz);
            flipStream = !flipStream;
        }

        private static Task<RTCPeerConnection> CreatePeerConnection()
        {
            var config = new RTCConfiguration
            {
                iceServers = new List<RTCIceServer>()
            };

            config.iceServers.Add(new RTCIceServer { urls = "stun:stun.l.google.com:19302" });

            var pc = new RTCPeerConnection(config);

            var audioSource = new AudioExtrasSource(new AudioEncoder());

            audioSource.AudioSamplePeriodMilliseconds = 20;
            MediaStreamTrack audioTrack = new MediaStreamTrack(audioSource.GetAudioSourceFormats(), MediaStreamStatusEnum.SendRecv);
            pc.addTrack(audioTrack);

            pc.OnAudioFormatsNegotiated += (audioFormats) => audioSource.SetAudioSourceFormat(audioFormats.First());

            audioSource.OnAudioSourceEncodedSample += pc.SendAudio;

            pc.onsignalingstatechange += () =>
            {
                Console.WriteLine("ice signaling state 1: " + pc.signalingState);
            };

            pc.onicegatheringstatechange += (state) =>
            {
                Console.WriteLine("ice gathering state 1: " + state);
            };

            pc.oniceconnectionstatechange += (state) =>
            {
                Console.WriteLine("ice connection state 1: " + state);
            };

            pc.onicecandidateerror += (state, s) =>
            {
                Console.WriteLine("ice connection state error: " + pc.iceConnectionState);
                Console.WriteLine("ice candidate error state: " + state);
                Console.WriteLine("ice candidate error string: " + s);
            };

            pc.onconnectionstatechange += async (state) =>
            {
                Console.WriteLine($"Peer connection state change to {state}.");

                switch (state)
                {
                    case RTCPeerConnectionState.connected:
                        SendAudio(audioSource);
                        break;
                    case RTCPeerConnectionState.failed:
                        pc.Close("ice disconnection");
                        break;
                    case RTCPeerConnectionState.closed:
                        await audioSource.CloseAudio();
                        break;
                }
            };

            return Task.FromResult(pc);
        }

    }
}