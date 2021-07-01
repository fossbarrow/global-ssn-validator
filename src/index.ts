"use strict";

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
 * Checks if provided Swedish SSN number is valid.
 *
 * @param {string} ssn Swedish Social Security Number.
 * @param {boolean} [debug=false] Debugger activation.
 * @param {boolean} [info=false] Checkpoint info activation.
 * @return {boolean} Returns the validity of SSN number.
 */
const ssnIsValid = (
    ssn: string,
    debug: boolean = false,
    info: boolean = false
): boolean => {
    if (!/^(\d{6}|\d{8})(-|\+)(0[1-9]|1\d|2[0-1])\d{2}$/.test(ssn))
        return false;

    // (yyMMdd | yyyyMMdd)¹ (- | +)² [00-21]³ [0-9]⁴ [0-9]⁵

    if (info) console.log("[OK] General regex test passed...");

    ssn = sanitize(ssn);

    let [registry, checksum] = divideByIndex(ssn, debug, ssn.length - 1); // Splitting into two parts in order to obtain checksum.

    checksum = parseInt(checksum);

    if (info) {
        console.log(`[Info] Registry value gathered: ${registry}`);
        console.log(`[Info] Checksum value gathered: ${checksum}`);
    }

    /** Given date from SSN number. */
    let date = new Date(
        divideByIndex(registry.slice(0, 8), debug, 4, 6).join("-")
    ); // Retrieving the date with chunking.

    if (debug) console.log(`[Debug] Date value gathered: ${date}`);

    if (isNaN(date.getTime()) || new Date().getTime() < date.getTime())
        // Checking if date is valid and not overflowed.
        return false;

    if (info) console.log("[OK] Date validation test passed...");

    /** Simple accumulator. */
    let control = 0;

    registry
        .split("")
        .slice(2) // Skipping the first two character.⁶
        .forEach((element, index) => {
            let dummy = (parseInt(element) * (index % 2 ? 1 : 2)) // Multiplying the whole ssn with 2121212121.
                .toString()
                .split("")
                .map(Number)
                .reduce((a, b) => a + b, 0); // Summing all of the digits.

            control += dummy; // Adding it to last sum.

            if (debug) {
                console.log("#########################");
                console.log(`[Debug] Element value: ${element}`);
                console.log(`[Debug] Index value: ${index}`);
                console.log(`[Debug] Dummy value: ${dummy}`);
                console.log(`[Debug] Control value: ${control}`);
            }
        });

    if (info) console.log(`[Info] Checksum created: ${10 - (control % 10)}`); // Getting the units digit and substracting it from 10.

    return 10 - (control % 10) == checksum; // Checking if checksum matches.
};

/**
 * Masks the provided Swedish SSN number.
 *
 * @param {string} ssn Swedish Social Security Number.
 * @return {any} Returns the masked version of SSN number.
 */
const ssnMask = (ssn: string): any => {
    /**
     * Masks the SSN with "X" placeholders to protect sensitive data.
     * E.g. "12345678-1234" -> "XXXXXX78XX3X ", "123456-1234" -> "XXXX56XX3X".
     * The numbers left unmasked can be used to determine the gender and day of birth.
     */

    /**
     * 1 2 3 4|5 6|- 1 2|3|4 => the length of value to be masked is 7;
     * X X X X|5 6|- X X|3|X;
     *  0 1 2 3 4 5 6 7 8 9 => [length (10) - 6] - 1 = 3
     * 1 2 3 4 5 6|7 8|- 1 2|3|4 => the length of value to be masked is 9;
     * X X X X X X|7 8|- X X|3|X;
     *  0 1 2 3 4 5 6 7 8 9 A B => [length (12) - 6] - 1 = 5
     * The spaces between the cutting point and the last point is constant, 6.
     * That's why it's fixed to 6.
     * Also for the combination of gender value, there is only 1 space to the end.
     * [length (10) - 1] - 1 = 8 or [length (12) - 1] - 1 = 10 => 9 or 11
     */

    if (!ssnIsValid(ssn)) return false;

    /** Date Index. */
    const date_index = ssn.length - 7;
    /** Gender Index. */
    const gender_index = ssn.length - 2;

    /** Parts from the chunked string. */
    const fragments = divideByIndex(
        ssn,
        false,
        date_index,
        date_index + 2,
        gender_index,
        gender_index + 1
    );
    fragments[0] = fragments[0].replace(/\d/g, "X");
    fragments[2] = fragments[2].replace(/\d/g, "X");
    fragments[4] = fragments[4].replace(/\d/g, "X");
    return fragments.join("");
};

/**
 * Sanitizes the provided Swedish SSN number to a processable form.
 *
 * @param {string} ssn Swedish Social Security Number.
 * @return {boolean} Returns the sanitized SSN number.
 */
const sanitize = (ssn: string): string => {
    /** Average of maximum human lifespan. */
    let age_threshold = 125;

    if (/-/.test(ssn)) age_threshold = 100; // Dash indicates that the user isn't older than 100.

    ssn = ssn.replace("-", "");
    ssn = ssn.replace("+", "");

    if (ssn.length === 10)
        ssn = ssn.replace(
            /^/,
            (new Date().getFullYear() - age_threshold).toString().slice(0, 2)
        );

    return ssn;
};

/**
 * Chunks the provided string from given index or indices.
 *
 * @param {string} string A string to be chunked.
 * @param {boolean} [debug=false] Debugger activation.
 * @param {number[]} index Index or indices to cut from.
 * @return {string[]} Returns the chunked parts of given string.
 */
const divideByIndex = (
    string: string,
    debug: boolean = false,
    ...index: number[]
): any[] => {
    let [indices, arr] = [[0, ...index, string.length], []];
    for (let i = 0; i < indices.length - 1; i++) {
        arr.push(string.slice(indices[i], indices[i + 1]));
    }

    if (debug) {
        console.log(`[Debug] Indices array: ${indices}`);
        console.log(`[Debug] Sliced array: ${arr}`);
    }

    return arr;
};
/**
 * Exports.
 */

console.log(ssnMask("123456-1234"));
console.log(ssnIsValid("430416+1476"));

module.exports = { ssnMask, ssnIsValid };
