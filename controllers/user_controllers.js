const pool = require("../Database/dbConfig");
const queries = require("../Database/user_queries");
const bcrypt = require("bcrypt");

const profilePage = (req, res) => {
  res.render("profile", { user: req.user });
  console.log(req.session);
};

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  pool.query(queries.getUserById, [id], (error, results) => {
    if (error) {
      console.error("Error querying user by ID:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (results.rows.length === 0) {
      res.status(404).send(`User with ID ${id} not found.`);
      return;
    }

    res.status(200).json(results.rows);
  });
};

const getUsers = (req, res) => {
  pool.query(queries.getUsers, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

// add user
const addUser = (req, res) => {
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
        queries.createUser, // Corrected query name here
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

// update user
const updateUser = (req, res) => {
  const { username, password, first_name, last_name, email } = req.body;
  const id = parseInt(req.params.id);
  // check if user already exists
  pool.query(queries.getUserById, [id], async (error, results) => {
    if (error) {
      console.error("Error checking user existence:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (results.rows.length === 0) {
      res.status(404).send(`User with ID ${id} not found.`);
      return;
    }

    try {
      // If a new password provided, hash it
      let hashedPassword = results.rows[0].password;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }
      // Update user in db
      pool.query(
        queries.updateUser,
        [username, hashedPassword, first_name, last_name, email, id],
        (error, results) => {
          if (error) {
            console.error("Error updating user in the database:", error);
            res.status(500).send("Internal Server Error");
            return;
          }
          res.status(200).send(`User with ID ${id} updated successfully.`);
        }
      );
    } catch (error) {
      console.error("Error hashing password:", error);
      res.status(500).send("Internal Server Error");
    }
  });
};

// delete user
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  // check if user exists
  pool.query(queries.deleteUser, [id], (error, results) => {
    const noUserFound = !results.rows.length;
    if (error) {
      console.error("Error deleting user from the database:", error);
      res.status(500).send("Internal Server Error");
      return;
    }
    const deletedRowCount = results.rowCount;
    if (deletedRowCount === 0) {
      res.status(404).send(`User with ID ${id} not found.`);
    } else {
      res.status(200).send(`User with id: ${id} deleted successfully`);
    }
  });
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  profilePage,
};
