const express = require("express");
const bodyParser = require("body-parser");
//this is
const app = express();
app.use(bodyParser.json());

let users = [];
let nextId = 1;

app.get("/users", (req, res) => {
  res.status(200).json(users);
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  const newUser = {
    id: nextId++,
    name,
    email,
  };
  users.push(newUser);

  res.status(201).json(newUser);
});

app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: `User with ID ${userId} not found.` });
  }

  users.splice(userIndex, 1);
  res
    .status(200)
    .json({ message: `User with ID ${userId} deleted successfully.` });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
