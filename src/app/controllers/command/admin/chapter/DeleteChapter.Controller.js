const messages = require('../../../../Extesions/messCost');
const Courses = require('../../../../model/Course');
const Chapters = require('../../../../model/Chapter');
const Lessons = require('../../../../model/Lesson');

class DeleteChapter {
    /**
     * Vô hiệu hóa chương học và các bài học thuộc chương đó.
     * @param {Object} req - Request chứa `id` chương học.
     * @param {Object} res - Response trả về kết quả.
     */
    async disable(req, res) {
        const { id } = req.params;

        try {
            // Cập nhật trạng thái isDeleted của chương học
            const chapter = await Chapters.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
            if (!chapter) {
                return res.status(404).json({ success: false, message: messages.deleteChapter.chapterNotFound });
            }

            // Vô hiệu hóa tất cả các bài học thuộc chương này
            await Lessons.updateMany({ chapterId: id }, { isDeleted: true });

            req.session.isSoftDelete = true;
            return res.json({ success: true, message: messages.deleteChapter.softDeleteSuccess });
        } catch (error) {
            console.error(messages.deleteChapter.softDeleteError, error);
            return res.status(500).json({ success: false, message: messages.deleteChapter.softDeleteError });
        }
    }

    /**
     * Khôi phục chương học và các bài học thuộc chương đó.
     * Nếu khóa học của chương đang bị vô hiệu hóa, yêu cầu khôi phục khóa học trước.
     * @param {Object} req - Request chứa `id` chương học.
     * @param {Object} res - Response trả về kết quả.
     */
    async restore(req, res) {
        const { id } = req.params;

        try {
            // Tìm chương cần khôi phục
            const chapter = await Chapters.findById(id);
            if (!chapter) {
                return res.status(404).json({ success: false, message: messages.restoreChapter.chapterNotFound });
            }

            // Kiểm tra trạng thái của khóa học chứa chương này
            const course = await Courses.findById(chapter.courseId);
            if (!course || course.isDeleted) {
                // Nếu khóa học bị vô hiệu hóa, trả về thông báo lỗi
                return res.status(400).json({
                    success: false,
                    message: messages.restoreChapter.courseDisabled, // Thêm message vào `messCost`
                });
            }

            // Khôi phục trạng thái của chương
            const restoredChapter = await Chapters.findByIdAndUpdate(id, { isDeleted: false }, { new: true });

            // Khôi phục tất cả các bài học thuộc chương này
            await Lessons.updateMany({ chapterId: id }, { isDeleted: false });

            req.session.isRestore = true; // Đánh dấu trạng thái đã khôi phục
            return res.json({ success: true, message: messages.restoreChapter.restoreSuccess });
        } catch (error) {
            console.error(messages.restoreChapter.restoreError, error);
            return res.status(500).json({ success: false, message: messages.restoreChapter.restoreError });
        }
    }


    /**
     * Xóa chương học và tất cả bài học thuộc chương đó.
     * Đồng thời cập nhật lại thông tin liên quan trong khóa học.
     * @param {Object} req - Yêu cầu từ client.
     * @param {Object} res - Phản hồi tới client.
     */
    async delete(req, res) {
        const { id } = req.params; // ID của chapter cần xóa

        try {
            // Tìm chương cần xóa
            const chapter = await Chapters.findById(id);
            if (!chapter) {
                return res.status(404).json({
                    success: false,
                    message: messages.deleteChapter.chapterNotFound,
                });
            }

            // Xóa tất cả các bài học thuộc chương này
            await Lessons.deleteMany({ chapterId: id });

            // Xóa chapter khỏi danh sách các chapters trong khóa học
            const course = await Courses.findById(chapter.courseId);
            if (course) {
                // Loại bỏ chapter khỏi danh sách chapters
                course.chapters = course.chapters.filter(chapterId => chapterId.toString() !== id);
                await course.save();
            }

            // Xóa chapter khỏi cơ sở dữ liệu
            await Chapters.findByIdAndDelete(id);

            // Cập nhật lại tổng số bài học trong khóa học
            const remainingChapters = await Chapters.find({ courseId: chapter.courseId });
            const totalLessons = await Lessons.countDocuments({
                chapterId: { $in: remainingChapters.map(chap => chap._id) },
            });

            // Đồng bộ tổng số bài học
            if (course) {
                course.totalLessons = totalLessons;
                course.totalChapters = remainingChapters.length; // Cập nhật số lượng chapters
                await course.save();
            }

            // Phản hồi thành công
            return res.json({
                success: true,
                message: messages.deleteChapter.deleteSuccess,
            });
        } catch (error) {
            console.error(messages.deleteChapter.deleteError, error); // Ghi log lỗi
            return res.status(500).json({
                success: false,
                message: messages.deleteChapter.deleteError,
            });
        }
    }


}

module.exports = new DeleteChapter();
