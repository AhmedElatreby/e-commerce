require("dotenv").config();

const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const { loadPassport } = require("./config/passport");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./Database/dbConfig");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new pgSession({
      pool: pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // valid for one day
    },
  })
);
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
loadPassport(passport);

const userRoutes = require("./Routes/user_routes");
const authRoutes = require("./Routes/auth_routes");

app.get("/", (req, res) => {
  res.render("index", { user: "there" });
  console.log(req.session);
});

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
