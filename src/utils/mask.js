const padStart = require('string.prototype.padstart');
export const maskNumber = (number) => {
	number = padStart(String(number).slice(-4), String(number).length, '*');
	return number.slice(-4).padStart(number.length, '*');
};
