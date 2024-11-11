const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

class CryptoService {
    /**
     * Constructor của CryptoService
     * - Lấy các giá trị secret key và iv từ biến môi trường.
     * - Kiểm tra độ dài của secret key và iv. 
     * - Đảm bảo secret key có độ dài 32 byte và iv có độ dài 16 byte.
     */
    constructor() {
        this.secretKey = Buffer.from(process.env.AES_SECRET_KEY, 'hex'); // Chuyển đổi AES_SECRET_KEY từ hex sang buffer
        this.iv = Buffer.from(process.env.AES_IV, 'hex'); // Chuyển đổi AES_IV từ hex sang buffer

        // Kiểm tra độ dài của secretKey và iv
        if (this.secretKey.length !== 32 || this.iv.length !== 16) {
            throw new Error('AES_SECRET_KEY phải có độ dài 32 byte và AES_IV phải có độ dài 16 byte.');
        }
    }

    /**
     * Hàm mã hóa AES
     * - Mã hóa mật khẩu bằng thuật toán AES-256-CBC.
     * @param {string} password - Mật khẩu cần mã hóa
     * @returns {string} - Mật khẩu đã được mã hóa dưới dạng hex
     */
    encrypt(password) {
        // Tạo cipher AES-256-CBC với secret key và iv
        const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, this.iv);
        
        // Mã hóa mật khẩu
        let encrypted = cipher.update(password, 'utf8', 'hex');
        encrypted += cipher.final('hex'); // Kết thúc mã hóa và trả về kết quả dưới dạng hex
        return encrypted;
    }

    /**
     * Hàm giải mã AES
     * - Giải mã mật khẩu đã được mã hóa bằng thuật toán AES-256-CBC.
     * @param {string} encryptedPassword - Mật khẩu đã được mã hóa
     * @returns {string} - Mật khẩu sau khi giải mã
     */
    decrypt(encryptedPassword) {
        // Tạo decipher AES-256-CBC với secret key và iv
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKey, this.iv);

        // Giải mã mật khẩu
        let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
        decrypted += decipher.final('utf8'); // Kết thúc giải mã và trả về kết quả dưới dạng utf8
        return decrypted;
    }
}

module.exports = new CryptoService();
