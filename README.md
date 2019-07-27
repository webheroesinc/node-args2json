
# Overview

A node module for defining JSON from a list of string inputs.  The main use case this library was
designed for is command line input, but it will work in any scenario where the input is an array of
strings.

## Installation

    npm install args2json

## Example

``` javascript
const args2json = require('args2json');

args2json([
    'something[0].id=1',
    'something[0].name="Arnold"',
    'something[1].id=2',
    'something[1].name="Dwayne"',
])
// Returns:
//
//     {
//         "something": [
//             {
//                 "id": 1,
//                 "name": "Arnold"
//             }, {
//                 "id": 2,
//                 "name": "Dwayne"
//             }
//         ]
//     }
//
```

# Similar projects 

The projects below have similar designs around JSON input/output on the command line.  However,
neither of them are modules that can be used by another program.

- `gron` - https://github.com/tomnomnom/gron
- `catj` - https://github.com/soheilpro/catj

**Gron** is the most similar to our syntax with its ability to build JSON via `ungron`, but it is
 only build for command line usage and it is written in Go.

**Catj** only implements the ability to output JSON to a `path=value` form, but not the other way.
