const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const otpModel = require("../models/otp.model")
const emailService = require("../services/email.service")

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
};

async function registerUserController(req,res){
     const {username,email,password} = req.body
     if(!username || !email || !password){
        return res.status(400).json({
            message:"Please provide username, email and password"
        })
     }

     const isUserAlreadyExists = await userModel.findOne({
        $or:[{username},{email}]
     })

     if(isUserAlreadyExists){
        return res.status(400).json({
            message:"Account already exists with this credentials"
        })
     }

     const hash = await bcrypt.hash(password,10)

     const user = await userModel.create({
        username,
        email,
        password:hash
     })

     const token = jwt.sign(
        {id: user._id,username:user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
     )

     res.cookie("token", token, cookieOptions)

     res.status(201).json({
        message:"User registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
     })
}

async function loginUserController(req,res){
    const {email,password} = req.body
    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message:"Invalid username or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password,user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid username or password"
        })
    }

    const token = jwt.sign(
        {id:user._id,username:user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )
     res.cookie("token", token, cookieOptions);
    res.status(200).json({
        message:"User logged in successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

async function logoutUserController(req,res){
    const token = req.cookies.token
    if(token){
        await tokenBlacklistModel.create({token})
    }

     res.clearCookie("token", cookieOptions)

    res.status(200).json({
        message:"User logged out successfully"
    })
}

async function getMeController(req,res){
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message:"User details fetched successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

async function registerSendOtpController(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        });
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this credentials"
        });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (update if exists, otherwise insert)
    await otpModel.findOneAndUpdate(
        { email },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
    );

    // Send email
    try {
        await emailService.sendOtpEmail(email, otp);
        res.status(200).json({
            message: "Verification OTP code sent to your email."
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error sending verification email. Please try again."
        });
    }
}

async function registerVerifyOtpController(req, res) {
    const { username, email, password, otp } = req.body;
    if (!username || !email || !password || !otp) {
        return res.status(400).json({
            message: "Missing registration details or OTP"
        });
    }

    // Verify OTP
    const record = await otpModel.findOne({ email, otp });
    if (!record) {
        return res.status(400).json({
            message: "Invalid or expired OTP"
        });
    }

    // Check if user got created in the meantime
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this credentials"
        });
    }

    // Create user
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
        username,
        email,
        password: hash
    });

    // Delete OTP
    await otpModel.deleteOne({ _id: record._id });

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

async function loginSendOtpController(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "Please provide email and password"
        });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "Invalid username or password"
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid username or password"
        });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    await otpModel.findOneAndUpdate(
        { email },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
    );

    // Send email
    try {
        await emailService.sendOtpEmail(email, otp);
        res.status(200).json({
            message: "Verification OTP code sent to your email."
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error sending verification email. Please try again."
        });
    }
}

async function loginVerifyOtpController(req, res) {
    const { email, password, otp } = req.body;
    if (!email || !password || !otp) {
        return res.status(400).json({
            message: "Missing email, password, or OTP"
        });
    }

    // Verify OTP
    const record = await otpModel.findOne({ email, otp });
    if (!record) {
        return res.status(400).json({
            message: "Invalid or expired OTP"
        });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "User not found"
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid credentials"
        });
    }

    // Delete OTP
    await otpModel.deleteOne({ _id: record._id });

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    registerSendOtpController,
    registerVerifyOtpController,
    loginSendOtpController,
    loginVerifyOtpController
}