const messages = require('../../../../Extesions/messCost');
const Acounts = require('../../../../model/Acount');
const fs = require('fs');
const path = require('path');

class DeleteUser {
    
    /**
     * Vô hiệu hóa tài khoản người dùng bằng cách đặt thuộc tính `isDeleted` thành `true`.
     * Nếu không tìm thấy người dùng hoặc có lỗi xảy ra, trả về thông báo lỗi.
     * 
     * @param {Object} req - Yêu cầu chứa thông tin ID người dùng.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async disable(req, res) {
        const { id } = req.params;  

        try {
            // Cập nhật trạng thái isDeleted của người dùng thành true
            const result = await Acounts.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

            req.session.isSoftDelete = true; // Đánh dấu trạng thái đã vô hiệu hóa
            if (!result) {
                req.session.isSoftDelete = false;
                return res.status(400).json({ success: false, message: messages.deleteUser.softDeleteError });
            }
            
            return res.json({ success: true, message: messages.deleteUser.softDeleteSucces });
        } catch (error) {
            console.error(messages.deleteUser.softDeleteError, error);
            return res.status(400).json({ success: false, message: messages.deleteUser.softDeleteError });
        }
    }

    /**
     * Khôi phục tài khoản người dùng bằng cách đặt thuộc tính `isDeleted` thành `false`.
     * Nếu không tìm thấy người dùng hoặc có lỗi xảy ra, trả về thông báo lỗi.
     * 
     * @param {Object} req - Yêu cầu chứa thông tin ID người dùng.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async restore(req, res) {
        const { id } = req.params;

        try {
            // Cập nhật trạng thái isDeleted của người dùng thành false
            const result = await Acounts.findByIdAndUpdate(id, { isDeleted: false }, { new: true });

            req.session.isRestore = true; // Đánh dấu trạng thái đã khôi phục
            if (!result) {
                req.session.isRestore = false;
                return res.status(400).json({ success: false, message: messages.restoreUser.restoreError });
            }
            
            return res.json({ success: true, message: messages.restoreUser.restoreSuccess });
        } catch (error) {
            console.error(messages.restoreUser.restoreError, error);
            return res.status(400).json({ success: false, message: messages.restoreUser.restoreError });
        }
    }
    
    /**
     * Xóa vĩnh viễn tài khoản người dùng khỏi cơ sở dữ liệu và xóa ảnh đại diện (nếu có).
     * Kiểm tra sự tồn tại của ảnh đại diện trước khi xóa để tránh lỗi.
     * 
     * @param {Object} req - Yêu cầu chứa thông tin ID người dùng.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async delete(req, res) {
        const { id } = req.params;

        try {
            // Tìm và xóa người dùng khỏi cơ sở dữ liệu dựa trên ID
            const result = await Acounts.findByIdAndDelete(id);

            if (!result) {
                return res.status(400).json({ success: false, message: messages.deleteUser.deleteError });
            }
            if(result.profile.avatar){ 
                // Xác định đường dẫn đến ảnh đại diện của người dùng
                const avatarPath = path.join(__dirname, '../../../../../public', result.profile.avatar);
                // Kiểm tra và xóa file ảnh đại diện nếu tồn tại
                if (fs.existsSync(avatarPath)) {
                    fs.unlinkSync(avatarPath); 
                } else {
                    console.log("Avatar file does not exist, skipping deletion.");
                }
            }

            return res.json({ success: true, message: messages.deleteUser.deleteSuccess });
        } catch (error) {
            console.error(messages.deleteUser.deleteError, error);
            return res.status(400).json({ success: false, message: messages.deleteUser.deleteError });
        }
    }
}

module.exports = new DeleteUser();
