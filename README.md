# 🕵️‍♂️ Steganography Tool — Elevate Labs Internship Project

> 🔐 A dual-approach steganography solution developed as part of the Elevate Labs Internship program.  
> This project includes both a local Python GUI tool and a modern web version for embedding and extracting files/text from images.

---

## 🌐 Try the Web Version Online

▶️ Live Demo: [https://advanced-steganograp-f3g1.bolt.host](https://advanced-steganograp-f3g1.bolt.host)

---

## 📦 Project Overview

### 🧩 Method 1: Python GUI Tool

A desktop GUI application built using Python’s Tkinter framework. It provides offline steganography capabilities with optional AES encryption.

#### 🔧 Features:
- 🖼️ Support for PNG/BMP (lossless) image formats  
- 🔒 Optional AES-GCM encryption with passphrase  
- 📄 Embed and extract text or entire files  
- 💬 Drag-and-drop support via `tkinterdnd2`  
- 🎨 Simple, user-friendly GUI with status updates  

#### 🚀 Getting Started (Python)

```bash
# Clone the repository
git clone https://github.com/jagadeep18/Elevate_Labs_Internship_Project_Steganography_Tool.git
cd Elevate_Labs_Internship_Project_Steganography_Tool/python

# Install dependencies
pip install pillow pycryptodome tkinterdnd2

# Launch the GUI tool
python stego_tool.py
⚛️ Method 2: Web Tool (React + TypeScript + Vite)
A modern, interactive web-based steganography tool that runs entirely in the browser with no backend dependency.

🔧 Features:
⚡ Lightning-fast UI built with React + TailwindCSS

🔐 Secure AES-GCM encryption/decryption

📂 Drag-and-drop support for images/files

📤 Extract hidden messages or files right in your browser

🌍 Hosted version for instant access

🚀 Getting Started (Web App)
bash
Copy code
# Navigate to the web app project
cd Elevate_Labs_Internship_Project_Steganography_Tool/project

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
📁 Project Structure
bash
Copy code
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
✅ Python Version
Python 3.x

Pillow

PyCryptodome

Tkinter (built-in)

tkinterdnd2 (optional)

✅ Web Version
React + TypeScript + Vite

TailwindCSS

JavaScript (steganography logic)

⚠️ Notes
📌 Use PNG or BMP files only — JPEG may corrupt hidden data.

🔐 AES encryption is optional but highly recommended for privacy.

📂 Drag-and-drop is enabled in both versions (requires tkinterdnd2 in Python).

👨‍💻 Author
Developed by: Jagadeep Gorantla
🧑‍💻 Internship Project @ Elevate Labs
