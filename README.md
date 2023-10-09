# Global SSN Validator

[![MIT Licensed](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

Validate and mask functionality for an Swedish Social Security Number (SSN).

**Example**

```js

ssnIsValid('1990-11-21:1234');
// => True

ssnMask('19900211-1234') // The ssn key for _day of birth_ and _gender_ is left unmasked.
// => XXXXXX11XX3X 
```

## Installation
Install the package via `npm`:

```sh
npm install @fossbarrow/swedish-ssn-validator@1.0.0 --save
```

## Usage
### `ssnIsValid(value)`
This method validates if the given value is a valid `Social Security Number`.

### Input
string matching 10 or 12 _words_ in length. Dashes and colons are ignored to the
length count.



--------------------------------------------------------------------------------

### `mask(value)`
This method will help you protect the SSN from sensitive information by obfuscating some digits.

The ssn key for _day of birth_ and _gender_ is left unmasked.

#### Example

```js
ssnMask({});
// => Throws an Error.

ssnMask('900211-1234')
// => XXXX11XX3X

ssnMask('19900211-1234')
// => XXXXXX11XX3X

ssnMask('12345678912');
// => Throws an Error.
```

--------------------------------------------------------------------------------

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Feel free to add a pull-request containing changes to the validator, making it more accurate and/or faster!

Please see [CONTRIBUTING](/CONTRIBUTING.md) for details.

## Credits

- [PatricNox](https://github.com/PatricNox)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](/LICENSE) for more information.
