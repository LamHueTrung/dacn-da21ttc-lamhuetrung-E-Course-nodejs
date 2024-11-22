const Courses = require('../../../../model/Course'); 
const Chapter = require('../../../../model/Chapter'); 
const Validator = require('../../../../Extesions/validator'); 
const messages = require('../../../../Extesions/messCost'); 
const currentYear = new Date().getFullYear();

class UpdateChapter {

    /**
     * Xử lý cập nhật thông tin chapter
     * @param {Object} req - Yêu cầu từ client
     * @param {Object} res - Phản hồi tới client
     */
    Handle = async (req, res) => {
        const { chapterId, courseId, chapterName, chapterOrder } = req.body;

        try {
            const chapters = await Chapter.find();
            const chaptersData = chapters.map(chapter => {
                return {
                    ...chapter.toObject()
                };
            });

            // Kiểm tra chapter tồn tại không
            const chapter = await Chapter.findById(chapterId);
            if (!chapter) {
                return res.status(404).send(messages.updateChapter.chapterNotFound);
            }

            // Kiểm tra khóa học có tồn tại không
            const course = await Courses.findById(courseId);
            if (!course) {
                return res.status(404).send(messages.updateChapter.courseNotFound);
            }

            // Kiểm tra tên chapter trùng lặp
            const existingChapter = await Chapter.findOne({
                _id: { $ne: chapterId }, // Không xét chapter hiện tại
                courseId: courseId,
                title: chapterName
            });

            if (existingChapter) {
                return res.render('pages/admin/listAllChapter', {
                    layout: 'admin',
                    chapters: chaptersData, 
                    isSoftDelete: req.session.isSoftDelete, 
                    id: courseId,
                    ...req.body,
                    currentYear,
                    courseName: course.name,
                    isUpdateModal: true,
                    errors: { chapterName: messages.updateChapter.chapterExist }
                });
            }

            // Cập nhật chapter
            chapter.title = chapterName;
            chapter.chapterOrder = chapterOrder;
            await chapter.save();

            // Lấy danh sách chapter cập nhật mới nhất
            const updatedChapters = await Chapter.find({ courseId: courseId });
            const updatedChaptersData = updatedChapters.map(chap => chap.toObject());

            req.session.isUpdate = true;
            return res.render('pages/admin/listAllChapter', {
                layout: 'admin',
                chapters: updatedChaptersData,
                isSoftDelete: req.session.isSoftDelete, 
                id: courseId,
                chapterOrder: chapter.chapterOrder,
                currentYear,
                courseName: course.name,
                isUpdate: req.session.isUpdate
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');
        }
    };
}

module.exports = new UpdateChapter();
