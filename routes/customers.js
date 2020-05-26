'use strict';
var express = require('express');
const config = require('../config');
// const registerService = require('../services/customer/register-service');
// const customerValidator = require('../middlewares/validators/customer/customer-validator');
// const jwtTokenValidator = require('../middlewares/jwt-validation-middlewares');

var customerApi = express.Router();
customerApi.use(express.json());
customerApi.use(express.urlencoded({extended: false}));




module.exports = customerApi;