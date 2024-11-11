const messages = require('../../../../Extesions/messCost');
const Courses = require('../../../../model/Course');
const fs = require('fs');
const path = require('path');

class DeleteCourse {
    
    /**
     * Vô hiệu hóa khóa học bằng cách đặt thuộc tính `isDeleted` thành `true`.
     * Nếu không tìm thấy khóa học hoặc có lỗi xảy ra, trả về thông báo lỗi.
     * 
     * @param {Object} req - Yêu cầu chứa thông tin ID khóa học.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async disable(req, res) {
        const { id } = req.params;  

        try {
            // Cập nhật trạng thái isDeleted của khóa học thành true
            const result = await Courses.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

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
     * Khôi phục khóa học bằng cách đặt thuộc tính `isDeleted` thành `false`.
     * Nếu không tìm thấy khóa học hoặc có lỗi xảy ra, trả về thông báo lỗi.
     * 
     * @param {Object} req - Yêu cầu chứa thông tin ID khóa học.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async restore(req, res) {
        const { id } = req.params;

        try {
            // Cập nhật trạng thái isDeleted của khóa học thành false
            const result = await Courses.findByIdAndUpdate(id, { isDeleted: false }, { new: true });

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
     * Xóa vĩnh viễn khóa học khỏi cơ sở dữ liệu và xóa ảnh đại diện (nếu có).
     * Kiểm tra sự tồn tại của ảnh đại diện trước khi xóa để tránh lỗi.
     * 
     * @param {Object} req - Yêu cầu chứa thông tin ID khóa học.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async delete(req, res) {
        const { id } = req.params;

        try {
            // Tìm và xóa khóa học khỏi cơ sở dữ liệu dựa trên ID
            const result = await Courses.findByIdAndDelete(id);

            if (!result) {
                return res.status(400).json({ success: false, message: messages.deleteUser.deleteError });
            }

            // Xác định đường dẫn đến ảnh đại diện của khóa học
            const imagePath = path.join(__dirname, '../../../../../public', result.image);
    
            // Kiểm tra và xóa file ảnh đại diện nếu tồn tại
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); 
            } else {
                console.log("Image file does not exist, skipping deletion.");
            }

            return res.json({ success: true, message: messages.deleteUser.deleteSuccess });
        } catch (error) {
            console.error(messages.deleteUser.deleteError, error);
            return res.status(400).json({ success: false, message: messages.deleteUser.deleteError });
        }
    }
}

module.exports = new DeleteCourse();
