// let the editor know that `L` is defined by some code
// included in another file (in this case, `index.html`)
// Note: the code will still work without this line, but without it you
// will see an error in the editor
/* global L */
/* global leafletPip */
/* global jsts */

/* MAP SETUP
*/

let SUBWAY_STATIONS = "https://cdn.glitch.com/1030e7bb-9139-4731-ba93-6d376b180bbd%2Fsubway-stations.geojson?v=1616964201169";
let SUBWAY_ENTRANCES = "https://cdn.glitch.com/1030e7bb-9139-4731-ba93-6d376b180bbd%2Fsubway-entrances.geojson?v=1616966085398";
let SUBWAY_ROUTES = "https://cdn.glitch.com/1030e7bb-9139-4731-ba93-6d376b180bbd%2Fsubway-routes.geojson?v=1616964313747";


// make the map
let map = L.map("mapid", {
  center: [40.7451814, -73.98749], // latitude, longitude in decimal degrees (find it on Google Maps with a right click!)
  zoom: 15, // can be 0-22, higher is closer
  scrollWheelZoom: true // don't zoom the map on scroll
});
// add the basemap tiles
L.tileLayer(
  "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}@2x.png" // stamen toner tiles
).addTo(map);

// Add leaflet-control-geocoder
//L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//  attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
//}).addTo(map);
L.Control.geocoder({
  defaultMarkGeocode: true
}).addTo(map);





var linesLayer;
var linesData;
var allRouteIds = [];
function addLines(lines) {
   linesData = lines;
   linesLayer = new L.geoJson(lines, {
     opacity: 0.5,
     onEachFeature: function(feature, layer) {
       var l = layer.bindPopup(buildLinePopup(feature));
       l.getPopup().on('add', function() {
         onLinePopupOpen(feature);
       });
       l.getPopup().on('remove', function() {
         onLinePopupClose(feature);
       });
       return l;
     }
   }).addTo(map);
  
  // linesLayer.on('click', function (e) {
  //   processClick(linesLayer, e.latlng.lat, e.latlng.lng)
  // });

    // Props to https://chriswhong.com/local/a-chrome-extension-to-inject-nyc-subway-data-into-streeteasy-com/
    //set the colors for each line based on the route_id property
    linesLayer.setStyle(function(feature){
        switch (feature.properties.route_id) {
            case "1": return {color: "#EE352E"};
            case "2": return {color: "#EE352E"};
            case "3": return {color: "#EE352E"};
            case "4": return {color: "#00933C"};
            case "5": return {color: "#00933C"};
            case "6": return {color: "#00933C"};
            case "B": return {color: "#FF6319"};
            case "D": return {color: "#FF6319"};
            case "F": return {color: "#FF6319"};
            case "M": return {color: "#FF6319"};
            case "A": return {color: "#2850AD"};
            case "C": return {color: "#2850AD"};
            case "E": return {color: "#2850AD"};
            case "G": return {color: "#6CBE45"};
            case "J": return {color: "#996633"};
            case "Z": return {color: "#996633"};
            case "L": return {color: "#A7A9AC"};
            case "N": return {color: "#FCCC0A"};
            case "Q": return {color: "#FCCC0A"};
            case "R": return {color: "#FCCC0A"};
            case "S": return {color: "#808183"};
            case "FS": return {color: "#808183"};
            case "7": return {color: "#A7A9AC"};
        }
    });
}

function genPolygonCoords(feature) {
  var toJson = feature.toGeoJSON();
  console.info("genPolygon", toJson);
  
  var reader = new jsts.io.GeoJSONReader();
  
  var map = {};
  for (var i=0; i<toJson.features.length; i++) {
      var feature = toJson.features[i];
      var input = reader.read(feature.geometry);
      //pathCoords should be an array of jsts.geom.Coordinate
      // var pathCoords = [];
      var geometryFactory = new jsts.geom.GeometryFactory();

      // on what distance new polygon should be built
      var distance = (10 * 0.0001) / 111.12;

      var shell = geometryFactory.createLineString(input.getCoordinates());
      console.info("shell", shell);
  
      // building a new polygon
      var polygon = shell.buffer(distance);

      // finally get your new polygon coordinates
      var polygonCoords = polygon.getCoordinates();
      console.log("polygonCoords", polygonCoords);
    
      map[JSON.stringify(toJson.properties)] = polygonCoords;
  }
  
  return map; 
}


function getLinesFromSegment(feature) {
  let line = feature["properties"]["Line"];
  let div = feature["properties"]["Division"];
  let matchingSegments = linesData["features"].filter(i => i["properties"]["Line"] == line && i["properties"]["Division"] == div);
  return matchingSegments.map(i => i["properties"]["route_id"]).join("-");
}

function buildLinePopup(feature) {
  
  return "<b class='tt-header'>" +
         feature["properties"]["Line"] +
         " (" + feature["properties"]["Division"] + ")" +
         "</b><br />" +
         buildLinesHtml(getLinesFromSegment(feature))
}

function parseFeatureData(feature) {
  var t = document.createElement("div");
  t.innerHTML = feature["properties"]["description"];
  
  var data = {};
  var n = t.querySelectorAll(".atr-name");
  var v = t.querySelectorAll(".atr-value");
  for (var i=0; i<v.length; i++) {
    data[n[i].innerHTML] = v[i].innerHTML;
  }
  
  return data;
}

function buildStopPopup(feature, withLink) {
  var data = parseFeatureData(feature);
  
  return "<b class='tt-header'>" +
         (withLink ? "<a href='" + data["URL"] + "' target=_blank>" : "") +
         data["NAME"] +
         (withLink ? "</a>" : "") +
         "</b><br />" +
         buildLinesHtml(data["LINE"]);
}

function buildStopClassName(feature) {
  var cls = "stop-marker";
  var data = parseFeatureData(feature);
  var lines = getStopLineNames(data["LINE"]);
  for (var i=0; i<lines.length; i++) {
    cls += " line-" + lines[i];
  }
  return cls;
}

function getStopLineNames(line) {
  var ret = [];
  var lines = line.split("-");
  for (var i=0; i<lines.length; i++) {
    let l = lines[i].replace(" Express", "X");
    ret.push(l);
  }
  return ret;
}

function buildLinesHtml(line, disableAuto) {
  var urlBase = "https://new.mta.info/themes/custom/bootstrap_mta/images/icons/";
  var lines = getStopLineNames(line);
  var str = "<span style='white-space: nowrap; display: table-cell; vertical-align: middle'>";
  var onclick = "";
  if (disableAuto === true) {
    onclick = "disableAutoFilter()"
  }
  for (var i=0; i<lines.length; i++) {
    let l = lines[i];
    str += "<img src='" + urlBase + l + ".svg' class='line-img line-" + l + "' style='cursor: pointer' onclick='clickLine(\"" + l + "\");" + onclick + "' width=20 valign=center />&nbsp;";
  }
  return str + "</span>";
}

var selectedLines = [];
function clickLine(line, open) {
  var sls = document.querySelector("#selected-line-style");
  if (selectedLines.indexOf(line) != -1) {
    if (open === false || typeof open == 'undefined') {
      selectedLines = selectedLines.filter(i => i != line);
    }
  } else if (selectedLines.indexOf(line) == -1) {
    if (open === true || typeof open == 'undefined') {
      selectedLines.push(line);
    }
  }
  
  var notLines = "";
  for (var i=0; i<selectedLines.length; i++) {
    notLines += ":not(.line-"+selectedLines[i]+")"; 
  }
  
  if (notLines.length > 0) {
    // Highlight line image and stop markers
    sls.innerHTML = ".line-img" + notLines + " { opacity: 0.5 }\n" +
                    ".stop-marker" + notLines + " { opacity: 0.5 }";
  } else {
    sls.innerHTML = "";
  }
  updateSelectedLine();
}

function updateSelectedLine() {
  linesLayer.setStyle(function(feature){
        if (selectedLines.length == 0) {
          return {opacity: 0.5, weight: 3}
        } else if (selectedLines.indexOf(feature.properties.route_id) != -1) {
          return {opacity: 1, weight: 8}
        } else {
          return {opacity: 0.25, weight: 3}
        }
  });
}

function autoFilterEnabled() {
  return document.querySelector("#auto-filter").checked;
}

function disableAutoFilter() {
  document.querySelector("#auto-filter").checked = false;
}

function onStopPopupOpen(feature) {
  if (autoFilterEnabled()) {
    var data = parseFeatureData(feature);
    console.log("onStopPopupOpen", data);
    getStopLineNames(data["LINE"]).forEach(l => clickLine(l, true));
  }
}

function onStopPopupClose(feature) {
  if (autoFilterEnabled()) {
    var data = parseFeatureData(feature);
    console.log("onStopPopupClose", data);
    getStopLineNames(data["LINE"]).forEach(l => clickLine(l, false));
  }
}

function onLinePopupOpen(feature) {
  if (autoFilterEnabled()) {
    console.log(feature);
    let lines = getLinesFromSegment(feature);
    console.log("onLinePopupOpen", lines);
    getStopLineNames(lines).forEach(l => clickLine(l, true));
  }
}

function onLinePopupClose(feature) {
  if (autoFilterEnabled()) {
    console.log(feature)
    let lines = getLinesFromSegment(feature);
    console.log("onLinePopupClose", lines);
    getStopLineNames(lines).forEach(l => clickLine(l, false));
  }
}

function addStops(stops) {
    var stopsLayer = new L.geoJson(stops, {                
        pointToLayer: function (feature, latlng) {                    
            var m = new L.CircleMarker(latlng, {
                radius: 5,
                fillColor: "#FFFFFF",
                color: "#000",
                weight: 3,
                opacity: 1,
                fillOpacity: 1,
                className: buildStopClassName(feature)
            }).bindPopup(buildStopPopup(feature, true));
          
            m.getPopup().on('add', function() {
              onStopPopupOpen(feature);
            });
            m.getPopup().on('remove', function() {
              onStopPopupClose(feature);
            });
            return m;
          // return new L.marker(latlng, {
          //   icon: new L.icon({
          //     iconUrl: 'https://new.mta.info/themes/custom/bootstrap_mta/images/icons/1.svg',
          //     iconSize: [15, 15]
          //   })
          // })
        }
    }).addTo(map);
  
  
  map.on('zoomend', function() {
    console.log('zoom: ' + map.getZoom());
    var radius, weight;
    if (map.getZoom() >= 17) {
      radius = 6;
      weight = 4;
    } else if (map.getZoom() >= 15) {
      radius = 5;
      weight = 3;
    } else if (map.getZoom() == 14) {
      radius = 4;
      weight = 2;
    } else if (map.getZoom() <= 13) {
      radius = 3;
      weight = 1;
    }
    stopsLayer.setStyle(function(feature) {
      return {radius: radius, weight: weight};
    });
  });
}

function addEntrances(entrances) {
    var entrancesLayer = new L.geoJson(entrances, {                
        pointToLayer: function (feature, latlng) {                    
            return new L.CircleMarker(latlng, {
                radius: 2,
                fillColor: "#FFFFFF",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            }).bindPopup(buildStopPopup(feature, false));
        }
    });
  var enabledZoom = 15;
  if (map.getZoom() >= enabledZoom) {
    entrancesLayer.addTo(map);
  }
  
  map.on('zoomend', function() {
    console.log('zoom: ' + map.getZoom());
    if (map.getZoom() >= enabledZoom && !map.hasLayer(entrancesLayer)) {
      map.addLayer(entrancesLayer);
    } else if (map.getZoom() < enabledZoom && map.hasLayer(entrancesLayer)) {
      map.removeLayer(entrancesLayer);
    }
    
    if (map.getZoom() >= enabledZoom) {
      var radius, weight;
      if (map.getZoom() >= 17) {
        radius = 4;
        weight = 2;
      } else if (map.getZoom() >= 16) {
        radius = 3;
        weight = 1;
      } else {
        radius = 2;
        weight = 1;
      }
      entrancesLayer.setStyle(function(feature) {
        return {radius: radius, weight: weight};
      });
    }
    
  });
}

function fetchStops(cb) {
    fetch(SUBWAY_STATIONS)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      // this is where we do things with data
      addStops(json);
      cb && cb();
    });
}

function fetchLines(cb) {
  fetch(SUBWAY_ROUTES)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      // this is where we do things with data
      addLines(json);
      cb && cb();
    });
}
function fetchEntrances(cb) {
  fetch(SUBWAY_ENTRANCES)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      // this is where we do things with data
      addEntrances(json);
      cb && cb();
    });
}

fetchLines(function() {
  fetchStops(function() {
    fetchEntrances();
  });
})

function initLinesList() {
  var allLines = "1-2-3-4-5-6-B-D-F-M-A-C-E-G-J-Z-L-N-Q-R-S-FS-7";
  document.querySelector("#lines-list").innerHTML = buildLinesHtml(allLines, true);
}
initLinesList();




/* EVENT HANDLERS
   Event handlers are functions that respond to events on the page. These are
   defined first so they can each be attached to the data layer and triggered on
   specific events.
*/

let geojson; // this is global because of resetHighlight

// // change style
// function highlightFeature(e) {
//   let layer = e.target; // highlight the actual feature that should be highlighted
//   layer.setStyle({
//     weight: 3, // thicker border
//     color: "#000", // black
//     fillOpacity: 0.3 // a bit transparent
//   });
// }

// // reset to normal style
// function resetHighlight(e) {
//   geojson.resetStyle(e.target);
// }

// // zoom to feature (a.k.a. fit the bounds of the map to the bounds of the feature
// function zoomToFeature(e) {
//   map.fitBounds(e.target.getBounds());
// }

// // attach the event handlers to events
// function onEachFeature(feature, layer) {
//   layer.on({
//     mouseover: highlightFeature, // a.k.a. hover
//     mouseout: resetHighlight, // a.k.a. no longer hovering
//     click: zoomToFeature // a.k.a. clicking
//   });
// }

/* GET DATA
   Because the data is in a different file, it must be retrieved asynchronously. This ensures that all of
   the data has been loaded before trying to use it (in this case, add it to the map). Read more about Fetch:
   https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
*/

// // Subway stations
// fetch(
//   SUBWAY_STATIONS
// )
//   .then(function(response) {
//     return response.json();
//   })
//   .then(function(json) {
//     // this is where we do things with data
//     doThingsWithData(json);
//   });

// // once the data is loaded, this function takes over
// function doThingsWithData(json) {
//   // assign colors to each "COALIT" (a.k.a. neighborhood coalition)
//   let colorObj = assignColors(json);
//   // add the data to the map
//   geojson = L.geoJSON(json, {
//     // both `style` and `onEachFeature` want a function as a value
//     // the function for `style` is defined inline (a.k.a. an "anonymous function")
//     // the function for `onEachFeature` is defined earlier in the file
//     // so we just set the value to the function name
//     style: function(feature) {
//       return {
//         color: colorObj, // set color based on colorObj
//         weight: 1.7, // thickness of the border
//         fillOpacity: 0.2 // opacity of the fill
//       };
//     },
//     onEachFeature: onEachFeature // call onEachFeature
//   })
//     .bindPopup(function(layer) {
//       return layer.feature.properties.NAME; // use the NAME property as the popup value
//     })
//     .addTo(map); // add it to the map
// }

// // create an object where each unique value in prop is a key and
// // each key has a color as its value
// function assignColors(json, prop) {
//   // from ColorBrewer http://colorbrewer2.org
//   return "blue";
// }
