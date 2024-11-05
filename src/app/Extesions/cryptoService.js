const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

class CryptoService {
    constructor() {
        this.secretKey = Buffer.from(process.env.AES_SECRET_KEY, 'hex');
        this.iv = Buffer.from(process.env.AES_IV, 'hex');

        if (this.secretKey.length !== 32 || this.iv.length !== 16) {
            throw new Error('AES_SECRET_KEY phải có độ dài 32 byte và AES_IV phải có độ dài 16 byte.');
        }
    }

    // Hàm mã hóa AES
    encrypt(password) {
        const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, this.iv);
        let encrypted = cipher.update(password, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    // Hàm giải mã AES
    decrypt(encryptedPassword) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKey, this.iv);
        let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

module.exports = new CryptoService();
