/**
 * Middleware to validate contact form input fields.
 */
function validateContact(req, res, next) {
    const { name, email, phone, message } = req.body;
    
    // Basic field validation
    if (!name || name.trim() === '') {
        return res.status(400).send('failed');
    }
    
    if (!email || email.trim() === '' || !email.includes('@')) {
        return res.status(400).send('failed');
    }
    
    if (!phone || phone.trim() === '') {
        return res.status(400).send('failed');
    }
    
    if (!message || message.trim() === '') {
        return res.status(400).send('failed');
    }
    
    // If validation passes, move to next handler
    next();
}

module.exports = validateContact;
