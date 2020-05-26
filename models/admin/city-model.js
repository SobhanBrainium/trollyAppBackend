// var async = require('async');
const citySchema = require('../../schema/City');

module.exports = {
    addCity: (data, callBack) => {
        if (data) {
            async.waterfall([
                function (nextCb) {
                    /** Check state is already exists or not */
                    citySchema.countDocuments({ stateId: data.stateId, name: data.name }, function (err, count) {
                        if (err) {
                            nextCb(null, {
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error',
                                response_data: {}
                            });
                        }
                        if (count) {
                            nextCb(null, {
                                success: false,
                                STATUSCODE: 422,
                                message: 'City already exists for the state',
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
                    })
                },
                function (arg1, nextCb) {
                    if (arg1.STATUSCODE === 200) {
                        new citySchema(data).save(function (err, result) {
                            if (err) {
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                nextCb(null, {
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'City added successfully',
                                    response_data: result
                                })
                            }
                        })
                    } else {
                        nextCb(null, arg1);
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

    getAllCities: async () => {
        let lists = await citySchema.find({isActive : true}, {name : 1, _id : 1, stateId : 1})
        .sort('name')

        if(lists.length > 0){
            return{
                success: true,
                STATUSCODE: 200,
                message: 'City fetched successfully',
                response_data: lists
            }
        }else{
            return{
                success: true,
                STATUSCODE: 200,
                message: 'No record found',
                response_data: []
            }
        }
    },

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}