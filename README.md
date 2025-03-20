# 🐱 Cat Loaf Rater

### **A web app to rate and classify cat loaves using machine learning.**

---

## 📌 **Project Overview**
The **Cat Loaf Rater** is a (Express, React, Node.js) + TensorFlow.js web app where users can **upload or paste** images of their cats, and the system will **analyze and rate the loafness** using a trained deep learning model.

---

## 🎯 **Features**

✅ Upload or paste cat images for loaf analysis  
✅ Fetch random cat images from **CATAAS API** for testing  
✅ Train a **TensorFlow.js** model based on user-rated loaf scores (1-10)  
✅ Classifies images and provides **detailed loaf score explanation**  
✅ Uses **bounding boxes** to highlight loaf features (paws, body alignment, etc.)  
✅ Filter uploaded images by **loaf rating (1-10)**  

---

## 🛠️ **Installation & Setup**

### **1️⃣ Clone the Repository**  
```sh
git clone https://github.com/crizmo/CatLoaf
cd catloaf
```

### **2️⃣ Install Dependencies**  

#### **Backend (Server)**
```sh
cd server
npm install express cors multer sharp fs path tensorflow/tfjs-node
```

#### **Frontend (Client)**
```sh
cd ../client
npm install react-router-dom @tensorflow/tfjs
```

### **3️⃣ Run the Application**  

#### **Start Backend (Server)**
```sh
cd server
node server.js
```

#### **Start Frontend (Client)**
```sh
cd client
npm run dev
```

Now visit **`http://localhost:5173`** in your browser! 🚀

---

## 🖼️ **How to Use**

### **1️⃣ Upload & Rate a Cat Image**  
- Choose a file or paste an image using **Ctrl+V**  
- Assign a loaf score from **1 to 10**  
- Click `"Upload"` to save the image for training  

### **2️⃣ Fetch & Classify a Random Cat Image**  
- Click `"Fetch Image"` to get a random cat  
- Click `"Classify"` to rate its loafness  
- See bounding boxes & loaf score explanation  

### **3️⃣ Train the Model (Optional)**  
If you've uploaded new images, retrain the model:  
```sh
curl -X POST http://localhost:5000/train
```

---

## 🛠️ **API Endpoints**

### **1️⃣ Upload an Image**
```http
POST /upload
```
- **Body:** `{ image: file, rating: 1-10 }`
- **Response:** `{ message: "✅ Image uploaded!", filePath: "/dataset/loaf/{rating}/file.jpg" }`  

### **2️⃣ Get Uploaded Images**
```http
GET /uploads
```
- **Response:** `{ "10": ["/dataset/loaf/10/img.jpg"], "9": ["/dataset/loaf/9/img.jpg"] }`  

### **3️⃣ Analyze a Loaf Image**
```http
POST /analyze
```
- **Response:** `{ score: 8, explanation: "Good loaf, slight misalignment.", bounding_boxes: [...] }`  

### **4️⃣ Train the Model**
```http
POST /train
```
- **Response:** `{ message: "✅ Model trained successfully!" }`  

---

## 📂 **Project Structure**
```
📦 cat-loaf-rater
├── 📁 client           # React Frontend
│   ├── 📁 src
│   │   ├── 📝 App.jsx
│   │   ├── 📝 LoafUploader.jsx
│   │   ├── 📝 LoafClassifier.jsx
│   ├── 📄 package.json
│   ├── 📄 index.html
│   ├── 📄 vite.config.js
│
├── 📁 server           # Express Backend
│   ├── 📁 dataset     # Stored uploaded images
│   ├── 📁 tfjs_model  # Trained model files
│   ├── 📝 server.js
│   ├── 📝 train.js
│   ├── 📄 package.json
│
└── README.md          # Project Documentation
```


---

🐱🥖 **Enjoy rating cat loaves!** 🚀🔥
