const messages = require('./messCost');

class Validator {

    static notEmpty(value, fieldName) {
        if (!value || value.trim() === '') {
            return messages.validation.notEmpty(fieldName);
        }
        return null;
    }

    static notNull(value, fieldName) {
        if (value === null) {
            return messages.validation.notNull(fieldName);
        }
        return null;
    }

    static greaterThan(value, minValue, fieldName) {
        if (value <= minValue) {
            return messages.validation.greaterThan(fieldName, minValue);
        }
        return null;
    }

    static maxLength(value, maxLength, fieldName) {
        if (value.length > maxLength) {
            return messages.validation.maxLength(fieldName, maxLength);
        }
        return null;
    }

    static isEmail(value) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) {
            return messages.validation.invalidEmail;
        }
        return null;
    }

    static isPhoneNumber(value) {
        const regex = /^[0-9]{10,15}$/; 
        if (!regex.test(value)) {
            return messages.validation.invalidPhoneNumber;
        }
        return null;
    }
    
    static isPassword(value) {
        if (value.length < 8) {
            return 'Mật khẩu phải có ít nhất 8 ký tự.';
        }
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(value)) {
            return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt.';
        }
        return null;
    }

    static isDate(value, fieldName) {
        if (!value || isNaN(Date.parse(value))) {
            return messages.validation.invalidDate(fieldName);
        }
        return null;
    }

    static maxFileSize(file, maxSizeMB, fieldName) {
        if (file && file.size > maxSizeMB * 1024 * 1024) {
            return messages.validation.maxFileSize(fieldName, maxSizeMB);
        }
        return null;
    }

    static isEnum(value, options, fieldName) {
        if (!options.includes(value)) {
            return messages.validation.invalidEnum(fieldName);
        }
        return null;
    }

    static isImageFile(file, fieldName, allowedExtensions = ['png', 'jpg', 'jpeg']) {
        if (file && file.name) { 
            const extension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(extension)) {
                return messages.validation.invalidFileType(fieldName, allowedExtensions.join(', '));
            }
        } else {
            return messages.validation.requiredField(fieldName); 
        }
        return null;
    } 
    
    static containsVietnamese(value) {
        const vietnameseRegex = /[àáạảãâầấậẩẫêềếệểễôồốộổỗơờớợởỡưừứựửữý]/i;
        if (vietnameseRegex.test(value)) {
            return 'Chuỗi không được chứa ký tự tiếng Việt.';
        }
        return null;
    }
}

module.exports = Validator;
