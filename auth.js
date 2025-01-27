const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const users = []; // Mock database for registered users
const JWT_SECRET = "your_secret_key"; // Replace with a strong secret key in production

// User signup
function signup(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  // Check if the user already exists
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ error: "Username already exists." });
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Save the user
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: "User registered successfully." });
}

// User login
function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  // Find the user
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  // Compare the password
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  // Generate a JWT
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  res.status(200).json({ message: "Login successful.", token });
}

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    req.user = user; // Attach user info to the request object
    next(); // Proceed to the next middleware/route handler
  });
}

module.exports = {
  signup,
  login,
  authenticateToken,
};
