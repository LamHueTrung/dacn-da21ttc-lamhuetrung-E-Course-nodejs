const messages = require('../../../../Extesions/messCost');
const Courses = require('../../../../model/Course');
const Chapters = require('../../../../model/Chapter');

class DeleteChapter {
    /**
     * Vô hiệu hóa chương học bằng cách đặt `isDeleted` thành `true`.
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

            req.session.isSoftDelete = true;
            return res.json({ success: true, message: messages.deleteChapter.softDeleteSuccess });
        } catch (error) {
            console.error(messages.deleteChapter.softDeleteError, error);
            return res.status(500).json({ success: false, message: messages.deleteChapter.softDeleteError });
        }
    }

    /**
     * Khôi phục chương học bằng cách đặt `isDeleted` thành `false`.
     * @param {Object} req - Request chứa `id` chương học.
     * @param {Object} res - Response trả về kết quả.
     */
    async restore(req, res) {
        const { id } = req.params;

        try {
            // Cập nhật trạng thái isDeleted của chương học
            const chapter = await Chapters.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
            if (!chapter) {
                return res.status(404).json({ success: false, message: messages.restoreChapter.chapterNotFound });
            }

            req.session.isRestore = true;
            return res.json({ success: true, message: messages.restoreChapter.restoreSuccess });
        } catch (error) {
            console.error(messages.restoreChapter.restoreError, error);
            return res.status(500).json({ success: false, message: messages.restoreChapter.restoreError });
        }
    }

     /**
     * Xử lý xóa chapter và cập nhật khóa học liên quan
     * @param {Object} req - Yêu cầu từ client
     * @param {Object} res - Phản hồi tới client
     */
     async delete(req, res) {
        const { id } = req.params; // ID của chapter cần xóa

        try {
            // Tìm chapter cần xóa
            const chapter = await Chapters.findById(id);
            if (!chapter) {
                return res.status(404).json({ 
                    success: false, 
                    message: messages.deleteChapter.chapterNotFound 
                });
            }

            // Cập nhật thông tin khóa học: Xóa chapter khỏi mảng chapters
            const course = await Courses.findById(chapter.courseId);
            if (course) {
                course.chapters = course.chapters.filter(chapterId => chapterId.toString() !== id);
                course.totalChapters = course.chapters.length; // Đồng bộ số lượng chapters
                await course.save();
            }

            // Xóa chapter khỏi cơ sở dữ liệu
            await Chapters.findByIdAndDelete(id);

            // Phản hồi thành công
            return res.json({ 
                success: true, 
                message: messages.deleteChapter.deleteSuccess 
            });
        } catch (error) {
            console.error(messages.deleteChapter.deleteError, error);
            return res.status(500).json({ 
                success: false, 
                message: messages.deleteChapter.deleteError 
            });
        }
    }
}

module.exports = new DeleteChapter();
