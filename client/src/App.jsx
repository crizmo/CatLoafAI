import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoafUploader from "./LoafUploader";
import LoafClassifier from "./LoafClassifier";

function App() {
  return (
    <Router>
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h1>🐱 Cat Loaf Rater</h1>
        <nav>
          <Link to="/upload" style={{ margin: "10px" }}>Upload Loaf</Link>
          <Link to="/classify" style={{ margin: "10px" }}>Classify Loaf</Link>
        </nav>
        <Routes>
          <Route path="/upload" element={<LoafUploader />} />
          <Route path="/classify" element={<LoafClassifier />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;