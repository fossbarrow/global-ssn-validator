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
 * Validate function for SSN which combines different checks.
 */
function ssnIsValid(value): boolean {
  let isSsnValid : boolean;
  isSsnValid = false;

  // Apply the different check functions and first start with the format check because if that fails everything else should fail too as the functions might assume a correct format
  isSsnValid = ssnIsFormatValid(value) && ssnIsDateValid(value) && ssnIsChecksumValid(value) 
  return isSsnValid;
}

/**
 * Helper function that removes all non-word characters (so digits and letters remain but e.g. '-' gets removed) in a string.
 */
function removeNonWordCharacters(stringToHandle: string): string {
  let stringWithoutNonWordCharacters: string;
  stringWithoutNonWordCharacters = stringToHandle;

  // Just get the String without non-word characters
  stringWithoutNonWordCharacters = stringWithoutNonWordCharacters.replace(/\W/g, '');
  
  return stringWithoutNonWordCharacters;
}

/** 
 * Checks if the format of the SSN is valid. 
 */
function ssnIsFormatValid(ssnToCheckFormatFor: string): boolean {
  let isValidSsnFormat : boolean;
  let ssnToCheckWithoutNonWordChars : string;

  // Remove non-word characters from the String to make it easier to test
  ssnToCheckWithoutNonWordChars = removeNonWordCharacters(ssnToCheckFormatFor);
  
  // Check if the String matches the defined pattern
  isValidSsnFormat = expression.test(ssnToCheckWithoutNonWordChars);

  // As an additional security measure try to parse the SSN without non-word characters into a number, if that fails you know that something is wrong
  return isValidSsnFormat && !isNaN( Number(ssnToCheckWithoutNonWordChars) );
}

/** 
 * Checks if the date in the SSN is valid. 
 */
function ssnIsDateValid(ssnToCheckDateFor: string): boolean {
  let dateArr, dateStr;
  let isSsnDateValid: boolean;
  isSsnDateValid = false;

  // Replace all non-word characters with '-', e.g. "1900-01-01:1234" will result in "1900-01-01-1234"
  ssnToCheckDateFor = ssnToCheckDateFor.replace(/\W/g, '-');
  
  // If the SSN is in the format 19000101-1234 (or 000101-1234) this will result in an array with two entries
  dateArr = ssnToCheckDateFor.split('-');

  // Check that it is not of the format 19000101-1234 (or 000101-1234) and includes more than one '-'
  if (dateArr.length !== 2 && ssnToCheckDateFor.includes('-')) {
    dateArr = ssnToCheckDateFor.split('-');

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
    ssnToCheckDateFor = removeNonWordCharacters(ssnToCheckDateFor);
    // Handle the digits for dates correctly by bringing them into a specific format that can later be parsed to check the date
    switch (ssnToCheckDateFor.length - 4) {
      case 6:
        //YY-MM-DD
        dateStr = `${ssnToCheckDateFor.substring(0, 2)}-${ssnToCheckDateFor.substring(2, 4)}-${ssnToCheckDateFor.substring(4, 6)}`;
        break;
        
      case 8:
        //YYYY-MM-DD
        dateStr = `${ssnToCheckDateFor.substring(0, 4)}-${ssnToCheckDateFor.substring(4, 6)}-${ssnToCheckDateFor.substring(6, 8)}`;
        break;

      default:
        //Invalid date
        return false;
        break;
    }
  }
  // Check if the date can be parsed or not to see if it is valid
  isSsnDateValid = !isNaN( Date.parse(dateStr) );

  return isSsnDateValid;
}

/**
 * Calculate checksum function for a SSN without the checksum.
 * WARNING: It assumes that the format of the SSN was checked and that the checksum digit at the end was removed before!
 * It throws an Error if the amount of digits (without non-word characters) is not 9 or 11!
 */
function ssnCalculateChecksum(ssnWithoutChecksum: string): string {
  let numberAsString: string;
  let checksum: number;

  // Just get the digits as a String
  ssnWithoutChecksum = removeNonWordCharacters(ssnWithoutChecksum)
  
  // Initialize the sum
  checksum = 0;

  switch (ssnWithoutChecksum.length) {
    case 9:
      // It already has the correct length
      break;
    case 11:
      // Cut off the first two digits as they are not used
      ssnWithoutChecksum = `${ssnWithoutChecksum.substring(2, 11)}`;
      break;
    default:
      // The format is not valid --> Throw an error
      throw new Error('Invalid Swedish Social Security Number');
      break;
  }
    
  // Calculate the checksum
  // First iterate over the digits and multiply them with 2, 1, 2, 1, 2, 1, 2, 1, 2
  for (let i = 0; i < ssnWithoutChecksum.length; i++) {
    let currentNumber = parseInt(ssnWithoutChecksum.charAt(i));
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
  return String(checksum);
}

/**
 * Checks if the given SSN has the correct checksum.
 */
function ssnIsChecksumValid(ssnToCheckChecksumFor: string): boolean {
  let extractedChecksum: string;
  let ssnWithoutChecksum: string;
  let calculatedChecksum: string;
  
  // Extract the checksum from the given SSN string
  extractedChecksum = ssnToCheckChecksumFor.substring(ssnToCheckChecksumFor.length-1, ssnToCheckChecksumFor.length);
  // Extract the SSN without the checksum from the SSN string
  ssnWithoutChecksum = ssnToCheckChecksumFor.substring(0, ssnToCheckChecksumFor.length-1);
  // Calculate the checksum
  calculatedChecksum = ssnCalculateChecksum(ssnWithoutChecksum);
  // Return the result of the comparison between calculated and extracted checksum
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
