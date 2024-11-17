const Courses = require('../../../../model/Course'); 
const Chapter = require('../../../../model/Chapter'); 
const Validator = require('../../../../Extesions/validator'); 
const messages = require('../../../../Extesions/messCost'); 
const currentYear = new Date().getFullYear();

class CreateChapter {
    /**
     * Validate đầu vào khi thêm chapter mới
     * @param {Object} req - Yêu cầu từ client
     * @returns {Object} - Trả về đối tượng chứa lỗi nếu có
     */
    Validate(req) {
        const { chapterName } = req.body;

        let errors = {
            chapterName: '',
        };

        // Kiểm tra tên chương (không được rỗng hoặc null)
        const chapterNameError = Validator.notEmpty(chapterName, 'Chapter name') ||
            Validator.notNull(chapterName, 'Chapter name');
        if (chapterNameError) errors.chapterName = chapterNameError;

        return errors;
    }

    /**
     * Xử lý thêm mới chapter và cập nhật khóa học
     * @param {Object} req - Yêu cầu từ client
     * @param {Object} res - Phản hồi tới client
     */
    Handle = async (req, res) => {
        const courseId = req.body.courseId;
        try {
            const chapters = await Chapter.find();
            const chaptersData = chapters.map(chapter => {
                return {
                    ...chapter.toObject()
                };
            });

            // Tìm chapter có số thứ tự lớn nhất cho khóa học này
            // Sắp xếp các chapter theo trường chapterOrder từ cao đến thấp, lấy chapter đầu tiên
            const lastChapter = await Chapter.find({ courseId: courseId }).sort({ chapterOrder: -1 }).limit(1);

            // Tính toán chapterOrder tiếp theo
            const nextChapterOrder = lastChapter.length > 0 ? lastChapter[0].chapterOrder + 1 : 1;

            // Kiểm tra lỗi đầu vào
            const errors = this.Validate(req);
            let courseName = '';
            const hasErrors = Object.values(errors).some(error => error !== '');
            // Kiểm tra xem khóa học có tồn tại không
            const courses = await Courses.findById(courseId);
            if (!courses) {
                return res.status(404).send("Khóa học không tồn tại.");
            }

            req.session.isCreateModal = true;
            // Nếu có lỗi, trả về giao diện thêm chapter với thông báo lỗi
            if (hasErrors) {
                return res.render('pages/admin/listAllChapter', {
                    layout: 'admin',
                    chapters: chaptersData, 
                    isSoftDelete: req.session.isSoftDelete, 
                    id: courseId,
                    chapterOrder: nextChapterOrder,
                    errors,
                    ...req.body,
                    currentYear: currentYear,
                    courseName: courses.name,
                    courseId: courseId,
                    isCreateModal: req.session.isCreateModal 
                });
            }
            courseName = courses.name;

            // Lấy thông tin chapter từ yêu cầu
            const { chapterName, chapterOrder } = req.body;

            // Kiểm tra sự tồn tại của chapter với cùng tên và khóa học
            req.session.isCreateModal = true;
            const existingChapter = await Chapter.findOne({ courseId: courseId, title: chapterName });
            if (existingChapter) {
                return res.render('pages/admin/listAllChapter', {
                    layout: 'admin',
                    chapters: chaptersData, 
                    isSoftDelete: req.session.isSoftDelete, 
                    id: courseId,
                    chapterOrder: nextChapterOrder,
                    currentYear: currentYear,
                    courseName: courses.name,
                    courseId: courseId,
                    isCreateModal: req.session.isCreateModal, 
                    errors: { chapterName: messages.createChapter.chapterExist },
                    ...req.body
                });
            }

            // Tạo chapter mới
            const newChapter = new Chapter({
                courseId: courseId,
                title: chapterName,
                chapterOrder: chapterOrder,
                lessons: []
            });

            // Lưu chapter mới vào cơ sở dữ liệu
            await newChapter.save();

            // Cập nhật mảng chapters và totalChapters trong model Course
            const course = await Courses.findById(courseId);
            if (course) {
                course.chapters.push(newChapter._id);
                course.totalChapters = course.chapters.length; // Đồng bộ số lượng chapters
                await course.save();
            }

            // Đánh dấu session đã tạo thành công
            req.session.isCreate = true;
            const chaptersNew = await Chapter.find();
            const chaptersDataNew = chaptersNew.map(chapter => {
                return {
                    ...chapter.toObject()
                };
            });
            // Trả về giao diện sau khi lưu thành công
            return res.render('pages/admin/listAllChapter', {
                layout: 'admin',
                isCreate: req.session.isCreate,
                year: currentYear,
                chapters: chaptersDataNew, 
                isSoftDelete: req.session.isSoftDelete, 
                id: courseId,
                chapterOrder: nextChapterOrder
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');  // Xử lý lỗi server
        }
        

        
    }
}

module.exports = new CreateChapter();
