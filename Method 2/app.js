class SteganographyApp {
    constructor() {
        this.engine = new SteganographyEngine();
        this.currentImage = null;
        this.currentFile = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    initializeElements() {
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Input tab elements
        this.inputTabButtons = document.querySelectorAll('.input-tab-button');
        this.inputTabContents = document.querySelectorAll('.input-tab-content');
        
        // Hide tab elements
        this.imageInput = document.getElementById('image-input');
        this.imageUploadArea = document.getElementById('image-upload-area');
        this.secretText = document.getElementById('secret-text');
        this.charCount = document.getElementById('char-count');
        this.fileInputElement = document.getElementById('file-input-element');
        this.fileUploadArea = document.getElementById('file-upload-area');
        this.fileInfo = document.getElementById('file-info');
        this.password = document.getElementById('password');
        this.compressData = document.getElementById('compress-data');
        this.hideBtn = document.getElementById('hide-btn');
        this.hidePreview = document.getElementById('hide-preview');
        this.originalCanvas = document.getElementById('original-canvas');
        this.stegoCanvas = document.getElementById('stego-canvas');
        this.originalInfo = document.getElementById('original-info');
        this.stegoInfo = document.getElementById('stego-info');
        this.downloadBtn = document.getElementById('download-btn');
        
        // Extract tab elements
        this.extractImageInput = document.getElementById('extract-image-input');
        this.extractUploadArea = document.getElementById('extract-upload-area');
        this.extractPassword = document.getElementById('extract-password');
        this.extractBtn = document.getElementById('extract-btn');
        this.extractResult = document.getElementById('extract-result');
        this.resultType = document.getElementById('result-type');
        this.resultSize = document.getElementById('result-size');
        this.resultContent = document.getElementById('result-content');
        this.resultActions = document.getElementById('result-actions');
        
        // Progress and notification elements
        this.progressBar = document.getElementById('progress-bar');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.notification = document.getElementById('notification');
    }

    setupEventListeners() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });
        
        // Input tab switching
        this.inputTabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchInputTab(button.dataset.inputTab));
        });
        
        // File inputs
        this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e.target.files[0]));
        this.extractImageInput.addEventListener('change', (e) => this.handleExtractImageSelect(e.target.files[0]));
        this.fileInputElement.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        
        // Upload area clicks
        this.imageUploadArea.addEventListener('click', () => this.imageInput.click());
        this.extractUploadArea.addEventListener('click', () => this.extractImageInput.click());
        this.fileUploadArea.addEventListener('click', () => this.fileInputElement.click());
        
        // Text input
        this.secretText.addEventListener('input', () => this.updateCharCount());
        this.secretText.addEventListener('input', () => this.checkHideButtonState());
        
        // Buttons
        this.hideBtn.addEventListener('click', () => this.hideData());
        this.extractBtn.addEventListener('click', () => this.extractData());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        
        // Form validation
        this.imageInput.addEventListener('change', () => this.checkHideButtonState());
        this.extractImageInput.addEventListener('change', () => this.checkExtractButtonState());
    }

    setupDragAndDrop() {
        const setupDropZone = (element, callback) => {
            element.addEventListener('dragover', (e) => {
                e.preventDefault();
                element.classList.add('dragover');
            });
            
            element.addEventListener('dragleave', (e) => {
                e.preventDefault();
                if (!element.contains(e.relatedTarget)) {
                    element.classList.remove('dragover');
                }
            });
            
            element.addEventListener('drop', (e) => {
                e.preventDefault();
                element.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    callback(files[0]);
                }
            });
        };
        
        setupDropZone(this.imageUploadArea, (file) => this.handleImageSelect(file));
        setupDropZone(this.extractUploadArea, (file) => this.handleExtractImageSelect(file));
        setupDropZone(this.fileUploadArea, (file) => this.handleFileSelect(file));
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        // Update tab contents
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        // Reset forms when switching tabs
        if (tabName === 'extract') {
            this.extractResult.style.display = 'none';
        } else {
            this.hidePreview.style.display = 'none';
        }
    }

    switchInputTab(tabName) {
        // Update input tab buttons
        this.inputTabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.inputTab === tabName);
        });
        
        // Update input tab contents
        this.inputTabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-input`);
        });
        
        // Check button state after switching
        this.checkHideButtonState();
    }

    async handleImageSelect(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }
        
        try {
            this.currentImage = await this.loadImage(file);
            this.updateImagePreview();
            this.checkHideButtonState();
            this.showNotification('Image loaded successfully!', 'success');
        } catch (error) {
            this.showNotification('Error loading image: ' + error.message, 'error');
        }
    }

    async handleExtractImageSelect(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }
        
        try {
            this.currentExtractImage = await this.loadImage(file);
            this.checkExtractButtonState();
            this.showNotification('Image loaded successfully!', 'success');
        } catch (error) {
            this.showNotification('Error loading image: ' + error.message, 'error');
        }
    }

    async handleFileSelect(file) {
        if (!file) return;
        
        try {
            this.currentFile = file;
            this.fileInfo.textContent = `Selected: ${file.name} (${this.formatFileSize(file.size)})`;
            this.checkHideButtonState();
            this.showNotification('File loaded successfully!', 'success');
        } catch (error) {
            this.showNotification('Error loading file: ' + error.message, 'error');
        }
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    resolve({
                        file: file,
                        image: img,
                        canvas: canvas,
                        imageData: imageData
                    });
                };
                img.onerror = () => reject(new Error('Invalid image format'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    }

    updateImagePreview() {
        if (!this.currentImage) return;
        
        const { image, imageData } = this.currentImage;
        
        // Update canvas size and draw image
        this.originalCanvas.width = Math.min(image.width, 400);
        this.originalCanvas.height = Math.min(image.height, 300);
        
        const ctx = this.originalCanvas.getContext('2d');
        ctx.drawImage(image, 0, 0, this.originalCanvas.width, this.originalCanvas.height);
        
        // Update image info
        const capacity = this.engine.getImageCapacity(imageData);
        this.originalInfo.textContent = `${image.width}×${image.height} pixels | Capacity: ~${capacity} characters`;
    }

    updateCharCount() {
        const count = this.secretText.value.length;
        this.charCount.textContent = count;
    }

    checkHideButtonState() {
        const hasImage = !!this.currentImage;
        const activeTab = document.querySelector('.input-tab-button.active').dataset.inputTab;
        const hasData = activeTab === 'text' ? 
            this.secretText.value.trim().length > 0 : 
            !!this.currentFile;
        
        this.hideBtn.disabled = !hasImage || !hasData;
    }

    checkExtractButtonState() {
        this.extractBtn.disabled = !this.currentExtractImage;
    }

    async hideData() {
        if (!this.currentImage) return;
        
        try {
            this.showProgress(0, 'Preparing data...');
            
            const activeTab = document.querySelector('.input-tab-button.active').dataset.inputTab;
            let secretData;
            
            if (activeTab === 'text') {
                secretData = this.secretText.value;
            } else {
                this.showProgress(20, 'Processing file...');
                secretData = await this.engine.fileToBase64(this.currentFile);
            }
            
            this.showProgress(40, 'Encrypting data...');
            
            const options = {
                password: this.password.value || null,
                compress: this.compressData.checked
            };
            
            this.showProgress(60, 'Hiding data in image...');
            
            const stegoImageData = await this.engine.hideData(
                this.currentImage.imageData, 
                secretData, 
                options
            );
            
            this.showProgress(80, 'Generating preview...');
            
            // Create stego canvas
            this.stegoCanvas.width = this.originalCanvas.width;
            this.stegoCanvas.height = this.originalCanvas.height;
            const stegoCtx = this.stegoCanvas.getContext('2d');
            stegoCtx.putImageData(stegoImageData, 0, 0);
            
            // Update info
            this.stegoInfo.textContent = `${stegoImageData.width}×${stegoImageData.height} pixels | Contains hidden data`;
            
            this.showProgress(100, 'Complete!');
            
            // Show preview
            this.hidePreview.style.display = 'block';
            this.hidePreview.scrollIntoView({ behavior: 'smooth' });
            
            // Store for download
            this.stegoImageData = stegoImageData;
            
            setTimeout(() => this.hideProgress(), 1000);
            this.showNotification('Data hidden successfully!', 'success');
            
        } catch (error) {
            this.hideProgress();
            this.showNotification('Error hiding data: ' + error.message, 'error');
        }
    }

    async extractData() {
        if (!this.currentExtractImage) return;
        
        try {
            this.showProgress(0, 'Reading image data...');
            
            const options = {
                password: this.extractPassword.value || null
            };
            
            this.showProgress(50, 'Extracting hidden data...');
            
            const result = await this.engine.extractData(
                this.currentExtractImage.imageData, 
                options
            );
            
            this.showProgress(100, 'Complete!');
            
            // Display results
            this.displayExtractedData(result);
            
            setTimeout(() => this.hideProgress(), 1000);
            this.showNotification('Data extracted successfully!', 'success');
            
        } catch (error) {
            this.hideProgress();
            this.showNotification('Error extracting data: ' + error.message, 'error');
        }
    }

    displayExtractedData(result) {
        const { data, metadata } = result;
        
        // Try to parse as file data first
        let isFile = false;
        let fileData = null;
        
        try {
            fileData = JSON.parse(data);
            if (fileData.name && fileData.type && fileData.data) {
                isFile = true;
            }
        } catch (e) {
            // Not a file, treat as text
        }
        
        // Update result info
        this.resultType.textContent = isFile ? `📄 File: ${fileData.name}` : '📝 Text Message';
        this.resultSize.textContent = isFile ? 
            `Size: ${this.formatFileSize(fileData.size)}` : 
            `Length: ${data.length} characters`;
        
        // Display content
        if (isFile) {
            this.resultContent.textContent = `File Type: ${fileData.type}\nOriginal Size: ${this.formatFileSize(fileData.size)}\nData: [Binary data - use download button to save]`;
            
            // Add download button for file
            this.resultActions.innerHTML = `
                <button class="btn btn-success" onclick="app.downloadExtractedFile()">
                    <span class="btn-icon">💾</span>
                    Download File
                </button>
            `;
            
            this.extractedFileData = fileData;
        } else {
            this.resultContent.textContent = data;
            this.resultActions.innerHTML = `
                <button class="btn btn-primary" onclick="app.copyToClipboard('${data.replace(/'/g, "\\'")}')">
                    <span class="btn-icon">📋</span>
                    Copy to Clipboard
                </button>
            `;
        }
        
        // Show result section
        this.extractResult.style.display = 'block';
        this.extractResult.scrollIntoView({ behavior: 'smooth' });
    }

    downloadImage() {
        if (!this.stegoImageData) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = this.stegoImageData.width;
        canvas.height = this.stegoImageData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(this.stegoImageData, 0, 0);
        
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'steganographic_image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Image downloaded successfully!', 'success');
        }, 'image/png');
    }

    downloadExtractedFile() {
        if (!this.extractedFileData) return;
        
        try {
            const { blob, name } = this.engine.base64ToFile(JSON.stringify(this.extractedFileData));
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('File downloaded successfully!', 'success');
        } catch (error) {
            this.showNotification('Error downloading file: ' + error.message, 'error');
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Text copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy text', 'error');
        });
    }

    showProgress(percent, text) {
        this.progressBar.style.display = 'block';
        this.progressFill.style.width = percent + '%';
        this.progressText.textContent = text;
    }

    hideProgress() {
        this.progressBar.style.display = 'none';
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 4000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SteganographyApp();
});

// Export for global access
window.SteganographyApp = SteganographyApp;