import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Card,
  CardMedia,
} from "@mui/material";

function LoafUploader() {
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [rating, setRating] = useState(10);
  const [loafImages, setLoafImages] = useState([]);
  const [loafFilter, setLoafFilter] = useState("All Ratings");
  const [fetchedImage, setFetchedImage] = useState(null);

  const CATAAS_API_URL = "https://cataas.com/cat";

  const fetchRandomImage = async () => {
    try {
      const response = await fetch(CATAAS_API_URL);
      const blob = await response.blob();
      const file = new File([blob], `fetched_cat.jpg`, { type: blob.type });

      setFetchedImage(URL.createObjectURL(blob));
      setFile(file);
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
      setFile(null);
      setPreviewImage(null);
      setFetchedImage(null);
      fetchUploadedImages();
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Failed to upload image.");
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const response = await fetch("http://localhost:5000/uploads");
      const data = await response.json();
      const imageArray = Object.values(data).flat();
      setLoafImages(imageArray);
    } catch (error) {
      console.error("Failed to fetch uploaded images:", error);
      setLoafImages([]);
    }
  };

  const filterImages = (images, filter) => {
    if (filter === "All Ratings") return images;

    return images.filter((img) => {
      const ratingMatch = img.match(/loaf_(\d+)_/);
      if (ratingMatch) {
        const rating = parseInt(ratingMatch[1]);
        return rating === parseInt(filter);
      }
      return false;
    });
  };

  useEffect(() => {
    fetchUploadedImages();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Cat Image
      </Typography>
      <Box mb={2}>
        <Button variant="contained" component="label">
          Select Image
          <input
            type="file"
            hidden
            onChange={(e) => {
              setFile(e.target.files[0]);
              setPreviewImage(URL.createObjectURL(e.target.files[0]));
            }}
          />
        </Button>
        {previewImage && (
          <Box mt={2}>
            <Typography variant="body1">Preview:</Typography>
            <img
              src={previewImage}
              alt="Preview"
              style={{ width: "150px", borderRadius: "8px" }}
            />
          </Box>
        )}
      </Box>
      <Box mb={2}>
        <TextField
          label="Rate the loaf (1-10)"
          type="number"
          value={rating}
          onChange={(e) => setRating(e.target.value || 1)}
          inputProps={{ min: 1, max: 10 }}
        />
      </Box>
      <Button variant="contained" color="primary" onClick={uploadImage}>
        Upload
      </Button>
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Fetch Random Cat Image
        </Typography>
        <Button variant="contained" color="secondary" onClick={fetchRandomImage}>
          Fetch Image
        </Button>
        {fetchedImage && (
          <Box mt={2}>
            <Typography variant="body1">Fetched Image:</Typography>
            <img
              src={fetchedImage}
              alt="Fetched Cat"
              style={{ width: "150px", borderRadius: "8px" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={uploadImage}
              sx={{ mt: 2 }}
            >
              Rate & Upload
            </Button>
          </Box>
        )}
      </Box>
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Filter Loaf Images
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Filter by Rating</InputLabel>
          <Select
            value={loafFilter}
            onChange={(e) => setLoafFilter(e.target.value)}
          >
            <MenuItem value="All Ratings">All Ratings</MenuItem>
            {[...Array(10).keys()].map((i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {i + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Grid container spacing={2} mt={2}>
          {filterImages(loafImages, loafFilter).map((img, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={img}
                  alt="Loaf"
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default LoafUploader;