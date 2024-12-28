const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registrationCourseSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId,
    ref: 'Acount', 
    required: true 
},  
  courseId: { 
    type: Schema.Types.ObjectId,
    ref: 'Courses', 
    required: true 
},  
  registrationDate: {
     type: Date, 
     default: Date.now 
    },  
  status: { type: String, enum: ['registered', 'completed', 'in-progress'], default: 'registered' },  // Trạng thái đăng ký
});

const RegistrationCourse = mongoose.model('registrationCourse', registrationCourseSchema);

module.exports = RegistrationCourse;
