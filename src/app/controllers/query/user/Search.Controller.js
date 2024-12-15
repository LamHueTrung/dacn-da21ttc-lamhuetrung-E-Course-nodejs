const Courses = require('../../../model/Course');
const Acounts = require('../../../model/Acount');
const jwt = require('jsonwebtoken');
const currentYear = new Date().getFullYear();

class Search {
    Handle = async (req, res) => {
        const searchTerm = req.query.searchTerm || '';
        const category = req.query.category || '';
        const level = req.query.level || '';
        const maxPrice = req.query.maxPrice || Infinity;
        const minPrice = req.query.minPrice || 0;

        try {
            // Tìm kiếm khóa học theo tên, tác giả, giá, trình độ và lĩnh vực
            const courses = await Courses.find({
                $and: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { category: { $regex: category, $options: 'i' } },
                    { level: { $regex: level, $options: 'i' } },
                    { $or: [
                        { newPrice: { $gte: minPrice, $lte: maxPrice } },
                        { newPrice: 0 } // Nếu khóa học miễn phí
                    ]}
                ]
            }).populate('author', 'profile.fullName profile.avatar');

            // Chuyển đổi dữ liệu khóa học để thêm tên tác giả và avatar
            const coursesData = courses.map(course => {
                const authorFullName = course.author && course.author.profile ? course.author.profile.fullName : 'Unknown';
                const authorImage = course.author && course.author.profile ? course.author.profile.avatar : 'Unknown';
                return {
                    ...course.toObject(),
                    author: authorFullName,
                    imageAuthor: authorImage
                };
            });

            res.render('pages/home', {
                year: currentYear,
                courses: coursesData,
                searchTerm: searchTerm,
                category: category,
                level: level,
                maxPrice: maxPrice,
                minPrice: minPrice
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');
        }
    }
}

module.exports = new Search();
