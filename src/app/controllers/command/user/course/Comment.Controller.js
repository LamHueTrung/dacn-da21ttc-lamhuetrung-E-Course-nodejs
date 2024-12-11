// const Courses = require('../../../../model/Course');
// const Validator = require('../../../../Extesions/validator');
// const messages = require('../../../../Extesions/messCost');
const jwt = require('jsonwebtoken');
const currentYear = new Date().getFullYear();

class Comments {


    /**
     * Hàm Handle
     * Xác thực token, kiểm tra lỗi đầu vào và thêm khóa học mới vào hệ thống nếu không có lỗi.
     * @param {Object} req - Đối tượng request chứa dữ liệu khóa học.
     * @param {Object} res - Đối tượng response để gửi phản hồi về phía client.
     */
    Handle = async (req, res) => {
        const IdUser = req.params.IdUser;
        const IdLesson = req.params.IdLesson;

        console.log('IdUser' + IdUser)
        console.log('IdLesson' + IdLesson)
    }
}

module.exports = new Comments();
