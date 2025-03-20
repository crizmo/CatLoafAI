import { useState, useEffect } from "react";

function LoafUploader() {
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // Store pasted/uploaded image
  const [rating, setRating] = useState(10); // Default loaf rating
  const [loafImages, setLoafImages] = useState([]);
  const [loafFilter, setLoafFilter] = useState("All Ratings");
  const [fetchedImage, setFetchedImage] = useState(null); // Store fetched image URL

  const CATAAS_API_URL = "https://cataas.com/cat"; // Fetch random cat images

  const fetchRandomImage = async () => {
    try {
      const response = await fetch(CATAAS_API_URL);
      const blob = await response.blob();
      const file = new File([blob], `fetched_cat.jpg`, { type: blob.type });

      setFetchedImage(URL.createObjectURL(blob)); // Show preview
      setFile(file); // Set as file to upload
    } catch (error) {
      console.error("Error fetching image:", error);
      alert("Failed to fetch image. Please try again.");
    }
  };

  const uploadImage = async () => {
    if (!file) return alert("Select an image first!");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("rating", rating);

    try {
      const response = await fetch("http://localhost:5000/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed!");

      alert("✅ Image uploaded!");
      setFile(null); // Clear file selection
      setPreviewImage(null); // Remove preview
      setFetchedImage(null); // Clear fetched image
      fetchUploadedImages(); // Refresh image list
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Failed to upload image.");
    }
  };

  const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          setFile(file);
          const reader = new FileReader();
          reader.onload = (e) => setPreviewImage(e.target.result);
          reader.readAsDataURL(file);
          alert("📋 Image pasted!");
        }
      }
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const response = await fetch("http://localhost:5000/uploads");
      const data = await response.json();
  
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format");
      }
  
      // Convert object values to a flat array of image URLs
      const imageArray = Object.values(data).flat();
  
      setLoafImages(imageArray);
    } catch (error) {
      console.error("Failed to fetch uploaded images:", error);
      setLoafImages([]); // Ensure it doesn't break if the fetch fails
    }
  };
  

  const filterImages = (images, filter) => {
    if (filter === "All Ratings") return images;

    return images.filter(img => {
      const ratingMatch = img.match(/loaf_(\d+)_/); // Extract rating from filename
      if (ratingMatch) {
        const rating = parseInt(ratingMatch[1]);
        return rating === parseInt(filter);
      }
      return false;
    });
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    fetchUploadedImages();
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <div>
      <h2>Upload Cat Image</h2>
      <input type="file" onChange={(e) => {
        setFile(e.target.files[0]);
        setPreviewImage(URL.createObjectURL(e.target.files[0]));
      }} />

      <label>Rate the loaf (1-10):</label>
      <input type="number" min="1" max="10" value={rating} onChange={(e) => setRating(e.target.value || 1)} />

      <button onClick={uploadImage}>Upload</button>
      <p>📋 Paste an image using Ctrl+V</p>

      {previewImage && <img src={previewImage} alt="Preview" style={{ width: "150px", marginTop: "10px", borderRadius: "8px" }} />}

      <h3>Fetch Random Cat Image</h3>
      <button onClick={fetchRandomImage}>Fetch Image</button>
      {fetchedImage && (
        <div>
          <img src={fetchedImage} alt="Fetched Cat" style={{ width: "150px", marginTop: "10px", borderRadius: "8px" }} />
          <button onClick={uploadImage}>Rate & Upload</button>
        </div>
      )}

      <h3>Filter Loaf Images</h3>
      <div>
        <label>Filter by Rating:</label>
        <select value={loafFilter} onChange={(e) => setLoafFilter(e.target.value)}>
          <option>All Ratings</option>
          {[...Array(10).keys()].map(i => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        {filterImages(loafImages, loafFilter).map((img, index) => (
          <img key={index} src={img} alt="Loaf" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }} />
        ))}
      </div>
    </div>
  );
}

export default LoafUploader;
