import registerModel from "../../models/customer/register-model"

module.exports = {
    customerRegister: async (data) => {
        const result = await registerModel.customerRegistration(data)
        return result
    }
}