import cityModel from "../models/admin/city-model"

module.exports = {
    getAllCities : async () => {
        const cityList = cityModel.getAllCities()

        return cityList;
    },
}