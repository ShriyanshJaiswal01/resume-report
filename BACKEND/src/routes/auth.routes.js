const {Router} = require('express');
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const authRouter = Router()


authRouter.post("/register",authController.registerUserController)
authRouter.post("/register/send-otp", authController.registerSendOtpController)
authRouter.post("/register/verify-otp", authController.registerVerifyOtpController)
authRouter.post("/login", authController.loginUserController)
authRouter.post("/login/send-otp", authController.loginSendOtpController)
authRouter.post("/login/verify-otp", authController.loginVerifyOtpController)
authRouter.get("/logout",authController.logoutUserController)
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)
module.exports = authRouter