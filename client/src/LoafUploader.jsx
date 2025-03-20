import { useState, useEffect } from "react";

function LoafUploader() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("loaf");

  const uploadImage = async () => {
    if (!file) return alert("Select an image first!");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);

    await fetch("http://localhost:5000/upload", { method: "POST", body: formData });
    alert("Image uploaded!");
  };

  const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          setFile(file);
          alert("Image pasted!");
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
      <h2>Upload Cat Image</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <select onChange={(e) => setCategory(e.target.value)}>
        <option value="loaf">Loaf</option>
        <option value="not_loaf">Not Loaf</option>
      </select>
      <button onClick={uploadImage}>Upload</button>
      <p>📋 Paste an image using Ctrl+V</p>
    </div>
  );
}

export default LoafUploader;
