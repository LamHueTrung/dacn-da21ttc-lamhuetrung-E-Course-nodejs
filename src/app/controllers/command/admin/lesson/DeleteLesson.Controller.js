const messages = require('../../../../Extesions/messCost');
const Courses = require('../../../../model/Course');
const Chapters = require('../../../../model/Chapter');
const Lessons = require('../../../../model/Lesson');

class DeleteLesson {
    /**
     * Vô hiệu hóa bài học bằng cách đặt `isDeleted` thành `true`.
     * @param {Object} req - Yêu cầu từ client, chứa `id` của bài học.
     * @param {Object} res - Phản hồi tới client, thông báo kết quả.
     */
    async disable(req, res) {
        const { id } = req.params;

        try {
            // Cập nhật trạng thái `isDeleted` thành `true` để vô hiệu hóa bài học
            const lesson = await Lessons.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
            if (!lesson) {
                // Nếu bài học không tồn tại, trả về lỗi 404
                return res.status(404).json({ success: false, message: messages.deleteLesson.lessonNotFound });
            }

            req.session.isSoftDelete = true; // Đánh dấu trạng thái vô hiệu hóa thành công trong session
            return res.json({ success: true, message: messages.deleteLesson.softDeleteSuccess });
        } catch (error) {
            console.error(messages.deleteLesson.softDeleteError, error); // Ghi log lỗi
            return res.status(500).json({ success: false, message: messages.deleteLesson.softDeleteError });
        }
    }

    /**
     * Khôi phục bài học bằng cách đặt `isDeleted` thành `false`.
     * Nếu chương của bài học bị vô hiệu hóa, yêu cầu khôi phục chương trước.
     * @param {Object} req - Yêu cầu từ client, chứa `id` của bài học.
     * @param {Object} res - Phản hồi tới client, thông báo kết quả.
     */
    async restore(req, res) {
        const { id } = req.params;

        try {
            // Tìm bài học cần khôi phục
            const lesson = await Lessons.findById(id);
            if (!lesson) {
                // Nếu bài học không tồn tại, trả về lỗi 404
                return res.status(404).json({ success: false, message: messages.restoreLesson.lessonNotFound });
            }

            // Kiểm tra trạng thái của chương chứa bài học
            const chapter = await Chapters.findById(lesson.chapterId);
            if (!chapter || chapter.isDeleted) {
                // Nếu chương bị vô hiệu hóa, yêu cầu khôi phục chương trước
                return res.status(400).json({
                    success: false,
                    message: messages.restoreLesson.chapterDisabled,
                });
            }

            // Khôi phục bài học
            const updatedLesson = await Lessons.findByIdAndUpdate(id, { isDeleted: false }, { new: true });

            req.session.isRestore = true; // Đánh dấu trạng thái khôi phục thành công
            return res.json({ success: true, message: messages.restoreLesson.restoreSuccess, lesson: updatedLesson });
        } catch (error) {
            console.error(messages.restoreLesson.restoreError, error); // Ghi log lỗi
            return res.status(500).json({ success: false, message: messages.restoreLesson.restoreError });
        }
    }


    /**
     * Xóa bài học khỏi cơ sở dữ liệu và cập nhật thông tin liên quan trong chương và khóa học.
     * @param {Object} req - Yêu cầu từ client, chứa `id` của bài học.
     * @param {Object} res - Phản hồi tới client, thông báo kết quả.
     */
    async delete(req, res) {
        const { id } = req.params; // ID của bài học cần xóa

        try {
            // Tìm bài học cần xóa
            const lesson = await Lessons.findById(id);
            if (!lesson) {
                // Nếu bài học không tồn tại, trả về lỗi 404
                return res.status(404).json({
                    success: false,
                    message: messages.deleteLesson.lessonNotFound,
                });
            }

            // Xóa bài học khỏi danh sách các bài học trong chương
            const chapter = await Chapters.findById(lesson.chapterId);
            if (chapter) {
                chapter.lessons = chapter.lessons.filter(lessonId => lessonId.toString() !== id);
                await chapter.save(); // Lưu cập nhật chương
            }

            // Xóa bài học khỏi cơ sở dữ liệu
            await Lessons.findByIdAndDelete(id);

            // Cập nhật thứ tự các bài học còn lại trong chương
            const lessonsInChapter = await Lessons.find({ chapterId: lesson.chapterId }).sort({ lessonOrder: 1 });
            for (let i = 0; i < lessonsInChapter.length; i++) {
                lessonsInChapter[i].lessonOrder = i + 1; // Cập nhật lại thứ tự bài học
                await lessonsInChapter[i].save(); // Lưu cập nhật
            }

            // Cập nhật tổng số bài học trong khóa học liên quan
            const course = await Courses.findById(chapter.courseId);
            if (course) {
                course.totalLessons = chapter.lessons.length; // Cập nhật tổng số bài học
                await course.save(); // Lưu cập nhật khóa học
            }

            // Phản hồi thành công
            return res.json({
                success: true,
                message: messages.deleteLesson.deleteSuccess,
            });
        } catch (error) {
            console.error(messages.deleteLesson.deleteError, error); // Ghi log lỗi
            return res.status(500).json({
                success: false,
                message: messages.deleteLesson.deleteError,
            });
        }
    }

}

module.exports = new DeleteLesson();
