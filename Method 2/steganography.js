// Advanced Steganography Implementation
class SteganographyEngine {
    constructor() {
        this.HEADER_SIZE = 32; // Size in bits for header information
        this.DELIMITER = '\0END\0'; // End of data delimiter
    }

    // Convert string to binary
    stringToBinary(str) {
        return str.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('');
    }

    // Convert binary to string
    binaryToString(binary) {
        const chars = [];
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.slice(i, i + 8);
            if (byte.length === 8) {
                chars.push(String.fromCharCode(parseInt(byte, 2)));
            }
        }
        return chars.join('');
    }

    // Simple XOR encryption/decryption
    xorEncrypt(data, key) {
        if (!key) return data;
        const keyBytes = new TextEncoder().encode(key);
        const dataBytes = new TextEncoder().encode(data);
        const encrypted = new Uint8Array(dataBytes.length);
        
        for (let i = 0; i < dataBytes.length; i++) {
            encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        
        return new TextDecoder().decode(encrypted);
    }

    // Compress data using simple run-length encoding
    compress(data) {
        let compressed = '';
        let count = 1;
        
        for (let i = 0; i < data.length; i++) {
            if (i < data.length - 1 && data[i] === data[i + 1]) {
                count++;
            } else {
                if (count > 3) {
                    compressed += `~${count}${data[i]}`;
                } else {
                    compressed += data[i].repeat(count);
                }
                count = 1;
            }
        }
        
        return compressed;
    }

    // Decompress run-length encoded data
    decompress(data) {
        let decompressed = '';
        let i = 0;
        
        while (i < data.length) {
            if (data[i] === '~') {
                i++; // Skip ~
                let count = '';
                while (i < data.length && /\d/.test(data[i])) {
                    count += data[i];
                    i++;
                }
                const char = data[i];
                decompressed += char.repeat(parseInt(count));
                i++;
            } else {
                decompressed += data[i];
                i++;
            }
        }
        
        return decompressed;
    }

    // Hide data in image using LSB steganography
    async hideData(imageData, secretData, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const { password, compress } = options;
                
                // Prepare data
                let dataToHide = secretData;
                
                // Encrypt if password provided
                if (password) {
                    dataToHide = this.xorEncrypt(dataToHide, password);
                }
                
                // Compress if requested
                if (compress) {
                    dataToHide = this.compress(dataToHide);
                }
                
                // Add delimiter
                dataToHide += this.DELIMITER;
                
                // Convert to binary
                const binaryData = this.stringToBinary(dataToHide);
                const dataLength = binaryData.length;
                
                // Check if image can hold the data
                const availableBits = imageData.data.length;
                if (dataLength > availableBits) {
                    reject(new Error('Image too small to hold the secret data'));
                    return;
                }
                
                // Create header with data length and options
                const header = {
                    length: dataLength,
                    hasPassword: !!password,
                    isCompressed: !!compress
                };
                const headerBinary = this.stringToBinary(JSON.stringify(header));
                const headerLength = headerBinary.length;
                
                if (headerLength > this.HEADER_SIZE * 8) {
                    reject(new Error('Header too large'));
                    return;
                }
                
                // Pad header to fixed size
                const paddedHeader = headerBinary.padEnd(this.HEADER_SIZE * 8, '0');
                const fullBinary = paddedHeader + binaryData;
                
                // Hide data in LSB
                const modifiedData = new Uint8ClampedArray(imageData.data);
                
                for (let i = 0; i < fullBinary.length; i++) {
                    const bit = parseInt(fullBinary[i]);
                    modifiedData[i] = (modifiedData[i] & 0xFE) | bit;
                }
                
                resolve(new ImageData(modifiedData, imageData.width, imageData.height));
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // Extract data from image
    async extractData(imageData, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const { password } = options;
                
                // Extract header
                const headerBinary = this.extractBitsFromImage(imageData, 0, this.HEADER_SIZE * 8);
                const headerString = this.binaryToString(headerBinary);
                
                let header;
                try {
                    // Find the first valid JSON in the header
                    const jsonStart = headerString.indexOf('{');
                    if (jsonStart !== -1) {
                        let jsonEnd = jsonStart;
                        let braceCount = 0;
                        for (let i = jsonStart; i < headerString.length; i++) {
                            if (headerString[i] === '{') braceCount++;
                            if (headerString[i] === '}') braceCount--;
                            if (braceCount === 0) {
                                jsonEnd = i;
                                break;
                            }
                        }
                        const headerJson = headerString.slice(jsonStart, jsonEnd + 1);
                        header = JSON.parse(headerJson);
                    } else {
                        throw new Error('No header found');
                    }
                } catch (e) {
                    reject(new Error('Invalid or corrupted header'));
                    return;
                }
                
                // Extract data
                const dataBinary = this.extractBitsFromImage(imageData, this.HEADER_SIZE * 8, header.length);
                let extractedData = this.binaryToString(dataBinary);
                
                // Remove delimiter
                const delimiterIndex = extractedData.indexOf(this.DELIMITER);
                if (delimiterIndex !== -1) {
                    extractedData = extractedData.slice(0, delimiterIndex);
                } else {
                    reject(new Error('Data delimiter not found - file may be corrupted'));
                    return;
                }
                
                // Decompress if needed
                if (header.isCompressed) {
                    extractedData = this.decompress(extractedData);
                }
                
                // Decrypt if password provided
                if (header.hasPassword) {
                    if (!password) {
                        reject(new Error('Password required to decrypt data'));
                        return;
                    }
                    extractedData = this.xorEncrypt(extractedData, password);
                }
                
                resolve({
                    data: extractedData,
                    metadata: {
                        hasPassword: header.hasPassword,
                        isCompressed: header.isCompressed,
                        originalSize: header.length
                    }
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // Extract bits from image data
    extractBitsFromImage(imageData, startBit, length) {
        let binary = '';
        for (let i = 0; i < length; i++) {
            const pixelIndex = startBit + i;
            if (pixelIndex >= imageData.data.length) break;
            binary += (imageData.data[pixelIndex] & 1).toString();
        }
        return binary;
    }

    // Utility method to get image capacity
    getImageCapacity(imageData) {
        // Reserve space for header
        const availableBits = imageData.data.length - (this.HEADER_SIZE * 8);
        // Convert to approximate character capacity (8 bits per character + delimiter)
        return Math.floor(availableBits / 8) - this.DELIMITER.length;
    }

    // Method to check if data fits in image
    canHideData(imageData, dataSize) {
        return dataSize <= this.getImageCapacity(imageData);
    }

    // File to base64 string conversion for hiding files
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // Remove data URL prefix
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64
                };
                resolve(JSON.stringify(fileData));
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Base64 string to downloadable file
    base64ToFile(base64String) {
        try {
            const fileData = JSON.parse(base64String);
            const byteCharacters = atob(fileData.data);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            return {
                blob: new Blob([byteArray], { type: fileData.type }),
                name: fileData.name,
                originalSize: fileData.size
            };
        } catch (error) {
            throw new Error('Invalid file data format');
        }
    }
}

// Export for use in main app
window.SteganographyEngine = SteganographyEngine;