const Courses = require('../../../../model/Course');
const Validator = require('../../../../Extesions/validator');
const messages = require('../../../../Extesions/messCost');
const CryptoService = require('../../../../Extesions/cryptoService');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const currentYear = new Date().getFullYear();


class UpdateChapter {
    /**
     * Xác thực dữ liệu người dùng trước khi cập nhật thông tin khóa học.
     * Kiểm tra các trường như tên khóa học, mô tả, lợi ích, cấp độ, giá cũ, giá mới và thể loại.
     * 
     * @param {Object} req - Yêu cầu từ người dùng, chứa thông tin cần cập nhật.
     * @param {Object} currentData - Dữ liệu hiện tại của khóa học, dùng để so sánh và xác thực.
     * @returns {Object} - Trả về đối tượng chứa các lỗi (nếu có) và giá trị hợp lệ của các trường cần cập nhật.
     */
    async Validate(req, currentData) {
        // Khởi tạo các giá trị mặc định từ dữ liệu hiện tại nếu không có thông tin trong req.body
        const {
            courseName = currentData.courseName,
            description = currentData.description,
            benefits = currentData.benefits,
            level = currentData.level,
            oldPrice = currentData.oldPrice, 
            newPrice = currentData.newPrice, 
            category = currentData.category 
        } = req.body;

        // Khởi tạo đối tượng lưu trữ lỗi cho từng trường hợp
        let errors = {
            courseName: '',
            description: '',
            benefits: '',
            level: '',
            oldPrice: '',
            newPrice: '',
            category: '',
        };

        // Kiểm tra tên khóa học
        const courseNameError = Validator.notEmpty(courseName, 'Course name') ||
        Validator.notNull(courseName, 'Course name');
        if (courseNameError) errors.courseName = courseNameError;

        // Kiểm tra mô tả khóa học
        const descriptionError = Validator.notEmpty(description, 'Description') ||
        Validator.notNull(description, 'Description');
        if (descriptionError) errors.description = descriptionError;

        // Kiểm tra lợi ích khóa học
        const benefitsError = Validator.arrayNotEmpty(benefits, 'Benefits');
        if (benefitsError) errors.benefits = benefitsError;

        // Kiểm tra cấp độ khóa học
        const levelError = Validator.isEnum(level, ['Beginner', 'Intermediate', 'Advanced'], 'Level');
        if (levelError) errors.level = levelError;

        // Kiểm tra giá cũ
        const oldPriceError = Validator.isPositiveNumber(oldPrice, 'Old Price');
        if (oldPriceError) errors.oldPrice = oldPriceError;

        // Kiểm tra giá mới
        const newPriceError = Validator.isPositiveNumber(newPrice, 'New Price');
        if (newPriceError) errors.newPrice = newPriceError;

        // Kiểm tra thể loại khóa học
        const categoryError = Validator.notEmpty(category, 'Category');
        if (categoryError) errors.category = categoryError;

        // Kiểm tra sự chênh lệch giữa giá cũ và giá mới
        const priceError = Validator.greaterThan(oldPrice, newPrice, 'Old Price');
        if (priceError) errors.oldPrice = priceError;

        // Trả về kết quả lỗi và giá trị hợp lệ
        return { errors, values: { courseName, description, benefits, level, oldPrice, newPrice, category } };
    }

    /**
     * Xử lý việc cập nhật thông tin khóa học.
     * 
     * @param {Object} req - Yêu cầu từ người dùng, chứa thông tin cần cập nhật.
     * @param {Object} res - Phản hồi gửi tới người dùng.
     * @returns {void} - Không trả về giá trị, chỉ thực hiện cập nhật và trả về kết quả.
     */
    Handle = async (req, res) => {
        try {
            // Lấy thông tin khóa học hiện tại từ cơ sở dữ liệu
            const currentCourse = await Courses.findById(req.params.id); 
            if (!currentCourse) {
                return res.status(404).json({ message: messages.updateCourse.courseNotFound });
            }

            // Thực hiện kiểm tra và xác thực dữ liệu từ người dùng
            const { errors, values } = await this.Validate(req, currentCourse);

            // Kiểm tra nếu có lỗi trong quá trình xác thực
            const hasErrors = Object.values(errors).some(error => error !== '');
            if (hasErrors) {
                // Nếu có lỗi, hiển thị lại trang với các thông báo lỗi
                return res.render('pages/admin/updateCourse', {
                    layout: 'admin',
                    errors,
                    ...values,
                    currentYear: currentYear
                });
            }

            const jwtSecretKey = process.env.JWT_SECRET_KEY;
            const token = req.session.token;

            // Xác thực token từ người dùng
            jwt.verify(token, jwtSecretKey, async (err, decoded) => {
                if (err) {
                    console.error(messages.token.tokenVerificationFailed, err);
                    return res.status(401).json({ message: messages.token.tokenVerificationFailed });
                }

                req.userId = decoded.id; // Lưu userId vào request sau khi xác thực token

                try {
                    // Tạo đối tượng dữ liệu cập nhật
                    const updatedData = {
                        name: req.body.courseName || currentCourse.courseName,
                        description: req.body.description || currentCourse.description,
                        benefits: req.body.benefits || currentCourse.benefits,
                        level: req.body.level || currentCourse.level,
                        oldPrice: req.body.oldPrice || currentCourse.oldPrice,
                        newPrice: req.body.newPrice || currentCourse.newPrice,
                        author: req.userId || currentCourse.author,
                        image: req.file ? '/courses/' + req.file.filename : currentCourse.image,
                        category: req.body.category || currentCourse.category
                    };

                    // Xóa ảnh đại diện cũ nếu có ảnh mới
                    if (req.file) {
                        const oldImagePath = path.join(__dirname, '../../../../../public', currentCourse.image); 
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath); 
                        }
                    }

                    // Cập nhật thông tin khóa học trong cơ sở dữ liệu
                    await Courses.findByIdAndUpdate(req.params.id, updatedData);
                    req.session.isUpdate = true;
        
                    // Hiển thị thông báo thành công sau khi cập nhật
                    return res.render('pages/admin/updateCourse', {
                        layout: 'admin',
                        isUpdate: req.session.isUpdate,
                        currentYear: currentYear
                    });
                    
                } catch (error) {
                    return res.status(500).json({ error });
                }
            });
        } catch (error) {
            console.error(messages.updateCourse.updateError, error);
            return res.status(500).json({ message: messages.serverError });
        } finally {
            delete req.session.isUpdate;
        }
    }
}

module.exports = new UpdateChapter();
