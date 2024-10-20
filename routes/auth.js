const express = require("express");
const router = express.Router();
const UserModel = require("../config/schema/user");
const bcrypt = require("bcrypt");


function islogin(req,res,nest){
    if(req.session.login){
        res.redirect('/')
    }else{
        nest()
    }
}

// sign up page

router.get("/signup",islogin, (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password, cpassword } = req.body;

    if (password != cpassword) {
      res.status(401).render("signup", { error: "password not match" });
    } else {
        const User = await UserModel.findOne({email})
        if(User){
            return res.status(403).render('signup',{error: 'user already exists with this email'})
        }
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
  } catch (error) {
    res.send('Server Error').status(500)
  }
});


// login page

router.get('/login',islogin, (req,res)=>{
    res.render('login')
})

router.post('/login',async(req,res)=>{
    try {
        const { email, password } = req.body
        const user = await UserModel.findOne({email})
        if(!user){
            res.status(404).render('login',{error: 'User not found. Create a Account'})
        }else{
            const compare = await bcrypt.compare(password, user.password)
            console.log(compare)
            if(!compare){
                res.status(401).render('login',{error: "incorrect password"})
            }else{
                req.session.user = user
                req.session.login = true
                res.status('204').redirect('/')
            }
        }
    } catch (error) {
        res.status(500).send('Server error')
        console.log(error)
    }
})


router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect('/');
      }
      res.clearCookie('connect.sid'); 
      res.redirect('/auth/login'); 
    });
});

module.exports = router;
