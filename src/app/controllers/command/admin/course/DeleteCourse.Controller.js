const messages = require('../../../../Extesions/messCost');
const Courses = require('../../../../model/Course');
const Chapters = require('../../../../model/Chapter');
const Lessons = require('../../../../model/Lesson');
const fs = require('fs');
const path = require('path');

class DeleteCourse {
    
    /**
     * Vô hiệu hóa khóa học và tất cả chương, bài học trong khóa học.
     * @param {Object} req - Yêu cầu chứa thông tin ID khóa học.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async disable(req, res) {
        const { id } = req.params;

        try {
            // Cập nhật trạng thái isDeleted của khóa học
            const course = await Courses.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

            if (!course) {
                return res.status(400).json({ success: false, message: messages.deleteUser.softDeleteError });
            }

            // Vô hiệu hóa tất cả chương thuộc khóa học
            const chapters = await Chapters.updateMany({ courseId: id }, { isDeleted: true });

            // Vô hiệu hóa tất cả bài học thuộc các chương trong khóa học
            const chapterIds = await Chapters.find({ courseId: id }, '_id'); // Lấy danh sách chapterId
            await Lessons.updateMany({ chapterId: { $in: chapterIds.map(ch => ch._id) } }, { isDeleted: true });

            req.session.isSoftDelete = true; // Đánh dấu trạng thái đã vô hiệu hóa
            return res.json({ success: true, message: messages.deleteUser.softDeleteSucces });
        } catch (error) {
            console.error(messages.deleteUser.softDeleteError, error);
            return res.status(400).json({ success: false, message: messages.deleteUser.softDeleteError });
        }
    }

    /**
     * Khôi phục khóa học và tất cả chương, bài học trong khóa học.
     * @param {Object} req - Yêu cầu chứa thông tin ID khóa học.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async restore(req, res) {
        const { id } = req.params;

        try {
            // Cập nhật trạng thái isDeleted của khóa học
            const course = await Courses.findByIdAndUpdate(id, { isDeleted: false }, { new: true });

            if (!course) {
                return res.status(400).json({ success: false, message: messages.restoreUser.restoreError });
            }

            // Khôi phục tất cả chương thuộc khóa học
            const chapters = await Chapters.updateMany({ courseId: id }, { isDeleted: false });

            // Khôi phục tất cả bài học thuộc các chương trong khóa học
            const chapterIds = await Chapters.find({ courseId: id }, '_id'); // Lấy danh sách chapterId
            await Lessons.updateMany({ chapterId: { $in: chapterIds.map(ch => ch._id) } }, { isDeleted: false });

            req.session.isRestore = true; // Đánh dấu trạng thái đã khôi phục
            return res.json({ success: true, message: messages.restoreUser.restoreSuccess });
        } catch (error) {
            console.error(messages.restoreUser.restoreError, error);
            return res.status(400).json({ success: false, message: messages.restoreUser.restoreError });
        }
    }
    
    /**
     * Xóa khóa học và tất cả chương, bài học thuộc khóa học.
     * @param {Object} req - Yêu cầu chứa thông tin ID khóa học.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async delete(req, res) {
        const { id } = req.params;

        try {
            // Tìm khóa học
            const course = await Courses.findById(id);
            if (!course) {
                return res.status(400).json({ success: false, message: messages.deleteUser.deleteError });
            }

            // Xóa tất cả bài học thuộc các chương trong khóa học
            const chapterIds = await Chapters.find({ courseId: id }, '_id'); // Lấy danh sách chapterId
            await Lessons.deleteMany({ chapterId: { $in: chapterIds.map(ch => ch._id) } });

            // Xóa tất cả chương trong khóa học
            await Chapters.deleteMany({ courseId: id });

            // Xóa khóa học
            await Courses.findByIdAndDelete(id);

            // Xóa ảnh đại diện của khóa học nếu tồn tại
            const imagePath = path.join(__dirname, '../../../../../public', course.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

            return res.json({ success: true, message: messages.deleteUser.deleteSuccess });
        } catch (error) {
            console.error(messages.deleteUser.deleteError, error);
            return res.status(400).json({ success: false, message: messages.deleteUser.deleteError });
        }
    }

}

module.exports = new DeleteCourse();
