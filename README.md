Leaflet Starter
=================

🔗 [Leaflet documentation](https://leafletjs.com)

This app uses [Leaflet](https://leafletjs.com) (client-side) to display a web map with Portland, Oregon neighborhood boundaries. Leaflet is a tool for displaying and loading interactive maps in the browser.

![](https://cdn.glitch.com/4e131691-974a-4b1f-95e5-47137b94043d%2FScreen%20Shot%202019-03-26%20at%2011.13.49%20AM.png?1553624048062)

## Getting started

First of all, remix this app! Remixing will create your own copy of the app that is unique to you -- any changes you make will only apply to your version. Make sure you change the description in your version so you remember what the app does when you're looking at it later.

Here are some ideas for ways to customize this app:
1. Make the popups look pretty — add some styling, change the names to title-case, etc.
2. Some Portland neighborhoods have overlapping boundaries — the dataset used in this map has these areas as separate polygons. Use styling to make it clear that these are overlap areas.
3. Add a legend to this map.
4. Change out the GeoJSON file for a file of your choosing, ideally in a different location. Think about what might be different between the two datasets. ([Data.gov](https://data.gov) is a great place to find GeoJSON data!)
5. Leaflet has some special things you can do when adding markers to a map. Add some point data and do some cool marker stuff.

## Code

### `assets`

The data for this map comes from the [City of Portland](https://gis-pdx.opendata.arcgis.com/datasets/neighborhood-boundaries-1) as a **GeoJSON** file. [GeoJSON](http://geojson.org) is a specific flavor of JSON that is used to describe geographic vector features (points, lines, and polygons). We downloaded this file and then uploaded it to the `assets` directory in our Glitch app so we can request the data with JavaScript when creating the map.

_Note: the data is in the `assets` directory because that's where files go automagically in Glitch when you add them to your project. It's also handy because the `assets` directory gives you a URL for accessing each resource, which we need later in the code!_

### `index.html`

To make the map work, we add an empty `<div>` element with `id="mapid"`. This is where the map will be added to the page.

### `style.css`

In order to make the map display, its container must be given a height. To make the map responsive to different screen sizes, we can set the `html` and `body` elements to `height: 100%` and then use a percentage value for the `#mapid` element as well.

### `script.js`

`script.js` is where we actually make the map, add layers to it, and add event handlers to make the map interactive. This code:

- makes a `L.map` object and adds it to our `mapid` `<div>`
- makes a `L.tileLayer` and adds it to the map
- adds event listeners for highlighting a feature, resetting a feature's style after highlight, and zooming to the bounds of a feature
- uses `fetch` to retrieve the data from the GeoJSON file
- makes a `L.geoJSON` data layer and adds it to the map with the data from the GeoJSON file
- sets the style for the data layer and adds popups
- attaches the event listeners to the layer

Made by [Glitch](https://glitch.com/)
-------------------

\ ゜o゜)ノ

Click `Show` in the header to see your app live. Updates to your code will instantly deploy and update live.

**Glitch** is the friendly community where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).