const express = require("express");
const passport = require('passport');
const nodemailer = require('nodemailer');
const router = express.Router();
const User = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


router.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const { username, password, email } = req.body;

  if (username === "" || password === "" || email === "") {
    res.render("auth/signup", { message: "Indicate username, password and email" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let confirmationCode = '';
    for (let i = 0; i < 25; i++) {
      confirmationCode += characters[Math.floor(Math.random() * characters.length )];
    }

    const newUser = new User({
      username,
      password: hashPass,
      email,
      confirmationCode
    });

    newUser.save()
    .then(() => {
      var transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "3df17404d7da23",
          pass: "9321da3ba64039"
        }
      });

      transporter.sendMail({
        from: '"My Awesome Project 👻" <myawesome@project.com>',
        to: email,
        subject: 'Awesome Subject',
        text: `Welcome, access http://localhost:3000/auth/confirm/${confirmationCode} to active your account`,
        html: `Welcome, access <a href="http://localhost:3000/auth/confirm/${confirmationCode}" target="_blank">http://localhost:3000/auth/confirm/${confirmationCode}</a> to active your account`
      })
      .then(info => {
        console.log('nodemailer info', info);
        //res.redirect("/")
      })
      .catch(error => {
        console.log('nodemailer error', error);
        //res.redirect("/");
      });

      res.redirect("/");
    })
    .catch(err => {
      res.render("auth/signup", { message: "Something went wrong. Details: " + err });
    })
  });
});

router.get("/confirm/:confirmationCode", (req, res) => {
  let confirmationCode = req.params.confirmationCode;

  User.findOneAndUpdate({confirmationCode}, {
    status: 'Active'
  }, { new: true })
  .then(user => {
    res.render('auth/confirmation');
  })
  .catch(err => {
    console.log(err);
  })
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
