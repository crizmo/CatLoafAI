const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { trainModel } = require("./train");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const UPLOAD_DIR = "dataset";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 **Handle image uploads & rating**
app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const { rating } = req.body;
        const validRating = Math.min(Math.max(parseInt(rating), 1), 10); // Ensure rating is between 1-10
        const categoryDir = path.join(UPLOAD_DIR, `loaf/${validRating}`);
        fs.mkdirSync(categoryDir, { recursive: true });

        const filename = `loaf_${validRating}_${Date.now()}.jpg`;
        const filepath = path.join(categoryDir, filename);

        await sharp(req.file.buffer)
            .resize(128, 128)
            .toFile(filepath);

        // Delay response to ensure file writes are complete before frontend fetches
        setTimeout(() => {
            res.json({ 
                message: `✅ Image uploaded and rated ${validRating}/10!`, 
                filePath: `/dataset/loaf/${validRating}/${filename}` 
            });
        }, 500);
    } catch (err) {
        console.error("❌ Upload failed:", err);
        res.status(500).json({ error: "Upload failed." });
    }
});

// 📌 **Fetch uploaded images & organize by rating**
app.get("/uploads", (req, res) => {
    try {
        const loafDirs = fs.readdirSync(path.join(UPLOAD_DIR, "loaf"), { withFileTypes: true })
            .filter(dir => dir.isDirectory())
            .map(dir => dir.name);

        let loafImages = {};
        for (const dir of loafDirs) {
            loafImages[dir] = fs.readdirSync(path.join(UPLOAD_DIR, "loaf", dir))
                .map(file => `http://localhost:5000/dataset/loaf/${dir}/${file}`);
        }

        res.json(Object.values(loafImages).flat()); // Convert to array

    } catch (err) {
        console.error("❌ Failed to fetch uploads:", err);
        res.status(500).json({ error: "Failed to fetch images." });
    }
});

// 📌 **Analyze loaf image for bounding boxes & explanation**
app.post("/analyze", upload.single("image"), async (req, res) => {
    try {
        const imageBuffer = req.file.buffer;
        const imgPath = `temp.jpg`;
        await sharp(imageBuffer).resize(128, 128).toFile(imgPath);

        // Simulated score from model (Replace this with actual model inference)
        const score = Math.random() * 10; 
        let explanation = "Perfect loaf!";
        if (score < 4) explanation = "Not a loaf: legs visible, bad shape.";
        else if (score < 7) explanation = "Partial loaf: tail visible, minor issues.";
        else if (score < 9) explanation = "Good loaf, but slight misalignment.";

        const boundingBoxes = [
            { x: 30, y: 40, width: 50, height: 60 }, // Example: Body box
            { x: 60, y: 80, width: 20, height: 30 }  // Example: Paw box
        ];

        res.json({ score: Math.round(score), explanation, bounding_boxes: boundingBoxes });
    } catch (err) {
        console.error("❌ Analysis failed!", err);
        res.status(500).json({ error: "Failed to analyze image." });
    }
});

// 📌 **Train the model on demand**
app.post("/train", async (req, res) => {
    try {
        await trainModel();
        res.json({ message: "✅ Model trained successfully!" });
    } catch (err) {
        console.error("❌ Training failed!", err);
        res.status(500).json({ error: "Model training failed." });
    }
});

// 📌 **Serve TensorFlow.js model if it exists**
app.get("/tfjs_model/model.json", (req, res) => {
    const modelPath = path.join(__dirname, "tfjs_model", "model.json");
    if (!fs.existsSync(modelPath)) {
        return res.status(404).json({ error: "Model not found. Train the model first!" });
    }
    res.sendFile(modelPath);
});

// 📌 **Serve model weights if available**
app.use("/tfjs_model", express.static(path.join(__dirname, "tfjs_model")));

// 📌 **Serve uploaded images statically**
app.use("/dataset", express.static(path.join(__dirname, "dataset")));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
