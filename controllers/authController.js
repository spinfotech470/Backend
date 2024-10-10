const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/PostSchema');

// Signup
exports.signup = async (req, res) => {
    const { username, email, password, gender, dob, name, mobile, city, aboutMe } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, gender, dob, name, mobile, city, aboutMe });

    try {
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // console.log(user, "Login successfully");

        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);


        res.json({ user: user.toObject(), token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Social Login
exports.socialLogin = async (req, res) => {
    const { id, email, name, given_name, family_name, picture, verified_email } = req.body;

    if (!verified_email) {
        return res.status(400).json({ message: 'Email not verified' });
    }

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                username: email.replace("@gmail.com", ""),
                email: email,
                name: name,
                socialAccounts: [{
                    provider: 'google',
                    providerId: id,
                    given_name,
                    family_name,
                    email,
                    profilePicture: picture
                }]
            });
            const socailUser = await user.save();

            // console.log("socailUser",socailUser)
        } else {
            // Check if the social account is already linked
            const accountIndex = user.socialAccounts.findIndex(account => account.provider === 'google' && account.providerId === id);
            if (accountIndex === -1) {
                // If not, add the new social account
                user.socialAccounts.push({
                    provider: 'google',
                    providerId: id,
                    email,
                    profilePicture: picture
                });
            } else {
                // Update the existing social account information
                user.socialAccounts[accountIndex] = {
                    provider: 'google',
                    providerId: id,
                    email,
                    profilePicture: picture
                };
            }
            await user.save();
        }

        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get User Profile
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('posts').populate('followers');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user.followers and user.posts are defined
        const followersCount = user.followers ? user.followers.length : 0;
        const postCount = user.posts ? user.posts.length : 0;
        const likeCount = user.postLikes ? user.postLikes.length : 0;

        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            gender: user.gender,
            dob: user.dob,
            postCount: postCount,
            likeCount: likeCount,
            followersCount: followersCount
        };

        // console.log(userData);
        res.json(userData);
    } catch (error) {
        // console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

