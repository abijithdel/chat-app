const express = require("express");
const router = express.Router();
const UserModel = require("../config/schema/user");

function islogin(req, res, nest) {
  if (req.session.login) {
    nest();
  } else {
    res.redirect("/auth/login");
  }
}


router.get("/", islogin, async (req, res) => {
  const email = req.session.user.email;
  const username = email.slice(0, 8);
  try {
    var users = await UserModel.find();
  } catch (error) {
    console.log(error);
  }
  res.render("index", { username, user: users, fromuser: req.session.user });
});

router.get('/user', async (req, res) => {
  const userId = req.query.userId;  
  try {
    const user = await UserModel.findById(userId)
    const Username = user.email
    res.json(Username)
  } catch (error) {
    
  }
});


module.exports = router;
