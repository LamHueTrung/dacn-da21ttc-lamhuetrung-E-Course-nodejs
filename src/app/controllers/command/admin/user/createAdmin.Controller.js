const Acount = require('../../../../model/admin/Acount');
const bcrypt = require('bcrypt');

class CreateAdmin {
    CreateAdmin = async () => {
        try {
            const existingAdmin = await Acount.findOne({ username: 'LamHueTrung' });
            
            if (existingAdmin) {
                console.log('Tài khoản admin đã tồn tại:', existingAdmin);
                return; 
            }
    
            const password = 'Lht080103*';
            const saltRounds = 12; 
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newAdmin = new Acount({
                username: 'LamHueTrung',
                password: hashedPassword, 
                role: 'system_admin',
                profile: {
                    fullName: 'Lâm Huệ Trung',
                    birthDate: new Date('2003-08-01'),
                    specialty: 'Quản lý hệ thống',
                    avatar: './img/user-LHT.jpg',
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
    
            const savedAdmin = await newAdmin.save();
            console.log('Tài khoản admin đã được tạo:', savedAdmin);
        } catch (error) {
            console.error('Lỗi khi kiểm tra hoặc tạo tài khoản admin:', error);
        }
    };

}

module.exports = new CreateAdmin;
