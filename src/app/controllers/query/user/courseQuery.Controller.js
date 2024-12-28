const Acounts = require('../../../model/Acount');
const Courses = require('../../../model/Course');
const Chapters = require('../../../model/Chapter');
const Lessons = require('../../../model/Lesson');
const registrationCourse = require("../../../model/RegistrationCourse");
const ProcessCourses = require("../../../model/ProgressCourse");
const jwt = require('jsonwebtoken');
const currentYear = new Date().getFullYear();

class CourseQuery {
    //Home course pages
    async homeCourse(req, res, next) {
        const courseId = req.params.id;

        try {
            // Truy vấn khóa học theo ID và sử dụng populate để lấy thông tin tác giả
            const course = await Courses.findById(courseId).populate('author', 'profile.fullName profile.specialty profile.avatar profile.phone profile.degree');

            if (!course) {
                return res.status(404).send('Không tìm thấy khóa học'); // Trả về lỗi nếu không tìm thấy khóa học
            }

            // Truy vấn tất cả các chương liên quan đến khóa học và sử dụng lean
            const chapters = await Chapters.find({ courseId: courseId }).lean();

            // Truy vấn tất cả các bài học cho từng chương và sử dụng lean
            const chaptersData = await Promise.all(chapters.map(async (chapter) => {
                const lessons = await Lessons.find({ chapterId: chapter._id }).lean();
                return {
                    ...chapter,
                    lessons: lessons // Thêm mảng lessons vào đối tượng chapter
                };
            }));

            if(req.session.tokenUser) {
                let IdUser = '';
                if (req.session.tokenUser) {
                    try {
                      const decoded = await jwt.verify(req.session.tokenUser, process.env.JWT_SECRET_KEY);
                      IdUser = decoded.id;
                    } catch (err) {
                      // Nếu token không hợp lệ, yêu cầu đăng nhập lại
                      return res.redirect("/User/Login");
                    }
                }
                const User = await Acounts.findOne({ _id: IdUser });

                const existingregistration = await registrationCourse.findOne({
                    userId: IdUser,
                    courseId: courseId,
                  });

                if (existingregistration) {
                    const existingprocess = await ProcessCourses.findOne({registrationId: existingregistration._id})
                    const completedLessons = existingprocess.chapters
                        .flatMap(chapter => chapter.lessons)  
                        .filter(lesson => lesson.status === 'completed');

                    if (completedLessons.length > 0) {
                        // Tìm bài học có lessonOrder cao nhất
                        const highestLesson = completedLessons.reduce((maxLesson, currentLesson) => {
                            return currentLesson.lessonOrder > maxLesson.lessonOrder ? currentLesson : maxLesson;
                        });
                
                        // Bạn có thể sử dụng highestLesson trong logic tiếp theo của mình, ví dụ chuyển hướng đến lesson đó
                        res.redirect(`/Course/Learning/${courseId}/${highestLesson.lessonId}`);
                    }
                } 
                
                res.render('pages/courses/home', {
                    year: currentYear,
                    course: course.toObject(),
                    chapters: chaptersData,
                    author: course.author && course.author.profile ? course.author.profile.fullName : 'Unknown', // Xử lý trường hợp không có tác giả
                    dataUser: {
                        id: User._id,
                        fullName: User.profile.fullName,
                        avatar: User.profile.avatar ? User.profile.avatar : '/avatars/user.png',
                    }
                });
            }

            res.render('pages/courses/home', {
                year: currentYear,
                courseId: courseId,
                course: course.toObject(),
                chapters: chaptersData,
                author: course.author && course.author.profile ? course.author.profile.fullName : 'Unknown', // Xử lý trường hợp không có tác giả
            });
            
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server'); // Xử lý lỗi server
        }
    }
    //Home pages
    async index(req, res) {
        try {
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

            if(req.session.tokenUser) {
                let IdUser = '';
                jwt.verify(req.session.tokenUser, process.env.JWT_SECRET_KEY, (err, decoded) => {
                    if (err) {
                        return res.redirect('/User/Login');
                    }
                    
                    IdUser= decoded.id; 
                });
                const User = await Acounts.findOne({ _id: IdUser });
                res.render('pages/home', {
                    year: currentYear,
                    courses: coursesData,
                    dataUser: {
                        id: User._id,
                        fullName: User.profile.fullName,
                        avatar: User.profile.avatar ? User.profile.avatar : '/avatars/user.png',
                    }
                });
            }

            res.render('pages/home', {
                year: currentYear,
                courses: coursesData,
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');  // Xử lý lỗi server
        }
    }

    //Home course pages
    learningCourse(req, res) {
        res.render('pages/courses/learning', { layout: 'learing'});
    }

    //Learning path pages
    async learningPath(req, res) {
        if(req.session.tokenUser) {
            let IdUser = '';
            jwt.verify(req.session.tokenUser, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.redirect('/User/Login');
                }
                
                IdUser= decoded.id; 
            });
            const User = await Acounts.findOne({ _id: IdUser });
            res.render('pages/courses/learningPath', {dataUser: {
                id: User._id,
                fullName: User.profile.fullName,
                avatar: User.profile.avatar ? User.profile.avatar : '/avatars/user.png',
            }});
        }
        res.render('pages/courses/learningPath');
    }

    async pathFrontend(req, res) {
        if(req.session.tokenUser) {
            let IdUser = '';
            jwt.verify(req.session.tokenUser, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.redirect('/User/Login');
                }
                
                IdUser= decoded.id; 
            });
            const User = await Acounts.findOne({ _id: IdUser });
            res.render('pages/courses/frontEndAndDevelopment', {dataUser: {
                id: User._id,
                fullName: User.profile.fullName,
                avatar: User.profile.avatar ? User.profile.avatar : '/avatars/user.png',
            }});
        }
        res.render('pages/courses/frontEndAndDevelopment');
    }

    async pathBackend(req, res) {
        if(req.session.tokenUser) {
            let IdUser = '';
            jwt.verify(req.session.tokenUser, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.redirect('/User/Login');
                }
                
                IdUser= decoded.id; 
            });
            const User = await Acounts.findOne({ _id: IdUser });
            res.render('pages/courses/backEndAndDevelopment', {dataUser: {
                id: User._id,
                fullName: User.profile.fullName,
                avatar: User.profile.avatar ? User.profile.avatar : '/avatars/user.png',
            }});
        }
        res.render('pages/courses/backEndAndDevelopment');
    }
}

module.exports = new CourseQuery;


