const ProcessCourses = require("../../../../model/ProgressCourse");
const registrationCourse = require("../../../../model/RegistrationCourse");
const Chapters = require("../../../../model/Chapter");
const Lessons = require("../../../../model/Lesson");

class Progress {
  // Hàm cập nhật trạng thái bài học dựa trên tiến độ xem video
  Handle = async (req, res) => {
    try {
      const IdLesson = req.params.IdLesson;
      const Idregistration = req.params.Idregistration;
      const completed = req.body.completed;
      // Kiểm tra đăng ký khóa học
      const existingRegistration = await registrationCourse.findOne({ _id: Idregistration });
      if (!existingRegistration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      const IdCourse = existingRegistration.courseId;

      // Xác định bài học
      let lesson;
      if (IdLesson !== "default") {
        lesson = await Lessons.findOne({ _id: IdLesson }).lean();
      } else {
        const chapters = await Chapters.find({ courseId: IdCourse }).lean();
        if (chapters.length > 0 && chapters[0].lessons.length > 0) {
          lesson = await Lessons.findOne({ _id: chapters[0].lessons[0] }).lean();
        }
      }

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Tiến hành tìm kiếm tiến độ người dùng
      let progress = await ProcessCourses.findOne({ registrationId: Idregistration });

      // Nếu chưa có tiến độ, tạo mới
      if (!progress) {
        progress = new ProcessCourses({
          registrationId: Idregistration,
          chapters: [],
          overallProgress: 0,
        });
      }

      // Lấy chapters trong khóa học
      const chapters = await Chapters.find({ courseId: IdCourse }).lean();

      let IdLessonNext = '';
      // Cập nhật hoặc thêm chapter và lesson
      for (const chapterIndex in chapters) {
        const chapter = chapters[chapterIndex];
        
        let existingChapter = progress.chapters.find(
          (ch) => ch.chapterId.toString() === chapter._id.toString()
        );
        
        if (!existingChapter) {
          existingChapter = {
            chapterId: chapter._id,
            lessons: [],
            progress: 0,
          };
          for (let lessonIndex in chapter.lessons) {
            const lessonId = chapter.lessons[lessonIndex];
            if(lessonId.toString() === IdLesson) {
              existingChapter.lessons.push({
                lessonId: lessonId,
                status: "in_progress",
              });
            } else {
              existingChapter.lessons.push({
                lessonId: lessonId,
                status: "not_started",
              });
            }
          }
          progress.chapters.push(existingChapter);
        }
      
        // Duyệt qua từng bài học trong chương
        for (let lessonIndex in chapter.lessons) {
          const lessonId = chapter.lessons[lessonIndex];
      
          let existingLesson = existingChapter.lessons.find(
            (ls) => ls.lessonId.toString() === lessonId.toString()
          );
      
          // Cập nhật trạng thái của bài học nếu đã hoàn thành
          if (lessonId.toString() === IdLesson ) {
            existingLesson.status = "completed";
            // Sau khi bài học hiện tại hoàn thành, tiến hành kiểm tra bài học tiếp theo
            if (parseInt(lessonIndex) + 1 < chapter.lessons.length) {
              // Nếu có bài học tiếp theo trong chương hiện tại, set trạng thái của nó là "in_progress"
              const nextLessonId = chapter.lessons[parseInt(lessonIndex) + 1];
              IdLessonNext = nextLessonId;

              let nextLesson = existingChapter.lessons.find(
                (ls) => ls.lessonId.toString() === nextLessonId.toString()
              );
              if (nextLesson) {
                nextLesson.status = "in_progress";
              }
            } else {
              // Nếu không có bài học tiếp theo trong chương hiện tại, chuyển sang bài học đầu tiên của chapter tiếp theo
              const nextChapterIndex = parseInt(chapterIndex) + 1;
              if (nextChapterIndex < chapters.length) {
                const nextChapter = chapters[nextChapterIndex];
                if (nextChapter.lessons.length > 0) {
                  const firstLessonOfNextChapter = nextChapter.lessons[0];
                  IdLessonNext = firstLessonOfNextChapter;
                  let firstLesson = existingChapter.lessons.find(
                    (ls) => ls.lessonId.toString() === firstLessonOfNextChapter.toString()
                  );
                  if (firstLesson) {
                    firstLesson.status = "in_progress";
                  }
                }
              }
            }
          }
        }

        // Tính tiến độ chương sau khi cập nhật trạng thái bài học
        const completedLessons = existingChapter.lessons.filter(
          (ls) => ls.status === "completed"
        ).length;
        existingChapter.progress = (completedLessons / existingChapter.lessons.length) * 100;
      }

      // Tính tiến độ tổng thể
      const totalProgress = progress.chapters.reduce((total, chapter) => total + chapter.progress, 0);
      progress.overallProgress = chapters.length > 0 ? totalProgress / chapters.length : 0;

      // Lưu tiến độ
      await progress.save();

      return res.status(200).json({
        message: "Progress updated successfully",
        progress: progress,
        IdLessonNext: IdLessonNext,
        overallProgress: progress.overallProgress,
        chapters: progress.chapters,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
}

module.exports = new Progress();
