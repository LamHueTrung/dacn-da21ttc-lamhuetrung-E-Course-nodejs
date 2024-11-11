const Courses = require('../../../../model/Course');
const Validator = require('../../../../Extesions/validator');
const messages = require('../../../../Extesions/messCost');
const jwt = require('jsonwebtoken');
const currentYear = new Date().getFullYear();

/**
 * Class CreateCourse
 * Chức năng: Xử lý thêm khóa học mới vào hệ thống
 * - Hàm `Validate`: Thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào cho khóa học.
 * - Hàm `Handle`: Thực hiện xác thực và xử lý logic thêm khóa học mới.
 */
class CreateCourse {

    /**
     * Hàm Validate
     * Kiểm tra tính hợp lệ của các trường nhập từ request.
     * @param {Object} req - Đối tượng request chứa dữ liệu khóa học.
     * @returns {Object} errors - Đối tượng chứa các thông báo lỗi tương ứng với từng trường input.
     */
    Validate(req) {
        const { courseName, description, benefits, level, oldPrice, newPrice, category } = req.body;

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

        // Kiểm tra lợi ích
        const benefitsError = Validator.arrayNotEmpty(benefits, 'Benefits');
        if (benefitsError) errors.benefits = benefitsError;

        // Kiểm tra cấp độ
        const levelError = Validator.isEnum(level, ['Beginner', 'Intermediate', 'Advanced'], 'Level');
        if (levelError) errors.level = levelError;

        // Kiểm tra giá cũ
        const oldPriceError = Validator.isPositiveNumber(oldPrice, 'Old Price');
        if (oldPriceError) errors.oldPrice = oldPriceError;

        // Kiểm tra giá mới
        const newPriceError = Validator.isPositiveNumber(newPrice, 'New Price');
        if (newPriceError) errors.newPrice = newPriceError;

        // Kiểm tra thể loại
        const categoryError = Validator.notEmpty(category, 'Category');
        if (categoryError) errors.category = categoryError;

        // Kiểm tra giá mới phải nhỏ hơn giá cũ
        const priceError = Validator.greaterThan(oldPrice, newPrice, 'Old Price');
        if (priceError) errors.oldPrice = priceError;

        return errors;
    }

    /**
     * Hàm Handle
     * Xác thực token, kiểm tra lỗi đầu vào và thêm khóa học mới vào hệ thống nếu không có lỗi.
     * @param {Object} req - Đối tượng request chứa dữ liệu khóa học.
     * @param {Object} res - Đối tượng response để gửi phản hồi về phía client.
     */
    Handle = async (req, res) => {
        // Kiểm tra lỗi đầu vào
        const errors = this.Validate(req);
        const hasErrors = Object.values(errors).some(error => error !== '');
        if (hasErrors) {
            return res.render('pages/admin/addCourse', {
                layout: 'admin',
                errors,
                ...req.body,
                currentYear: currentYear
            });
        }

        // Nếu không có lỗi, xác thực token người dùng
        const { courseName, description, benefits, level, oldPrice, newPrice, category } = req.body;
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        const token = req.session.token;

        jwt.verify(token, jwtSecretKey, async (err, decoded) => {
            if (err) {
                console.error(messages.token.tokenVerificationFailed, err);
                return res.status(401).json({ message: messages.token.tokenVerificationFailed }); // Trả về lỗi nếu token không hợp lệ
            }

            req.userId = decoded.id; // Gán userId vào request sau khi xác thực token

            try {
                // Kiểm tra sự tồn tại của khóa học với tên đã nhập
                const existingCourse = await Courses.findOne({ name: courseName });
                if (existingCourse) {
                    return res.render('pages/admin/addCourse', {
                        layout: 'admin',
                        errors: { courseName: messages.createCourse.courseExist },
                        ...req.body,
                        currentYear: currentYear
                    });
                }

                // Tạo và lưu khóa học mới vào cơ sở dữ liệu
                const newCourse = new Courses({
                    name: courseName,
                    description: description,
                    benefits: benefits,
                    level: level,
                    oldPrice: oldPrice,
                    newPrice: newPrice,
                    author: req.userId,
                    image: req.file ? '/courses/' + req.file.filename : null,
                    category: category
                });

                // Lưu khóa học vào cơ sở dữ liệu
                await newCourse.save();
                req.session.isCreate = true;
                
                // Phản hồi sau khi lưu khóa học thành công
                return res.render('pages/admin/addCourse', {
                    layout: 'admin',
                    isCreate: req.session.isCreate,
                    currentYear: currentYear
                });
            } catch (error) {
                return res.status(500).json({ error });
            }
        });
    }
}

module.exports = new CreateCourse();
