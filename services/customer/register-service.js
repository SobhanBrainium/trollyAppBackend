import registerModel from "../../models/customer/register-model"
import async from "async"
module.exports = {
    // customerRegister: async (data) => {
    //     const result = registerModel.customerRegistration(data)
    //     return result
    // },

    // customerLogin : async (data) => {
    //     const LoginResult = registerModel.customerLogin(data)
    //     return LoginResult
    // },

    // viewProfile : async (data) => {
    //     const profileObject = registerModel.viewProfile(data)
    //     return profileObject
    // },

    // editProfile : async (data) => {
    //     const updatedData = registerModel.editProfile(data)
    //     return updatedData
    // },

    // profileImageUpload : async (data) => {
    //     const uploadImage = registerModel.profileImageUpload(data)
    //     return uploadImage
    // },

    OTPVerification : async (data) => {
        const verify = registerModel.OTPVerification(data)
        return verify
    },
    
    // resendOtp : async (data) => {
    //     const reSent = registerModel.resendOtp(data)
    //     return reSent
    // },

    // changePassword : async (data) => {
    //     const update = registerModel.changePassword(data)
    //     return update
    // },

    // forgotPassword : async (data) => {
    //     const forgotPassword = await registerModel.forgotPassword(data)
    //     return forgotPassword
    // },

    // resetPassword : async (data) => {
    //     const resetPassword = await registerModel.resetPassword(data)
    //     return resetPassword
    // }

    customerRegister: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                registerModel.customerRegistration(data, function(result) {
                    nextCb(null, result);
                })
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    },

    customerLogin: (data, callBack) => {

        if((data.userType == 'customer') || (data.userType == 'admin')) {
            async.waterfall([
                function(nextCb) {
                    registerModel.customerLogin(data, function(result) {
                        nextCb(null, result);
                    })
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if(data.userType == 'deliveryboy') {
            async.waterfall([
                function(nextCb) {
                    registerModel.deliveryboyLogin(data, function(result) {
                        nextCb(null, result);
                    })
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if((data.userType == 'vendorowner') || (data.userType == 'vendoradmin')) {
            async.waterfall([
                function(nextCb) {
                    registerModel.vendorownerLogin(data, function(result) {
                        nextCb(null, result);
                    })
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        }
       
    },

    forgotEmail: (data, callBack) => {
       

            async.waterfall([
                function(nextCb) {
                    registerModel.forgotEmail(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        
        
    },
    forgotPassword: (data, callBack) => {
        if(data.userType == 'customer') {

            async.waterfall([
                function(nextCb) {
                    registerModel.customerForgotPassword(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if(data.userType == 'deliveryboy') {

            async.waterfall([
                function(nextCb) {
                    registerModel.deliveryboyForgotPassword(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });

        } else if(data.userType == 'vendorowner') {

            async.waterfall([
                function(nextCb) {
                    registerModel.vendorownerForgotPassword(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } 
        
    },

    resetPassword: (data, callBack) => {
        if(data.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerResetPassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyResetPassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerResetPassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    },

    viewProfile: (data, callBack) => {
        if(data.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerViewProfile(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyViewProfile(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerViewProfile(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    },
    editProfile: (data, callBack) => {
        if(data.userType == 'customer') {
            async.waterfall([
                function(nextCb) {
                    registerModel.customerEditProfile(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if(data.userType == 'deliveryboy') {
            async.waterfall([
                function(nextCb) {
                    registerModel.deliveryboyEditProfile(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if(data.userType == 'vendorowner') {
            async.waterfall([
                function(nextCb) {
                    registerModel.vendorownerEditProfile(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        }
       
    },
    changePassword: (data, callBack) => {
        if(data.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerChangePassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyChangePassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerChangePassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    },
    logout: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                registerModel.logout(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    },

    profileImageUpload: (data, callBack) => {
        if(data.body.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerProfileImageUpload(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.body.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyProfileImageUpload(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.body.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerProfileImageUpload(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    }, 

    resendForgotPassordOtp: (data, callBack) => {
        if(data.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerResendForgotPasswordOtp(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyResendForgotPasswordOtp(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerResendForgotPasswordOtp(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    },
}