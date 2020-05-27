import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import customerSchema from "../../schema/Customer"
import config from "../../config"
const mail = require('../../modules/sendEmail');

module.exports = {
    customerRegistration : async (data) => {
        try {
            const isExistWithEmail = await customerSchema.countDocuments({ email: data.email })
            if(isExistWithEmail > 0){
                return{
                    success: false,
                    STATUSCODE: 422,
                    message: 'User already exists for this email',
                    response_data: {}
                }
            }else{
                const isExistWithPhone = await customerSchema.countDocuments({ phone: data.phone })
                if(isExistWithPhone > 0){
                    return{
                        success: false,
                        STATUSCODE: 422,
                        message: 'User already exists for this phone no.',
                        response_data: {}
                    }
                }else{
                    let result = await customerSchema.create(data)

                    let loginType = '';
                                
                    if (data.loginType == undefined) { //IF NO SOCIAL SIGN UP THEN GENERAL LOGIN
                        loginType = 'NORMAL';
                    }

                    const authToken = generateToken(result);


                    if (data.profileImage != undefined) { // IF SOCIAL PROFILE PIC PRESENT THEN UPLOAD IT IN OUR SERVER
                        const download = require('image-downloader')

                        // Download to a directory and save with the original filename
                        const options = {
                            url: data.profileImage,
                            dest: `public/img/`   // Save to /path/to/dest/image.jpg
                        }
                        const FileType = require('file-type');
                        download.image(options)
                            .then(({ filename, image }) => {
                                (async () => {
                                    var fileInfo = await FileType.fromFile(filename);
                                    var fileExt = fileInfo.ext;
                                    // console.log(fileExt);

                                    var fs = require('fs');

                                    var file_name = `profile-${result._id}-${Math.floor(Date.now() / 1000)}.${fileExt}`;
                                    
                                    let image_path = `public/img/${file_name}`;

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
                                            phone: result.phone,
                                            cityId: result.cityId,
                                            location: result.location,
                                            id: result._id,
                                            profileImage : `${config.serverhost}:${config.port}/img/` + file_name
                                        },
                                        authToken: authToken
                                    }

                                    updateUser({
                                        loginType: loginType
                                    }, { _id: result._id });

                                    return{
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'Registration Successfull',
                                        response_data: response
                                    }

                                })();
                            })
                    } else {
                        var response = {
                            userDetails: {
                                firstName: result.firstName,
                                lastName: result.lastName,
                                email: result.email,
                                phone: result.phone,
                                cityId: result.cityId,
                                location: result.location,
                                id: result._id,
                                profileImage: ''
                            },
                            authToken: authToken
                        }

                        //update loginType
                        result.loginType = loginType
                        await result.save()

                        //sent email
                        let sentEmail = mail('userRegistrationMail')(response.userDetails.email, response.userDetails).send();
                        console.log(sentEmail,'sentEmail')

                        return{
                            success: true,
                            STATUSCODE: 200,
                            message: 'Registration Successfull',
                            response_data: response
                        }
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