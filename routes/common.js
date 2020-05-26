'use strict';
import express from "express"
import commonService from "../services/common-service"

let commonAPI = express.Router()
commonAPI.use(express.json());
commonAPI.use(express.urlencoded({extended: false}));

commonAPI.get('/getAllCities', async (req, res) => {
    let getAllCities = await commonService.getAllCities()
    res.status(200).send(getAllCities);
})

module.exports = commonAPI