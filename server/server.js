const express = require("express");
const cors = require("cors");  // Import CORS
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { trainModel } = require("./train");

const app = express();
const PORT = 5000;

app.use(cors()); // Allow frontend to access the backend
app.use(express.json());

const UPLOAD_DIR = "dataset";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {
    const { category } = req.body;
    const categoryDir = path.join(UPLOAD_DIR, category);
    fs.mkdirSync(categoryDir, { recursive: true });

    const filename = `${Date.now()}.jpg`;
    const filepath = path.join(categoryDir, filename);

    await sharp(req.file.buffer)
        .resize(128, 128)
        .toFile(filepath);

    res.json({ message: "Image uploaded and resized!" });
});

app.post("/train", async (req, res) => {
    await trainModel();
    res.json({ message: "Model trained successfully!" });
});

// Serve TensorFlow.js model
app.use("/tfjs_model", express.static(path.join(__dirname, "tfjs_model")));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
