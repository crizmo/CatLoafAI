import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import LoafUploader from "./LoafUploader";
import LoafClassifier from "./LoafClassifier";

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🐱 CatLoafAI
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/upload">
            Upload Loaf
          </Button>
          <Button color="inherit" component={Link} to="/classify">
            Classify Loaf
          </Button>
          <Button
            color="inherit"
            href="https://github.com/crizmo/CatLoaf"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route
            path="/"
            element={
              <Box textAlign="center">
                <Typography variant="h4" gutterBottom>
                  Welcome to CatLoafAI 🐱🥖
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Analyze and rate your cat's loafness with AI-powered tools!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/upload"
                  sx={{ m: 1 }}
                >
                  Upload Loaf
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  component={Link}
                  to="/classify"
                  sx={{ m: 1 }}
                >
                  Classify Loaf
                </Button>
              </Box>
            }
          />
          <Route path="/upload" element={<LoafUploader />} />
          <Route path="/classify" element={<LoafClassifier />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;