const express = require("express");
const User = require("./users-model.js");
const bcrypt = require("bcryptjs");
const router = express.Router();
const protected = require("./middleware/protect.js");

router.post('/register', (req, res) => {
  const { username, password } = req.body

  const hashed = bcrypt.hashSync(password, 10)

  User.add({ username, password: hashed })
    .then(user => {
      res.status(201).json(user)
    })
    .catch(err => {
      res.status(500).json(err.message)
    })
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const allegedUser = await User.findBy({ username }).first()
    if (allegedUser && bcrypt.compareSync(password, allegedUser.password)) {
      req.session.user = allegedUser
      res.json('welcome back')
    } else {
      res.status(401).json('invalid credentials')
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
});

router.get('/logout', (req, res) => {
  if(req.session && req.session.user) {
    req.session.destroy(err => {
      if (err) {
        res.json('you cannot leave')
      } else {
        res.json('bye')
      }
    })
  } else {
    res.end()
  }
});

router.get("/users", protected, (req, res) => {
    User.find()
      .then(users => {
        res.status(200).json(users);
      })
      .catch(err => res.send(err));
});

module.exports = router;
