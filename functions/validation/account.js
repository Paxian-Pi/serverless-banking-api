const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateAccountInput(data) {
    let errors = {}

    // Make the name field 'empty' instead of 'null'.
    data.accountNumber = !isEmpty(data.accountNumber) ? data.accountNumber : '';
    data.transactionPIN = !isEmpty(data.transactionPIN) ? data.transactionPIN : '';

    if (validator.isEmpty(data.accountNumber)) {
        errors.accountNumber = 'Account number is required (this will be your phone number)';
    }
    
    if (validator.isEmpty(data.transactionPIN)) {
        errors.accountNumber = 'Please enter your transaction PIN';
    }
    
    return {
        errors,
        isValid: isEmpty(errors)
    }
}