const express = require("express");
const router = express.Router();
const UserModel = require("../config/schema/user");
const ChatModel = require("../config/schema/message");

function islogin(req, res, nest) {
  if (req.session.login) {
    nest();
  } else {
    res.redirect("/auth/login");
  }
}

router.get("/", islogin, async (req, res) => {
  const email = req.session.user.email;
  const username = email.split("@")[0];
  const uid = req.session.user._id
  var contactUsers = [];
  try {
    var users = await UserModel.findById(uid)
    const contact_id = users.contact;
    
    for(var x in contact_id){
      const contact = await UserModel.findById(contact_id[x].id)
      contactUsers.push(contact)
    }
  } catch (error) {
    console.log(error);
  }
  res.render("index", { username, user: contactUsers, fromuser: req.session.user });
});

router.get("/user", async (req, res) => {
  const userId = req.query.userId;
  try {
    const user = await UserModel.findById(userId);
    const Username = user.email.split("@")[0];
    res.json(Username);
  } catch (error) {}
});

router.get("/get-chat/:from/:to", async (req, res) => {
  try {
    const { from, to } = req.params;

    const chatHistory = await ChatModel.find({
      $or: [
        { from: from, to: to },
        { from: to, to: from },
      ],
    });

    res.status(200).json({ success: true, chatHistory });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to retrieve messages" });
  }
});

router.post("/search", islogin, async (req, res) => {
  try {
    const { search } = req.body;
    var errorMessage = undefined
    const Users = await UserModel.find({
      email: new RegExp(search, "i"),
    });
    if(Users.length <= 0){
      errorMessage = "User not found"
    }
    res.status(200).render("search", { Users, errorMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during search." });
  }
});

router.get("/add-contact/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.session.user._id;
    console.log(uid);

    const user = await UserModel.findById(uid);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const contactExists = user.contact.some((contact) => contact.id === id);

    if (contactExists) {
      res.status(200).json({ success: true, message: "Contact already exists" });
    } else {
      user.contact.push({ id: id });
      await user.save();
      return res.status(200).json({ success: true, message: "Contact added successfully" });
    }
  } catch (error) {
    return res
      .status(500)
      .json('Server error');
  }
});

module.exports = router;
