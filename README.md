# mondrian-rest-client

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
