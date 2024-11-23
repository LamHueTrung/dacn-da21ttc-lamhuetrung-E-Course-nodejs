const Lessons = require('../../../../model/Lesson'); 
const Courses = require('../../../../model/Course');
const Chapters = require('../../../../model/Chapter'); 
const Validator = require('../../../../Extesions/validator'); 
const messages = require('../../../../Extesions/messCost'); 
const currentYear = new Date().getFullYear();

class CreateLesson {
    /**
     * Validate đầu vào khi thêm bài học mới.
     * Kiểm tra các trường thông tin có hợp lệ không.
     * @param {Object} req - Yêu cầu từ client (chứa thông tin bài học trong body).
     * @returns {Object} - Đối tượng chứa lỗi nếu có.
     */
    Validate(req) {
        const { lessonName, lessonDescription, videoUrl, duration, lessonOrder } = req.body;

        let errors = {
            lessonName: '',
            lessonDescription: '',
            videoUrl: '',
            duration: '',
            lessonOrder: '',
        };

        // Kiểm tra tên bài học không được để trống hoặc null.
        const nameError = Validator.notEmpty(lessonName, 'Lesson name') || Validator.notNull(lessonName, 'Lesson name');
        if (nameError) errors.lessonName = nameError;

        // Kiểm tra mô tả bài học không được để trống hoặc null.
        const descriptionError = Validator.notEmpty(lessonDescription, 'Lesson description') || Validator.notNull(lessonDescription, 'Lesson description');
        if (descriptionError) errors.lessonDescription = descriptionError;

        // Kiểm tra URL của video phải hợp lệ, không trống và không null.
        const videoUrlError = Validator.notEmpty(videoUrl, 'Video URL') || Validator.notNull(videoUrl, 'Video URL') || Validator.isValidUrl(videoUrl, 'Video URL');
        if (videoUrlError) errors.videoUrl = videoUrlError;

        // Kiểm tra thời lượng (duration) phải hợp lệ, không trống, và không null.
        const durationError = Validator.notEmpty(duration, 'Duration') || Validator.notNull(duration, 'Duration') || Validator.isValidDuration(duration, 'Duration');
        if (durationError) errors.duration = durationError;

        // Kiểm tra thứ tự bài học (lessonOrder) phải là số dương.
        const lessonOrderError = Validator.isPositiveNumber(lessonOrder, 'Lesson order');
        if (lessonOrderError) errors.lessonOrder = lessonOrderError;

        // Trả về đối tượng lỗi.
        return errors;
    }

    /**
     * Xử lý thêm mới bài học vào chương và cập nhật thông tin liên quan.
     * @param {Object} req - Yêu cầu từ client (bao gồm thông tin bài học).
     * @param {Object} res - Phản hồi tới client.
     */
    Handle = async (req, res) => {
        const chapterId = req.params.id; // Lấy ID của chương từ URL.
        
        // Lấy bài học cuối cùng theo thứ tự (lessonOrder) để xác định thứ tự tiếp theo.
        const lastLesson = await Lessons.find({ chapterId: chapterId }).sort({ lessonOrder: -1 }).limit(1);
        const nextLessonOrder = lastLesson.length > 0 ? lastLesson[0].lessonOrder + 1 : 1;

        const { lessonName, lessonDescription, videoUrl, duration, lessonOrder } = req.body;

        try {
            // Kiểm tra lỗi đầu vào.
            const errors = this.Validate(req);
            const hasErrors = Object.values(errors).some(error => error !== ''); // Kiểm tra xem có lỗi nào không.

            // Kiểm tra xem chương (chapter) có tồn tại không.
            const chapters = await Chapters.findById(chapterId);
            if (!chapters) {
                return res.status(404).send("Chương không tồn tại.");
            }

            // Nếu có lỗi, trả về giao diện thêm bài học kèm thông báo lỗi.
            if (hasErrors) {
                return res.render('pages/admin/addLesson', {
                    layout: 'admin',
                    isSoftDelete: req.session.isSoftDelete, 
                    lessonsOrder: nextLessonOrder, // Thứ tự bài học tiếp theo.
                    idChapter: chapterId,
                    errors, // Danh sách lỗi để hiển thị trên giao diện.
                    ...req.body, // Trả lại thông tin người dùng đã nhập.
                    currentYear: currentYear, // Năm hiện tại (cho mục đích hiển thị).
                });
            }
            
            // Kiểm tra xem bài học có trùng tên trong chương không.
            const existingLesson = await Lessons.findOne({ chapterId: chapterId, name: lessonName });
            if (existingLesson) {
                return res.render('pages/admin/addLesson', {
                    layout: 'admin',
                    isSoftDelete: req.session.isSoftDelete, 
                    lessonsOrder: nextLessonOrder,
                    idChapter: chapterId,
                    errors: { lessonName: messages.createLesson.lessonExist }, // Báo lỗi bài học đã tồn tại.
                    ...req.body,
                    currentYear: currentYear,
                });
            }

            // Tạo bài học mới.
            const newLesson = new Lessons({
                chapterId: chapterId, // Liên kết bài học với chương.
                name: lessonName,
                description: lessonDescription, 
                videoUrl: videoUrl, 
                duration: duration, 
                lessonOrder: lessonOrder,
            });

            // Lưu bài học vào cơ sở dữ liệu.
            await newLesson.save();

            // Thêm bài học vào danh sách bài học của chương.
            const chapter = await Chapters.findById(chapterId);
            if (chapter) {
                chapter.lessons.push(newLesson._id);
                await chapter.save();
            }
            
            // Cập nhật tổng số bài học trong khóa học.
            const course = await Courses.findById(chapter.courseId);
            if (course) {
                course.totalLessons = course.totalLessons + 1; // Tổng số bài học hiện tại.
                await course.save();
            }

            // Lấy danh sách bài học để hiển thị.
            const lessons = await Lessons.find();
            const lessonsData = lessons.map(lesson => lesson.toObject()); // Chuyển đổi dữ liệu bài học sang Object.

            req.session.isCreate = true; // Đánh dấu tạo mới thành công.
            return res.render('pages/admin/addLesson', {
                layout: 'admin',
                isCreate: req.session.isCreate,
                currentYear: currentYear,
                lessons: lessonsData, // Danh sách bài học để hiển thị.
                isSoftDelete: req.session.isSoftDelete, 
                idChapter: chapterId,
            });

        } catch (error) {
            // Ghi lại lỗi vào log và phản hồi lỗi server.
            console.error(error);
            res.status(500).send('Lỗi server');  
        }
    }
}

module.exports = new CreateLesson();
