const db = require('../config/db');

class ContactModel {
    /**
     * Inserts contact form details into the database.
     * @param {Object} contactData - Object containing name, email, phone, and message.
     * @returns {Promise<Object>} Insert result metadata.
     */
    static async create(contactData) {
        const { name, email, phone, message } = contactData;
        const query = 'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)';
        
        try {
            const [result] = await db.query(query, [name, email, phone, message]);
            return result;
        } catch (error) {
            console.error('Database Error in ContactModel.create:', error);
            throw error;
        }
    }
}

module.exports = ContactModel;
