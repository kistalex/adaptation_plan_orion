const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require('passport');

//User model

const User = require("../models/User");
//Login Page
router.get("/login", (req, res) => res.render("login"));
//Register Page
router.get("/register", (req, res) => res.render("register"));
//Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //Check required fields

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Пожалуйста, заполните все поля" });
  }

  //Check passwords match

  if (password !== password2) {
    errors.push({ msg: "Пароли не совпадают. Пожалуйста, повторите ввод" });
  }

  //Check password lenght

  if (password.length < 6) {
    errors.push({ msg: "Длина пароля должна быть минимум 6 знаков" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    //Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User exists
        errors.push({ msg: "E-mail уже зарегистрирован" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err;
            //Set password to hashed
              newUser.password = hash;
            //Save user
            newUser.save()
                .then(user =>{
                    req.flash('success_msg', 'Вы успешно зарегистрировались, можно войти в систему')
                    res.redirect('/users/login');
                })
                .catch(err => console.log(err));

          })
        );
      }
    });
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Вы вышли из системы');
    res.redirect('/users/login');
});


module.exports = router;
