const Courses = require("../../../../model/Course");
const Acounts = require("../../../../model/Acount");
const Chapters = require("../../../../model/Chapter");
const Lessons = require("../../../../model/Lesson");
const registrationCourse = require("../../../../model/RegistrationCourse");
const ProcessCourses = require("../../../../model/ProgressCourse");
const jwt = require("jsonwebtoken");
const currentYear = new Date().getFullYear();

class Registration {
  Handle = async (req, res) => {
    const IdCourse = req.params.idCourse;
    const IdLesson = req.params.idLesson;

    let IdUser = "";
    if (req.session.tokenUser) {
        try {
          const decoded = await jwt.verify(req.session.tokenUser, process.env.JWT_SECRET_KEY);
          IdUser = decoded.id;
        } catch (err) {
          // Nếu token không hợp lệ, yêu cầu đăng nhập lại
          return res.redirect("/User/Login");
        }
      }
    try {
      // Kiểm tra sự tồn tại của khóa học với tên đã nhập
      const existingCourse = await Courses.findOne({ _id: IdCourse });
      if (!existingCourse) {
        req.session.Notfound = true;
        return res.render("pages/courses/home", {
          NotFound: req.session.Notfound,
          ...req.body,
          currentYear: currentYear,
        });
      }

      // Kiểm tra sự tồn tại của người dùng
      const existingUser = await Acounts.findOne({ _id: IdUser });
      if (!existingUser) {
        req.session.Notfound = true;
        return res.render("pages/courses/home", {
          NotFound: req.session.Notfound,
          ...req.body,
          currentYear: currentYear,
        });
      }

      // Truy vấn tất cả các chương liên quan đến khóa học và sử dụng lean
      const chapters = await Chapters.find({ courseId: IdCourse }).lean();

      const chaptersData = await Promise.all(
        chapters.map(async (chapter) => {
          const lessons = await Lessons.find({ chapterId: chapter._id }).lean();
          const totalDurationInSeconds = lessons.reduce((total, lesson) => {
            const [minutes, seconds] = lesson.duration.split(":").map(Number); // Chuyển "minutes:seconds" thành số
            return total + (minutes * 60 + seconds); // Tính tổng thời gian (giây)
          }, 0);
          // Chuyển tổng thời gian (giây) sang giờ, phút, giây
          const totalHours = Math.floor(totalDurationInSeconds / 3600); // 1 giờ = 3600 giây
          const totalMinutes = Math.floor((totalDurationInSeconds % 3600) / 60); // 1 phút = 60 giây
          const totalSeconds = totalDurationInSeconds % 60; // Số giây còn lại

          // Định dạng kết quả dưới dạng giờ:phút:giây
          const formattedDuration = `${totalHours}:${totalMinutes
            .toString()
            .padStart(2, "0")}:${totalSeconds.toString().padStart(2, "0")}`;

          return {
            ...chapter,
            lessons: lessons, // Thêm mảng lessons vào đối tượng chapter
            totalDuration: formattedDuration,
          };
        })
      );

      // Kiểm tra nếu IdLesson là 'default' hay không
      let lessonData;

      if (IdLesson === 'default') {
        // Nếu IdLesson là 'default', lấy bài học đầu tiên trong chương đầu tiên
        if (chapters.length > 0 && chapters[0].lessons.length > 0) {
          lessonData = await Lessons.findOne({ _id: chapters[0].lessons[0] }).lean();
        }
      } else {
        // Nếu có IdLesson cụ thể, tìm bài học theo IdLesson
        lessonData = await Lessons.findOne({ _id: IdLesson }).lean();
      }

      // Kiểm tra đăng ký
      const existingregistration = await registrationCourse.findOne({
        userId: IdUser,
        courseId: IdCourse,
      });
      if (!existingregistration) {
        // Tạo và lưu khóa học mới vào cơ sở dữ liệu
        const newData = new registrationCourse({
          userId: IdUser,
          courseId: IdCourse,
        });
        await newData.save();

        // Lưu vào cơ sở dữ liệu
        req.session.isCreate = true;

        // Phản hồi sau khi lưu thành công
        return res.render("pages/courses/learning", {
          layout: "learing",
          isCreate: req.session.isCreate,
          chaptersData: chaptersData,
          course: existingCourse.toObject(),
          lessonData: lessonData,
          IdLesson: IdLesson,
          dataUser: {
            id: existingUser._id,
            fullName: existingUser.profile.fullName,
            avatar: existingUser.profile.avatar ? existingUser.profile.avatar : '/avatars/user.png',
        },
          currentYear: currentYear,
        });
      } else {
        const existingprocess = await ProcessCourses.findOne({
          registrationId: existingregistration._id,
        });

        if (!existingprocess) {
          const newDataProcess = new ProcessCourses({
            registrationId: existingregistration._id,
          });
          await newDataProcess.save();
          return res.render("pages/courses/learning", {
            layout: "learing",
            isCreate: req.session.isCreate,
            chaptersData: chaptersData,
            course: existingCourse.toObject(),
            IdLesson: IdLesson,
            dataUser: {
                id: existingUser._id,
                fullName: existingUser.profile.fullName,
                avatar: existingUser.profile.avatar ? existingUser.profile.avatar : '/avatars/user.png',
            },
            lessonData: lessonData,
            currentYear: currentYear,
          });
        } else {

          return res.render("pages/courses/learning", {
            layout: "learing",
            isCreate: req.session.isCreate,
            chaptersData: chaptersData,
            IdLesson: IdLesson,
            course: existingCourse.toObject(),
            dataUser: {
                id: existingUser._id,
                fullName: existingUser.profile.fullName,
                avatar: existingUser.profile.avatar ? existingUser.profile.avatar : '/avatars/user.png',
            },
            lessonData: lessonData,
            currentYear: currentYear,
          });
        }
      }
    } catch (error) {
      return res.status(500).json({ error });
    }
  };
}

module.exports = new Registration();
