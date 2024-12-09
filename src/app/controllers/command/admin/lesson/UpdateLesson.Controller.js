const Courses = require('../../../../model/Course'); 
const Chapters = require('../../../../model/Chapter'); 
const Lessons = require('../../../../model/Lesson'); 
const Validator = require('../../../../Extesions/validator'); 
const messages = require('../../../../Extesions/messCost'); 
const { convertToSeconds, convertSecondsToTime, sumDurations } = require('../../../../Extesions/timeUtils');
const currentYear = new Date().getFullYear();

class UpdateLesson {
    /**
     * Validate đầu vào khi cập nhật bài học.
     * Kiểm tra các trường thông tin chỉ khi chúng có giá trị.
     * @param {Object} req - Yêu cầu từ client (dữ liệu bài học trong body).
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

        // Kiểm tra videoUrl chỉ khi có giá trị
        if (videoUrl) {
            const videoUrlError = 
                Validator.notEmpty(videoUrl, 'Video URL') || 
                Validator.notNull(videoUrl, 'Video URL') || 
                Validator.isValidUrl(videoUrl, 'Video URL');
            if (videoUrlError) errors.videoUrl = videoUrlError;
        }

        // Kiểm tra duration chỉ khi có giá trị
        if (duration) {
            const durationError = 
                Validator.notEmpty(duration, 'Duration') || 
                Validator.notNull(duration, 'Duration') || 
                Validator.isValidDuration(duration, 'Duration');
            if (durationError) errors.duration = durationError;
        }

        // Trả về đối tượng lỗi
        return errors;
    }

    /**
     * Xử lý cập nhật thông tin bài học.
     * @param {Object} req - Yêu cầu từ client (bao gồm dữ liệu bài học cần cập nhật).
     * @param {Object} res - Phản hồi tới client.
     */
    Handle = async (req, res) => {
        const id = req.params.id; // ID của bài học cần cập nhật
        const chapterId = req.body.IdChapter; // ID của chương chứa bài học
        const { lessonName, lessonDescription, videoUrl, duration, lessonOrder } = req.body;

        try {
            // Kiểm tra lỗi đầu vào
            const errors = this.Validate(req);
            const hasErrors = Object.values(errors).some(error => error !== ''); // Kiểm tra nếu có lỗi
            const lesson = await Lessons.findById(id); // Tìm bài học cần cập nhật

            // Kiểm tra xem bài học có tồn tại không
            if (!lesson) {
                return res.status(404).send("Bài học không tồn tại."); // Trả về lỗi nếu bài học không tồn tại
            }

            // Nếu có lỗi, trả về giao diện cập nhật bài học với thông báo lỗi
            if (hasErrors) {
                return res.render('pages/admin/updateLesson', {
                    layout: 'admin',
                    errors, // Thông báo lỗi
                    lessonsData: lesson.toObject(), // Dữ liệu bài học để hiển thị lại
                    currentYear: currentYear,
                });
            }
            
            // Kiểm tra chương học có tồn tại không
            const chapter = await Chapters.findById(chapterId);
            if (!chapter) {
                return res.status(404).send(messages.updateChapter.courseNotFound); // Trả về lỗi nếu chương không tồn tại
            }

            // Kiểm tra bài học trùng tên trong chương học
            const existingLesson = await Lessons.findOne({
                _id: { $ne: id }, // Loại trừ bài học hiện tại
                chapterId: chapterId,
                name: lessonName, // Kiểm tra trùng tên
            });

            if (existingLesson) {
                // Nếu trùng tên, trả về giao diện với thông báo lỗi
                return res.render('pages/admin/updateLesson', {
                    layout: 'admin',
                    idChapter: chapterId,
                    lessonsData: lesson.toObject(), // Dữ liệu bài học để hiển thị lại
                    currentYear,
                    errors: { lessonName: messages.updateLesson.lessonExist }, // Lỗi trùng tên bài học
                });
            }

            // Tạo đối tượng dữ liệu cập nhật với các trường không bị bỏ trống
            const updatedData = {
                chapterId: lesson.chapterId, // Giữ nguyên chương hiện tại
                lessonOrder: lesson.lessonOrder, // Giữ nguyên thứ tự bài học
                name: lessonName || lesson.name, // Nếu không nhập mới, giữ nguyên tên cũ
                description: lessonDescription || lesson.description, // Nếu không nhập mới, giữ nguyên mô tả cũ
                videoUrl: videoUrl || lesson.videoUrl, // Nếu không nhập mới, giữ nguyên URL cũ
                duration: duration || lesson.duration, // Nếu không nhập mới, giữ nguyên thời lượng cũ
            };

            // Cập nhật bài học trong cơ sở dữ liệu
            await Lessons.findByIdAndUpdate(id, updatedData);

            // Lấy courseId từ chapterId của bài học
            const courseId = chapter.courseId;

            const course = await Courses.findById(courseId);
            
            // Lấy tất cả các chương của khóa học
            const chapters = await Chapters.find({ courseId });

            // Lấy tất cả các bài học trong các chương của khóa học
            let durations = [];
            for (let chapter of chapters) {
                const lessons = await Lessons.find({ chapterId: chapter._id });
                lessons.forEach(lesson => {
                    durations.push(lesson.duration); // Lưu lại duration của mỗi bài học
                });
            }

            // Tính tổng duration của khóa học
            const totalDuration = sumDurations(durations);

            // Cập nhật lại trường duration của khóa học
            course.duration = totalDuration;
            await course.save();

            req.session.isUpdate = true; // Đánh dấu trạng thái cập nhật thành công

            // Hiển thị thông báo thành công sau khi cập nhật
            return res.render('pages/admin/updateLesson', {
                layout: 'admin',
                isUpdate: req.session.isUpdate, // Gắn cờ thông báo thành công
                lessonsData: lesson.toObject(),
                currentYear: currentYear,
            });
            
        } catch (error) {
            // Ghi log lỗi và phản hồi lỗi server
            console.error(error);
            res.status(500).send('Lỗi server');
        }
    };
}

module.exports = new UpdateLesson();
