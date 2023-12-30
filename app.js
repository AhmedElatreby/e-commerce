require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./Database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view-engine', 'ejs');

app.use(express.json());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    store: new pgSession({
      pool: pool,
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);


const userRoutes = require("./Routes/user_routes");
const authRoutes = require("./Routes/auth_routes");

app.get("/", (req, res) => {
  res.render("index.ejs");
  console.log(req.session);
});

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
