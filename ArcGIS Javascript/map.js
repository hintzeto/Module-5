require([
    "esri/config", 
    "esri/Map", 
    "esri/views/MapView",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/layers/FeatureLayer",
    "esri/widgets/Locate",
    "esri/widgets/Search",
    "esri/widgets/Legend",
    "esri/symbols/SimpleMarkerSymbol"
], function(esriConfig, Map, MapView, GraphicsLayer, Graphic, FeatureLayer, Locate, Search, Legend, SimpleMarkerSymbol) {

    var myMap = new Map({
        basemap: "hybrid"
    });

    var myView = new MapView({
        container: "viewDiv",
        map: myMap,
        zoom: 5,
        center: [-114.742, 44.068]
    });

    var graphicsLayer = new GraphicsLayer();
    myMap.add(graphicsLayer);

    // Function to replace null values with "N/A"
    function checkNull(value) {
        return value === null || value === undefined || value === "" ? "N/A" : value;
    }

    // Function to add features to the graphics layer
    function addFeatures(data, markerSymbol, popupTemplate, siteNameField) {
        for (var feature of data.features) {
            var siteName = feature.properties[siteNameField];

            // Filter for site subtype and non-null/non-blank site name
            if (siteName) {
                var location = {
                    type: "point",
                    longitude: feature.geometry.coordinates[0],
                    latitude: feature.geometry.coordinates[1]
                };

                var popup_attributes = feature.properties;

                var graphic = new Graphic({
                    geometry: location,
                    symbol: markerSymbol,
                    attributes: popup_attributes,
                    popupTemplate: popupTemplate
                });
                graphicsLayer.add(graphic);
            }
        }
    }

    // USFS Data
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);

            var markerSymbol1 = new SimpleMarkerSymbol({
                color: "blue", // Fill color
                size: 5, // Size in points
                outline: { // Outline properties
                    color: "white",
                    width: 0.5
                },
                style: "circle" // Options: "circle", "square", "cross", "x", "diamond", "triangle"
            });

            var popupTemplate1 = {
                title: "Site Information",
                content: `<b>Site Name</b>: ${checkNull('{PUBLIC_SITE_NAME}')} <br> 
                          <b>Subtype</b>: ${checkNull('{SITE_SUBTYPE}')} <br> 
                          <b>State</b>: ${checkNull('{ADDRESS_STATE}')} <br>
                          <b>Recreation Information</b>: ${checkNull('{RECAREA_DESCRIPTION}')} <br>
                          <b>Water</b>: ${checkNull('{WATER_AVAILABILITY}')} <br>
                          <b>Activity Types</b>: ${checkNull('{ACTIVITY_TYPES}')} <br>`
            };

            addFeatures(data, markerSymbol1, popupTemplate1, "PUBLIC_SITE_NAME");
        }
    };

    xmlhttp.open("GET", "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_InfraRecreationSites_01/MapServer/0/query?outFields=*&where=1%3D1&f=geojson", true);
    xmlhttp.send();

    // // data.gov data
    var xmlhttp2 = new XMLHttpRequest();
    xmlhttp2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);

            var markerSymbol2 = new SimpleMarkerSymbol({
                color: "red", // Fill color
                size: 4, // Size in points
                outline: { // Outline properties
                    color: "black",
                    width: 1
                },
                style: "diamond" // Options: "circle", "square", "cross", "x", "diamond", "triangle"
            });

            var popupTemplate2 = {
                title: "Additional Site Information",
                content: `<b>Site</b>: ${checkNull('{FET_NAME}')} <br> 
                          <b>Description</b>: ${checkNull('{DESCRIPTION}')} <br> 
                          <b>Picture</b>: ${checkNull('{PHOTO_THUMB}')}`
            };

            addFeatures(data, markerSymbol2, popupTemplate2, "FET_NAME");
        }
    };

    xmlhttp2.open("GET", "https://services1.arcgis.com/KbxwQRRfWyEYLgp4/arcgis/rest/services/BLM_National_Recreation_Site_Points/FeatureServer/1/query?outFields=*&where=1%3D1&f=geojson", true);
    xmlhttp2.send();

    myView.popup.defaultPopupTemplateEnabled = true;

    var locate = new Locate({
        view: myView,
        useHeadingEnables: false,
        goToOverride: function(view, options) {
            options.target.scale = 1000000;
            return view.goTo(options.target);
        }
    });

    myView.ui.add(locate, "top-left");

    var search = new Search({
        view: myView
    });
    myView.ui.add(search, "top-right");

});
