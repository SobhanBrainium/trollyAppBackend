import express from "express"
import registerService from "../services/customer/register-service"
import customerValidator from "../middlewares/validators/customer/customer-validator"
import jwtTokenValidator from "../middlewares/jwt-validation-middlewares"

var customerApi = express.Router();
customerApi.use(express.json());
customerApi.use(express.urlencoded({extended: false}));

/** Customer registration */
customerApi.post('/register', customerValidator.customerRegister, async (req, res) => {
    let registrationObject = await registerService.customerRegister(req.body)
    res.status(200).send(registrationObject);
});


module.exports = customerApi;