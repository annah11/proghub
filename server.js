const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Initialize App
const app = express();
app.use(bodyParser.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_uploads", // Folder name in Cloudinary
    allowed_formats: ["jpeg", "png", "jpg"],
    transformation: [{ width: 800, height: 800, crop: "limit" }], // Resize images
  },
});
const upload = multer({ storage });

// Users Storage (for demonstration purposes)
let users = [];
let nextUserId = 1;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    req.user = user; // Add user info to request
    next();
  });
};

// Routes

// 1. User Registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  // Check if the username already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(409).json({ error: "Username already exists." });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: nextUserId++,
    username,
    password: hashedPassword,
  };
  users.push(newUser);

  res.status(201).json({ message: "User registered successfully." });
});

// 2. User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(403).json({ error: "Invalid credentials." });
  }

  // Generate a JWT Token
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json({ message: "Login successful.", token });
});

// 3. Fetch User Info (Protected Route)
app.get("/profile", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  res.status(200).json({ id: user.id, username: user.username });
});

// 4. Image Upload (Protected Route)
app.post(
  "/upload-image",
  authenticateToken,
  upload.single("image"),
  (req, res) => {
    try {
      const imageUrl = req.file.path; // Get image URL from Cloudinary
      res.status(200).json({
        message: "Image uploaded successfully.",
        imageUrl,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to upload image.", details: error.message });
    }
  }
);

// 5. Logout (Optional)
app.post("/logout", authenticateToken, (req, res) => {
  // Invalidate token (optional depending on requirements)
  res.status(200).json({ message: "Logout successful." });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
