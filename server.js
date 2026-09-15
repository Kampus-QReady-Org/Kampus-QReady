const express = require("express");

const app = express();

// Allows the backend to receive JSON data
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Kampus-QReady API is running successfully");
});

// Render will provide PORT when hosted.
// 3000 will be used when running locally.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Kampus-QReady server running on port ${PORT}`);
});