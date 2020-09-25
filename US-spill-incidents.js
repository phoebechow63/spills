//phoebe's mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoicGhvZWJlY2hvdyIsImEiOiJjazYyOW1uMngwNzU3M2xxdjg2djRla2ttIn0.3TfoZyTMstZ1O0t8SMzcNw'; //my mapbox account access token
var map = new mapboxgl.Map({
    container: 'map', //container id in HTML
    style: 'mapbox://styles/phoebechow/ck7kufr4s4mze1ips3u4i7ice', //stylesheet location
    center: [-94.35, 50],  //starting point, longitude/latitude
    zoom: 1.8, // starting zoom level
});

//list of colors for US spill incidents 
const colors = ['#66c2a5','#fc8d62', '#8da0cb', '#e78ac3'];  
//filters for each sector for clusters
const oil = ['==', ['get', 'threat'], 'Oil'];
const chem = ['==', ['get', 'threat'], 'Chemical'];
const other = ['==', ['get', 'threat'],'Other'];
const unclass = ['==', ['get', 'threat'], 'Unclass'];

map.on('load', function(){
     //add polygons of CDO relevant Asian countries (17) from Mapbox Vector Tile
    //add data map source of CDO relevant Asian countries (17)
    map.addSource('usa',{
        'type': 'vector',
        'url': 'mapbox://phoebechow.a86eg4y7'
    });
    map.addLayer({
        'id': 'usa-fill',
        'type': 'fill',
        'source': 'usa',
        'layout': {},
        //show asian countries by number of locations
        'paint': {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['to-number',['get', 'Count_'],0], // get a number, but if provided with a non-number default to 0
              //symbology classified into 6 quantiles
              //0, '#eff3ff',
              1, '#eff3ff',
                10, '#bdd7e7',
                20, '#6baed6',
                36, '#3182bd',
                327, '#08519c'
            ],
            'fill-opacity': 0.3,
        },
        'source-layer': "states-boundary-10ogx5"
    });
    //change asian country outline width and color
    map.addLayer({
        'id': 'usa-border',
        'type': 'line',
        'source': 'usa',
        'layout': {},
        'paint': {
            'line-width': 1.5,
            //line color to match the quantile classification colors
            'line-color': [
                'interpolate',
                ['linear'],
                ['to-number',['get', 'Count_'],0], // get a number, but if provided with a non-number default to 0
                //line color classified into 6 quantiles
                //0, '#eff3ff',
                1, '#eff3ff',
                10, '#bdd7e7',
                20, '#6baed6',
                36, '#3182bd',
                327, '#08519c'
              ],
        },
        'source-layer': "states-boundary-10ogx5"
    });

    //add polygons of CDO relevant Asian countries (17) from Mapbox Vector Tile
    //add data map source of US spill incidents
    map.addSource('incidents',{
        'type': 'vector',
        'url': 'mapbox://phoebechow.35gpzh5p'
    });
    //Oil
    map.addLayer({
        'id': 'oil',
        'type': 'circle',
        'source': 'incidents',
        'layout': {},
        'source-layer': 'US_Spill_Incidents-5d29by',
        'paint': {
          'circle-color': '#66c2a5',
          'circle-radius': 3.5
        },
        'filter': ['==','threat', 'Oil']
    });

    //Chemical
    map.addLayer({
        'id': 'chem',
        'type': 'circle',
        'source': 'incidents',
        'layout': {},
        'source-layer': 'US_Spill_Incidents-5d29by',
        'paint': {
          'circle-color': '#fc8d62',
          'circle-radius': 3.5
        },
        'filter': ['==','threat', 'Chemical']
    });

    //Others
    map.addLayer({
        'id': 'other',
        'type': 'circle',
        'source': 'incidents',
        'layout': {},
        'source-layer': 'US_Spill_Incidents-5d29by',
        'paint': {
          'circle-color': '#8da0cb',
          'circle-radius': 3.5
        },
        'filter': ['==','threat', 'Other']
    });

     //unclassified
     map.addLayer({
        'id': 'unclass',
        'type': 'circle',
        'source': 'incidents',
        'layout': {},
        'source-layer': 'US_Spill_Incidents-5d29by',
        'paint': {
          'circle-color': '#e78ac3',
          'circle-radius': 3.5
        },
        'filter': ['==','threat', 'Unclass']
    });

    //default sector layer properties to visible, so that user only clicks once to hide layer on toggle list
    map.setLayoutProperty ('oil', 'visibility', 'visible');
    map.setLayoutProperty ('chem', 'visibility', 'visible');
    map.setLayoutProperty ('other', 'visibility', 'visible');
    map.setLayoutProperty ('unclass', 'visibility', 'visible');

   //add points of canadian tech company locations from local geojson file for clustering 
   //add map source of Canadian Tech Comapny Locations (geojson)
    map.addSource('incidents-geojson',{
        type: 'geojson',
        data: incidents, //variable created in geoJSON file 
        cluster: true,
        clusterMaxZoom: 8, // Max zoom to cluster points on
        clusterRadius: 80, // Radius of each cluster when clustering points
    });
    
    //add layer for clusters 
    map.addLayer({
        'id': 'clusters', 
        'type': 'circle',
        'source': 'incidents-geojson',
        filter: ['has', 'point_count'],
        paint: {
        //four step clusters:
        //   * lightest orange: 25px circles when point count is less than 50
        //   * light orange: 35px circles when point count is between 50 and 100
        //   * orange: 45px circles when point count is between 100 and 400
        //   * dark orange: 55px circles when point count is greater than or equal to 300
        'circle-color': [
            'step',
            ['get', 'point_count'],
            '#ffd0b1',
            50,
            '#ff944e',
            100,
            '#ff6500',
            300,
            '#b14600'
            ],
        'circle-radius': [
            'step',
            ['get', 'point_count'],
            25,50,
            35,100,
            45,300,
            55],
        }
    });

    //add layer for clusters point count 
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'incidents-geojson',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14
        }
    });
    
    //add layer for individual companies (unclustered points)
    //add layer for dot (individual companies - unclustered points)
    map.addLayer({
        'id': 'incidents-individual',
        'type': 'circle',
        'source': 'incidents-geojson',
        'filter': ['!=', ['get', 'cluster'], true], //unclustered points
        'paint': {
            'circle-color': ['case',
                oil, colors[0],
                chem, colors[1],
                other, colors[2],
                unclass, colors[3], '#ffed6f'], //set each individual company with corresponding color to sector icon image
           'circle-radius': 5
        }
        
      });

    //hide cluster layers until user clicks on cluster option 
    map.setLayoutProperty ('clusters', 'visibility', 'none');
    map.setLayoutProperty('cluster-count', 'visibility', 'none');
    map.setLayoutProperty('incidents-individual', 'visibility', 'none');

});
/*
//asian countries interactions: 
//create a popup object for number of company locations per country
    //will use same popup for company descriptions (vector points and geojson unclustered points)
    var popup = new mapboxgl.Popup({
        closeButton: true,  //allow users to close popup
        closeOnClick: null
    });
    /*
//popup for number of company locations per country 
    map.on('click','asia-fill',function(e){
        popup.remove();  //removes existing popup
        //get the rendered features that belong to the asia-fill layer
        var features = map.queryRenderedFeatures(e.point, {
            "layers": ["asia-fill"]}
        );
        //if there is a feature there, do the following
        if (features.length > 0){
            console.log(features[0]); //print out the first element of the features array that was selected
            var feature = features[0]; //store the first element as 'feature'
            popup.setLngLat(e.lngLat); //place the popup window at the lng and lat where your click event happened
            //add stuff to the pop up:
            popup.setHTML("<b>" + feature.properties.CNTRY_NAME + "</b><br> The number of Canadian Tech Company locations in " + feature.properties.CNTRY_NAME + " is: " + feature.properties.Locations);
            popup.addTo(map); //finally add the pop up to the map

        }
        //if there are no features under the click, then print this in the web browser console
        else{
            console.log("no features from layer here...")
        }
    });
    
//change mouse point when user hovers over clusters
    map.on('mouseenter','asia-fill',function(e){   //when your mouse enters the asia-fill layer
        map.getCanvas().style.cursor = 'pointer';    //change the mouse cursor to a pointer
    });
    map.on('mouseleave','asia-fill',function(e){
        map.getCanvas().style.cursor = '';              //when the mouse leaves the asia fill layer
    });
*/
//canadian company locations interactions: 
//variables for hovering over locations to show relevant description 
    //target the relevant span tags in the location-description div 
    var idDisplay = document.getElementById('id');
    var dateDisplay = document.getElementById('date');
    var nameDisplay = document.getElementById('name');
    var locDisplay = document.getElementById('loc');
    var threatDisplay = document.getElementById('threat');
    var commDisplay = document.getElementById('comm');
    var maxDisplay = document.getElementById('max');
    var desDisplay = document.getElementById('des');

    //list of CDO Techmap sector layers 
    var seclist = ['oil', 'chem', 'other', 'unclass'];
    var locID = null;

//loop through all sector layers to minimize code
    for (var b = 0; b < seclist.length; b++) {

        var id1 = seclist[b];
    
        //hover description for each sector layer
        map.on('mouseenter', id1, (e) => {
            
            map.getCanvas().style.cursor = 'pointer';
            // Set variables equal to the current feature's magnitude, location, and time
            var locId = e.features[0].properties.id;
            var locDate = e.features[0].properties.openDate;
            var locName = e.features[0].properties.name;
            var locLoc = e.features[0].properties.location;
            var locThreat = e.features[0].properties.threat;
            var locComm = e.features[0].properties.commodity;
            var locMax = e.features[0].properties.maxPtlReleaseGallons;
            var locDes = e.features[0].properties.description;
    
            // Check whether features exist
            if (e.features.length > 0) {
                // Display the magnitude, location, and time in the sidebar
                idDisplay.textContent = locId; 
                dateDisplay.textContent = locDate; 
                nameDisplay.textContent = locName; 
                locDisplay.textContent = locLoc; 
                threatDisplay.textContent = locThreat; 
                commDisplay.textContent = locComm; 
                maxDisplay.textContent = locMax; 
                desDisplay.textContent = locDes; 
        
                // If quakeID for the hovered feature is not null,
                // use removeFeatureState to reset to the default behavior
                if (locID) {
                    map.removeFeatureState({
                    source: "incidents",
                    id: id1
                    });
                }
        
                locID = e.features[0].id;
                
                // When the mouse moves over the earthquakes-viz layer, set the
                // feature state for the feature under the mouse
                map.setFeatureState({
                    source: 'incidents',
                    id: id1
                }, {
                    hover: true
                });
            }
        });
        
        //popup for each sector layer
        map.on('click', id1, function(e){
            //removes existing popup 
            popup.remove();
            map.flyTo({ center: e.features[0].geometry.coordinates, zoom:12});
            var coordinates = e.features[0].geometry.coordinates.slice();
            var name = e.features[0].properties.name; 
            var date = e.features[0].properties.openDate; 

            //var description = e.features[0].properties.TECHSEC;
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
                popup
                .setLngLat(coordinates)
                .setHTML("<b>"+ name + "<br><br> Open Date: </b>" + date)
                .addTo(map);
        });

        
    }

//second loop to remove previously hovered information and remove mouse point 
    for (var c = 0; c < seclist.length; c++) {

        var id2 = seclist[c];
    
        map.on('mouseleave', id2, function() {
            if (locID) {
                map.setFeatureState({
                source: 'incidents',
                id: id2
                }, {
                hover: false
                });
            }
            locID = null;
            // Remove the information from the previously hovered feature from the sidebar
            idDisplay.textContent = ''; 
            dateDisplay.textContent = ''; 
            nameDisplay.textContent = ''; 
            locDisplay.textContent = ''; 
            threatDisplay.textContent = ''; 
            commDisplay.textContent = ''; 
            maxDisplay.textContent = ''; 
            desDisplay.textContent = ''; 

            map.getCanvas().style.cursor = '';
        }); 
    }

//create toggle layer for different canadian tech company sectors
    //list of tech sector layers 
    var toggleLayerIds = ['oil', 'chem', 'other', 'unclass'];
    
    function showLayers(layer_ids) {

        for (var i = 0; i < layer_ids.length; i++) {

            var id = layer_ids[i];

            var link = document.createElement('a');
            link.href = '#';
            link.className = 'active'; //default toggle list to active
            link.textContent = id; 

            //set toggle list name
            if (id === 'oil'){
                link.textContent = "Oil Spills";
            } else if (id === 'chem'){
                link.textContent = "Chemical Spills";
            } else if (id === 'other'){
                link.textContent = "Other Spills";
            } else if (id === 'unclass'){
                link.textContent = "Unclassified Spills";
            } 

            link.onclick = function(e) {
                // Retrieve the clicked layer
                    var clickedLayer = null;
                if (this.textContent === 'Oil Spills'){
                    clickedLayer = "oil";
                } else if (this.textContent === 'Chemical Spills'){
                    clickedLayer = "chem";
                } else if (this.textContent === 'Other Spills'){
                    clickedLayer = "other";
                } else if (this.textContent === 'Unclassified Spills'){
                    clickedLayer = "unclass";
                } 
                
                e.preventDefault();
                e.stopPropagation();
                var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
                //if clicked layer is visible hide, else show hidden layer
                if (visibility === 'visible') {
                        map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                        this.className = '';
                } else {
                        this.className = 'active';
                        map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                }
            };
            var layers = document.getElementById('filter-group');
            layers.appendChild(link);
        }
    } showLayers(toggleLayerIds);

    //cluster interactions: 
//inspect a cluster and zoom in on click
map.on('click', 'clusters', function(e) {
    popup.remove(); 
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
    });
    var clusterId = features[0].properties.cluster_id;
    map.getSource('incidents-geojson').getClusterExpansionZoom(
        clusterId,
        function(err, zoom) 
        { if (err) return;
            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
            });
        }
    );
});
//change mouse point when user hovers over clusters
map.on('mouseenter','clusters',function(e){ 
    map.getCanvas().style.cursor = 'pointer'; 
    });
map.on('mouseleave','clusters',function(e){
    map.getCanvas().style.cursor = '';  
});

//popup description for each unclustered point 
map.on('click', 'incidents-individual', function(e) {
    popup.remove();
    map.flyTo({ center: e.features[0].geometry.coordinates, zoom:12});

    var coordinates = e.features[0].geometry.coordinates.slice();
    var name = e.features[0].properties.name; 
    var date = e.features[0].properties.OpenDate; 

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    
    popup
    .setLngLat(coordinates)
        .setHTML("<b>"+ name + "<br> <b> Open Date: </b>" + date)
        .addTo(map);
});
//change mouse point when user hovers over unclustered points
map.on('mouseenter','companies_individual',function(e){  
    map.getCanvas().style.cursor = 'pointer';    
});
map.on('mouseleave','companies_individual',function(e){
    map.getCanvas().style.cursor = '';             
});

    //cluster option to enable and disable clustering 
    var link2 = document.createElement('a');
    link2.href = '#';
    link2.className = ' ';
    link2.textContent = 'Clusters'; //name of cluster option button
    
    //if users click on cluster option 
    link2.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var visibility2 = map.getLayoutProperty('clusters', 'visibility');
        
    //if clustering is enabled on click (user is trying to turn off clustering)
        if (visibility2 === 'visible') {
        //hide cluster layers 
            map.setLayoutProperty('clusters', 'visibility', 'none');
            map.setLayoutProperty('cluster-count', 'visibility', 'none');
            map.setLayoutProperty('incidents-individual', 'visibility', 'none');
        //show sector layers (vector)
            map.setLayoutProperty ('oil', 'visibility', 'visible');
            map.setLayoutProperty ('chem', 'visibility', 'visible');
            map.setLayoutProperty ('other', 'visibility', 'visible');
            map.setLayoutProperty ('unclass', 'visibility', 'visible');
        //show sector filters and hover descriptions
            document.getElementById('filter-group').style.visibility = '';
            document.getElementById('location-description').style.visibility = '';
        //attempt to reset sector filter class
            //document.getElementById('filter-group').className = 'active'; 
            
            this.className = ' '; // reset 

        } else { //else clustering is disabled on click (user is trying to turn on clustering)
        //show cluster layers
            map.setLayoutProperty('clusters', 'visibility', 'visible');
            map.setLayoutProperty('cluster-count', 'visibility', 'visible');
            map.setLayoutProperty('incidents-individual', 'visibility', 'visible');
        //hide sector layers (vector)
            map.setLayoutProperty ('oil', 'visibility', 'none');
            map.setLayoutProperty ('chem', 'visibility', 'none');
            map.setLayoutProperty ('other', 'visibility', 'none');
            map.setLayoutProperty ('unclass', 'visibility', 'none');
        //hide sector filters and hover descriptions
            document.getElementById('location-description').style.visibility = 'hidden';
            document.getElementById('filter-group').style.visibility = 'hidden';
            
            this.className = 'active';
        }
    };
    var layers2 = document.getElementById('cluster-option');
    layers2.appendChild(link2);

//add full screen, zoom, and rotation controls to the bottom left corner of map
map.addControl(new mapboxgl.FullscreenControl(), 'bottom-left'); 
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
