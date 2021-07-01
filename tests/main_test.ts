import { expect } from "chai";
import { SSN } from "../src/index";

const data: Array<any> = [
    ["SE", "900211-1234", false],
    ["SE", "670919-9530", false], // county check
    ["SE", "670919-9534", false], // checksum
    ["SE", "67019-9530", false], // date string
    ["SE", "000919-9530", false], // date validity
    ["SE", "19900211-1234", false], // 12 digit
    ["SE", "20470705-0573", false], // 12 digit
    ["SE", "430416+1476", true], // older than 100
    ["SE", "", false], // type check
    ["SE", 12341231, false], // type check
];

for (let datum of data) {
    const ssn = new SSN(datum[0]);
    const dummy = ssn.validate(datum[1]);
    console.log(datum[1], expect(dummy).to.equal(datum[2]));
}

const ssn = new SSN("SE");
console.log(ssn.mask("123456-1234"));
console.log(ssn.validate("430416+1476"));
