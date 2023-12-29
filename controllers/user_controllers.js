const pool = require("../Database/db");
const queries = require("../Database/user_queries");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query(queries.getUserById, [id], (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const getUsers = (req, res) => {
  pool.query(queries.getUsers, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const addUser = (req, res) => {
  const { username, password, first_name, last_name, email } = req.body;

  // Check if the user exists
  pool.query(queries.checkEmailExists, [email], (error, results) => {
    if (error) {
      console.error("Error checking email existence:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Query results:", results);

    const emailCount = parseInt(results.rows[0] ? results.rows[0].emailcount : 0, 10);
    console.log("Email count:", emailCount);

    if (emailCount > 0) {
      res.status(400).send(`User ${email} already exists.`);
      return;
    }

    bcrypt.hash(password, saltRounds, (hashError, hashedPassword) => {
      if (hashError) {
        console.error("Error hashing password:", hashError);
        res.status(500).send("Internal Server Error");
        return;
      }

      // add user into db
      pool.query(
        queries.addUser,
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
    });
  });
};

const updateUser = (req, res) => {
  const { username, password, first_name, last_name, email } = req.body;
  const id = parseInt(req.params.id);
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
};
