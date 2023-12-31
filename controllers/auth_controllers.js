const pool = require("../Database/dbConfig");
const queries = require("../Database/user_queries");
const bcrypt = require("bcrypt");
const flash = require("express-flash");

const registerUser = (req, res) => {
  let { username, password, password2, first_name, last_name, email } =
    req.body;
  console.log(username, password, password2, first_name, last_name, email);

  let errors = [];
  if (
    !username ||
    !password ||
    !password2 ||
    !first_name ||
    !last_name ||
    !email
  ) {
    errors.push({ message: "Please enter all fields" });
  }
  if (password.length < 6) {
    errors.push({ message: "Password should be at least 6 characters" });
  }

  if (password !== password2) {
    errors.push({ message: "Password do not match" });
  }

  if (errors.length > 0) {
    return res.render("register", { errors });
  }

  pool.query(queries.getUserByEmail, [email], async (error, results) => {
    if (error) throw error;
    if (results.rows.length) {
      errors.push({ message: "Email taken" });
      res.status(400).render("register", { errors });
    } else {
      let salt = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(password, salt);
      pool.query(
        queries.createUser,
        [username, hashedPassword, first_name, last_name, email],
        (error, results) => {
          if (error) throw error;
          req.flash("success_msg", "You are now registered. Please log in.");
          return res.status(201).redirect("/auth/login");
        }
      );
    }
  });
};
module.exports = {
  registerUser,
};
