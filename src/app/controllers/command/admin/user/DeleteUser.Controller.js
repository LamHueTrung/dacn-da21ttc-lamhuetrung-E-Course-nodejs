const messages = require('../../../../Extesions/messCost');
const Acount = require('../../../../model/admin/Acount');

class DeleteUser {
    
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
    
}

module.exports = new DeleteUser();
