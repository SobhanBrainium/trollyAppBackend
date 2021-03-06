var vendorSchema = require('../../schema/Vendor');
var vendorFavouriteSchema = require('../../schema/VendorFavourite');
var categorySchema = require('../../schema/Category');
var bannerSchema = require('../../schema/Banner');
var itemSchema = require('../../schema/Item');
var userDeviceLoginSchemaSchema = require('../../schema/UserDeviceLogin');
var vendorOwnerSchema = require('../../schema/VendorOwner');

var orderSchema = require('../../schema/Order');
var OrderDetailSchema = require('../../schema/OrderDetail');
var config = require('../../config');
var PushLib = require('../../libraries/pushlib/send-push');

import _ from "lodash"

module.exports = {
    //Customer Home/Dashboard API
    customerHome: (data, callBack) => {
        if (data) {
            var latt = data.body.latitude;
            var long = data.body.longitude;
            var userType = data.body.userType;
            var responseDt = [];
            var response_data = {};

            // console.log(data.body);

            vendorSchema.find({
                location: {
                    $near: {
                        $maxDistance: config.restaurantSearchDistance,
                        $geometry: {
                            type: "Point",
                            coordinates: [long, latt]
                        }
                    }
                },
                isActive: true
            })
                // .limit(4)
                // .populate('vendorOpenCloseTime')
                .exec(async function (err, results) {
                    if (err) {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error',
                            response_data: {}
                        });
                    } else {
                        if (results.length > 0) {
                            var vendorIds = [];
                            let productList = []
                            //#region product fetch vendor/warehouse wise
                            for(let warehouseItem of results){
                                const vendorId = warehouseItem._id
                                const fetchItem = await itemSchema.find({vendorId : vendorId},{
                                    _id : 1, itemName : 1, categoryId : 1, vendorId : 1, price : 1, unit : 1, offerId : 1, isActive : 1
                                })
                                .populate('categoryId', {_id : 1, categoryName : 1})
                                .populate('vendorId', {_id : 1, restaurantName : 1})

                                if(fetchItem.length > 0){
                                    for(let item of fetchItem){
                                        //#region check item is favorite or not by customer
                                        const itemId = item._id
                                        const customerId = data.body.customerId;
                                        let productFinalList = {}

                                        const isFavorite = await vendorFavouriteSchema.findOne({ itemId: itemId, customerId: customerId });

                                        if(isFavorite != null){
                                            productFinalList = {
                                                ...item.toObject(),
                                                favorite : 1
                                            }
                                        }else{
                                            productFinalList = {
                                                ...item.toObject(),
                                                favorite : 0
                                            }
                                        }
                                        //#endregion
                                        productList.push(productFinalList)
                                    }
                                }
                            }
                            //#endregion

                            //#region vendor
                            // for (let restaurant of results) {
                            //     var responseObj = {};
                            //     responseObj = {
                            //         id: restaurant._id,
                            //         name: restaurant.restaurantName,
                            //         description: restaurant.description,
                            //         logo: `${config.serverhost}:${config.port}/img/vendor/${restaurant.logo}`,
                            //         rating: restaurant.rating
                            //     };
                            //     // console.log(restaurant.location.coordinates);

                            //     //Calculate Distance
                            //     var sourceLat = restaurant.location.coordinates[1];
                            //     var sourceLong = restaurant.location.coordinates[0];

                            //     var destLat = latt;
                            //     var destLong = long;
                            //     responseObj.distance = await getDistanceinMtr(sourceLat, sourceLong, destLat, destLong);
                            //     // console.log(responseObj);

                            //     //Get Favorites (Only for Genuine Customers, No Guest)
                            //     if (userType == 'GUEST') {
                            //         responseObj.favorite = 0;
                            //     } else {
                            //         var customerId = data.body.customerId;
                            //         var vendorId = restaurant._id;
                            //         responseObj.favorite = await vendorFavouriteSchema.countDocuments({ vendorId: vendorId, customerId: customerId });
                            //     }
                            //     responseDt.push(responseObj);
                            //     vendorIds.push(restaurant._id);
                            // }
                            //#endregion

                            //Restaurant
                            response_data.productList = productList

                            // response_data.vendor = responseDt;
                            //Category Data
                            response_data.category_data = await categorySchema.find({}, { "categoryName": 1, "image": 1 })
                            response_data.category_imageUrl = `${config.serverhost}:${config.port}/img/category/`;

                            //Banner Data
                            // console.log(vendorIds);
                            response_data.banner_data = await bannerSchema.find({
                                vendorId: { $in: vendorIds }
                            }, { "bannerType": 1, "image": 1 })
                            response_data.banner_imageUrl = `${config.serverhost}:${config.port}/img/vendor/`;

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: `${results.length} nearby warehouse found.`,
                                response_data: response_data
                            })

                        } else {
                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'No nearby restaurants found.',
                                response_data: response_data
                            })
                        }
                    }
                });
        }
    },
    //Customer Restaurant details API
    restaurantDetails: (data, callBack) => {
        if (data) {

            var vendorId = data.vendorId;
            var categoryId = data.categoryId;
            var responseDt = {};
            var latt = data.latitude;
            var long = data.longitude;
            var restaurantInformation = data.restaurantInfo;
            // return;

            if (restaurantInformation == 'YES') {

                vendorSchema.findOne({
                    location: {
                        $near: {
                            $maxDistance: config.restaurantSearchDistance,
                            $geometry: {
                                type: "Point",
                                coordinates: [long, latt]
                            }
                        }
                    },
                    _id: vendorId,
                    isActive: true
                })
                    .populate('vendorOpenCloseTime')
                    .exec(async function (err, results) {
                        if (err) {
                            console.log(err);
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal error',
                                response_data: {}
                            });
                        } else {
                            if (results != null) {
                                var restaurantInfo = {
                                    name: results.restaurantName,
                                    description: results.description,
                                    rating: results.rating,
                                    logo: `${config.serverhost}:${config.port}/img/vendor/${results.logo}`,
                                    banner: `${config.serverhost}:${config.port}/img/vendor/${results.banner}`
                                };

                                //Calculate Distance
                                var sourceLat = results.location.coordinates[1];
                                var sourceLong = results.location.coordinates[0];

                                var destLat = latt;
                                var destLong = long;
                                restaurantInfo.distance = await getDistanceinMtr(sourceLat, sourceLong, destLat, destLong);

                                //Open time
                                var vendorTimeArr = [];
                                var openTimeArr = [];
                                var closeTimeArr = [];
                                if (results.vendorOpenCloseTime.length > 0) {
                                    if (results.vendorOpenCloseTime.length == 7) {
                                        var everydayCheck = 1;
                                    } else {
                                        var everydayCheck = 0;
                                    }


                                    for (let vendorTime of results.vendorOpenCloseTime) {
                                        var vendorTimeObj = {};
                                      //  console.log(vendorTime);
                                        if (everydayCheck == 1) {

                                            openTimeArr.push(vendorTime.openTime);
                                            closeTimeArr.push(vendorTime.closeTime);
                                        }
                                        //OPEN TIME CALCULATION
                                        var openTimeAMPM = '';
                                        var openTimeHours = '';
                                        var openTimeMin = '';
                                        if (vendorTime.openTime < 720) {
                                            var num = vendorTime.openTime;
                                            openTimeAMPM = 'am';
                                        } else {
                                            var num = (vendorTime.openTime - 720);
                                            openTimeAMPM = 'pm';
                                        }

                                        var openHours = (num / 60);
                                        var openrhours = Math.floor(openHours);
                                        var openminutes = (openHours - openrhours) * 60;
                                        var openrminutes = Math.round(openminutes);

                                        openTimeHours = openrhours;
                                        openTimeMin = openrminutes;

                                        //CLOSE TIME CALCULATION
                                        var closeTimeAMPM = '';
                                        var closeTimeHours = '';
                                        var closeTimeMin = '';
                                        if (vendorTime.closeTime < 720) {
                                            var num = vendorTime.closeTime;
                                            closeTimeAMPM = 'am';
                                        } else {
                                            var num = (vendorTime.closeTime - 720);
                                            closeTimeAMPM = 'pm';
                                        }

                                        var closeHours = (num / 60);
                                        var closerhours = Math.floor(closeHours);
                                        var closeminutes = (closeHours - closerhours) * 60;
                                        var closerminutes = Math.round(closeminutes);

                                        closeTimeHours = closerhours;
                                        closeTimeMin = closerminutes;

                                        vendorTimeObj.day = vendorTime.day;
                                        vendorTimeObj.openTime = `${openTimeHours}:${openTimeMin} ${openTimeAMPM}`
                                        vendorTimeObj.closeTime = `${closeTimeHours}:${closeTimeMin} ${closeTimeAMPM}`

                                        vendorTimeArr.push(vendorTimeObj);
                                    }
                                }

                                responseDt.restaurant = restaurantInfo;

                                //Everyday Check
                                if (everydayCheck == 1) {
                                    // console.log(openTimeArr);
                                    // console.log(closeTimeArr);
                                    var uniqueOpen = openTimeArr.filter(onlyUnique);
                                    var uniqueClose = closeTimeArr.filter(onlyUnique);
                                    if ((uniqueOpen.length == 1) && (uniqueClose.length == 1)) {
                                        responseDt.vendorTimeEveryday = 1;
                                        responseDt.vendorTimeEverydayStart = uniqueOpen[0];
                                        responseDt.vendorTimeEverydayClose = uniqueClose[0];
                                    }
                                } else {
                                    responseDt.vendorTimeEveryday = 0;
                                }

                                responseDt.vendorTime = vendorTimeArr;


                                //Get Item Details
                                var restaurantItemDetails = await restaurantCategoryItem(vendorId, categoryId);

                                if (restaurantItemDetails != 'err') {
                                    responseDt.catitem = restaurantItemDetails;

                                    callBack({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'Restaurant details.',
                                        response_data: responseDt
                                    });

                                    //  console.log(responseDt);
                                } else {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Internal DB error.',
                                        response_data: {}
                                    });
                                }

                            } else {
                                callBack({
                                    success: false,
                                    STATUSCODE: 400,
                                    message: 'Something went wrong.',
                                    response_data: {}
                                });
                            }
                        }
                        //console.log(results);
                    });

            } else {

                //Get Item Details
                restaurantCategoryItem(vendorId, categoryId)
                    .then(function (restaurantItemDetails) {

                        if (restaurantItemDetails != 'err') {
                            responseDt.catitem = restaurantItemDetails;

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Restaurant details.',
                                response_data: responseDt
                            });

                            //  console.log(responseDt);
                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error.',
                                response_data: {}
                            });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error.',
                            response_data: {}
                        });
                    });
            }


        }
    },
    //Customer Post Order API
    postOrder: (data, callBack) => {
        if (data) {
         //   console.log(data);

            // return;

            var vendorId = data.vendorId;
            var items = data.items;
            var latt = data.latitude;
            var long = data.longitude;
            var appType = data.appType;

            var checkJson = false

            if(appType == 'ANDROID') {
                var checkJson = isJson(items);
            } else {
                checkJson = true;
            }
           

            // console.log(checkJson);
            // console.log(appType);
            // console.log(items);

            var checkJson = true;

            if (checkJson == true) {

              //  var itemObj = JSON.parse(items);

              if(appType == 'ANDROID') {
                var itemObj = JSON.parse(items);
            } else {
                var itemObj = items;
            }

              
                // console.log(itemObj);
                var errorCheck = 0;
                var orderDetailsItm = [];
                var itemsIdArr = [];
                for (item of itemObj) {
                    var orderDetailsItmObj = {};
                    if ((item.name == undefined) || (item.name == '') || (item.quantity == undefined) || (item.quantity == '') || (item.price == undefined) || (item.price == '') || (item.itemId == undefined) || (item.itemId == '')) {
                        errorCheck++;
                    } else {
                        //Items Check
                        itemsIdArr.push(item.itemId);

                        orderDetailsItmObj.item = item.name;
                        orderDetailsItmObj.quantity = item.quantity;
                        orderDetailsItmObj.itemPrice = item.price;
                        orderDetailsItmObj.totalPrice = (Number(item.price) * Number(item.quantity));
                        orderDetailsItm.push(orderDetailsItmObj);
                    }
                    // console.log(item.name);
                    // console.log(item.quantity);
                    // console.log(item.price);
                }

                if (errorCheck == 0) {

                    vendorSchema.findOne({
                        _id: vendorId,
                        location: {
                            $near: {
                                $maxDistance: config.restaurantSearchDistance,
                                $geometry: {
                                    type: "Point",
                                    coordinates: [long, latt]
                                }
                            }
                        },
                        isActive: true
                    })
                        .exec(async function (err, results) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                if (results != null) {

                                    
                                    //console.log(data);
                                   // console.log(itemsIdArr);
                                    var itemsCheck = await itemSchema.find({ _id: { $in: itemsIdArr } })
                                    var waitingTimeAll = 0;

                                    if (itemsCheck.length > 0) {
                                        for (let item of itemsCheck) {
                                            waitingTimeAll += Number(item.waitingTime);
                                        }
                                    }
                                    var orderVendorId = data.vendorId;

                                    var orderNo = generateOrder();

                                    var ordersObj = {
                                        vendorId: data.vendorId,
                                        orderNo: orderNo,
                                        orderTime: new Date(),
                                        estimatedDeliveryTime: waitingTimeAll,

                                        deliveryPincode: data.deliveryPincode,
                                        deliveryHouseNo: data.deliveryHouseNo,
                                        deliveryRoad: data.deliveryRoad,
                                        deliveryCountryCode: data.deliveryCountryCode,
                                        deliveryPhone: data.deliveryPhone,
                                        deliveryState: data.deliveryState,
                                        deliveryCity: data.deliveryCity,
                                        deliveryLandmark: data.deliveryLandmark,
                                        deliveryName: data.deliveryName,

                                        customerId: data.customerId,
                                        orderType: data.orderType,
                                        deliveryPreference: data.deliveryPreference,
                                        orderStatus: 'NEW',
                                        price: data.price,
                                        discount: data.discount,
                                        finalPrice: data.finalPrice,
                                        specialInstruction: data.specialInstruction,
                                        promocodeId: data.promocodeId
                                    }

                                    // console.log(ordersObj);



                                  //  console.log(orderDetailsItm);

                                    new orderSchema(ordersObj).save(async function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            callBack({
                                                success: false,
                                                STATUSCODE: 500,
                                                message: 'Internal DB error',
                                                response_data: {}
                                            });
                                        } else {
                                            var orderId = result._id;
                                            var orderDetailsArr = [];
                                            var orderIdsArr = [];
                                            var orderDetailsCount = orderDetailsItm.length;
                                            var c = 0;
                                            for (let orderdetails of orderDetailsItm) {
                                                c++;
                                                var orderEnter = orderdetails;
                                                orderEnter.orderId = orderId;

                                                // console.log(orderEnter);

                                                orderDetailsArr.push(orderEnter);

                                                new OrderDetailSchema(orderEnter).save(async function (err, result) {
                                                    orderIdsArr.push(result._id);



                                                    orderSchema.update({ _id: orderId }, {
                                                        $set: { orderDetails: orderIdsArr }
                                                    }, function (err, res) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                           // console.log(res);
                                                        }
                                                    });
                                                })
                                            }
                                            //SEND PUSH MESSAGE
                                            var pushMessage = 'You have received a new order'
                                            var receiverId = orderVendorId;
                                            sendPush(receiverId, pushMessage,orderNo);
                                            var respOrder = {};
                                            respOrder.order = ordersObj;
                                            respOrder.orderDetails = orderDetailsArr;
                                            callBack({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'Order Updated Successfully.',
                                                response_data: respOrder
                                            });

                                        }
                                    });

                                } else {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong.',
                                        response_data: {}
                                    });
                                }
                            }

                        });



                } else {
                    console.log('Invalid items object format');
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Validation failed.',
                        response_data: {}
                    });
                }

            } else {
                console.log('Invalid items object format');
                callBack({
                    success: false,
                    STATUSCODE: 500,
                    message: 'Validation failed.',
                    response_data: {}
                });
            }
            return;


        }
    },
    //Customer Search API
    customerSearch: (data, callBack) => {
        if (data) {
            var latt = data.body.latitude;
            var long = data.body.longitude;
            var userType = data.body.userType;
            var searchVal = data.body.search;
            var responseDt = [];
            var response_data = {};

            // console.log(data.body);
          //  console.log(searchVal);

            //SEARCH ALL RESTAURANT
            vendorSchema.find({
                "restaurantName": { $regex: '.*' + searchVal + '.*' },
                // location: {
                //     $near: {
                //         $maxDistance: config.restaurantSearchDistance,
                //         $geometry: {
                //             type: "Point",
                //             coordinates: [long, latt]
                //         }
                //     }
                // },
                isActive: true
            })
                .exec(async function (err, vendorresults) {
                    if (err) {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error',
                            response_data: {}
                        });
                    } else {
                        var vendorIdres = [];

                        if (vendorresults.length > 0) {
                            for (let vendorRes of vendorresults) {
                                vendorIdres.push(vendorRes._id);
                            }
                        }

                        //SEARCH ALL ITEM
                        itemSchema.find({
                            "itemName": { $regex: '.*' + searchVal + '.*' }
                        })
                            .then(function (itemresponse) {
                                if (itemresponse.length > 0) {
                                    for (let itemRes of itemresponse) {
                                        vendorIdres.push(itemRes.vendorId);
                                    }
                                }
                              //  console.log(vendorIdres);
                                vendorSchema.find({
                                    _id: { $in: vendorIdres },
                                    // location: {
                                    //     $near: {
                                    //         $maxDistance: config.restaurantSearchDistance,
                                    //         $geometry: {
                                    //             type: "Point",
                                    //             coordinates: [long, latt]
                                    //         }
                                    //     }
                                    // },
                                    isActive: true
                                })
                                    .then(async function (results) {
                                       // console.log(results);
                                        // return;
                                        if (results.length > 0) {
                                            var vendorIds = [];
                                            for (let restaurant of results) {
                                                var responseObj = {};
                                                responseObj = {
                                                    id: restaurant._id,
                                                    name: restaurant.restaurantName,
                                                    description: restaurant.description,
                                                    logo: `${config.serverhost}:${config.port}/img/vendor/${restaurant.logo}`,
                                                    rating: restaurant.rating
                                                };
                                                // console.log(restaurant.location.coordinates);

                                                //Calculate Distance
                                                var sourceLat = restaurant.location.coordinates[1];
                                                var sourceLong = restaurant.location.coordinates[0];

                                                var destLat = latt;
                                                var destLong = long;
                                                responseObj.distance = await getDistanceinMtr(sourceLat, sourceLong, destLat, destLong);
                                                // console.log(responseObj);

                                                //Get Favorites (Only for Genuine Customers, No Guest)
                                                if (userType == 'GUEST') {
                                                    responseObj.favorite = 0;
                                                } else {
                                                    var customerId = data.body.customerId;
                                                    var vendorId = restaurant._id;
                                                    responseObj.favorite = await vendorFavouriteSchema.countDocuments({ vendorId: vendorId, customerId: customerId });
                                                }
                                                responseDt.push(responseObj);
                                                vendorIds.push(restaurant._id);
                                            }

                                            //Restaurant
                                            response_data.vendor = responseDt;
                                            // //Category Data
                                            // response_data.category_data = await categorySchema.find({}, { "categoryName": 1, "image": 1 })
                                            // response_data.category_imageUrl = `${config.serverhost}:${config.port}/img/category/`;

                                            // //Banner Data
                                            // // console.log(vendorIds);
                                            // response_data.banner_data = await bannerSchema.find({
                                            //     vendorId: { $in: vendorIds }
                                            // }, { "bannerType": 1, "image": 1 })
                                            // response_data.banner_imageUrl = `${config.serverhost}:${config.port}/img/vendor/`;

                                            callBack({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: `${results.length} restaurants found.`,
                                                response_data: response_data
                                            })

                                        } else {
                                            callBack({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'No nearby restaurants found.',
                                                response_data: response_data
                                            })
                                        }
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                        callBack({
                                            success: false,
                                            STATUSCODE: 500,
                                            message: 'Something went wrong.',
                                            response_data: {}
                                        })
                                    })

                            })
                            .catch(function (error) {
                                console.log(error);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong.',
                                    response_data: {}
                                })
                            });
                    }
                });
        }
    }
}


//getDistance(start, end, accuracy = 1)
function getDistanceinMtr(sourceLat, sourceLong, destinationLat, destinationLong) {
    return new Promise(function (resolve, reject) {
        const geolib = require('geolib');

        var distanceCal = geolib.getDistance(
            { latitude: sourceLat, longitude: sourceLong },
            { latitude: destinationLat, longitude: destinationLong },
            1
        );

        //  console.log(distanceCal);
        var distanceStr = '';
        if (Number(distanceCal) > 1000) {
            distanceStr += Math.round((Number(distanceCal) / 1000));
            distanceStr += ' km away'
        } else {
            distanceStr = distanceCal
            distanceStr += ' mtrs away'
        }


        return resolve(distanceStr);

    });
}

function restaurantCategoryItem(vendorId, categoryId) {
    return new Promise(function (resolve, reject) {
        var resp = {};

        var itemSerachParam = {
            vendorId: vendorId,
            isActive: true
        }

        if (categoryId != '') {
            itemSerachParam.categoryId = categoryId;
            var catId = 1;
        } else {
            var catId = 0;
        }
        itemSchema.find(itemSerachParam)
            .sort({ createdAt: -1 })
            .exec(async function (err, results) {
                if (err) {
                    console.log(err);
                    return resolve('err');
                } else {
                    if (catId == 1) { // Category with Items Data
                        if (results.length > 0) {
                            var itemsArr = [];
                            for (let itemsVal of results) {
                                var itemsObj = {};
                                itemsObj.itemId = itemsVal._id
                                itemsObj.itemName = itemsVal.itemName
                                itemsObj.type = itemsVal.type
                                itemsObj.price = itemsVal.price
                                itemsObj.description = itemsVal.description
                                itemsObj.menuImage = `${config.serverhost}:${config.port}/img/vendor/${itemsVal.menuImage}`;

                                itemsArr.push(itemsObj);
                            }
                        }
                        resp.item = itemsArr;
                        // console.log(itemsArr);
                    } else {
                        if (results.length > 0) {
                            var categoryId = results[0].categoryId;
                            var itemsArr = [];
                            var categoryIdArr = [];
                            for (let itemsVal of results) {

                                if (itemsVal.categoryId.toString() == categoryId.toString()) {
                                    var itemsObj = {};
                                    itemsObj.itemId = itemsVal._id
                                    itemsObj.categoryId = itemsVal.categoryId
                                    itemsObj.itemName = itemsVal.itemName
                                    itemsObj.type = itemsVal.type
                                    itemsObj.price = itemsVal.price
                                    itemsObj.description = itemsVal.description
                                    itemsObj.menuImage = `${config.serverhost}:${config.port}/img/vendor/${itemsVal.menuImage}`;

                                    itemsArr.push(itemsObj);
                                }
                                if (!categoryIdArr.includes(itemsVal.categoryId)) {
                                    // console.log(itemsVal.categoryId); 
                                    categoryIdArr.push(itemsVal.categoryId);
                                    // console.log(categoryIdArr);
                                }

                            }
                        }
                        resp.item = itemsArr;

                        // console.log(categoryIdArr);

                        //Category Data
                        var categoryData = {};
                        categoryData.data = await categorySchema.find({
                            _id: { $in: categoryIdArr }
                        }, { "categoryName": 1, "image": 1 });
                        // console.log(categoryData.data);
                        categoryData.imageUrl = `${config.serverhost}:${config.port}/img/category/`;

                        // console.log(categoryData);
                        resp.category = categoryData;
                    }
                    return resolve(resp);
                }
            })
    });
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function generateOrder() {

    var orderNo = `EE${Math.floor((Math.random() * 100000))}`
    return orderNo;
}

function sendPush(receiverId, pushMessage,orderNo) {
   // console.log(receiverId);
   var pushMessage = pushMessage;
    vendorOwnerSchema
        .find({ vendorId: receiverId })
        .then(function (allowners) {
            vendorOwnerId = [];
            if (allowners.length > 0) {
                for (let owner of allowners) {
                    vendorOwnerId.push(owner._id);
                }
            }

            //console.log(vendorOwnerId);
            userDeviceLoginSchemaSchema
                .find({  userId: { $in: vendorOwnerId }, userType: 'VENDOR' })
                .then(function (customers) {
                    // console.log(customers);
                    //   return;

                    if (customers.length > 0) {
                        for (let customer of customers) {
                            if(customer.deviceToken != '') {

                                var msgStr = ",";
                                msgStr += "~order_no~:~" + orderNo + "~";
                                var dataset = "{~message~:~" + pushMessage + "~" + msgStr + "}";
    
                                var deviceToken = customer.deviceToken;
    
                                if (customer.appType == 'ANDROID') {
    
                                    //ANDROID PUSH START
                                    var andPushData = {
                                        'badge': 0,
                                        'alert': pushMessage,
                                        'deviceToken': deviceToken,
                                        'pushMode': customer.pushMode,
                                        // 'dataset': dataset,
                                        'dataset': {
                                            "order_no": orderNo
                                        }
                                    }
                                    PushLib.sendPushAndroid(andPushData)
                                        .then(async function (success) { //PUSH SUCCESS
    
                                            console.log('push_success_ANDROID', success);
                                        }).catch(async function (err) { //PUSH FAILED
    
                                            console.log('push_err_ANDROID', err);
                                        });
                                    //ANDROID PUSH END
    
                                } else if (customer.appType == 'IOS') {
    
                                    //IOS PUSH START
                                    var iosPushData = {
                                        'badge': 0,
                                        'alert': pushMessage,
                                        'deviceToken': deviceToken,
                                        'pushMode': customer.pushMode,
                                        'pushTo': 'VENDOR',
                                        'dataset': {
                                            "order_no": orderNo
                                        }
                                    }
                                    //SEND PUSH TO IOS [APN]
    
                                    PushLib.sendPushIOS(iosPushData)
                                        .then(async function (success) { //PUSH SUCCESS
                                            console.log('push_success_IOS', success);
    
                                        }).catch(async function (err) { //PUSH FAILED
                                            console.log('push_err_IOS', err);
                                        });
                                    //IOS PUSH END
    
                                }

                            }
                        }
                    }



                })


        })



}