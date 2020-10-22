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

  value = value.replace(/\W/g, '-');

  if (value.includes('-')) {
    dateArr = value.split('-');

    if(dateArr.length !== 4) {
      //Invalid SSN format
      return false;
    }
    else {
      dateArr.pop();
      dateStr = (dateArr.join('-'));
    }
  }
  else {
    switch(value.length - 4) {
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

  return !isNaN( Date.parse(dateStr) ) && expression.test(value.replace(/\W/g, '')) && hasValidSsnChecksum(value) ;
}


/**
 * Calculate checksum function.
 */
function ssnCalculateChecksum(numberToCalculateChecksumFor: number): number {
  let numberAsString: string;
  let checksum: number;

  // Just get the digits as a String
  numberAsString = String(numberToCalculateChecksumFor)
  
  // Initialize the sum
  checksum = 0;

  switch(numberAsString.length) {
      case 8:
        // The leading "0" got lost so add it
        numberAsString = "0" + numberAsString;
      break;
      case 9:
        // It already has the correct length
        break;
      case 10:
        // Cut off the last digit as this might be the checksum
        numberAsString = `${numberAsString.substring(0, 9)}`;
        break;
      case 11:
        // Cut off the first two digits (and ignore the nonexisting checksum that somebody already might have removed it), so the same steps as for case "12:" below
      case 12:
        // Cut off the first two and the last digits as they are not used
        numberAsString = `${numberAsString.substring(2, 11)}`;
        break;
      default:
        // The format is not valid --> Throw an error
        throw new Error('Invalid Swedish Social Security Number');
        break;
    }
    
    // Calculate the checksum
    // First iterate over the digits and multiply them with 2, 1, 2, 1, 2, 1, 2, 1, 2
    for (let i = 0; i < numberAsString.length; i++) {
      let currentNumber = parseInt(numberAsString.charAt(i));
      // Every second digit needs to be multiplied with two
      if (i % 2 === 0) {
        currentNumber = currentNumber * 2;
      }
      // Make sure to handle the new two digit numbers, that might occur, correctly
      if (currentNumber > 9) {
        currentNumber = currentNumber - 9;
      }
      // Add the number to the temporary checksum value 
      checksum = checksum + currentNumber;
  }
  // Apply the last calculation steps
  // Get the last digit
  checksum = checksum % 10;
  
  // Check if it is zero and if yes use 0 as this is mentioned in the definition
  if (checksum === 0) {
    checksum = 0;
  } else {
    // Calculate 10 - last digit
    checksum = 10 - checksum;
  }
  return checksum;
}

/**
 * Returns only the digits as a number.
 */
function ssnExtractDigitsAsNumber(ssnToExtractDigitsFrom: string): number {
  let digitsAsString: string;
  let extractedDigitsAsNumber: number;

  // Just get the digits as a String
  digitsAsString = ssnToExtractDigitsFrom.replace(/\W/g, '');
  
  extractedDigitsAsNumber = Number(digitsAsString)
  
  return extractedDigitsAsNumber;
}

/**
 * Checks if the given SSN has the correct checksum.
 */
function hasValidSsnChecksum(ssnToCheckChecksumFor: string): boolean {
  let digitsAsString: string;
  let extractedChecksum: number;
  let calculatedChecksum: number;
  let extractedDigitsAsNumber: number;

  // Get the digits as a number
  extractedDigitsAsNumber = ssnExtractDigitsAsNumber(ssnToCheckChecksumFor);
  // Get the digits as a String
  digitsAsString = String(extractedDigitsAsNumber);
  // Extract the checksum from the string
  extractedChecksum = Number(digitsAsString.substring(digitsAsString.length-1, digitsAsString.length));
  
  // Calculate the checksum
  calculatedChecksum = ssnCalculateChecksum(extractedDigitsAsNumber);
  // Return the result of the comparison between calculated and given checksum
  return calculatedChecksum === extractedChecksum;
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