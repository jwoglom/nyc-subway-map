
function isPoly(l) {
    return l.feature &&
        l.feature.geometry &&
        l.feature.geometry.type &&
        ['Polygon', 'MultiPolygon', 'MultiLineString'].indexOf(l.feature.geometry.type) !== -1;
}

// function pointInPolygon(point, polygon) {
//     var x = point.coordinates[1],
//         y = point.coordinates[0],
//         poly = polygon.coordinates[0]; //TODO: support polygons with holes
//     for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
//         var px = poly[i][1],
//             py = poly[i][0],
//             jx = poly[j][1],
//             jy = poly[j][0];
//         if (((py <= y && y < jy) || (jy <= y && y < py)) && (x < (jx - px) * (y - py) / (jy - py) + px)) {
//             //c = !c; //[point]; // <== THE PROBLEM WAS HERE. "c" MUST BE NEGATED ACCORDING TO JORDAN ALGORITHM INSTEAD OF ASSIGNED TO COORDINATE
//           c = [point];
//         }
//     }
//     return c;
// }

/* global gju */
let pointInPolygon = gju.pointInPolygon;

function updateGeometry(geometry) {
  let pad = 0.000001;
  for (var i=0; i<geometry.coordinates.length; i++) {
    let len = geometry.coordinates[i].length;
    for (var j=len-1; j>=0; j--) {
      geometry.coordinates[i].push([
        geometry.coordinates[i][j][0] + pad,
        geometry.coordinates[i][j][1] + pad
      ]);
    }
    for (var j=0; j<len; j++) {
      geometry.coordinates[i][j][0] -= pad;
      geometry.coordinates[i][j][1] -= pad;
    }
  }
  return geometry;
}

var leafletPip = {
  bassackwards: false,
  pointInLayer: function(p, layer, first) {
    if (typeof p.lat === 'number') p = [p.lng, p.lat];
    else if (leafletPip.bassackwards) p = p.concat().reverse();

    var results = [];

    layer.eachLayer(function(l) {

      if (l.feature &&
          l.feature.geometry &&
          l.feature.geometry.type &&
          ['GeometryCollection'].indexOf(l.feature.geometry.type) !== -1) {
        for (var i=0;i<l.feature.geometry.geometries.length;i++) {
          var geometry=l.feature.geometry.geometries[i];
          if (first && results.length) return;
          if (['Polygon', 'MultiPolygon'].indexOf(geometry.type) !== -1 && pointInPolygon({
                type: 'Point',
                coordinates: p
              }, geometry)) {
            results.push(geometry);
          }
        }
      } else {
        if (first && results.length) return;
        if (isPoly(l) && pointInPolygon({
              type: 'Point',
              coordinates: p
            }, updateGeometry(l.toGeoJSON().geometry))) {
          //results.push(l.toGeoJSON().geometry);
          results.push(l.feature.properties);
        }

      }
    });
    return results;
    }
  };