const getUsers = "SELECT * FROM users";
const getUserById = "SELECT * FROM ueser WHERE id = $1";

module.exports = {
  getUserById,
  getUsers,
};
