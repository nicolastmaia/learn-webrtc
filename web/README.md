# Learn WebRTC Web

This is my first attempt at building a web application using WebRTC. It connects a browser page to a .NET Core application via WebRTC and have the .NET peer send an audio stream to the browser peer.
At first it should work in a LAN network and later evolve to work between machines behind NAT.

It has two main parts:

- a web client (client.html), which is gonna be one WebRTC peer.
- a .NET Core 6.0 application, which is gonna be the other WebRTC peer. Let's call this the "server" for simplicity.

## Running

- The client can be run simply by opening the client.html file in your browser.
- To run the server, simply open the WebRTCLearn.sln file in Visual Studio and hit Ctrl+F5.

Note: The file to be streamed from server to client is defined in the variable TESTE_FILENAME in the Program.cs file in the server application. Change it to the absolute path of a .wav file with sampling rate 16KHz on your machine to hear it on the client. If it's only for testing, any audio file will work, but the audio may be distorted when it gets to the client.
