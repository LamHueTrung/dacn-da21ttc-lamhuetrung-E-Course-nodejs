const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    route: { type: String, required: true },
    count: { type: Number, default: 0 },
    userId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Acount' 
    }]
}, {
    timestamps: true 
});

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;
