const messages = require('../../../../Extesions/messCost');
const Acount = require('../../../../model/admin/Acount');
const fs = require('fs');
const path = require('path');

class DeleteUser {
    
    //Disable user
    async disable(req, res) {
        const { id } = req.params;  

        try {
            const result = await Acount.findByIdAndUpdate(id, { isDeleted: true }, { new: true });  

            req.session.isSoftDelete = true;
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

    //Restore user
    async restore(req, res) {
        const { id } = req.params;

        try {
            const result = await Acount.findByIdAndUpdate(id, { isDeleted: false }, { new: true });

            req.session.isRestore = true;
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
    
    //Delete User
    async delete(req, res) {
        const { id } = req.params;

        try {
            const result = await Acount.findByIdAndDelete(id);
            const vatarPath = path.join(__dirname, '../../../../../public', result.profile.avatar);

            if (!result) {
                return res.status(400).json({ success: false, message: messages.deleteUser.deleteError });
            } 
    
            if (fs.existsSync(vatarPath)) {
                fs.unlinkSync(vatarPath); 
            } else {
            }

            return res.json({ success: true, message: messages.deleteUser.deleteSuccess });
        } catch (error) {

            console.error(messages.deleteUser.deleteError, error);
            return res.status(400).json({ success: false, message: messages.deleteUser.deleteError });
        }
    }
}

module.exports = new DeleteUser();
