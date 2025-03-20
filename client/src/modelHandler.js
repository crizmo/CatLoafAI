import * as tf from "@tensorflow/tfjs";

let model;

export async function loadModel() {
  model = await tf.loadLayersModel("http://localhost:5000/model.json");
  console.log("Model loaded!");
}

export async function classifyLoaf(imageSrc) {
  const img = new Image();
  img.src = imageSrc;

  return new Promise((resolve) => {
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 128;
      canvas.height = 128;
      ctx.drawImage(img, 0, 0, 128, 128);

      const tensor = tf.browser.fromPixels(canvas)
        .toFloat()
        .div(255.0)
        .expandDims(0);

      const prediction = model.predict(tensor);
      const score = await prediction.data();
      resolve(Math.round(score[0] * 10));
      tensor.dispose();
    };
  });
}
