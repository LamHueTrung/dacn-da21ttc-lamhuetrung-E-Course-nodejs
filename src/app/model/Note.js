const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Acount', 
        required: true
    },
    lessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lession', 
        required: true
    },
    content: {
        type: String,
        required: true, 
        trim: true
    },
    status: {
        type: String, 
        default: 'In Progress'
    }
}, {
    timestamps: true 
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
