const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', 
        required: true
    },
    title: {
        type: String,
        required: true 
    },
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson' 
    }],
    chapterOrder: {
        type: Number, 
        required: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started', 
    },
    isDeleted: {
        type: Boolean,
        default: false 
    }
}, {
    timestamps: true 
});

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
