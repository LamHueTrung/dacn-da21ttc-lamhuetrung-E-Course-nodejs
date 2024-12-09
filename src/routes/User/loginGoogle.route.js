const express = require('express');
const passport = require('passport');
const router  = express.Router();
const userQuery = require('../../app/controllers/query/user/userQuery.Controller');
const userLoginCommand = require('../../app/controllers/command/user/LoginGoogle.Controller'); 

// Route để bắt đầu quá trình đăng nhập với Google
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Route callback sau khi Google trả về
router.use('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/User/Login'
}),(req, res) => userLoginCommand.Handle(req, res));

// Route để đăng xuất
router.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send('Đã xảy ra lỗi khi đăng xuất');
      }
      res.redirect('back');
    });
  });

module.exports = router;