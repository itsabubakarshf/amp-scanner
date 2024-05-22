const express = require("express");
const crypto = require('crypto');
const User = require("../../models/user/user");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const fs = require("fs");
const auth = require('../../config/auth')
const logger = require('../../utils/logger')

app.post("/user/signup", async (req, res) => {
    try {
        const requiredFields = ["email", "firstName", "lastName", "password", "confirmPassword"];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                logger.error(`Missing required field: ${field}` )
                return res
                    .status(400)
                    .json({ status: false, message: `Missing required field: ${field}` });
            }
        }

        if (req.body.password !== req.body.confirmPassword) {
            logger.error('Password Does not match')
            return res
                .status(400)
                .json({ status: false, error: "Password does not match" });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            logger.error("Email already signed-up")
            return res
                .status(400)
                .json({ status: false, error: "Email already signed-up" });
        }

       

        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            lastLogin: new Date(),
            profileImageUrl: "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Picture.png",
        });

        const token = jwt.sign({ _id: user._id.toString() }, process.env.token_key);
        user.tokens = user.tokens.concat({ token });
        let access = await user.generateAuthToken();
        const newUser = await user.save();

        logger.info(`Signup Successful Successful for user: ${req.body.email}`);

        return res.status(201).json({
            status: true,
            success:
                "Signup Successful",
            data: { data: user, access, success: "success" },
        });
    } catch (err) {
        logger.error(err.message);
        return res.status(400).json({
            status: false,
            message: "Error in registering the user",
            error: err.message,
        });
    }
});

app.post("/user/login", async (req, res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;

        if (!email || !password) {
            logger.error('Please Provide Correct email and password ')
            return res.json({
                status: false,
                error: "Please Provide Correct email and password ",
            });
        }

        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        if (!user) {
            logger.error(new Date().toLocaleString() + 'Incorrect Email or Password');
            return res.json({ status: false, error: "Email or Password is not correct " });
        }
        let access = await user.generateAuthToken();

        user.lastLogin = new Date();
        logger.info(`Login Successful for user: ${req.body.email}`);
        await user.save();
        return res.json({
            status: true,
            success: "Successfully Login",
            data: { data: user, access, success: "success" },
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(400).json({
            status: false,
            message: `Login Failed ${error.message}`,
            error: error.message,
        });
    }
});

app.post("/user/changepassword", auth, async (req, res) => {
    try {
        let oldPassword = req.body.oldPassword;
        let newPassword = req.body.newPassword;

        if (!oldPassword || !newPassword) {
            logger.error("Please Enter Correct password")
            return res.json({
                status: false,
                error: "Please Enter Correct password",
            });
        }

        if (oldPassword == newPassword) {
            logger.error("New Password Must be different from Old One")
            return res.json({
                status: false,
                error: "New Password Must be different from Old One",
            });
        }

        const user = await User.findById(req.user?._id);
        if (!user) {
            logger.error( "Please provide Valid User")
            return res.json({ status: false, error: "Please provide Valid User" });
        }
        // const isMatch = await bcrypt.compare(oldPassword, user.password);
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            logger.error( `Incorrect old password for user: ${req.user.email}`)
            return res.status(401).json({ status: false, error: "Incorrect old password" });
        }
        user.password = newPassword;
        user.lastLogin = new Date();

        await user.save();

        const access = await user.generateAuthToken();

        logger.info( `Password Changed Successfully for user: ${req.user.email}`)


        return res.json({
            status: true,
            success: "Password changed successfully",
            data: user,
            access,
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(400).json({
            status: false,
            message: "Failed to change password",
            error: error.message,
        });
    }
});


app.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ status: false, error: 'User not found' });
        }
        logger.info( `User ${req.user.email} Fetched Successfully`)
        return res.status(200).json({ status: true, message: 'User retrieved successfully', data: user });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ status: false, error: 'Error fetching User'});
    }
});

module.exports = app