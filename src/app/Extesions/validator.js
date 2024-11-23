const messages = require('./messCost');

class Validator {

    /**
     * Kiểm tra giá trị có trống hay không.
     * @param {string} value - Giá trị cần kiểm tra.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu không hợp lệ, null nếu hợp lệ.
     */
    static notEmpty(value, fieldName) {
        if (!value || value.trim() === '') {
            return messages.validation.notEmpty(fieldName);  // Trả về thông báo lỗi nếu giá trị trống
        }
        return null;  // Trả về null nếu giá trị hợp lệ
    }

    /**
     * Kiểm tra giá trị có phải là null hay không.
     * @param {any} value - Giá trị cần kiểm tra.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu giá trị là null, null nếu hợp lệ.
     */
    static notNull(value, fieldName) {
        if (value === null) {
            return messages.validation.notNull(fieldName);  // Trả về thông báo lỗi nếu giá trị là null
        }
        return null;  // Trả về null nếu giá trị hợp lệ
    }

    /**
     * Kiểm tra giá trị có lớn hơn giá trị tối thiểu không.
     * @param {number} value - Giá trị cần kiểm tra.
     * @param {number} minValue - Giá trị tối thiểu.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu giá trị không lớn hơn minValue, null nếu hợp lệ.
     */
    static greaterThan(value, minValue, fieldName) {
        const numericValue = parseFloat(value);
        const numericMinValue = parseFloat(minValue);
        if (numericValue <= numericMinValue) {
            return messages.validation.greaterThan(fieldName, numericMinValue);  // Trả về thông báo lỗi nếu giá trị nhỏ hơn hoặc bằng minValue
        }
        return null;  // Trả về null nếu giá trị hợp lệ
    }

    /**
     * Kiểm tra chiều dài của giá trị có vượt quá độ dài tối đa không.
     * @param {string} value - Giá trị cần kiểm tra.
     * @param {number} maxLength - Độ dài tối đa cho phép.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu độ dài vượt quá, null nếu hợp lệ.
     */
    static maxLength(value, maxLength, fieldName) {
        if (value.length > maxLength) {
            return messages.validation.maxLength(fieldName, maxLength);  // Trả về thông báo lỗi nếu độ dài vượt quá maxLength
        }
        return null;  // Trả về null nếu độ dài hợp lệ
    }

    /**
     * Kiểm tra giá trị có phải là email hợp lệ không.
     * @param {string} value - Giá trị cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu không phải email hợp lệ, null nếu hợp lệ.
     */
    static isEmail(value) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Biểu thức chính quy cho email
        if (!regex.test(value)) {
            return messages.validation.invalidEmail;  // Trả về thông báo lỗi nếu email không hợp lệ
        }
        return null;  // Trả về null nếu email hợp lệ
    }

    /**
     * Kiểm tra giá trị có phải là số điện thoại hợp lệ không.
     * @param {string} value - Giá trị cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu không phải số điện thoại hợp lệ, null nếu hợp lệ.
     */
    static isPhoneNumber(value) {
        const regex = /^[0-9]{10,15}$/;  // Biểu thức chính quy cho số điện thoại
        if (!regex.test(value)) {
            return messages.validation.invalidPhoneNumber;  // Trả về thông báo lỗi nếu số điện thoại không hợp lệ
        }
        return null;  // Trả về null nếu số điện thoại hợp lệ
    }

    /**
     * Kiểm tra giá trị có phải là mật khẩu hợp lệ không.
     * - Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất một ký tự đặc biệt.
     * @param {string} value - Giá trị cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu không hợp lệ, null nếu hợp lệ.
     */
    static isPassword(value) {
        if (value.length < 8) {
            return 'Mật khẩu phải có ít nhất 8 ký tự.';  // Trả về thông báo lỗi nếu mật khẩu quá ngắn
        }
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;  // Biểu thức chính quy cho ký tự đặc biệt
        if (!specialCharRegex.test(value)) {
            return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt.';  // Trả về thông báo lỗi nếu mật khẩu không có ký tự đặc biệt
        }
        return null;  // Trả về null nếu mật khẩu hợp lệ
    }

    /**
     * Kiểm tra giá trị có phải là ngày hợp lệ không.
     * @param {string} value - Giá trị cần kiểm tra.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu không phải ngày hợp lệ, null nếu hợp lệ.
     */
    static isDate(value, fieldName) {
        if (!value || isNaN(Date.parse(value))) {
            return messages.validation.invalidDate(fieldName);  // Trả về thông báo lỗi nếu không phải ngày hợp lệ
        }
        return null;  // Trả về null nếu ngày hợp lệ
    }

    /**
     * Kiểm tra kích thước tệp có vượt quá giới hạn không.
     * @param {Object} file - Tệp cần kiểm tra.
     * @param {number} maxSizeMB - Kích thước tối đa cho phép (MB).
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu vượt quá kích thước, null nếu hợp lệ.
     */
    static maxFileSize(file, maxSizeMB, fieldName) {
        if (file && file.size > maxSizeMB * 1024 * 1024) {
            return messages.validation.maxFileSize(fieldName, maxSizeMB);  // Trả về thông báo lỗi nếu tệp quá lớn
        }
        return null;  // Trả về null nếu kích thước tệp hợp lệ
    }

    /**
     * Kiểm tra giá trị có thuộc một trong các giá trị hợp lệ không.
     * @param {string} value - Giá trị cần kiểm tra.
     * @param {Array} options - Danh sách các giá trị hợp lệ.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu không thuộc giá trị hợp lệ, null nếu hợp lệ.
     */
    static isEnum(value, options, fieldName) {
        if (!options.includes(value)) {
            return messages.validation.invalidEnum(fieldName);  // Trả về thông báo lỗi nếu giá trị không hợp lệ
        }
        return null;  // Trả về null nếu giá trị hợp lệ
    }

    /**
     * Kiểm tra xem mảng có rỗng hay không.
     * @param {Array} value - Mảng cần kiểm tra.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu mảng rỗng, null nếu mảng không rỗng.
     */
    static arrayNotEmpty(value, fieldName) {
        if (!Array.isArray(value) || value.length === 0) {
            return messages.validation.arrayNotEmpty(fieldName);
        }
        return null;  // Trả về null nếu mảng không rỗng
    }

    /**
     * Kiểm tra xem giá trị có phải là một số dương không.
     * @param {number} value - Giá trị cần kiểm tra.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu giá trị không phải là số dương, null nếu hợp lệ.
     */
    static isPositiveNumber(value, fieldName) {
        const numericValue = parseFloat(value);
        // Kiểm tra nếu value không phải là số hoặc nếu value <= 0
        if (isNaN(numericValue) || typeof numericValue !== 'number' || numericValue <= 0) {
            return messages.validation.isPositiveNumber(fieldName);
        }
        return null;  // Trả về null nếu giá trị hợp lệ
    }

    /**
     * Kiểm tra tệp có phải là ảnh hợp lệ không.
     * @param {Object} file - Tệp cần kiểm tra.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @param {Array} allowedExtensions - Các định dạng tệp cho phép.
     * @returns {string|null} - Thông báo lỗi nếu không phải ảnh hợp lệ, null nếu hợp lệ.
     */
    static isImageFile(file, fieldName, allowedExtensions = ['png', 'jpg', 'jpeg']) {
        if (file && file.name) { 
            const extension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(extension)) {
                return messages.validation.invalidFileType(fieldName, allowedExtensions.join(', '));  // Trả về thông báo lỗi nếu không phải định dạng ảnh hợp lệ
            }
        } else {
            return messages.validation.requiredField(fieldName);  // Trả về thông báo lỗi nếu tệp không có
        }
        return null;  // Trả về null nếu tệp hợp lệ
    }

    /**
     * Kiểm tra chuỗi có chứa ký tự tiếng Việt hay không.
     * @param {string} value - Chuỗi cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu chứa ký tự tiếng Việt, null nếu không.
     */
    static containsVietnamese(value) {
        const vietnameseRegex = /[àáạảãâầấậẩẫêềếệểễôồốộổỗơờớợởỡưừứựửữý]/i;
        if (vietnameseRegex.test(value)) {
            return messages.validation.containsVietnamese;  // Trả về thông báo lỗi nếu chuỗi có ký tự tiếng Việt
        }
        return null;  // Trả về null nếu chuỗi không chứa ký tự tiếng Việt
    }

    /**
     * Kiểm tra URL có hợp lệ hay không.
     * @param {string} value - Giá trị cần kiểm tra.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {string|null} - Thông báo lỗi nếu không hợp lệ, null nếu hợp lệ.
     */
    static isValidUrl(value, fieldName) {
        // Regex kiểm tra URL nhúng YouTube
        const youtubeEmbedRegex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?.*)?$/;

        if (!youtubeEmbedRegex.test(value)) {
            return messages.validation.invalidUrl(fieldName);
        }

        return null;
    }

    /**
     * Kiểm tra thời lượng có đúng định dạng hh:mm:ss hoặc mm:ss và lớn hơn 0 không.
     * Tự động chuẩn hóa từ mm:ss thành hh:mm:ss.
     * @param {string} value - Giá trị cần kiểm tra.
     * @param {string} fieldName - Tên trường cần kiểm tra.
     * @returns {Object} - Trả về đối tượng { error: string|null, duration: string }.
     */
    static isValidDuration(value, fieldName) {
        const mmssRegex = /^[0-5]?[0-9]:[0-5][0-9]$/; // Định dạng mm:ss
        const hhmmssRegex = /^([0-9]{1,2}):([0-5]?[0-9]):([0-5]?[0-9])$/; // Định dạng hh:mm:ss

        // Chuẩn hóa mm:ss thành hh:mm:ss
        if (mmssRegex.test(value)) {
            value = `00:${value}`;
        }

        // Kiểm tra định dạng hh:mm:ss
        if (!hhmmssRegex.test(value)) {
            return messages.validation.invalidDurationFormat(fieldName);
        }

        const [hours, minutes, seconds] = value.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds <= 0) {
            return messages.validation.invalidDurationValue(fieldName);
        }

        // Trả về thời lượng hợp lệ
        return null;
    }

}

module.exports = Validator;
