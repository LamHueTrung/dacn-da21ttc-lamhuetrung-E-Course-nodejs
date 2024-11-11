const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    lessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lession', 
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Acount', 
        required: true
    },
    content: {
        type: String,
        required: true, 
        trim: true
    },
    avatar: {
        type: String, 
        default: null
    },
    likes: {
        type: Number, 
        default: 0 
    },
    tym: {
        type: Number, 
        default: 0 
    },
    replies: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Acount',
            required: true
        },
        content: {
            type: String,
            required: true, 
            trim: true
        },
        avatar: {
            type: String, 
            default: null
        },
        likes: {
            type: Number,
            default: 0 
        },
        tym: {
            type: Number,
            default: 0 
        },
        createdAt: {
            type: Date,
            default: Date.now 
        },
        updatedAt: {
            type: Date,
            default: Date.now 
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now 
    },
    updatedAt: {
        type: Date,
        default: Date.now 
    }
}, {
    timestamps: true,
    status: {
        type: String, 
        default: 'In Progress'
    }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
