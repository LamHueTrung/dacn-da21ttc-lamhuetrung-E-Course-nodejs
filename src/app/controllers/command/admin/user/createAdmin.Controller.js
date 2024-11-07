const Acount = require('../../../../model/admin/Acount');
const CryptoService = require('../../../../Extesions/cryptoService');
const messages = require('../../../../Extesions/messCost');
class CreateAdmin {
    CreateAdmin = async () => {
        try {
            const existingAdmin = await Acount.findOne({ username: 'LamHueTrung' });
            
            if (existingAdmin) {
                console.log(messages.createUser.accountAdminExist, existingAdmin);
                return; 
            }
    
            const password = 'Lht080103*';
            const encryptedPassword = CryptoService.encrypt(password); 
            const newAdmin = new Acount({
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
    
            const savedAdmin = await newAdmin.save();
            console.log(messages.createUser.accountCreateSuccess, savedAdmin);
        } catch (error) {
            console.error(messages.createUser.accountCreateError, error);
        }
    };
}

module.exports = new CreateAdmin();
