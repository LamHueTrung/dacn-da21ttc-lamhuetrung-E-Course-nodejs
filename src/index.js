const path = require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const route = require('./routes/index.route');
const connectDB = require('./app/database'); 
const app = express();
const port = 3000;

// Kết nối tới MongoDB
connectDB();

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
app.engine('hbs', handlebars.engine({extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

// Route
route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})