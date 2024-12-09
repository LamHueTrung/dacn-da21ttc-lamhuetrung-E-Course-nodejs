const jwt = require('jsonwebtoken');
const Courses = require('../../../model/Course');
const currentYear = new Date().getFullYear(); // Lấy năm hiện tại để hiển thị
const messages = require('../../../Extesions/messCost');

class LoginGoogle {
    
    /**
     * Hàm xử lý đăng nhập của quản trị viên.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     */
    Handle = async (req, res) => {
        const dataUser = {
            id: req.user._id,
            userName: req.user.username,
            fullName: req.user.profile.fullName,
            avatar: req.user.profile.avatar,
            googleId: req.user.googleId,
            isDeleted: req.user.isDeleted,
        };
        try {       
            const jwtSecretKey = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ id: dataUser.id, googleId: dataUser.googleId }, jwtSecretKey, { expiresIn: '4h' });
            req.session.tokenUser = token;  // Lưu token vào session
            req.session.isLoggedInUser = true;  // Đánh dấu là đã đăng nhập
            
            // Truy vấn tất cả các khóa học và sử dụng populate để lấy thông tin tác giả
            const courses = await Courses.find().populate('author', 'profile');
                
            // Chuyển đổi dữ liệu khóa học để thêm tên tác giả
            const coursesData = courses.map(course => {
                const authorFullName = course.author && course.author.profile ? course.author.profile.fullName : 'Unknown';
                const authorImage = course.author && course.author.profile ? course.author.profile.avatar : 'Unknown';
                return {
                    ...course.toObject(),
                    author: authorFullName,
                    imageAuthor: authorImage
                };
            });
            res.render(
            'pages/home',
            { 
                year: currentYear,
                courses: coursesData, 
                tokenUser: req.session.tokenUser, 
                isLoggedInUser: req.session.isLoggedInUser, 
                currentYear: currentYear,
                dataUser: dataUser
            });
        } catch (error) {
            console.error(messages.login.loginError, error);
            return res.status(500).json({ message: messages.serverError });
        }
    } 
}

module.exports = new LoginGoogle();
