require("dotenv").config();
const express = require("express");
const userRoutes = require("./Routes/user_routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World");
});

app.use("/api/v1/ec", userRoutes);
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
