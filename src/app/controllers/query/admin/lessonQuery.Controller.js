const Chapters = require('../../../model/Chapter');
const Lessons = require('../../../model/Lesson');
const messages = require('../../../Extesions/messCost');

class LessonQuery {
    /**
     * Hiển thị trang thêm bài học cho quản trị viên.
     * 
     * @param {Object} req - Đối tượng yêu cầu.
     * @param {Object} res - Đối tượng phản hồi.
     * @param {Function} next - Hàm middleware tiếp theo.
     */
    async addLesson(req, res, next) {
        const currentYear = new Date().getFullYear();
        const chapterId = req.params.id;
        try {
            const lastLesson = await Lessons.find({ chapterId: chapterId }).sort({ lessonOrder: -1 }).limit(1);

            // Tính toán chapterOrder tiếp theo
            const nextLessonOrder = lastLesson.length > 0 ? lastLesson[0].lessonOrder + 1 : 1;

            res.render('pages/admin/addLesson', { 
                layout: 'admin', 
                year: currentYear,
                isSoftDelete: req.session.isSoftDelete, 
                lessonsOrder: nextLessonOrder,
                idChapter: chapterId
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');  // Xử lý lỗi server
        }
    }

    /**
     * Hiển thị danh sách tất cả các bài học cho quản trị viên.
     * 
     * @param {Object} req - Đối tượng yêu cầu.
     * @param {Object} res - Đối tượng phản hồi.
     * @param {Function} next - Hàm middleware tiếp theo.
     */
    async listAllLesson(req, res, next) {
        const currentYear = new Date().getFullYear();
        const chapterId = req.params.id;
        try {
            const lessons = await Lessons.find({ chapterId });
            const lessonsData = lessons.map(lessons => {
                return {
                    ...lessons.toObject()
                };
            });

            res.render('pages/admin/listAllLesson', { 
                layout: 'admin', 
                year: currentYear,
                lessons: lessonsData, 
                isSoftDelete: req.session.isSoftDelete, 
                idChapter: chapterId
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');  // Xử lý lỗi server
        }
    }

    /**
     * Hàm UpdateUser: Xử lý trang cập nhật thông tin người dùng.
     * - Tìm kiếm người dùng theo ID và trả về dữ liệu để hiển thị lên form.
     * - Nếu không tìm thấy người dùng, trả về lỗi 404.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
     */
    async UpdateLesson(req, res, next) {
        const currentYear = new Date().getFullYear();
        const id = req.params.id;

        try {
            const lesson = await Lessons.findById(id);
            if (!lesson) {
                return res.status(404).send(messages.updateLesson.lessonExist);  
            }

            res.render('pages/admin/updateLesson', {
                layout: 'admin',
                year: currentYear,
                isUpdate: req.session.isUpdate,  
                lessonsData: lesson.toObject()
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');  // Trả về lỗi server nếu có lỗi
        }
    }

    /**
     * Hiển thị chi tiết khóa học cùng với thông tin tác giả.
     * 
     * @param {Object} req - Đối tượng yêu cầu.
     * @param {Object} res - Đối tượng phản hồi.
     * @param {Function} next - Hàm middleware tiếp theo.
     */
    async viewsLesson(req, res, next) {
        const currentYear = new Date().getFullYear();
        const lessonId = req.params.id;

        try {
            // Truy vấn khóa học theo ID và sử dụng populate để lấy thông tin tác giả
            const lesson = await Lessons.findById(lessonId);

            if (!lesson) {
                return res.status(404).send('Không tìm thấy khóa học'); // Trả về lỗi nếu không tìm thấy khóa học
            }

            const chapter = await Chapters.findById(lesson.chapterId);

            res.render('pages/admin/viewLesson', {
                layout: 'admin',
                year: currentYear,
                lesson: lesson.toObject(),
                chapter: chapter.toObject()
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server'); // Xử lý lỗi server
        }
    }
}

module.exports = new LessonQuery;
