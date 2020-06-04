import express from "express"
import registerService from "../services/customer/register-service"
import orderService from "../services/customer/order-service"
import customerValidator from "../middlewares/validators/customer/customer-validator"
import jwtTokenValidator from "../middlewares/jwt-validation-middlewares"

const restaurantValidator = require('../middlewares/validators/customer/restaurant-validator');
const restaurantService = require('../services/customer/restaurant-service');

var customerApi = express.Router();
customerApi.use(express.json());
customerApi.use(express.urlencoded({extended: false}));

/** Customer registration */
customerApi.post('/register', customerValidator.customerRegister, function(req, res) {
    registerService.customerRegister(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Customer Login */
customerApi.post('/login', customerValidator.customerLogin, function(req, res) {
    registerService.customerLogin(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Forgot Password */
customerApi.post('/forgotPassword', customerValidator.forgotPasswordEmail, function(req, res) {
    registerService.forgotPassword(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Reset Password */
customerApi.post('/resetPassword', customerValidator.resetPassword, function(req, res) {
    registerService.resetPassword(req.body, function(result) {
        res.status(200).send(result);
    });
});

/** Resend Forgot Password OTP */
customerApi.post('/resendOtp', customerValidator.resendForgotPassOtp, function(req, res) {
    registerService.resendForgotPassordOtp(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Forgot Password Admin */
customerApi.post('/forgotPasswordAdmin', customerValidator.forgotPasswordEmail, function(req, res) {
    registerService.forgotPasswordAdmin(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Reset Password Admin */
customerApi.post('/resetPasswordAdmin', customerValidator.resetPasswordAdmin, function(req, res) {
    registerService.resetPasswordAdmin(req.body, function(result) {
        res.status(200).send(result);
    });
});

/** Change password Admin */
customerApi.post('/changePasswordAdmin',jwtTokenValidator.validateToken, customerValidator.changePassword, function(req, res) {
    registerService.changePasswordAdmin(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** View Profile */
customerApi.post('/viewProfile',jwtTokenValidator.validateToken, customerValidator.viewProfile, function(req, res) {
    registerService.viewProfile(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Edit Profile */
customerApi.post('/editProfile',jwtTokenValidator.validateToken, customerValidator.editProfile, function(req, res) {
    registerService.editProfile(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Change password */
customerApi.post('/changePassword',jwtTokenValidator.validateToken, customerValidator.changePassword, function(req, res) {
    registerService.changePassword(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Profile image upload */
customerApi.post('/profileImageUpload',jwtTokenValidator.validateToken,customerValidator.profileImageUpload, function(req, res) {
    registerService.profileImageUpload(req, function(result) {
        res.status(200).send(result);
    });
})


/** Change password */
customerApi.post('/logout',jwtTokenValidator.validateToken, customerValidator.logout, function(req, res) {
    registerService.logout(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** OTP verification */
customerApi.post('/otpVerification', customerValidator.OTPVerification, async (req,res) => {
    let verifyOTP = await registerService.OTPVerification(req.body)
    res.status(200).send(verifyOTP)
})

/** Home/Dashboard */
customerApi.post('/dashboard',jwtTokenValidator.validateToken,restaurantValidator.customerHomeValidator, function(req, res) {
    restaurantService.customerHome(req, function(result) {
        res.status(200).send(result);
    });
})

/** All promo List */
customerApi.post('/promoCodeList',jwtTokenValidator.validateToken,restaurantValidator.promoCodeList, function(req, res) {
    orderService.promoCodeList(req, function(result) {
        res.status(200).send(result);
    });
});

/** Logout */
customerApi.post('/logout',jwtTokenValidator.validateToken, customerValidator.logout, function(req, res) {
    registerService.logout(req.body, function(result) {
        res.status(200).send(result);
    });
})


module.exports = customerApi;