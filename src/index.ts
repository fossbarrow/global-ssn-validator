'use strict';

/**
 * Social Security number (SSN) is a 4-digit number following the date of birth 
 * in the format: YYYYMMDD-XXXX issued to Swedish citizens, permanent residents 
 * and/or individuals with educational registration.
 * 
 * The format length can either be 12 (full year) or 10 (short year) digits long.
 * E.g. 19900211-1234 (12) or instead 900211-1234 (10).
 *
 * See following link for more information.
 * https://www.skatteverket.se/servicelankar/otherlanguages/inenglish/individualsandemployees/movingtosweden/citizenofeueeacountry/youarestudying/youaremovingbyyourself.4.3810a01c150939e893f4157.html
 */

/**
 * Regular expression to match dates after 1800 and include possibility to be
 * over 100 years old. 
 */
const expression = /^(19|20)?(\d{6}\d{4}|(?!19|20)\d{10})$/;

/**
 * Validate function.
 */
function ssnIsValid(value) {
  let dateArr, dateStr;
  let isSsnDateValid: boolean;
  isSsnDateValid = false;

  // Replace all non-word characters with '-', e.g. "1900-01-01:1234" will result in "1900-01-01-1234"
  value = value.replace(/\W/g, '-');
  
  // If the SSN is in the format 19000101-1234 (or 000101-1234) this will result in an array with two entries
  dateArr = value.split('-');

  // Check that it is not of the format 19000101-1234 (or 000101-1234) and includes more than one '-'
  if (dateArr.length !== 2 && value.includes('-')) {
    dateArr = value.split('-');

    if (dateArr.length !== 4) {
      //Invalid SSN format
      return false;
    }
    else {
      dateArr.pop();
      dateStr = (dateArr.join('-'));
    }
  }
  else {
    // Make sure that the SSN in the format 19000101-1234 (or 000101-1234) can be handled by removing the '-'
    value = value.replace(/\W/g, '');
    // Handle the digits for dates correctly by bringing them into a specific format that can later be parsed to check the date
    switch (value.length - 4) {
      case 6:
        //YY-MM-DD
        dateStr = `${value.substring(0, 2)}-${value.substring(2, 4)}-${value.substring(4, 6)}`;
        break;
        
      case 8:
        //YYYY-MM-DD
        dateStr = `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`;
        break;

      default:
        //Invalid date
        return false;
        break;
    }
  }
  // Check if the date can be parsed or not to see if it is valid
  isSsnDateValid = !isNaN( Date.parse(dateStr) );

  return isSsnDateValid && expression.test(value.replace(/\W/g, ''));
}

/**
 * Mask the SSN with "X" placeholders to protect sensitive data.
 * E.g. "12345678-1234" -> "XXXXXX78XX3X ", "123456-1234" -> "XXXX56XX3X".
 * The numbers left unmasked can be used to determine the gender and day of birth.
 */
function ssnMask(value) {
  if (!ssnIsValid(value)) {
    throw new Error('Invalid Swedish Social Security Number');
  }
  
  value = value.replace(/\W/g, '');

  switch (value.length) {
    case 12:
      // YYYY-MM-DD:NNNN
      return value.substr(0, 6).replace(/[\w]/g, 'X') + value.substr(6, 2) + value.substr(10, 10).replace(/[\w]/g, 'X') + value.substr(10, 1) + 'X';
    case 10:
      // YY-MM-DD:NNNN
      return value.substr(0, 4).replace(/[\w]/g, 'X') + value.substr(4, 2) + value.substr(8, 8).replace(/[\w]/g, 'X') + value.substr(8, 1) + 'X';
    default:
      throw new Error('Invalid Swedish Social Security Number');
  }
}

/**
 * Exports.
 */
module.exports = { ssnMask, ssnIsValid };
