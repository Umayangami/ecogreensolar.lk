const QuoteModel = require('../models/quoteModel');

class QuoteController {
    static showQuotePage(req, res) {
        res.render('get-a-quote', {
            title: 'ECO GREEN ENERGY SOLUTION (PVT) LTD - Get a Quote'
        });
    }

    static async submitForm(req, res) {
        try {
            await QuoteModel.create(req.body);
            res.send('sent');
        } catch (error) {
            console.error('Error handling quote form submission:', error);
            res.status(500).send('failed');
        }
    }
}

module.exports = QuoteController;
