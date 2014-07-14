Data Mapper
===========

Generate county-level choropleth or bubble maps. This is a very new project and I explect to be cleaning it up heavily over the next month or two.

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
  // data is your data, not nested
```