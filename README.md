Data Mapper
===========

Generate county-level choropleth or bubble maps. This is a very new project and I explect to be cleaning it up heavily over the next month or two.

As long as your data has a 'fips' field, Data Mapper will make you a map. Your data can also include an optional 'sequence' field, which can be a date, year, day of the week, or any category that you may want to group your data by. Data Mapper will assume any field not named 'fips' or 'sequence' is something you want to map.

Demo at <a href="//kcollins.io/data-mapper/demo.html">kcollins.io/data-mapper/demo.html</a>

Or just paste in a CSV at <a href="//kcollins.io/data-mapper/">kcollins.io/data-mapper/</a>

## Snippets

```html
  <link href="http://kcollins.io/data-mapper/datamapper.css" media="all" rel="stylesheet" />
  <script src="http://kcollins.io/data-mapper/datamapper.js" type="text/javascript"></script>
```

## Usage

Data Mapper requires <a href="https://github.com/mbostock/d3">d3.js</a>, <a href="https://github.com/mbostock/topojson">topojson</a>, and <a href="https://github.com/mbostock/queue">queue</a>

```js
  datamapper(mapContainer, mapType, data);
  // mapContainer is the id or class of the div you want to append everything to
  // mapType can be 'bubble' or 'choropleth'
  // data is your data, not nested, must include a 'fips field'
```

