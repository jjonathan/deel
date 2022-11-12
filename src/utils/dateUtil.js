
const validateDateFormat = (date) => {
    const userKeyRegExp = /^[0-9]{8}/;
    return userKeyRegExp.test(date);
}
module.exports = { validateDateFormat }