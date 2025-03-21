import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import {
  Box,
  Button,
  Typography,
  TextField,
  Card,
  CardMedia,
  CircularProgress,
} from "@mui/material";

function LoafClassifier() {
  const [image, setImage] = useState(null);
  const [model, setModel] = useState(null);
  const [result, setResult] = useState(null);
  const [markedImage, setMarkedImage] = useState(null);
  const [error, setError] = useState(null);
  const [fetchedImage, setFetchedImage] = useState(null);
  const [explanation, setExplanation] = useState(null);

  const CATAAS_API_URL = "https://cataas.com/cat";

  useEffect(() => {
    async function loadModel() {
      try {
        const response = await fetch("http://localhost:5000/tfjs_model/model.json");
        if (!response.ok) throw new Error("Model not found. Train it first!");

        const model = await tf.loadLayersModel("http://localhost:5000/tfjs_model/model.json");
        setModel(model);
        console.log("✅ Model loaded successfully!");
      } catch (err) {
        console.error("❌ Error loading model:", err.message);
        setError(err.message);
      }
    }
    loadModel();
  }, []);

  const fetchRandomImage = async () => {
    try {
      const response = await fetch(CATAAS_API_URL);
      const blob = await response.blob();
      setFetchedImage(URL.createObjectURL(blob));
      setImage(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error fetching image:", error);
      alert("Failed to fetch image. Please try again.");
    }
  };

  const classifyImage = async () => {
    if (!image || !model) return;

    const img = new Image();
    img.src = image;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 128;
      canvas.height = 128;
      ctx.drawImage(img, 0, 0, 128, 128);

      const tensor = tf.browser.fromPixels(canvas)
        .toFloat()
        .div(255)
        .expandDims();

      const prediction = model.predict(tensor);
      const score = await prediction.data();
      const loafScore = Math.round(score[0] * 10);
      setResult(`Loaf Score: ${loafScore}/10`);
      console.log("🍞 Loaf Score:", loafScore);

      const formData = new FormData();
      formData.append("image", await fetch(image).then((res) => res.blob()));

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (loafScore < 4) setExplanation("Not a loaf: legs visible, bad shape.");
      else if (loafScore < 7) setExplanation("Partial loaf: tail visible | minor issues.");
      else if (loafScore < 9) setExplanation("Good loaf, but slight misalignment.");
      else setExplanation("Perfect loaf!");

      setMarkedImage(canvas.toDataURL());
    };
  };

  const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImage(e.target.result);
          };
          reader.readAsDataURL(file);
          alert("📋 Image pasted!");
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Classify Loaf
      </Typography>
      {error && (
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <Box mb={2}>
        <Button variant="contained" component="label">
          Upload Image
          <input
            type="file"
            hidden
            onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
          />
        </Button>
      </Box>
      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={classifyImage}
          disabled={!model}
        >
          Classify
        </Button>
        <Typography variant="body2" mt={1}>
          📋 Paste an image using Ctrl+V
        </Typography>
      </Box>
      <Box mb={2}>
        <Typography variant="h5" gutterBottom>
          Fetch Random Cat Image
        </Typography>
        <Button variant="contained" color="secondary" onClick={fetchRandomImage}>
          Fetch Image
        </Button>
      </Box>
      {fetchedImage && (
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={classifyImage}
            disabled={!model}
          >
            Classify Fetched Cat
          </Button>
        </Box>
      )}
      {image && (
        <Card sx={{ mt: 2, maxWidth: 300 }}>
          <CardMedia
            component="img"
            image={image}
            alt="Uploaded Loaf"
            sx={{ borderRadius: 2 }}
          />
        </Card>
      )}
      {result && (
        <Typography variant="h6" color="primary" mt={2}>
          {result}
        </Typography>
      )}
      {markedImage && (
        <Card sx={{ mt: 2, maxWidth: 300 }}>
          <CardMedia
            component="img"
            image={markedImage}
            alt="Analyzed Loaf"
            sx={{ borderRadius: 2 }}
          />
        </Card>
      )}
      {explanation && (
        <Typography variant="body1" mt={2}>
          {explanation}
        </Typography>
      )}
    </Box>
  );
}

export default LoafClassifier;