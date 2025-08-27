# Elevate_Labs_Internship_Project_Steganography_Tool
A Python-based Steganography Tool with a Tkinter GUI for hiding text and files inside images (PNG/BMP). Supports AES-GCM encryption, drag-and-drop, and secure data extraction.



````markdown
# 🕵️‍♂️ Steganography Tool (Image/File Hiding)

A Python-based **Steganography GUI Tool** that allows you to **embed text or files inside images** using **LSB (Least Significant Bit) steganography** with optional **AES-GCM encryption**.  

This tool supports **drag-and-drop**, has a **Tkinter GUI**, and works best with **PNG** or **BMP** images (lossless formats).

---

## ✨ Features
- 🔐 **Embed text or files** inside an image.
- 🛡️ **AES-GCM Encryption (optional)** with passphrase support.
- 📂 **Drag-and-drop support** (via `tkinterdnd2`).
- 🎨 Supports **PNG** and **BMP** images (recommended).
- 📜 **Preserves hidden file names** for extraction.
- 🖼️ GUI built with **Tkinter** for ease of use.

---

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/steganography-tool.git
   cd steganography-tool
````

2. Install dependencies:

   ```bash
   pip install pillow pycryptodome tkinterdnd2
   ```

---

## ▶️ Usage

Run the tool with:

```bash
python stego_tool.py
```

### Embedding:

1. Open an image (`.png` or `.bmp` recommended).
2. Choose **Text** or **File** mode.
3. Enter text or select a file.
4. (Optional) Enter a passphrase for encryption.
5. Click **Embed into Image**.
6. Save the modified image.

### Extracting:

1. Open the **modified image**.
2. Enter the passphrase if encryption was used.
3. Click **Extract from Image**.
4. The hidden text will display, or you can save the extracted file.

---

## 🛠️ Dependencies

* [Pillow](https://pypi.org/project/Pillow/) – image processing
* [PyCryptodome](https://pypi.org/project/pycryptodome/) – AES-GCM encryption
* [tkinterdnd2](https://pypi.org/project/tkinterdnd2/) *(optional)* – drag-and-drop support
* \[Tkinter] – built-in with Python

Install them with:

```bash
pip install pillow pycryptodome tkinterdnd2
```

---

## ⚠️ Notes

* **Use PNG or BMP** to avoid corruption (JPEG compression destroys hidden data).
* Embedding capacity depends on image size and channels (RGB/RGBA).
* Drag-and-drop requires `tkinterdnd2`. If unavailable, file dialogs will be used.

---

## 📸 Screenshots

### Main GUI

*(Insert a screenshot of your GUI here)*


---

## 

Developed using:

* Python 3
* Tkinter
* Pillow
* PyCryptodome

```

---

👉 Do you want me to also create a **sample screenshot mockup** (fake GUI preview) that you can add under the **Screenshots** section of your README?
```
