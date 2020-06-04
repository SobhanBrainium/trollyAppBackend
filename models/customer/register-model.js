import jwt from "jsonwebtoken"
import async from "async"
import bcrypt from "bcryptjs"
import axios from "axios"
import _ from "lodash"
import customerSchema from "../../schema/Customer"
import otpSchema from "../../schema/OTPLog"
import userDeviceLoginSchema from "../../schema/UserDeviceLogin"
import config from "../../config"
const mail = require('../../modules/sendEmail');

module.exports = {
    customerRegistration: (data, callBack) => {
        if (data) {
            async.waterfall([
                function (nextCb) {
                    if (data.socialId != '') {

                        /** Check for customer existence */
                        customerSchema.countDocuments({ socialId: data.socialId }).exec(function (err, count) {
                            if (err) {
                                console.log(err);
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } if (count) {
                               // console.log(count);
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'User already exists for this information.',
                                    response_data: {}
                                });
                            } else {
                                nextCb(null, {
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'success',
                                    response_data: {}
                                })
                            }
                        });

                    } else {
                        /** Check for customer existence */
                        customerSchema.countDocuments({ email: data.email, loginType: 'EMAIL' }).exec(function (err, count) {
                            if (err) {
                                console.log(err);
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                if (count) {
                                    nextCb(null, {
                                        success: false,
                                        STATUSCODE: 422,
                                        message: 'User already exists for this email',
                                        response_data: {}
                                    });
                                } else {
                                    customerSchema.countDocuments({ phone: data.phone, loginType: 'EMAIL' }).exec(function (err, count) {
                                        if (err) {
                                            console.log(err);
                                            nextCb(null, {
                                                success: false,
                                                STATUSCODE: 500,
                                                message: 'Internal DB error',
                                                response_data: {}
                                            });

                                        } if (count) {
                                            nextCb(null, {
                                                success: false,
                                                STATUSCODE: 422,
                                                message: 'User already exists for this phone no.',
                                                response_data: {}
                                            });
                                        } else {
                                            nextCb(null, {
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'success',
                                                response_data: {}
                                            })
                                        }
                                    });
                                }
                            }
                        })

                    }
                },
                function (arg1, nextCb) {
                    if (arg1.STATUSCODE === 200) {
                        var customerdata = data;
                        new customerSchema(customerdata).save(async function (err, result) {
                            if (err) {
                                console.log(err);
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                //ADD DATA IN USER LOGIN DEVICE TABLE
                                var userDeviceData = {
                                    userId: result._id,
                                    userType: 'CUSTOMER',
                                    appType: data.appType,
                                    pushMode: data.pushMode,
                                    deviceToken: data.deviceToken
                                }
                                new userDeviceLoginSchema(userDeviceData).save(async function (err, success) {
                                    if (err) {
                                        console.log(err);
                                        nextCb(null, {
                                            success: false,
                                            STATUSCODE: 500,
                                            message: 'Internal DB error',
                                            response_data: {}
                                        });
                                    } else {
                                        var loginId = success._id;
                                        //Developer: Subhajit Singha
                                        //Date: 20/02/2020
                                        //Description: Update Login Type
                                        var loginType = data.loginType;

                                        if ((data.loginType == undefined) || (data.loginType == '')) { //IF NO SOCIAL SIGN UP THEN GENERAL LOGIN
                                            loginType = 'EMAIL';
                                        }

                                        const authToken = generateToken(result);

                                        if (data.profileImage != undefined) { // IF SOCIAL PROFILE PIC PRESENT THEN UPLOAD IT IN OUR SERVER

                                            const download = require('image-downloader')

                                            // Download to a directory and save with the original filename
                                            const options = {
                                                url: data.profileImage,
                                                dest: `public/img/profile-pic/`   // Save to /path/to/dest/image.jpg
                                            }
                                            const FileType = require('file-type');
                                            download.image(options)
                                                .then(({ filename, image }) => {
                                                    (async () => {
                                                        var fileInfo = await FileType.fromFile(filename);
                                                        var fileExt = fileInfo.ext;
                                                        // console.log(fileExt);

                                                        var fs = require('fs');

                                                        var file_name = `customerprofile-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${fileExt}`;

                                                        let image_path = `public/img/profile-pic/${file_name}`;

                                                        fs.rename(filename, image_path, function (err) { //RENAME THE FILE
                                                            if (err) console.log('ERROR: ' + err);
                                                        })
                                                        updateUser({ //UPDATE THE DATA IN DB
                                                            profileImage: file_name
                                                        }, { _id: result._id });

                                                        var response = {
                                                            userDetails: {
                                                                firstName: result.firstName,
                                                                lastName: result.lastName,
                                                                email: result.email,
                                                                phone: result.phone.toString(),
                                                                socialId: result.socialId,
                                                                id: result._id,
                                                                loginId: loginId,
                                                                profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + file_name,
                                                                userType: 'customer',
                                                                loginType: loginType
                                                            },
                                                            authToken: authToken
                                                        }

                                                        updateUser({
                                                            loginType: loginType
                                                        }, { _id: result._id });

                                                        nextCb(null, {
                                                            success: true,
                                                            STATUSCODE: 200,
                                                            message: 'Registration Successfull',
                                                            response_data: response
                                                        })

                                                    })();
                                                })
                                        } else {
                                            var response = {
                                                userDetails: {
                                                    firstName: result.firstName,
                                                    lastName: result.lastName,
                                                    email: result.email,
                                                    phone: result.phone.toString(),
                                                    socialId: result.socialId,
                                                    id: result._id,
                                                    profileImage: '',
                                                    userType: 'customer',
                                                    loginType: loginType
                                                },
                                                authToken: authToken
                                            }
                                            updateUser({
                                                loginType: loginType
                                            }, { _id: result._id });

                                            //generate OTP and sent OTP to user email
                                            let generateRegisterOTP = Math.random().toString().replace('0.', '').substr(0, 4);

                                            let customer = {
                                                ...response.userDetails,
                                                otp : generateRegisterOTP
                                            }

                                            const finalResponse = {
                                                userDetails : {
                                                    firstName: result.firstName,
                                                    lastName: result.lastName,
                                                    email: result.email,
                                                    phone: result.phone.toString(),
                                                    socialId: result.socialId,
                                                    id: result._id,
                                                    profileImage: '',
                                                    userType: 'customer',
                                                    loginType: loginType,
                                                    otp : generateRegisterOTP
                                                },
                                                authToken: authToken
                                            }

                                            var addedOTPToTable = new otpSchema({
                                                userId : customer.id,
                                                phone : customer.phone,
                                                otp : generateRegisterOTP,
                                                usedFor : "Registration",
                                                status : 1
                                            })
                                            let savetoDB = await addedOTPToTable.save()
                                            //end

                                            nextCb(null, {
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'We have successfully sent OTP to your registered email. Please verify it.',
                                                response_data: finalResponse
                                            })
                                        }

                                    }


                                });
                            }
                        })
                    } else {
                        nextCb(null, arg1);
                    }
                },
                function (arg2, nextCb) {
                    if (arg2.STATUSCODE === 200) {
                        /** Send Registration Email */
                        mail('sendOTPdMail')(arg2.response_data.userDetails.email, arg2.response_data.userDetails).send();
                        nextCb(null, arg2);
                    } else {
                        nextCb(null, arg2);
                    }
                }
            ], function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    callBack(result);
                }
            })
        }
    },
    
    customerLogin: (data, callBack) => {
        if (data) {

            var loginUser = '';


            if (data.loginType != 'EMAIL') {
                loginUser = 'SOCIAL';
                var loginCond = { socialId: data.user };
            } else {
                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.user)) {
                    var loginCond = { email: data.user, loginType: 'EMAIL' };
                    loginUser = 'EMAIL';
                } else {
                    var loginCond = { phone: data.user, loginType: 'EMAIL' };
                    loginUser = 'PHONE';
                }
            }

            customerSchema.findOne(loginCond, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (data.userType == 'admin') {
                            var userType = 'ADMIN'
                            data.appType = 'BROWSER';
                            data.pushMode = 'P';
                            data.deviceToken = '';
                        } else {
                            var userType = 'CUSTOMER'
                        }
                        //ADD DATA IN USER LOGIN DEVICE TABLE
                        var userDeviceData = {
                            userId: result._id,
                            userType: userType,
                            appType: data.appType,
                            pushMode: data.pushMode,
                            deviceToken: data.deviceToken
                        }
                        new userDeviceLoginSchema(userDeviceData).save(async function (err, success) {
                            if (err) {
                                console.log(err);
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                var loginId = success._id;
                                if (loginUser == 'SOCIAL') { //IF SOCIAL LOGIN THEN NO NEED TO CHECK THE PASSWORD 
                                    const authToken = generateToken(result);
                                    let response = {
                                        userDetails: {
                                            firstName: result.firstName,
                                            lastName: result.lastName,
                                            email: result.email,
                                            phone: result.phone.toString(),
                                            socialId: result.socialId,
                                            id: result._id,
                                            loginId: loginId,
                                            profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + result.profileImage,
                                            userType: data.userType,
                                            loginType: data.loginType
                                        },
                                        authToken: authToken
                                    }

                                    callBack({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'Login Successfull',
                                        response_data: response
                                    })

                                } else { //NORMAL LOGIN
                                  //  console.log('hello');
                                    if ((data.password == '') || (data.password == undefined)) {
                                        callBack({
                                            success: false,
                                            STATUSCODE: 422,
                                            message: 'Password is required',
                                            response_data: {}
                                        });
                                    } else {
                                        const comparePass = bcrypt.compareSync(data.password, result.password);
                                        if (comparePass) {
                                            const authToken = generateToken(result);
                                            let response = {
                                                userDetails: {
                                                    firstName: result.firstName,
                                                    lastName: result.lastName,
                                                    email: result.email,
                                                    phone: result.phone.toString(),
                                                    socialId: result.socialId,
                                                    id: result._id,
                                                    loginId: loginId,
                                                    profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + result.profileImage,
                                                    userType: data.userType,
                                                    loginType: data.loginType
                                                },
                                                authToken: authToken
                                            }

                                            callBack({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'Login Successfull',
                                                response_data: response
                                            })

                                        } else {
                                            callBack({
                                                success: false,
                                                STATUSCODE: 422,
                                                message: 'Invalid email or password',
                                                response_data: {}
                                            });
                                        }
                                    }
                                }
                            }
                        })

                    } else {
                        if ((data.loginType != 'EMAIL') && (loginUser == 'SOCIAL')) {
                            callBack({
                                success: true,
                                STATUSCODE: 201,
                                message: 'New User',
                                response_data: {}
                            });
                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 422,
                                message: 'Invalid email or password',
                                response_data: {}
                            });
                        }

                    }
                }
            })
        }
    },

    customerViewProfile: (data, callBack) => {
        if (data) {

            customerSchema.findOne({ _id: data.customerId }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        let response = {
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                            email: customer.email,
                            phone: customer.phone.toString(),
                            countryCode: customer.countryCode
                        }

                        if (customer.profileImage != '') {
                            response.profileImage = `${config.serverhost}:${config.port}/img/profile-pic/` + customer.profileImage
                        } else {
                            response.profileImage = ''
                        }
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'User profile fetched successfully',
                            response_data: response
                        })

                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            });

        }
    },

    customerEditProfile: (data, callBack) => {
        if (data) {
            /** Check for customer existence */
            // console.log(data.customerId);
            // console.log(data.email);
            customerSchema.countDocuments({ email: data.email, loginType: data.loginType, _id: { $ne: data.customerId } }).exec(function (err, count) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (count) {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User already exists for this email',
                            response_data: {}
                        });
                    } else {
                        customerSchema.countDocuments({ phone: data.phone, loginType: data.loginType, _id: { $ne: data.customerId } }).exec(function (err, count) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });

                            } if (count) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'User already exists for this phone no.',
                                    response_data: {}
                                });
                            } else {

                                let updateData = {
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    email: data.email,
                                    phone: data.phone,
                                    countryCode: data.countryCode,
                                }

                                updateUser(updateData, { _id: data.customerId });

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'User updated Successfully',
                                    response_data: {}
                                })

                            }
                        })
                    }
                }
            });
        }
    },

    customerProfileImageUpload: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ _id: data.body.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (result.profileImage != '') {
                            var fs = require('fs');
                            var filePath = `public/img/profile-pic/${result.profileImage}`;
                            fs.unlink(filePath, (err) => { });
                        }

                        //Get image extension
                        var ext = getExtension(data.files.image.name);

                        // The name of the input field (i.e. "image") is used to retrieve the uploaded file
                        let sampleFile = data.files.image;

                        var file_name = `customerprofile-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

                        // Use the mv() method to place the file somewhere on your server
                        sampleFile.mv(`public/img/profile-pic/${file_name}`, function (err) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal error',
                                    response_data: {}
                                });
                            } else {
                                updateUser({ profileImage: file_name }, { _id: data.body.customerId });
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Profile image updated Successfully',
                                    response_data: {}
                                })
                            }
                        });
                    }
                }
            });


        }
    },

    customerChangePassword: (data, callBack) => {
        if (data) {

            customerSchema.findOne({ _id: data.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        const comparePass = bcrypt.compareSync(data.oldPassword, result.password);
                        if (comparePass) {

                            bcrypt.hash(data.newPassword, 8, function (err, hash) {
                                if (err) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong while setting the password',
                                        response_data: {}
                                    });
                                } else {
                                    customerSchema.update({ _id: data.customerId }, {
                                        $set: {
                                            password: hash
                                        }
                                    }, function (err, res) {
                                        if (err) {
                                            callBack({
                                                success: false,
                                                STATUSCODE: 500,
                                                message: 'Internal DB error',
                                                response_data: {}
                                            });
                                        } else {
                                            callBack({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'Password updated successfully',
                                                response_data: {}
                                            });
                                        }
                                    })
                                }
                            })
                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 422,
                                message: 'Invalid old password',
                                response_data: {}
                            });
                        }
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            });




        }
    },

    customerForgotPassword: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ email: data.email, loginType: 'EMAIL' }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        let forgotPasswordOtp = Math.random().toString().replace('0.', '').substr(0, 4);
                        customer = customer.toObject();
                        customer.forgotPasswordOtp = forgotPasswordOtp;
                        try {
                            mail('forgotPasswordMail')(customer.email, customer).send();
                            callBack({
                                success: false,
                                STATUSCODE: 200,
                                message: 'Please check your email. We have sent a code to be used to reset password.',
                                response_data: {
                                    email: customer.email,
                                    forgotPassOtp: forgotPasswordOtp
                                }
                            });
                        } catch (Error) {
                            console.log('Something went wrong while sending email');
                        }
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            })
        }
    },

    customerResetPassword: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ email: data.email, loginType: 'EMAIL' }, { _id: 1 }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        bcrypt.hash(data.password, 8, function (err, hash) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong while setting the password',
                                    response_data: {}
                                });
                            } else {
                                customerSchema.update({ _id: customer._id }, {
                                    $set: {
                                        password: hash
                                    }
                                }, function (err, res) {
                                    if (err) {
                                        callBack({
                                            success: false,
                                            STATUSCODE: 500,
                                            message: 'Internal DB error',
                                            response_data: {}
                                        });
                                    } else {
                                        callBack({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: 'Password updated successfully',
                                            response_data: {}
                                        });
                                    }
                                })
                            }
                        })
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            })
        }
    },

    OTPVerification : async (data) => {
        console.log(data,'otp data')
        try {
            if(data){
                const isChecked = await otpSchema.findOne({userId : data.cid, otp : data.otp, phone : data.phone, status : 1})
                if(isChecked != null){
                    //deactivate the OTP with status  2
                    isChecked.status = 2;
                    await isChecked.save();

                    if(isChecked.usedFor == 'Registration'){
                        const userDetail = await customerSchema.findOne({_id : isChecked.userId})
                        mail('userRegistrationMail')(userDetail.email, userDetail).send();
                    }
                    return{
                        success: true,
                        STATUSCODE: 200,
                        message: 'OTP verification successfully.',
                        response_data: {}
                    }
                }else{
                    return{
                        success: false,
                        STATUSCODE: 300,
                        message: 'OTP does not matched.',
                        response_data: {}
                    }
                }
            }
            
        } catch (error) {
            return{
                success: false,
                STATUSCODE: 500,
                message: 'Internal DB error',
                response_data: {}
            }
        }
    },

    customerResendForgotPasswordOtp: async (data, callBack) => {
        if (data) {
            const isValid = await customerSchema.findOne({phone : data.phone})
            if(isValid != null){
                //deactivate old or unused OTP
                const checkOldAndUnUsedOTP = await otpSchema.find({phone : data.phone, status : 1})
                if(checkOldAndUnUsedOTP.length >0){
                    //make status = 2 for expired, deactivate or used
                    _.forEach(checkOldAndUnUsedOTP, async (value, key) => {
                        value.status = 2;
                        await value.save()
                    })
                }
                //end

                //generate new OTP
                const newOTP = Math.random().toString().replace('0.', '').substr(0, 4)
                const addOTPToDb = new otpSchema({
                    userId : isValid.id,
                    phone : isValid.phone,
                    otp : newOTP,
                    usedFor : data.usedFor,
                    status : 1
                })

                await addOTPToDb.save()

                //sent mail with new OTP
                mail('resendOtpMail')(isValid.email, isValid).send();

                callBack({
                    success: false,
                    STATUSCODE: 200,
                    message: 'Please check your email. We have sent a code..',
                    response_data: {
                        phone: isValid.phone,
                        otp: newOTP
                    }
                })
            }else{
                callBack({
                    success: false,
                    STATUSCODE: 500,
                    message: 'Phone number is not registered with us.',
                    response_data: {}
                })
            }
            // customerSchema.findOne({ phone: data.phone, loginType: 'EMAIL' }, function (err, customer) {
            //     if (err) {
            //         callBack({
            //             success: false,
            //             STATUSCODE: 500,
            //             message: 'Internal DB error',
            //             response_data: {}
            //         });
            //     } else {
            //         if (customer) {
            //             let forgotPasswordOtp = Math.random().toString().replace('0.', '').substr(0, 4);
            //             customer = customer.toObject();
            //             customer.forgotPasswordOtp = forgotPasswordOtp;
            //             try {
            //                 mail('forgotPasswordMail')(customer.email, customer).send();
            //                 callBack({
            //                     success: false,
            //                     STATUSCODE: 200,
            //                     message: 'Please check your email. We have sent a code to be used to reset password.',
            //                     response_data: {
            //                         email: customer.email,
            //                         forgotPassOtp: forgotPasswordOtp
            //                     }
            //                 });
            //             } catch (Error) {
            //                 console.log('Something went wrong while sending email');
            //             }
            //         } else {
            //             callBack({
            //                 success: false,
            //                 STATUSCODE: 422,
            //                 message: 'User not found',
            //                 response_data: {}
            //             });
            //         }
            //     }
            // })
        }
    },

    logout: (data, callBack) => {
        if (data) {
            var loginId = data.loginId;
            userDeviceLoginSchema.deleteOne({ _id: loginId }, function (err) {
                if (err) {
                    console.log(err);
                }
                // deleted at most one tank document
            });
            callBack({
                success: true,
                STATUSCODE: 200,
                message: 'User logged out Successfully',
                response_data: {}
            })
        }
    },
}

function generateToken(userData) {
    let payload = { subject: userData._id, user: 'CUSTOMER' };
    return jwt.sign(payload, config.secretKey, { expiresIn: '24h' })
}

function updateUser(update, cond) {
    return new Promise(function (resolve, reject) {
        customerSchema.update(cond, {
            $set: update
        }, function (err, res) {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

function getExtension(filename) {
    return filename.substring(filename.indexOf('.') + 1);
}