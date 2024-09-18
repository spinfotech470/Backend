const mongoose = require('mongoose');
const userSchema = require("../User");
exports.getFollowersDetails = async (req, res) => {
    try {
        // console.log("inside the Lookup")
        const results = await userSchema.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'followersDetails'
                }
            },
            {
                $unwind: {
                    path: '$followersDetails',
                    preserveNullAndEmptyArrays: true // Keep posts without createdBy details
                }
            },
            {
                $group: {
                    _id: '$_id',
                    followersDetails: { $first: '$followersDetails' },
                }
            }
        ]);
        // console.log("results",results)
        res.status(200).json(results);
    } catch (error) {
        // console.error(error);
    }
};


