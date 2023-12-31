const express = require("express");
const passport = require("passport");
const controller = require("../controllers/auth_controllers");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", controller.registerUser); //throwing error

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  const user = req.user;
  console.log(user);
  res.json({ message: `${user.first_name} is logged in` });
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
