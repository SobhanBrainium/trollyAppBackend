var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref : "Category" },
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref : "Vendor" },
    description: { type: String, allow: '' },
    price: { type: Number, required: true },
    unit : { type : String, default : "KG"},
    menuImage: { type: String, allow: ''},
    isActive: { type: Boolean, default: false },
    offerId : {type : mongoose.Schema.Types.ObjectId, default : null, ref : 'PromoCode'}
}, {
    timestamps: true
});


// Getter
itemSchema.path('price').get(function(num) {
   var originalNum =  num.toFixed(2);

   return parseFloat(originalNum);
  });
  
  // Setter
  itemSchema.path('price').set(function(num) {
    return num;
  });

module.exports = mongoose.model('Item', itemSchema);