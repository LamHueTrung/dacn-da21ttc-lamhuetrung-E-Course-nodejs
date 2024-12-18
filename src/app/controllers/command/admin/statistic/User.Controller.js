const Acount = require('../../../../model/Acount');

class UserStatistic {
    Overview = async (req, res, next) => {
        try {
            const totalUsers = await Acount.countDocuments() - 1;
            const subAdmins = await Acount.countDocuments({ role: 'sub_admin' });
            const regularUsers = await Acount.countDocuments({ role: 'user',googleId: { $exists: false } });
            const googleUsers = await Acount.countDocuments({ role: 'user', googleId: { $exists: true } });
        
            res.json({
              totalUsers,
              subAdmins,
              regularUsers,
              googleUsers,
            });
          } catch (error) {
            console.error('Error fetching user overview:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
    }

    Registration = async (req, res, next) => {
        try {
            const registrationStats = await Acount.aggregate([
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ]);
        
            res.json(registrationStats);
          } catch (error) {
            console.error('Error fetching registration stats:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
    }
}

module.exports = new UserStatistic();