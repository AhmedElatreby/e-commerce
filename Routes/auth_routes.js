const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const controller = require("../controllers/user_controllers");

const router = express.Router();

// Passport Configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await pool.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      if (!user.rows.length) {
        return done(null, false, { message: "Incorrect username." });
      }
      const isValidPassword = await bcrypt.compare(
        password,
        user.rows[0].password
      );
      if (!isValidPassword) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user.rows[0]);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  pool.query(queries.getUserById, [id], (error, results) => {
    if (error) throw error;
    const user = results.rows[0];
    return done(null, user);
  });
});

router.get("/register", (req, res) => {
  res.render("register.ejs");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login"); // Change this to the desired failure redirect path
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: "Login successful" }); // Change this to the desired success response
    });
  })(req, res, next);
});

router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  res.json({ message: "User logged out" });
  res.redirect("/");
});

module.exports = router;
