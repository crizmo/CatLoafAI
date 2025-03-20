import { useState } from "react";
import LoafUploader from "./LoafUploader";
import LoafClassifier from "./LoafClassifier";

function App() {
  const [modelLoaded, setModelLoaded] = useState(false);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🐱 Cat Loaf Rater</h1>
      <LoafUploader />
      <LoafClassifier modelLoaded={modelLoaded} setModelLoaded={setModelLoaded} />
    </div>
  );
}

export default App;
