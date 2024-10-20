const express = require("express");
const router = express.Router();
const UserModel = require('../config/schema/user')

function islogin(req, res, nest) {
  if (req.session.login) {
    nest();
  } else {
    res.redirect("/auth/login");
  }
}

router.get("/", islogin,async (req, res) => {
    var err
  const email = req.session.user.email;
  const username = email.slice(0, 5);
  try {
    var users = await UserModel.find()
  } catch (error) {
    err = 'DB ERROR'
    console.log(error)
  }
  res.render("index",{username,user: users});
});

module.exports = router;
