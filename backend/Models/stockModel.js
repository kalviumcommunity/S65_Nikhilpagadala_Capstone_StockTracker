import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    stockSymbol: {
        type: String,
        required:true
    },
    number: {
        type: Number,
        required: true
    },
     userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
    timestamps: true,
});
const Stock = mongoose.model('Stock', stockSchema);

export default Stock;