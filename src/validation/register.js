const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
    
    let errors = {}

    // Make the name field 'empty' instead of 'null'.
    data.fullname = !isEmpty(data.fullname) ? data.fullname : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';



    if (!validator.isLength(data.fullname, { min: 2, max: 30 })) {
        errors.fullname = 'Name must be between 2 and 30 characters';
    }

    if (validator.isEmpty(data.fullname)) {
        errors.fullname = 'Name field is required';
    }

    if (!validator.isEmail(data.email)) {
        errors.email = 'Invalid Email ';
    }

    if (validator.isEmpty(data.email)) {
        errors.email = 'Email field is required';
    }

    if (!validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    if (!validator.equals(data.password, data.password2)) {
        errors.password2 = 'Password did not match';
    }

    if (validator.isEmpty(data.password2)) {
        errors.password2 = 'Confirm password field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}