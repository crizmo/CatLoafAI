const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");

const IMG_SIZE = 128;

async function loadDataset() {
    const categories = ["loaf", "not_loaf"];
    let images = [];
    let labels = [];

    console.log("🔄 Loading dataset...");

    for (let i = 0; i < categories.length; i++) {
        const categoryPath = `dataset/${categories[i]}`;
        if (!fs.existsSync(categoryPath)) {
            console.log(`⚠️ Warning: No images found in ${categoryPath}`);
            continue;
        }

        const files = fs.readdirSync(categoryPath);
        if (files.length === 0) {
            console.log(`⚠️ Warning: No images found in ${categoryPath}`);
            continue;
        }

        for (let file of files) {
            const buffer = fs.readFileSync(path.join(categoryPath, file));
            const tensor = tf.node.decodeImage(buffer)
                .resizeNearestNeighbor([IMG_SIZE, IMG_SIZE])
                .toFloat()
                .div(255)
                .expandDims();

            images.push(tensor);
            labels.push(i);
        }
    }

    if (images.length === 0) {
        console.error("❌ ERROR: No images loaded! Make sure dataset folders contain images.");
        process.exit(1);
    }

    console.log(`✅ Loaded ${images.length} images successfully.`);
    return {
        xs: tf.concat(images),
        ys: tf.oneHot(tf.tensor1d(labels, "int32"), 2)
    };
}

async function trainModel() {
    console.log("🚀 Starting model training...");
    const { xs, ys } = await loadDataset();

    const model = tf.sequential();
    model.add(tf.layers.conv2d({ inputShape: [128, 128, 3], filters: 32, kernelSize: 3, activation: "relu" }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: "relu" }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 128, activation: "relu" }));
    model.add(tf.layers.dense({ units: 2, activation: "softmax" }));

    model.compile({ optimizer: "adam", loss: "categoricalCrossentropy", metrics: ["accuracy"] });

    console.log("🧠 Training the model...");
    await model.fit(xs, ys, {
        epochs: 10,
        batchSize: 16,
        callbacks: {
            onEpochEnd: (epoch, logs) => console.log(`📊 Epoch ${epoch + 1}: loss = ${logs.loss}, accuracy = ${logs.acc}`)
        }
    });

    console.log("💾 Saving trained model...");
    await model.save(`file://tfjs_model`);
    console.log("✅ Model training complete!");
}

trainModel().catch(error => {
    console.error("❌ ERROR: Training failed!", error);
    process.exit(1);
});
