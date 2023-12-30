const pool = require("../Database/db");
const queries = require("../Database/user_queries");
const bcrypt = require("bcrypt");

const registerUser  = (req, res) => {
  const { username, password, first_name, last_name, email } = req.body;

  // Check if the user exists
  pool.query(queries.checkEmailExists, [email], async (error, results) => {
    if (error) {
      console.error("Error checking email existence:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (results.rows.length) {
      res.status(400).send(`User ${email} already exists.`);
      return;
    }

    try {
      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // add user into db
      pool.query(
        queries.createUser,
        [username, hashedPassword, first_name, last_name, email],
        (error, results) => {
          if (error) {
            console.error("Error adding user to the database:", error);
            res.status(500).send("Internal Server Error");
            return;
          }

          res.status(201).send(`User ${username} added into db successfully.`);
        }
      );
    } catch (hashError) {
      console.error("Error hashing password:", hashError);
      res.status(500).send("Internal Server Error");
    }
  });
};

module.exports = {
  registerUser,
};
