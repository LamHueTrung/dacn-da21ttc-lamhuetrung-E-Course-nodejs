const Courses = require('../../../model/Course');
const Chapter = require('../../../model/Chapter');
const messages = require('../../../Extesions/messCost');

class CourseQuery {
    /**
     * Hiển thị trang thêm khóa học cho quản trị viên.
     * 
     * @param {Object} req - Đối tượng yêu cầu.
     * @param {Object} res - Đối tượng phản hồi.
     * @param {Function} next - Hàm middleware tiếp theo.
     */
    addCourse(req, res, next) {
        const currentYear = new Date().getFullYear();
        res.render('pages/admin/addCourse', { layout: 'admin', year: currentYear });
    }

    /**
     * Hiển thị danh sách tất cả các khóa học với thông tin tác giả.
     * Sử dụng `populate` để lấy thông tin của tác giả.
     * 
     * @param {Object} req - Đối tượng yêu cầu.
     * @param {Object} res - Đối tượng phản hồi.
     * @param {Function} next - Hàm middleware tiếp theo.
     */
    async listAllCourse(req, res, next) {
        const currentYear = new Date().getFullYear();

        try {
            // Truy vấn tất cả các khóa học và sử dụng populate để lấy thông tin tác giả
            const courses = await Courses.find().populate('author', 'profile.fullName');

            // Chuyển đổi dữ liệu khóa học để thêm tên tác giả
            const coursesData = courses.map(course => {
                const authorFullName = course.author && course.author.profile ? course.author.profile.fullName : 'Unknown';
                return {
                    ...course.toObject(),
                    author: authorFullName
                };
            });

            res.render('pages/admin/listAllCourse', { 
                layout: 'admin', 
                year: currentYear,
                courses: coursesData, 
                isSoftDelete: req.session.isSoftDelete // Truyền trạng thái xóa mềm vào view
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');  // Xử lý lỗi server
        }
    }

    /**
     * Hiển thị chi tiết khóa học cùng với thông tin tác giả.
     * 
     * @param {Object} req - Đối tượng yêu cầu.
     * @param {Object} res - Đối tượng phản hồi.
     * @param {Function} next - Hàm middleware tiếp theo.
     */
    async viewsCourse(req, res, next) {
        const currentYear = new Date().getFullYear();
        const courseId = req.params.id;

        try {
            // Truy vấn khóa học theo ID và sử dụng populate để lấy thông tin tác giả
            const course = await Courses.findById(courseId).populate('author', 'profile.fullName profile.specialty profile.avatar profile.phone profile.degree');

            if (!course) {
                return res.status(404).send('Không tìm thấy khóa học'); // Trả về lỗi nếu không tìm thấy khóa học
            }

            // Giả sử số lượng người đăng ký là 0
            const registeredUserCount = 0;

            res.render('pages/admin/viewCourse', {
                layout: 'admin',
                year: currentYear,
                course: course.toObject(),
                author: course.author && course.author.profile ? course.author.profile.fullName : 'Unknown', // Xử lý trường hợp không có tác giả
                registeredUserCount 
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server'); // Xử lý lỗi server
        }
    }

    /**
     * Hiển thị trang cập nhật khóa học cho quản trị viên.
     * Lấy dữ liệu khóa học theo ID và hiển thị lên form cập nhật.
     * 
     * @param {Object} req - Đối tượng yêu cầu.
     * @param {Object} res - Đối tượng phản hồi.
     * @param {Function} next - Hàm middleware tiếp theo.
     */
    async UpdateCourse(req, res, next) {
        const currentYear = new Date().getFullYear();
        const courseId = req.params.id;

        try {
            // Truy vấn khóa học theo ID
            const course = await Courses.findById(courseId);

            if (!course) {
                return res.status(404).send(messages.updateCourse.courseNotFound);  // Trả về lỗi nếu không tìm thấy khóa học
            }

            res.render('pages/admin/updateCourse', {
                layout: 'admin',
                year: currentYear,
                isUpdate: req.session.isUpdate,  // Trạng thái cập nhật
                data: course.toObject()  // Truyền dữ liệu khóa học để điền vào form
            });
        } catch (error) {
            console.error(messages.token.tokenFetchingError, error);
            res.status(500).send('Lỗi server');  // Xử lý lỗi server
        }
    }

    async listAllChapter(req, res, next) {
        const currentYear = new Date().getFullYear();
        const courseId = req.params.id;
        try {
            const chapters = await Chapter.find({courseId: courseId});
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

            res.render('pages/admin/listAllChapter', { 
                layout: 'admin', 
                year: currentYear,
                chapters: chaptersData, 
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

module.exports = new CourseQuery;
