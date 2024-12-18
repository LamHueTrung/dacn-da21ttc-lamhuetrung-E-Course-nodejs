const Visit = require('../model/Visit');
const jwt = require('jsonwebtoken');

async function trackVisits(req, res, next) {
  const route = `${req.baseUrl}${req.path}`; 
  let userId = null;

  // Xác thực người dùng nếu có token
  if (req.session.tokenUser) {
    jwt.verify(req.session.tokenUser, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.redirect('/'); // Chuyển hướng nếu token không hợp lệ
      }
      req.user = decoded; // Lưu thông tin người dùng vào req.user
      userId = req.user ? req.user.id : null; // Lấy userId
    });
  }

  try {
    // Tìm bản ghi theo route
    let visit = await Visit.findOne({ route });
    
    if (!visit) {
      // Nếu không tìm thấy bản ghi, tạo mới
      if(route == '/' || route == '/LoginGoogle/auth/google/callback/' || route == '/User/Login' || route == '/home') {
        visit = new Visit({
          route,
          count: 1,
          userId: userId ? [userId] : [], // Khởi tạo mảng userId nếu có userId
        });
      } else {
      }
    } else {
      // Nếu tìm thấy, cập nhật số lượt truy cập và mảng userId
      visit.count += 1;

      if (userId && !visit.userId.includes(userId)) {
        // Chỉ thêm userId nếu chưa tồn tại trong mảng
        visit.userId.push(userId);
      }
    }

    await visit.save(); // Lưu bản ghi
  } catch (error) {
    console.error('Error tracking visits:', error);
  }

  next();
}

module.exports = trackVisits;
