import http from "http";
import express from "express"
import path from "path"
import {Server as SocketID} from "socket.io"
import { spawn } from "child_process";

const app = express();
const server=http.createServer(app);
const io= new SocketID(server);

//options for ffmpeg
//last m rtmp ki utl h ki kha pr bhj n a h saman
const options = [
    '-i',
    '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', `${25}`,
    '-g', `${25 * 2}`,
    '-keyint_min', 25,
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', 128000 / 4,
    '-f', 'flv',
    `./`,
];

const ffmpegProcess = spawn('ffmpeg',options);

ffmpegProcess.stdout.on('data',(data)=>{
    console.log(`ffmpeg stdout: ${data}`);
})
ffmpegProcess.stderr.on('data',(data)=>{
    console.log(`ffmpeg stderr: ${data}`);
})



app.use(express.static(path.resolve('./public')))

io.on("connection",socket =>{
    console.log("Socket Connected ", socket.id);
    socket.on("binarystream", stream =>{
        console.log("Binary Stream Incoming...",stream);
        ffmpegProcess.stdin.write(stream,()=>{
            console.log("Error", err);
        })
    })
})

server.listen(3000,()=>{
    console.log(`HTTP server is running on port 3000`);
})