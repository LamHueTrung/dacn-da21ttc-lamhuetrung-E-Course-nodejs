const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const progressSchema = new Schema({
  registrationId: {
    type: Schema.Types.ObjectId,
    ref: "registrationCourse",
    required: true,
  }, // Tham chiếu đến bảng Đăng ký khóa học
  chapters: [
    {
      chapterId: {
        type: Schema.Types.ObjectId,
        ref: "Chapter",
      }, // Tham chiếu đến bảng Chapter
      lessons: [
        {
          lessonId: {
            type: Schema.Types.ObjectId,
            ref: "Lesson",
          }, // Tham chiếu đến bảng Lesson
          status: {
            type: String,
            enum: ["not_started", "in_progress", "completed"],
            default: "not_started",
          }, // Trạng thái của bài học
        },
      ],
      progress: { type: Number, min: 0, max: 100, default: 0 }, 
    },
  ],
  overallProgress: { type: Number, min: 0, max: 100, default: 0 }, 
});

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;
