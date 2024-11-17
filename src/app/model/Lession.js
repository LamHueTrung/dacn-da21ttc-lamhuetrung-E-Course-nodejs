const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter', 
        required: true
    },
    name: {
        type: String,
        required: true 
    },
    description: {
        type: String,
        required: true 
    },
    videoUrl: {
        type: String,
        required: true 
    },
    duration: {
        type: Number, 
        required: true
    },
    lessonOrder: {
        type: Number, 
        required: true
    },
    status: {
        type: String, 
        default: 'In Progress'
    }
}, {
    timestamps: true 
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
