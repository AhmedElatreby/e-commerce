const pool = require("../Database/db");
const queries = require("../Database/user_queries");
const bcrypt = require("bcrypt");

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query(queries.getUserById, [id], (error, results) => {
    handleQueryResponse(res, error, results);
  });
};

const getUsers = (req, res) => {
  pool.query(queries.getUsers, (error, results) => {
    handleQueryResponse(res, error, results);
  });
};

const addUser = async (req, res) => {
  const { username, password, first_name, last_name, email } = req.body;
  try {
    const userExists = await checkUserExists(email);
    if (userExists) {
      res.status(400).send(`User ${email} already exists.`);
      return;
    }

    const hashedPassword = await hashPassword(password);
    await addUserToDB(
      res,
      username,
      hashedPassword,
      first_name,
      last_name,
      email
    );
  } catch (error) {
    console.error("Error processing add user request:", error);
    res.status(500).send("Internal Server Error");
  }
};

const updateUser = async (req, res) => {
  const { username, password, first_name, last_name, email } = req.body;
  const id = parseInt(req.params.id);

  try {
    const userExists = await checkUserExists(id);
    if (!userExists) {
      res.status(404).send(`User with ID ${id} not found.`);
      return;
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    await updateUserInDB(
      res,
      id,
      username,
      hashedPassword,
      first_name,
      last_name,
      email
    );
  } catch (error) {
    console.error("Error processing update user request:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const deletedRowCount = await deleteUserFromDB(res, id);
    if (deletedRowCount === 0) {
      res.status(404).send(`User with ID ${id} not found.`);
    } else {
      res.status(200).send(`User with id: ${id} deleted successfully`);
    }
  } catch (error) {
    console.error("Error processing delete user request:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Helper functions

const handleQueryResponse = (res, error, results) => {
  if (error) {
    console.error("Error executing database query:", error);
    res.status(500).send("Internal Server Error");
  } else {
    res.status(200).json(results.rows);
  }
};

const checkUserExists = async (identifier) => {
  const client = await pool.connect();
  try {
    const results = await client.query(queries.checkEmailExists, [identifier]);
    return results.rows.length > 0;
  } finally {
    client.release();
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const addUserToDB = async (
  res,
  username,
  hashedPassword,
  first_name,
  last_name,
  email
) => {
  const results = await pool.query(queries.addUser, [
    username,
    hashedPassword,
    first_name,
    last_name,
    email,
  ]);
  res.status(201).send(`User ${username} added into db successfully.`);
};

const updateUserInDB = async (
  res,
  id,
  username,
  hashedPassword,
  first_name,
  last_name,
  email
) => {
  await pool.query(queries.updateUser, [
    username,
    hashedPassword,
    first_name,
    last_name,
    email,
    id,
  ]);
  res.status(200).send(`User with ID ${id} updated successfully.`);
};

const deleteUserFromDB = async (res, id) => {
  const results = await pool.query(queries.deleteUser, [id]);
  return results.rowCount;
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
};
