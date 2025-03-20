import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

function LoafClassifier() {
  const [image, setImage] = useState(null);
  const [model, setModel] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadModel() {
      try {
        const model = await tf.loadLayersModel("http://localhost:5000/tfjs_model/model.json");
        setModel(model);
        console.log("✅ Model loaded successfully!");
      } catch (error) {
        console.error("❌ Error loading model:", error);
      }
    }
    loadModel();
  }, []);

  const classifyImage = async () => {
    if (!image || !model) return;

    const img = new Image();
    img.src = image;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      canvas.getContext("2d").drawImage(img, 0, 0, 128, 128);

      const tensor = tf.browser.fromPixels(canvas)
        .toFloat()
        .div(255)
        .expandDims();

      const prediction = model.predict(tensor);
      const score = await prediction.data();

      setResult(score[0] > 0.5 ? "Loaf! 🥖" : "Not a loaf 🐱");
    };
  };

  return (
    <div>
      <h2>Classify Loaf</h2>
      <input type="file" onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))} />
      <button onClick={classifyImage}>Classify</button>
      {result && <h3>{result}</h3>}
    </div>
  );
}

export default LoafClassifier;
