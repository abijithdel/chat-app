const express = require("express");
const router = express.Router();
const UserModel = require("../config/schema/user");
const bcrypt = require("bcrypt");



// sign up page

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", (req, res) => {
  try {
    const { email, password, cpassword } = req.body;

    if (password != cpassword) {
      res.status(401).render("signup", { error: "password not match" });
    } else {
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          res.send("Server Error");
        } else {
          const NewUser = new UserModel({
            email: email,
            password: hash,
          });

          req.session.user = NewUser;
          req.session.login = true;
          await NewUser.save();
          res.status(204).redirect("/");
        }
      });
    }
  } catch (error) {}
});


// login page

router.get('/login',(req,res)=>{
    res.render('login')
})

module.exports = router;
