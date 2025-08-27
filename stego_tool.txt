"""
Steganography GUI Tool (Python, Tkinter)

Features:
- Embed text or any file into an image using LSB steganography.
- Optional AES-GCM encryption with a passphrase.
- Drag-and-drop support via tkinterdnd2 (optional; falls back to file dialogs).
- Supports lossless image formats like PNG and BMP (recommended).

Dependencies:
- Pillow (PIL): pip install pillow
- PyCryptodome (for AES-GCM): pip install pycryptodome
- tkinterdnd2 (optional, for drag-and-drop): pip install tkinterdnd2

Run:
    python stego_tool.py

Notes:
- Embedding capacity depends on image size and channels (we use RGB or RGBA channels).
- Use PNG or BMP to avoid lossy compression (JPEG will corrupt hidden data).

"""


import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext, simpledialog
from PIL import Image, ImageTk
import os
import struct
import hashlib
from Crypto.Hash import SHA256
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes

# Try optional drag-and-drop library
try:
    from tkinterdnd2 import DND_FILES, TkinterDnD
    DND_AVAILABLE = True
except Exception:
    DND_AVAILABLE = False

# --------- Constants & Helpers ---------
MAGIC = b'STEG'  # 4 bytes marker
VERSION = 1
PBKDF2_ITER = 200000
KEY_LEN = 32  # AES-256
NONCE_LEN = 12
TAG_LEN = 16


def derive_key(passphrase: str, salt: bytes) -> bytes:
    return PBKDF2(
    passphrase.encode('utf-8'),
    salt,
    dkLen=KEY_LEN,
    count=PBKDF2_ITER,
    hmac_hash_module=SHA256
)


def encrypt_payload(plaintext: bytes, passphrase: str) -> bytes:
    salt = get_random_bytes(16)
    key = derive_key(passphrase, salt)
    nonce = get_random_bytes(NONCE_LEN)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return salt + nonce + tag + ciphertext


def decrypt_payload(blob: bytes, passphrase: str) -> bytes:
    if len(blob) < 16 + NONCE_LEN + TAG_LEN:
        raise ValueError('Encrypted blob too short')
    salt = blob[:16]
    nonce = blob[16:16+NONCE_LEN]
    tag = blob[16+NONCE_LEN:16+NONCE_LEN+TAG_LEN]
    ciphertext = blob[16+NONCE_LEN+TAG_LEN:]
    key = derive_key(passphrase, salt)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext


def bytes_to_bits(data: bytes):
    for byte in data:
        for i in range(8):
            yield (byte >> (7 - i)) & 1


def bits_to_bytes(bits):
    out = bytearray()
    cur = 0
    count = 0
    for b in bits:
        cur = (cur << 1) | (b & 1)
        count += 1
        if count == 8:
            out.append(cur)
            cur = 0
            count = 0
    return bytes(out)


def pack_payload(payload: bytes, filename: str = None, encrypted: bool = False) -> bytes:
    fname = filename.encode('utf-8') if filename else b''
    flags = 1 if encrypted else 0
    header = struct.pack('>4sBBQH', MAGIC, VERSION, flags, len(payload), len(fname)) + fname
    return header + payload


def unpack_payload(blob: bytes):
    if len(blob) < 4 + 1 + 1 + 8 + 2:
        raise ValueError('Blob too small to contain header')
    magic, ver, flags, payload_len, fname_len = struct.unpack('>4sBBQH', blob[:16])
    if magic != MAGIC:
        raise ValueError('Magic not found - not a supported stego payload')
    offset = 16
    fname = b''
    if fname_len:
        fname = blob[offset:offset+fname_len]
    offset += fname_len
    payload = blob[offset:offset+payload_len]
    return {'version': ver, 'encrypted': bool(flags & 1), 'filename': fname.decode('utf-8') if fname else None, 'payload': payload}


def embed_data_in_image(img: Image.Image, data: bytes) -> Image.Image:
    mode = img.mode
    if mode not in ('RGB', 'RGBA'):
        img = img.convert('RGBA')
        mode = 'RGBA'
    pixels = list(img.getdata())
    channels = 4 if mode == 'RGBA' else 3
    total_capacity = len(pixels) * channels
    needed = len(data) * 8
    if needed + 32 > total_capacity:
        raise ValueError(f'Insufficient capacity: need {needed} bits, have {total_capacity} bits')
    bits = bytes_to_bits(data)
    new_pixels = []
    bit_iter = iter(bits)
    for pix in pixels:
        pix = list(pix)
        for c in range(channels):
            try:
                b = next(bit_iter)
                pix[c] = (pix[c] & ~1) | b
            except StopIteration:
                pass
        new_pixels.append(tuple(pix))
    out = Image.new(mode, img.size)
    out.putdata(new_pixels)
    return out


def extract_data_from_image(img: Image.Image) -> bytes:
    mode = img.mode
    if mode not in ('RGB', 'RGBA'):
        img = img.convert('RGBA')
        mode = 'RGBA'
    pixels = list(img.getdata())
    channels = 4 if mode == 'RGBA' else 3
    bits = []
    for pix in pixels:
        for c in range(channels):
            bits.append(pix[c] & 1)
    header_bits = bits[:16*8]
    header_bytes = bits_to_bytes(header_bits)
    try:
        magic, ver, flags, payload_len, fname_len = struct.unpack('>4sBBQH', header_bytes[:16])
    except Exception as e:
        raise ValueError('Failed to read header from image: ' + str(e))
    total_payload_bits = (16 + fname_len + payload_len) * 8
    if total_payload_bits > len(bits):
        raise ValueError('Image does not contain full payload')
    payload_bits = bits[:total_payload_bits]
    payload_bytes = bits_to_bytes(payload_bits)
    return payload_bytes


class StegoApp:
    def __init__(self, root):
        self.root = root
        root.title('Steganography Tool')
        self.image_path = None
        self.image = None
        self.modified_image = None

        main = ttk.Frame(root, padding=10)
        main.grid(sticky='nsew')
        root.columnconfigure(0, weight=1)
        root.rowconfigure(0, weight=1)

        left = ttk.Frame(main)
        left.grid(row=0, column=0, sticky='nsew', padx=(0,10))
        self.img_label = ttk.Label(left, text='Drop or open an image (.png/.bmp recommended)', relief='sunken', width=40, anchor='center')
        self.img_label.grid(row=0, column=0, sticky='nsew')
        self.img_label.bind('<Button-1>', lambda e: self.open_image())

        btn_frame = ttk.Frame(left)
        btn_frame.grid(row=1, column=0, pady=8)
        ttk.Button(btn_frame, text='Open Image', command=self.open_image).grid(row=0, column=0, padx=4)
        ttk.Button(btn_frame, text='Save Modified Image', command=self.save_image).grid(row=0, column=1, padx=4)

        right = ttk.Frame(main)
        right.grid(row=0, column=1, sticky='nsew')

        mode_frame = ttk.LabelFrame(right, text='Payload')
        mode_frame.grid(row=0, column=0, sticky='ew')
        self.payload_mode = tk.StringVar(value='text')
        ttk.Radiobutton(mode_frame, text='Text', variable=self.payload_mode, value='text', command=self.update_payload_mode).grid(row=0, column=0)
        ttk.Radiobutton(mode_frame, text='File', variable=self.payload_mode, value='file', command=self.update_payload_mode).grid(row=0, column=1)

        self.text_area = scrolledtext.ScrolledText(right, width=40, height=10)
        self.text_area.grid(row=1, column=0, pady=6)

        file_sel = ttk.Frame(right)
        file_sel.grid(row=2, column=0, sticky='ew')
        self.file_entry = ttk.Entry(file_sel)
        self.file_entry.grid(row=0, column=0, sticky='ew')
        file_sel.columnconfigure(0, weight=1)
        ttk.Button(file_sel, text='Browse', command=self.browse_file).grid(row=0, column=1, padx=4)

        enc_frame = ttk.LabelFrame(right, text='Encryption (optional)')
        enc_frame.grid(row=3, column=0, sticky='ew', pady=6)
        ttk.Label(enc_frame, text='Passphrase:').grid(row=0, column=0)
        self.pass_entry = ttk.Entry(enc_frame, show='*')
        self.pass_entry.grid(row=0, column=1, sticky='ew')

        action_frame = ttk.Frame(right)
        action_frame.grid(row=4, column=0, pady=8)
        ttk.Button(action_frame, text='Embed into Image', command=self.embed_action).grid(row=0, column=0, padx=4)
        ttk.Button(action_frame, text='Extract from Image', command=self.extract_action).grid(row=0, column=1, padx=4)

        out_frame = ttk.LabelFrame(right, text='Output / Extracted')
        out_frame.grid(row=5, column=0, sticky='nsew')
        self.output_text = scrolledtext.ScrolledText(out_frame, width=40, height=10)
        self.output_text.grid(row=0, column=0)
        ttk.Button(out_frame, text='Save Extracted File', command=self.save_extracted).grid(row=1, column=0, pady=4)

        if DND_AVAILABLE:
            try:
                root.drop_target_register(DND_FILES)
                root.dnd_bind('<<Drop>>', self.on_drop_root)
            except Exception:
                pass

        self.update_payload_mode()

    def on_drop_root(self, event):
        files = self.root.tk.splitlist(event.data)
        if files:
            path = files[0]
            if os.path.isfile(path):
                ext = os.path.splitext(path)[1].lower()
                if ext in ('.png', '.bmp'):
                    self.load_image(path)
                else:
                    self.file_entry.delete(0, tk.END)
                    self.file_entry.insert(0, path)

    def open_image(self):
        p = filedialog.askopenfilename(filetypes=[('Images','*.png *.bmp'), ('All files','*.*')])
        if p:
            self.load_image(p)

    def load_image(self, path):
        try:
            img = Image.open(path)
            self.image_path = path
            self.image = img.copy()
            thumb = img.copy()
            thumb.thumbnail((300,300))
            self.tkimg = ImageTk.PhotoImage(thumb)
            self.img_label.config(image=self.tkimg, text='')
        except Exception as e:
            messagebox.showerror('Error', f'Failed to open image: {e}')

    def save_image(self):
        if not self.modified_image:
            messagebox.showinfo('Info', 'No modified image to save.')
            return
        p = filedialog.asksaveasfilename(defaultextension='.png', filetypes=[('PNG','*.png'),('BMP','*.bmp'),('All','*.*')])
        if p:
            try:
                self.modified_image.save(p)
                messagebox.showinfo('Saved', f'Saved to {p}')
            except Exception as e:
                messagebox.showerror('Error', f'Failed to save: {e}')

    def browse_file(self):
        p = filedialog.askopenfilename()
        if p:
            self.file_entry.delete(0, tk.END)
            self.file_entry.insert(0, p)

    def update_payload_mode(self):
        mode = self.payload_mode.get()
        if mode == 'text':
            self.text_area.config(state='normal')
            self.file_entry.config(state='disabled')
        else:
            self.text_area.config(state='disabled')
            self.file_entry.config(state='normal')

    def embed_action(self):
        if not self.image:
            messagebox.showerror('Error', 'Open an image first')
            return
        mode = self.payload_mode.get()
        if mode == 'text':
            text = self.text_area.get('1.0', 'end').rstrip('\n')
            payload = text.encode('utf-8')
            filename = None
        else:
            path = self.file_entry.get().strip()
            if not path or not os.path.isfile(path):
                messagebox.showerror('Error', 'Select a valid file')
                return
            with open(path, 'rb') as f:
                payload = f.read()
            filename = os.path.basename(path)
        passphrase = self.pass_entry.get().strip()
        encrypted = False
        if passphrase:
            payload = encrypt_payload(payload, passphrase)
            encrypted = True
        packed = pack_payload(payload, filename, encrypted)
        try:
            new_img = embed_data_in_image(self.image, packed)
            self.modified_image = new_img
            messagebox.showinfo('Success', 'Data embedded into image. Use Save Modified Image to save.')
            thumb = new_img.copy()
            thumb.thumbnail((300,300))
            self.tkimg = ImageTk.PhotoImage(thumb)
            self.img_label.config(image=self.tkimg, text='')
        except Exception as e:
            messagebox.showerror('Error', f'Embedding failed: {e}')

    def extract_action(self):
        if not self.image:
            messagebox.showerror('Error', 'Open an image first')
            return
        try:
            raw = extract_data_from_image(self.image)
            info = unpack_payload(raw)
            payload = info['payload']
            if info['encrypted']:
                passphrase = self.pass_entry.get().strip()
                if not passphrase:
                    passphrase = simpledialog.askstring('Passphrase', 'Enter passphrase:', show='*')
                if not passphrase:
                    messagebox.showerror('Error', 'Passphrase required')
                    return
                try:
                    plaintext = decrypt_payload(payload, passphrase)
                except Exception as e:
                    messagebox.showerror('Error', f'Decryption failed: {e}')
                    return
                payload = plaintext
            if info['filename']:
                self.extracted_bytes = payload
                self.extracted_filename = info['filename']
                self.output_text.config(state='normal')
                self.output_text.delete('1.0', tk.END)
                self.output_text.insert(tk.END, f'Extracted file: {self.extracted_filename} ({len(self.extracted_bytes)} bytes)\n')
                self.output_text.insert(tk.END, 'Use Save Extracted File to save to disk.')
                self.output_text.config(state='disabled')
            else:
                try:
                    text = payload.decode('utf-8')
                except Exception:
                    text = repr(payload)
                self.extracted_bytes = None
                self.extracted_filename = None
                self.output_text.config(state='normal')
                self.output_text.delete('1.0', tk.END)
                self.output_text.insert(tk.END, text)
                self.output_text.config(state='disabled')
            messagebox.showinfo('Done', 'Extraction completed')
        except Exception as e:
            messagebox.showerror('Error', f'Extraction failed: {e}')

    def save_extracted(self):
        if getattr(self, 'extracted_bytes', None) is None:
            messagebox.showinfo('Info', 'No extracted binary to save.')
            return
        default = self.extracted_filename or 'extracted.bin'
        p = filedialog.asksaveasfilename(initialfile=default)
        if p:
            try:
                with open(p, 'wb') as f:
                    f.write(self.extracted_bytes)
                messagebox.showinfo('Saved', f'File saved to {p}')
            except Exception as e:
                messagebox.showerror('Error', f'Failed to save: {e}')


if __name__ == '__main__':
    if DND_AVAILABLE:
        root = TkinterDnD.Tk()
    else:
        root = tk.Tk()
    app = StegoApp(root)
    root.mainloop()
