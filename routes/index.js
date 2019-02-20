const express = require('express');
const router  = express.Router();
const User = require("../models/User");

/* GET home page */
router.get('/', (req, res, next) => {
  User.find()
  .then(users => {
    res.render('index', { users });
  })
  .catch(err => console.log(err))
});

router.get('/profile/:id', (req, res, next) => {
  let id = req.params.id;

  User.findById(id)
  .then(user => {
    res.render('profile', { user });
  })
  .catch(err => console.log(err))
});

module.exports = router;
