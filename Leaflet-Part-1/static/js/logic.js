// Store our API endpoint as queryUrl and tectonicplatesUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var tectonicplatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"


// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {

// Console log the data retrieved 
  console.log(data);

// Send data.features object to the createFeatures functiion
  createFeatures(data.features);
});


// Create function to return the depth of the earthquake by colour - darker colours represent greater depth of earthquake
function chooseColor(depth){
  if (depth < 10) return "yellow";
  else if (depth < 20) return "orange"
  else if (depth < 30) return "orangered";
  else if (depth < 50) return "red";
  else if (depth < 70) return "darkred";
  else if (depth < 90) return "darkblue";
  else return "black";
}


//Create earthquakeData function
function createFeatures(earthquakeData) {

//Define the Popup for each array including the location - date and time to populate as new on each opening - magnitude and depth of each earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Earthquake Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Depth: ${feature.geometry.coordinates[0]}</p><p>Magnitude: ${feature.properties.mag}</p>`);
  }

  // Create a GeoJSON layer 
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // Point to layer including feature, latitude and longitude
    pointToLayer: function(feature, latlng) {

    // Create the markers to suite the properties functions
      var markers = {
        radius: feature.properties.mag * 25000,
        fillColor: chooseColor(feature.geometry.coordinates[0]),
        fillOpacity: 1.5,
        weight: 0.5,
        color: "grey"
    }
      return L.circle(latlng, markers);
    }
  });


// Create Earthquake layer and pass to the createMaps function
  createMap(earthquakes);
}

// CreateMaps funciton
function createMap(earthquakes) {

  // Create tile layers  - Create Street Map layer - Create Sattelite Layer - Create Gray Scale Layer
   var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/outdoors-v12',
    access_token: api_key
  });


  var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/satellite-v9',
    access_token: api_key
  });
  

  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/light-v11',
    access_token: api_key
  });

   
  // Create the layer for the tectonicPlates and make the techtonicplates yellow
  tectonicPlates = new L.layerGroup();

    // Perform a GET request for the techtonicPlates
    d3.json(tectonicplatesUrl).then(function (plates) {

    // Console log the data retrieved 
        console.log(plates);
        L.geoJSON(plates, {
            color: "yellow",
            weight: 2
        }).addTo(tectonicPlates);
    });


    // Create a baseMaps object to add to myMap for selecting grayscale, streetmap or sattelite map styles
    var baseMaps = {
        
        "Grayscale": grayscale,
        "Street Map": streetmap,
        "Satellite": satellite

    };


    // Create an overlay object to add to myMap to select the earthquake and/or techtonicPaltes layers
    var overlayMaps = {

      "Tectonic Plates": tectonicPlates,
      "Earthquakes": earthquakes
        
    };
    

    // Create myMap using co-ordinates of Nepal as the central point of the map opening and presenting with the streetmap base map, earthquake and techtonicPlates layers
  var myMap = L.map("map", {
    center: [28.3949, 84.1240],
    zoom: 1.5,
    layers: [earthquakes, streetmap, tectonicPlates]
  });


  // Create and add the legend and the legends location to myMap (right of myMap)
  var legend = L.control({position: "bottomright"});
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
	depth = [-10, 10, 20, 30, 50, 70, 90];

        div.innerHTML += "<h3 style='text-align: left'>Depth</h3>"

      for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
      '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  };

	
// Add the legend to myMap on both the baseMaps and overlayMaps layers
  legend.addTo(myMap)

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
};


