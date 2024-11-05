const path = require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const route = require('./routes/index.route');
const connectDB = require('./app/database'); 
const dotenv = require('dotenv');
const CreateAdmin = require('./app/controllers/command/admin/user/createAdmin.Controller');
const app = express();
const port = 3000;

dotenv.config();

// Kết nối tới MongoDB
connectDB();
CreateAdmin.CreateAdmin();

//Đinh tuyến đường dẫn file tĩnh
app.use(express.static(path.join(__dirname, 'public')));  

//Middleware
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

// Http logger
app.use(morgan('combined'));

// Template engine 
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: {
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('vi-VN', options); // Định dạng theo Việt Nam
    },
    eq: function(a, b) {
      return a === b;
    }
}
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));


// Route
route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})