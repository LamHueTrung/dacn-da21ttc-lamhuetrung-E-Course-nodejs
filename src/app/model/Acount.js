const mongoose = require('mongoose');

const degreeSchema = new mongoose.Schema({
    degreeName: {
        type: String, 
        required: true 
    }, 
    degreeFile: { 
        type: String, 
        required: true 
    }  
}); 

const profileSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: null 
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{10,15}$/, 'Số điện thoại không hợp lệ'] 
    },
    degree: [degreeSchema]
});

const acountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['system_admin', 'sub_admin', 'user'], 
        required: true
    },
    profile: profileSchema,
    isDeleted: {
        type: Boolean,
        default: false 
    }
}, {
    timestamps: true
});

const Acount = mongoose.model('Acount', acountSchema);

module.exports = Acount;
