const RegistrationCourse = require('../../../../model/RegistrationCourse');
const Progress = require('../../../../model/ProgressCourse');
const Course = require('../../../../model/Course');


class CourseStatistic {
    Registrations = async (req, res, next) =>  {
        try {
            const registrationStats = await RegistrationCourse.aggregate([
                {
                    $group: {
                        _id: '$courseId',
                        totalRegistrations: { $sum: 1 },
                        statusBreakdown: {
                            $push: '$status'
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'courseInfo',
                    },
                },
                {
                    $project: {
                        courseName: { $arrayElemAt: ['$courseInfo.name', 0] },
                        totalRegistrations: 1,
                        statusBreakdown: 1,
                    },
                },
            ]);
    
            res.json(registrationStats);
        } catch (error) {
            console.error('Error fetching registration statistics:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    Progress = async (req, res, next) => {
        try {
            const courseProgress = await Progress.aggregate([
                // Lookup từ Progress sang registrationCourse
                {
                    $lookup: {
                        from: 'registrationcourses', // Tên collection của `registrationCourse`
                        localField: 'registrationId',
                        foreignField: '_id',
                        as: 'registrationInfo',
                    },
                },
                { $unwind: '$registrationInfo' }, // Giải nén kết quả lookup
    
                // Lookup từ registrationCourse sang Courses
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'registrationInfo.courseId',
                        foreignField: '_id',
                        as: 'courseInfo',
                    },
                },
                { $unwind: '$courseInfo' }, // Giải nén kết quả lookup
    
                // Nhóm theo khóa học
                {
                    $group: {
                        _id: '$courseInfo._id', // Nhóm theo ID khóa học
                        courseName: { $first: '$courseInfo.name' }, // Lấy tên khóa học
                        averageProgress: { $avg: '$overallProgress' }, // Tính trung bình tiến độ
                        totalStudents: { $sum: 1 }, // Đếm số học viên
                    },
                },
                { $sort: { averageProgress: -1 } }, // Sắp xếp theo tiến độ giảm dần
            ]);
    
            res.json(courseProgress);
        } catch (error) {
            console.error('Error fetching course progress statistics:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    CourseDuration = async (req, res, next) => {
        try {
            const courseStats = await Course.aggregate([
                {
                    $project: {
                        _id: 1,
                        courseName: '$name', // Tên khóa học
                        totalLessons: '$totalLessons', // Tổng số bài học
                        totalDuration: {
                            $let: {
                                vars: {
                                    timeParts: { $split: ['$duration', ':'] } // Tách chuỗi hh:mm:ss
                                },
                                in: {
                                    $add: [
                                        { $multiply: [{ $toInt: { $arrayElemAt: ['$$timeParts', 0] } }, 3600] }, // Giờ -> Giây
                                        { $multiply: [{ $toInt: { $arrayElemAt: ['$$timeParts', 1] } }, 60] }, // Phút -> Giây
                                        { $toInt: { $arrayElemAt: ['$$timeParts', 2] } } // Giây
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        totalDurationMinutes: { $divide: ['$totalDuration', 60] } // Chuyển đổi giây -> phút
                    }
                },
                { $sort: { totalDurationMinutes: -1 } } // Sắp xếp giảm dần theo tổng thời lượng
            ]);
    
            res.json(courseStats);
        } catch (error) {
            console.error('Error fetching course duration statistics:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    Authors = async(req, res, next) =>  {
        try {
            const authorStats = await Course.aggregate([
                // Lookup từ Courses sang Accounts để lấy thông tin tác giả
                {
                    $lookup: {
                        from: 'acounts', // Tên collection của bảng Accounts
                        localField: 'author',
                        foreignField: '_id',
                        as: 'authorInfo',
                    },
                },
                { $unwind: '$authorInfo' }, // Giải nén kết quả lookup
    
                // Lookup từ Courses sang RegistrationCourse để tính doanh thu
                {
                    $lookup: {
                        from: 'registrationcourses', // Tên collection của bảng RegistrationCourse
                        localField: '_id',
                        foreignField: 'courseId',
                        as: 'registrations',
                    },
                },
    
                // Tính toán tổng doanh thu cho từng khóa học
                {
                    $group: {
                        _id: '$author', // Nhóm theo tác giả
                        authorName: { $first: '$authorInfo.profile.fullName' }, // Lấy tên tác giả
                        totalCourses: { $sum: 1 }, // Tổng số khóa học của tác giả
                        totalRevenue: {
                            $sum: {
                                $multiply: ['$newPrice', { $size: '$registrations' }],
                            },
                        }, // Tổng doanh thu từ các khóa học
                    },
                },
    
                // Sắp xếp theo doanh thu giảm dần
                { $sort: { totalRevenue: -1 } },
            ]);
    
            res.json(authorStats);
        } catch (error) {
            console.error('Error fetching author statistics:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new CourseStatistic();