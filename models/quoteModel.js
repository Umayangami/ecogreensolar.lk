const db = require('../config/db');

class QuoteModel {
    static async create(quoteData) {
        const { service, date, time, name, email, phone, message } = quoteData;
        const query = `
            INSERT INTO quote_requests (service, preferred_date, preferred_time, name, email, phone, message)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            service,
            date || null,
            time || null,
            name,
            email,
            phone,
            message || null
        ]);

        return result;
    }
}

module.exports = QuoteModel;
