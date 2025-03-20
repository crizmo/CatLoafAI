import { useEffect } from "react";

function LoafAnalyzer({ image, setRating, setMarkedImage }) {
  useEffect(() => {
    if (!image) return;

    const checkOpenCV = () => {
      if (typeof cv === "undefined" || !cv.imread) {
        console.error("OpenCV.js is not ready. Retrying...");
        setTimeout(checkOpenCV, 500); // Retry every 500ms
        return;
      }
      processImage();
    };

    const processImage = () => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        try {
          let src = cv.imread(canvas);
          let gray = new cv.Mat();
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

          let edges = new cv.Mat();
          cv.Canny(gray, edges, 50, 150, 3, false);

          let contours = new cv.MatVector();
          let hierarchy = new cv.Mat();
          cv.findContours(edges, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

          let compactnessScore = 0;
          let boundingRects = [];

          for (let i = 0; i < contours.size(); i++) {
            let cnt = contours.get(i);
            let rect = cv.boundingRect(cnt);
            let aspectRatio = rect.width / rect.height;

            // Loaf detection refinement: checking size and aspect ratio
            if (aspectRatio >= 0.85 && aspectRatio <= 1.15 && rect.width > 50 && rect.height > 50) {
              compactnessScore += 4;
              boundingRects.push(rect);
            }
          }

          let loafScore = Math.min(10, compactnessScore);
          setRating(loafScore);

          // Draw bounding boxes
          boundingRects.forEach(rect => {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
          });

          setMarkedImage(canvas.toDataURL());

          // Cleanup memory
          src.delete();
          gray.delete();
          edges.delete();
          contours.delete();
          hierarchy.delete();
        } catch (error) {
          console.error("Error processing image:", error);
        }
      };
    };

    checkOpenCV(); // Start OpenCV check
  }, [image, setRating, setMarkedImage]);

  return null;
}

export default LoafAnalyzer;
