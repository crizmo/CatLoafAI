const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");

const IMG_SIZE = 128;

async function loadDataset() {
    let images = [];
    let labels = [];

    console.log("🔄 Loading dataset...");

    const loafBasePath = path.join("dataset", "loaf");
    if (!fs.existsSync(loafBasePath)) {
        console.error("❌ ERROR: No 'loaf' directory found in dataset!");
        return { xs: null, ys: null };
    }

    // Read all rating folders (6, 8, 9, 10, etc.)
    const loafRatings = fs.readdirSync(loafBasePath).filter(dir => 
        fs.statSync(path.join(loafBasePath, dir)).isDirectory()
    );

    for (const rating of loafRatings) {
        const ratingPath = path.join(loafBasePath, rating);
        const files = fs.readdirSync(ratingPath);

        if (files.length === 0) continue; // Skip empty folders

        for (let file of files) {
            const buffer = fs.readFileSync(path.join(ratingPath, file));
            const tensor = tf.node.decodeImage(buffer)
                .resizeNearestNeighbor([IMG_SIZE, IMG_SIZE])
                .toFloat()
                .div(255)
                .expandDims();

            images.push(tensor);
            labels.push(parseInt(rating) / 10); // Normalize rating (1-10) to 0.1-1
        }
    }

    if (images.length === 0) {
        console.error("❌ ERROR: No images found in dataset!");
        return { xs: null, ys: null };
    }

    console.log(`✅ Loaded ${images.length} images successfully.`);
    return {
        xs: tf.concat(images),
        ys: tf.tensor1d(labels, "float32").expandDims(1)
    };
}

async function trainModel() {
    const { xs, ys } = await loadDataset();
    if (!xs || !ys) {
        console.error("❌ ERROR: Dataset is empty. Training aborted.");
        return;
    }

    const model = tf.sequential();
    model.add(tf.layers.conv2d({ inputShape: [128, 128, 3], filters: 32, kernelSize: 3, activation: "relu" }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: "relu" }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 128, activation: "relu" }));
    model.add(tf.layers.dense({ units: 1 })); // Output single loaf score

    model.compile({ optimizer: "adam", loss: "meanSquaredError", metrics: ["mae"] });

    console.log("🧠 Training the model...");

    await model.fit(xs, ys, {
        epochs: 10,
        batchSize: 16,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`📊 Epoch ${epoch + 1}: Loss = ${logs.loss.toFixed(4)}, MAE = ${logs.mae.toFixed(4)}`);
            }
        }
    });

    console.log("💾 Saving trained model...");
    await model.save(`file://tfjs_model`);
    console.log("✅ Model training complete!");
}

// trainModel().catch(error => {
//     console.error("❌ ERROR: Training failed!", error);
// });

module.exports = { trainModel };
