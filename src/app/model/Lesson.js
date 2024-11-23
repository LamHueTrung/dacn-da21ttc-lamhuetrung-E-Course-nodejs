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
        type: String, 
        required: true
    },
    lessonOrder: {
        type: Number, 
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false 
    }
    ,status: {
        type: String, 
        default: 'In Progress'
    }
}, {
    timestamps: true 
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
