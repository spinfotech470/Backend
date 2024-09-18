const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile:{type: String},
  message: { type: String },
}, { timestamps: true });


module.exports = mongoose.model('ContactUs', contactUsSchema);
