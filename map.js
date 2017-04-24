function getColor(min, max, val)
{
    // code from:
    // http://stackoverflow.com/questions/36687323/generate-rainbow-colors-based-on-value
    var minHue = 240, maxHue=0;
    var curPercent = (val - min) / (max-min);
    var colString = "hsl(" + ((curPercent * (maxHue-minHue) ) + minHue) + ",100%,50%)";
    return colString;
}

function getGeoJsonMarkerOptions(param, min = 0, max = 1) {
  var color = getColor(min, max, param);
  var geojsonMarkerOptions = {
      radius: 5,
      fillColor: color,
      color: color,
      weight: 1,
      opacity: 1,
      fillOpacity: 1
  };
  return geojsonMarkerOptions;
}


function myOnEachFeatureFunction(feature, layer) {
  var popuptext = '<div>';
  popuptext += '<p>' + feature.properties.Station_ID + '</p>' ;
  popuptext += '<p>' + feature.properties.Location_Info + '</p>' ;
  popuptext += '<p>TCD tMin Mean: ' + feature.properties.tcd_tmin_mean + '</p>';
  popuptext += '<p>TCD tMin Variance: ' + feature.properties.tcd_tmin_var + '</p>';
  popuptext += '<p>TCD tMin Std Deviation: ' + feature.properties.tcd_tmin_stddev + '</p>';
  popuptext += '<p>TCD tMax Mean: ' + feature.properties.tcd_tmax_mean + '</p>';
  popuptext += '<p>TCD tMax Variance: ' + feature.properties.tcd_tmax_var + '</p>';
  popuptext += '<p>TCD tMax Std Deviation: ' + feature.properties.tcd_tmax_stddev + '</p>';

  popuptext += '</div>';
  layer.bindPopup(popuptext);
}

function addFeature(feature, latlng) {
  return L.circleMarker(latlng, geojsonMarkerOptions);
}

function getHeatMap(features, intensity) {
  var heat = [];
  for(var i =0; i < features.length; i++) {
    var point = [ 
      features[i].geometry.coordinates[1], 
      features[i].geometry.coordinates[0], 
      intensity(features[i])
    ];
    heat.push(point);
  }
  return heat;
}

/* see old_stuff/Station_ID_List_231.js
this loop was set up to add a new property called name to the features array in variable features
for(var i=0; i<names.length; i++){
//  features.features[i].properties.name = names[i];
}*/

  var minmax = {};
  for(var p in features.features[0].properties) {
    var vals = [];
    for(var i = 0; i < features.features.length; i++) {
     vals.push(features.features[i].properties[p]);
    }
    minmax[p+"_min"] = Math.min(...vals);
    minmax[p+"_max"] = Math.max(...vals);
  }

//change basemap image
//http://leaflet-extras.github.io/leaflet-providers/preview/index.html
var basemap = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});


var markers1 = L.layerGroup([ 
  L.geoJSON(features.features, {
  onEachFeature: myOnEachFeatureFunction,
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, 
      getGeoJsonMarkerOptions(feature.properties.tcd_tmin_mean, 
        minmax.tcd_tmin_mean_min, minmax.tcd_tmin_mean_max));
  }
} )
 ]);

var markers2 = L.layerGroup([ 
  L.geoJSON(features.features, {
  onEachFeature: myOnEachFeatureFunction,
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, 
      getGeoJsonMarkerOptions(feature.properties.tcd_tmin_var,
        minmax.tcd_tmin_var_min, minmax.tcd_tmin_var_max));
  }
} )
 ]);

var markers3 = L.layerGroup([ 
  L.geoJSON(features.features, {
  onEachFeature: myOnEachFeatureFunction,
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, getGeoJsonMarkerOptions(feature.properties.tcd_tmin_stddev));
  }
} )
 ]);

var markers4 = L.layerGroup([ 
  L.geoJSON(features.features, {
  onEachFeature: myOnEachFeatureFunction,
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, getGeoJsonMarkerOptions(feature.properties.tcd_tmax_mean));
  }
} )
 ]);

var markers5 = L.layerGroup([ 
  L.geoJSON(features.features, {
  onEachFeature: myOnEachFeatureFunction,
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, getGeoJsonMarkerOptions(feature.properties.tcd_tmax_var));
  }
} )
 ]);

var markers6 = L.layerGroup([ 
  L.geoJSON(features.features, {
  onEachFeature: myOnEachFeatureFunction,
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, getGeoJsonMarkerOptions(feature.properties.tcd_tmax_stddev));
  }
} )
 ]);


var map = L.map('map', {
    center: [39.8282, -98.5795],
    zoom: 3,
    layers: [basemap, markers1]
});

var basemaps = {
  "Tile Layer": basemap
};

var overlayMaps = {
  "TCD tMin Mean": markers1,
  "TCD tMin Variance": markers2,
  "TCD tMin Std. Deviation": markers3,
  "TCD tMax Mean": markers4,
  "TCD tMax Variance": markers5,
  "TCD tMax Std. Deviation": markers6,
};

L.control.layers(basemaps, overlayMaps).addTo(map);
