data-mapper
===========

Generate county-level choropleth or bubble maps.

This is a very new project and I explect to be cleaning it up heavily over the next month or two.

## Snippets

```html
  <link href="http://kcollins.io/datamapper.js/datamapper.css" media="all" rel="stylesheet" />
  <script src="http://kcollins.io/datamapper.js/datamapper.js" type="text/javascript"></script>
```

## Usage

```js
  datamapper(mapContainer, mapType, data);
  // mapContainer is the id or class of the div you want to append everything to
  // mapType can be 'bubble' or 'choropleth'
  // data is your data, not nested
```

If you want to test it out, just paste in a CSV at <a href="kcollins.io/data-mapper/">kcollins.io</a>
