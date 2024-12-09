const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Acounts = require('../model/Acount');  // Model người dùng
const dotenv = require('dotenv');
dotenv.config();

// Cấu hình Passport với chiến lược Google OAuth 2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Kiểm tra nếu người dùng đã có trong DB qua googleId
      let user = await Acounts.findOne({ googleId: profile.id });

      if (!user) {
        // Nếu chưa có, tạo mới và lưu vào DB
        user = new Acounts({
          username: profile.emails[0].value, // Sử dụng email từ Google làm username
          googleId: profile.id,
          role: 'user', // Có thể thay đổi role tùy nhu cầu
          profile: {
            fullName: profile.displayName,
            avatar: profile.photos[0]?.value || null
          }
        });

        await user.save(); // Lưu vào DB
      }

      // Đăng nhập thành công, trả về user
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id); // Lưu id của người dùng vào session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Acounts.findById(id); // Tìm người dùng theo id
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

