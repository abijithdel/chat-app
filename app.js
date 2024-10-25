const express = require("express");
const { Server } = require("socket.io");
const http = require("node:http");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const session = require("express-session");
const UserModel = require("./config/schema/user");
const ChatModel = require("./config/schema/message");
const RoomModel = require("./config/schema/group");

const app = express();
const server = http.createServer(app);
const PORT = 3000;
app.use(
  session({ secret: "key", cookie: { maxAge: 1000 * 60 * 60 * 24 * 365 * 10 } })
);
require("./config/mongoos");

const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const user = require("./config/schema/user");

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  let status_id = [];

  socket.on("login", async (id) => {
    status_id.push(id);
    try {
      const User = await UserModel.findByIdAndUpdate(id, { status: true });
      console.log(`${User.email} Online`);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("JoinRoom", async (FromUid, ToUid) => {
    let RoomID;
    let isRoom;
    try {
      const room = await RoomModel.findOne({ _id: ToUid });
      if (room) {
        RoomID = room.name;
        isRoom = true;
      } else {
        isRoom = false;
        RoomID = [FromUid, ToUid].sort().join("-");
      }
      socket.join(RoomID);
      console.log(`User joined room: ${RoomID}`);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("PMessage", async (msg, FromUid, ToUid) => {
    let RoomID;
    try {
      const room = await RoomModel.findOne({ _id: ToUid });

      const User = await UserModel.findById(FromUid);
      const email = User.email.split("@")[0];

      if (room) {
        RoomID = room.name;
        room.message.push({
          username: email,
          user_id: FromUid,
          message: msg
        })
        await room.save()
      } else {
        RoomID = [FromUid, ToUid].sort().join("-");
        const newChat = new ChatModel({
          from: FromUid,
          fromUname: email,
          to: ToUid,
          message: msg,
        });
        await newChat.save();
      }

      io.to(RoomID).emit("PMChat", msg, email);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected");
    const id = status_id[0];
    try {
      const User = await UserModel.findByIdAndUpdate(id, { status: false });
      console.log(`${User.email} Offline`);
    } catch (error) {}
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "hbs");
app.set("views", "./views");

app.use("/auth", authRouter);
app.use("/", userRouter);

app.all("*", (req, res) => {
  res.status(404).render("404");
});

server.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
