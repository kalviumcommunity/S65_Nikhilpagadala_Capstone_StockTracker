import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    stockSymbol: {
        type: String,
        required:true
    },
    Number: {
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
const Stock = mongoose.model('Stock', userSchema);

export default Stock;