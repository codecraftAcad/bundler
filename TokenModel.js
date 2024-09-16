const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ticker: {
    type: String,
    required: true,
    uppercase: true, // Ensures that ticker symbols are stored in uppercase
  },
  totalSupply: {
    type: Number,
    required: true,
  },
  contractAddress: {
    type: String,
    required: true,
    unique: true, // Ensures that the contract address is unique
  },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
