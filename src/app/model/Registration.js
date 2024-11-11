const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    progress: {
        type: Number, 
        default: 0
    },
    grade: {
        type: String, 
        default: 'Not Graded'
    },
    status: {
        type: String, 
        default: 'In Progress'
    },
    completedAt: {
        type: Date,
        default: null
    }
});

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
