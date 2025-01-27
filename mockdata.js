// mockData.js

// Array to hold mock data
let users = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    age: 28,
    country: "USA",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    age: 34,
    country: "Canada",
  },
  {
    id: 3,
    name: "Emily Johnson",
    email: "emily.johnson@example.com",
    age: 22,
    country: "UK",
  },
];

// Simple function to simulate getting all users
function getAllUsers(req, res) {
  res.status(200).json(users);
}

// Simulate getting a single user by ID
function getUserById(req, res) {
  const { id } = req.params;
  const user = users.find((user) => user.id === parseInt(id));

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
}

// Simulate adding a new user
function addUser(req, res) {
  const { name, email, age, country } = req.body;

  if (!name || !email || !age || !country) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    age,
    country,
  };

  users.push(newUser);
  res.status(201).json(newUser);
}

// Simulate updating a user by ID
function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, age, country } = req.body;

  const userIndex = users.findIndex((user) => user.id === parseInt(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users[userIndex] = {
    id: parseInt(id),
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    age: age || users[userIndex].age,
    country: country || users[userIndex].country,
  };

  res.status(200).json(users[userIndex]);
}

// Simulate deleting a user by ID
function deleteUser(req, res) {
  const { id } = req.params;
  const userIndex = users.findIndex((user) => user.id === parseInt(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users.splice(userIndex, 1);
  res.status(204).end();
}

module.exports = {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
};
