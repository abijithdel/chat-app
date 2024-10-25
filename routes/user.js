const express = require("express");
const router = express.Router();
const UserModel = require("../config/schema/user");
const ChatModel = require("../config/schema/message");
const multer = require("multer");
const RoomModel = require("../config/schema/group");

function islogin(req, res, nest) {
  if (req.session.login) {
    nest();
  } else {
    res.redirect("/auth/login");
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/profile/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ".jpg");
  },
});
const upload = multer({ storage: storage });

router.get("/", islogin, async (req, res) => {
  const email = req.session.user.email;
  const username = email.split("@")[0];
  const uid = req.session.user._id;
  var contactUsers = [];
  try {
    var users = await UserModel.findById(uid);
    const contact_id = users.contact;

    for (var x in contact_id) {
      const contact = await UserModel.findById(contact_id[x].id);

      if (!contact) {
        const room = await RoomModel.findById(contact_id[x].id);
        contactUsers.push(room);
      } else {
        contactUsers.push(contact);
      }
    }
    res.render("index", {
      username,
      user: contactUsers,
      fromuser: req.session.user,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/user", async (req, res) => {
  const ID = req.query.userId;
  var Username;
  try {
    const user = await UserModel.findById(ID);
    if (!user) {
      const room = await RoomModel.findById(ID);
      Username = room.name;
    } else {
      Username = user.email.split("@")[0];
    }

    res.json(Username);
  } catch (error) {}
});

router.get("/get-chat/:from/:to", async (req, res) => {
  try {
    let room;
    let RoomHistory
    const { from, to } = req.params;

    const chatHistory = await ChatModel.find({
      $or: [
        { from: from, to: to },
        { from: to, to: from },
      ],
    });

    if (chatHistory.length === 0) {
      const Room = await RoomModel.findById(to);
      RoomHistory = Room.message;
      room = true;
    }
    res.status(200).json({ success: true, chatHistory, RoomHistory, room });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to retrieve messages" });
  }
});

router.post("/search", islogin, async (req, res) => {
  try {
    const { search } = req.body;
    let errorMessage;

    const users = await UserModel.find({ email: new RegExp(search, "i") });
    const rooms = await RoomModel.find({ name: new RegExp(search, "i") });

    // Add a type to each item and combine them
    const outdata = [
      ...users.map((user) => ({ ...user.toObject(), type: "user" })),
      ...rooms.map((room) => ({ ...room.toObject(), type: "room" })),
    ];

    if (outdata.length === 0) {
      errorMessage = "No results found";
    }

    res.status(200).render("search", { outdata, errorMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during search." });
  }
});

router.get("/add-contact/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.session.user._id;

    const user = await UserModel.findById(uid);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const contactExists = user.contact.some((contact) => contact.id === id);

    if (contactExists) {
      res
        .status(200)
        .json({ success: true, message: "Contact already exists" });
    } else {
      user.contact.push({ id: id });
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Contact added successfully" });
    }
  } catch (error) {
    return res.status(500).json("Server error");
  }
});

router.post(
  "/create-room",
  islogin,
  upload.single("room_img"),
  async (req, res) => {
    const { room_name } = req.body;
    const fileName = req.file.filename;
    try {
      var error = undefined;
      const room = await RoomModel.findOne({ name: room_name });
      if (room) {
        error = "Already room example. try another name";
      }

      const NewRoom = new RoomModel({
        name: room_name,
        img: fileName,
        members: [
          {
            user_id: req.session.user._id,
            admin: true,
          },
        ],
      });

      await NewRoom.save();

      const user = await UserModel.findById(req.session.user._id);

      const contactExists = user.contact.some(
        (contact) => contact.id === NewRoom._id
      );

      if (contactExists) {
        return res.status(200).json("Contact already exists");
      } else {
        user.contact.push({ id: NewRoom._id });
        await user.save();
        return res.status(200).redirect("/");
      }
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = router;
