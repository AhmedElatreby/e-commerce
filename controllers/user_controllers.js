const pool = require("../Database/db");
const queries = require("../Database/user_queries");

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query(queries.getUserById);
};

const getUsers = (req, res) => {
  pool.query(queries.getUsers, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

module.exports = {
  getUsers,
  getUserById,
};
