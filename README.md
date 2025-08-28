🕵️‍♂️ Steganography Tool — Elevate Labs Internship Project

A dual-approach steganography solution developed during the Elevate Labs Internship. This project includes:

🐍 A Python GUI Tool using Tkinter for embedding files/text into images.

⚛️ A Modern Web Version built with React + TypeScript (hosted online).

🌐 Try the Web Version Online

🔗 https://advanced-steganograp-f3g1.bolt.host

📦 Project Overview
🧩 Method 1: Python GUI Tool

A desktop GUI application for local steganography. Embed and extract text/files from images with optional AES-GCM encryption.

🔧 Features:

🖼️ Supports PNG/BMP (lossless) image formats

🔒 Optional passphrase-based AES encryption

📄 Embed text or entire files

💬 Drag-and-drop support (via tkinterdnd2)

💡 Simple and intuitive Tkinter-based GUI

🚀 Getting Started (Python)

Clone and navigate:

git clone https://github.com/jagadeep18/Elevate_Labs_Internship_Project_Steganography_Tool.git
cd Elevate_Labs_Internship_Project_Steganography_Tool/python


Install dependencies:

pip install pillow pycryptodome tkinterdnd2


Run the app:

python stego_tool.py

⚛️ Method 2: Web Tool (React + TypeScript + Vite)

A lightweight and interactive steganography web app with drag-and-drop, encryption, and instant previews.

🔧 Features:

⚡ Fast, responsive UI (React + TailwindCSS)

🔐 AES-GCM encryption

📂 Drag-and-drop image and file handling

📤 Extract hidden content via browser

🌍 Hosted and accessible online

🚀 Getting Started (Web App)

Clone and enter the project folder:

cd Elevate_Labs_Internship_Project_Steganography_Tool/project


Install dependencies:

npm install


Start development server:

npm run dev


Build for production:

npm run build

📁 Project Structure
.
├── python/               # Python GUI version
│   └── stego_tool.py     # Main Tkinter GUI
│
├── project/              # React + TypeScript version
│   ├── src/
│   ├── steganography.js  # Image encoding/decoding logic
│   ├── app.js
│   └── ...

## 📸 Screenshots

### Main Window - 1
![Screenshot 1](https://github.com/jagadeep18/Elevate_Labs_Internship_Project_Steganography_Tool/blob/main/Screenshot_1.png?raw=true)

### Main Window - 2
![Screenshot 2](https://github.com/jagadeep18/Elevate_Labs_Internship_Project_Steganography_Tool/blob/main/Screenshot_2.png?raw=true)

🛠 Dependencies
Python Version

Python 3.x

Pillow

PyCryptodome

Tkinter (built-in)

tkinterdnd2 (optional for drag-and-drop)

Web Version

React + TypeScript + Vite

TailwindCSS

JavaScript (for steganography logic)

⚠️ Notes

Always use PNG/BMP formats to avoid corruption from image compression.

Drag-and-drop functionality requires tkinterdnd2 (Python version).

AES encryption is optional but recommended for sensitive data.

👨‍💻 Author

Developed by Jagadeep Gorantla
💼 Internship Project @ Elevate Labs
