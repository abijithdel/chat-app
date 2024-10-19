const express = require("express");
const axios = require("socket.io");
const http = require("node:http");
const path = require('path')

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.static(path.join(__dirname,'public')))

server.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
