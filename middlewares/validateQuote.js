function validateQuote(req, res, next) {
    const { service, date, time, name, email, phone } = req.body;

    if (!service || service.trim() === '' || service === 'Select Service') {
        return res.status(400).send('failed');
    }

    if (!date || date.trim() === '' || date === 'Select Date') {
        return res.status(400).send('failed');
    }

    if (!time || time.trim() === '' || time === 'Select Time') {
        return res.status(400).send('failed');
    }

    if (!name || name.trim() === '') {
        return res.status(400).send('failed');
    }

    if (!email || email.trim() === '' || !email.includes('@')) {
        return res.status(400).send('failed');
    }

    if (!phone || phone.trim() === '') {
        return res.status(400).send('failed');
    }

    next();
}

module.exports = validateQuote;
