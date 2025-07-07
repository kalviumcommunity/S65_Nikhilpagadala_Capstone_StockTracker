import Stock from '../Models/stockModel.js';

export const addingStock = async (req, res) => {
    try {
        const { stockSymbol,Number } = req.body;

        // Check for missing fields
        if (!Number) {
            console.log("Number of stocks purchased required")
            return res.status(400).json({error: '"Please provide the Number of stocks purchased."'})
        }


        // Check if that stock symbol already exists
        const existingStock = await Stock.findOne({ stockSymbol });
        if (existingStock) {
            console.log("The stock symbol already exists in the portfolio.")
            return res.status(409).json({ error: "The stock symbol already exists in the portfolio." });
        }

        // Create and save the Stock
        const  newStock = new Stock({ stockSymbol,Number });
        await newStock.save();


        // Return success response
        console.log("Stock added to portfolio")
        res.status(201).json({ message: 'Stock added to portfolio'});



    } catch (error) {
        console.error('Error adding stock:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};