const Courses = require('../../../model/Course');
const messages = require('../../../Extesions/messCost');

class LessonQuery {
    /**
     * Hiển thị trang thêm bài học cho quản trị viên.
     * 
     * @param {Object} req - Đối tượng yêu cầu.
     * @param {Object} res - Đối tượng phản hồi.
     * @param {Function} next - Hàm middleware tiếp theo.
     */
    addLesson(req, res, next) {
        const currentYear = new Date().getFullYear();
        res.render('pages/admin/addLesson', { layout: 'admin', year: currentYear });
    }

    /**
     * Hiển thị danh sách tất cả các bài học cho quản trị viên.
     * 
     * @param {Object} req - Đối tượng yêu cầu.
     * @param {Object} res - Đối tượng phản hồi.
     * @param {Function} next - Hàm middleware tiếp theo.
     */
    listAllLesson(req, res, next) {
        const currentYear = new Date().getFullYear();
        res.render('pages/admin/listAllLesson', { layout: 'admin', year: currentYear });
    }
}

module.exports = new LessonQuery;
