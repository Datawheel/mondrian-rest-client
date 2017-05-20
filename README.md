# mondrian-rest-client

A javascript client for [mondrian-rest](https://github.com/jazzido/mondrian-rest).

## Example usage

``` javascript
let client = new Client('http://chilecube.datawheel.us');
client.cube('tax_data')
  .then(cube => client.query(cube.query
                                 .drilldown('ISICrev4', 'Level 1')
                                 .drilldown('Date', 'Year')
                                 .measure('Output')))
  .then(data => {
    // ...
  });

```

## Installation

`modnrian-rest-client` is not in NPM yet, install from GitHub or build it yourself.

## Building

```
yarn run build:tsc && yarn run build:webpack`
```

## License

The MIT License (MIT)

Copyright (c) 2017 Datawheel, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
