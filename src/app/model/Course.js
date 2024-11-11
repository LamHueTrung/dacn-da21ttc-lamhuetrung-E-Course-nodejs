const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true 
    },
    benefits: {
        type: [String], 
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'], 
        required: true
    },
    oldPrice: {
        type: Number,
        default: 0 
    },
    newPrice: {
        type: Number,
        default: 0 
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Acount', 
        required: true
    },
    image: {
        type: String, 
        default: null
    },
    totalLessons: {
        type: Number,
        default: 0, 
        required: true 
    },
    totalChapters: {
        type: Number,
        default: 0, 
        required: true 
    },
    category: {
        type: String, 
        default: null
    },
    duration: {
        type: Number,
        default: 0, 
        required: true
    },
    status: {
        type: String, 
        default: 'In Progress'
    },
    isDeleted: {
        type: Boolean,
        default: false 
    }
}, {
    timestamps: true 
});

// Tạo model từ schema
const Course = mongoose.model('Courses', courseSchema);

module.exports = Course;
