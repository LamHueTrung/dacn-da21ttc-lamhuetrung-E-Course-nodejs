const path = require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const app = express();
const port = 3000;

//Đinh tuyến đường dẫn file tĩnh
app.use(express.static(path.join(__dirname, 'public')));  

// Http logger
app.use(morgan('combined'));

// Template engine 
app.engine('hbs', handlebars.engine({extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

// Route
app.get('/', (req, res) => {
  res.render('home');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})