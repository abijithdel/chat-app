const express = require("express");
const axios = require("socket.io");
const http = require("node:http");
const path = require("path");
const { create } = require("express-handlebars");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const server = http.createServer(app);
const PORT = 3000;
app.use(
  session({ secret: "key", cookie: { maxAge: 1000 * 60 * 60 * 24 * 365 * 10 } })
);
require("./config/mongoos");

const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const hbs = create({ extname: ".hbs" });
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");

app.use("/auth", authRouter);
app.use("/", userRouter);

server.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
