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



export const gettingStocks = async (req, res) => {
    try {
        const stocks = await Stock.find();

        // If no stocks are found, return an empty array (not an error)
        if (!stocks || stocks.length === 0) {
            console.log('No stocks found in the portfolio.');
            return res.status(200).json({ message: 'No stocks in the portfolio yet.', stocks: [] });
        }

        // Return the list of stocks
        res.status(200).json({ message: 'Stocks retrieved successfully.', stocks });

    } catch (error) {
        console.error('Error while retrieving stocks:', error.message);

        // Send error response to client
        res.status(500).json({ error: 'Something went wrong while fetching the stocks. Please try again later.' });
    }
};
