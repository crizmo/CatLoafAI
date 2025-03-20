import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

function LoafClassifier() {
  const [image, setImage] = useState(null);
  const [model, setModel] = useState(null);
  const [result, setResult] = useState(null);
  const [markedImage, setMarkedImage] = useState(null);
  const [error, setError] = useState(null);
  const [fetchedImage, setFetchedImage] = useState(null);
  const [explanation, setExplanation] = useState(null); // Store explanation text

  const CATAAS_API_URL = "https://cataas.com/cat"; // Fetch random cat images

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
      setFetchedImage(URL.createObjectURL(blob)); // Show preview
      setImage(URL.createObjectURL(blob)); // Set for classification
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
      // Send the image to the server for explanation & bounding box points
      const formData = new FormData();
      formData.append("image", await fetch(image).then(res => res.blob()));

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      
      if (loafScore < 4) setExplanation("Not a loaf: legs visible, bad shape.");
      else if (loafScore < 7) setExplanation("Partial loaf: tail visible | minor issues.");
      else if (loafScore < 9) setExplanation("Good loaf, but slight misalignment.");
      else setExplanation("Perfect loaf!");

      // Draw bounding boxes based on key points
      // ctx.strokeStyle = "red";
      // ctx.lineWidth = 2;
      // for (const box of data.bounding_boxes) {
      //   console.log("📦 Drawing box:", box);
      //   ctx.strokeRect(box.x, box.y, box.width, box.height);
      // }

      setMarkedImage(canvas.toDataURL());
    };
  };

  // Handle Ctrl+V Paste Image
  const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImage(e.target.result); // Show pasted image immediately
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
    <div>
      <h2>Classify Loaf</h2>
      {error && <h3 style={{ color: "red" }}>{error}</h3>}
      <input type="file" onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))} />
      <button onClick={classifyImage} disabled={!model}>Classify</button>
      <p>📋 Paste an image using Ctrl+V</p>

      <h3>Fetch Random Cat Image</h3>
      <button onClick={fetchRandomImage}>Fetch Image</button>

      {fetchedImage && (
        <div>
          <button onClick={classifyImage}>Classify Fetched Cat</button>
        </div>
      )}

      {image && <img src={image} alt="Pasted/Uploaded Loaf" style={{ maxWidth: "300px", marginTop: "10px", borderRadius: "8px" }} />}
      {result && <h3>{result}</h3>}
      {markedImage && <img src={markedImage} alt="Analyzed Loaf" />}
      {explanation && <p>{explanation}</p>}
    </div>
  );
}

export default LoafClassifier;
