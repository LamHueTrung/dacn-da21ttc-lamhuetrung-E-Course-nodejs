const Acounts = require('../../../../model/Acount');
const CryptoService = require('../../../../Extesions/cryptoService');
const messages = require('../../../../Extesions/messCost');

/**
 * Class CreateAdmin
 * Chức năng: Tạo tài khoản quản trị viên hệ thống.
 * - Hàm `CreateAdmin`: Kiểm tra sự tồn tại của tài khoản admin và tạo mới nếu chưa tồn tại.
 */
class CreateAdmin {
    
    /**
     * Hàm CreateAdmin
     * Kiểm tra xem tài khoản quản trị viên hệ thống đã tồn tại chưa. Nếu chưa tồn tại, 
     * tạo tài khoản mới với thông tin cố định.
     */
    CreateAdmin = async () => {
        try {
            // Kiểm tra sự tồn tại của tài khoản admin dựa trên username
            const existingAdmin = await Acounts.findOne({ username: 'LamHueTrung' });
            
            // Nếu tài khoản đã tồn tại, log thông báo và dừng quá trình
            if (existingAdmin) {
                console.log(messages.createUser.accountAdminExist, existingAdmin);
                return; 
            }
    
            // Định nghĩa mật khẩu mặc định và mã hóa mật khẩu
            const password = 'Lht080103*';
            const encryptedPassword = CryptoService.encrypt(password); 

            // Tạo đối tượng quản trị viên mới với các thông tin cố định
            const newAdmin = new Acounts({
                username: 'LamHueTrung',
                password: encryptedPassword, 
                role: 'system_admin',
                profile: {
                    fullName: 'Lâm Huệ Trung',
                    birthDate: new Date('2003-08-01'),
                    specialty: 'Quản lý hệ thống',
                    avatar: '/img/user-LHT.jpg',
                    address: 'Trà Vinh',
                    phone: '0763849007',
                    degree: [ 
                        {
                            degreeName: 'GOOGLE UX DESIGN',
                            degreeFile: './file/GGUXDS.pdf'
                        }
                    ]
                }
            });
    
            // Lưu đối tượng quản trị viên mới vào cơ sở dữ liệu
            const savedAdmin = await newAdmin.save();

            // Log thông báo thành công kèm chi tiết đối tượng vừa lưu
            console.log(messages.createUser.accountCreateSuccess, savedAdmin);

        } catch (error) {
            // Log thông báo lỗi nếu xảy ra lỗi trong quá trình tạo tài khoản
            console.error(messages.createUser.accountCreateError, error);
        }
    };
}

module.exports = new CreateAdmin();
