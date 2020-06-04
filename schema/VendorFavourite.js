var mongoose = require('mongoose');

var vendorFavouriteSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true, ref : "Item" },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref : "Customer" },
}, {
    timestamps: true
});


module.exports = mongoose.model('GroceryFavoriteItem', vendorFavouriteSchema);