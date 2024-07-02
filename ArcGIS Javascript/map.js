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

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            for (var feature of data.features) {
                var siteName = feature.properties.PUBLIC_SITE_NAME;

                // Filter for site subtype and non-null/non-blank site name
                if (["CAMPING AREA", "CAMPGROUND"].includes(feature.properties.SITE_SUBTYPE) && siteName) {

                    var location = {
                        type: "point",
                        longitude: feature.geometry.coordinates[0],
                        latitude: feature.geometry.coordinates[1]
                    };

                    var marker = new SimpleMarkerSymbol({
                        color: "blue", // Fill color
                        size: 5, // Size in points
                        outline: { // Outline properties
                            color: "white",
                            width: 0.5
                        },
                        style: "circle" // Options: "circle", "square", "cross", "x", "diamond", "triangle"
                    });

                    var popup_attributes = feature.properties;

                    var popup_template = {
                        title: "Site Information",
                        content: `<b>Site Name</b>: ${checkNull(feature.properties.PUBLIC_SITE_NAME)} <br> 
                                  <b>Subtype</b>: ${checkNull(feature.properties.SITE_SUBTYPE)} <br> 
                                  <b>State</b>: ${checkNull(feature.properties.ADDRESS_STATE)} <br>
                                  <b>Recreation Information</b>: ${checkNull(feature.properties.RECAREA_DESCRIPTION)} <br>
                                  <b>Water</b>: ${checkNull(feature.properties.WATER_AVAILABILITY)} <br>
                                  <b>Activity Types</b>: ${checkNull(feature.properties.ACTIVITY_TYPES)} <br>`
                    };

                    var graphic = new Graphic({
                        geometry: location,
                        symbol: marker,
                        attributes: popup_attributes,
                        popupTemplate: popup_template
                    });
                    graphicsLayer.add(graphic);
                }
            }
        }
    };

    xmlhttp.open("GET", "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_InfraRecreationSites_01/MapServer/0/query?outFields=*&where=1%3D1&f=geojson", true);
    xmlhttp.send();

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
