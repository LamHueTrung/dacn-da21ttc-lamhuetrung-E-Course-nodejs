const mongoose = require('mongoose');

const lessionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', 
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

const Lession = mongoose.model('Lession', lessionSchema);

module.exports = Lession;
