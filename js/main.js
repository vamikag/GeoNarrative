// 1. Set Mapbox access token (REPLACE WITH YOUR OWN)
mapboxgl.accessToken = 'pk.eyJ1IjoidmFtaWthZyIsImEiOiJjbWt6MHV3YjEwMmdyM3FxMGZzNzlob3lvIn0.9ml0_x6-glv7a9AdaYc3QA';

// 2. Declare global variables
let map;
let scriptPanel = scrollama();
let restaurantsGeoJSON; // will hold the feature collection

// 3. Restaurant data (GeoJSON)
const restaurantsData = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: {
                name: "Pike Place Chowder",
                address: "1530 Post Aly, Seattle, WA 98101",
                cuisine: "Seafood",
                scene: 0
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3406, 47.6087]
            }
        },
        {
            type: "Feature",
            properties: {
                name: "Canlis",
                address: "2576 Aurora Ave N, Seattle, WA 98109",
                cuisine: "Fine Dining",
                scene: 1
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3455, 47.6457]
            }
        },
        {
            type: "Feature",
            properties: {
                name: "Toulouse Petit",
                address: "601 Queen Anne Ave N, Seattle, WA 98109",
                cuisine: "Creole",
                scene: 2
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3570, 47.6240]
            }
        },
        {
            type: "Feature",
            properties: {
                name: "Salumi",
                address: "309 3rd Ave S, Seattle, WA 98104",
                cuisine: "Italian Sandwiches",
                scene: 3
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3296, 47.6001]
            }
        },
        {
            type: "Feature",
            properties: {
                name: "Molly Moon's",
                address: "917 E Pine St, Seattle, WA 98122",
                cuisine: "Ice Cream",
                scene: 4
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3204, 47.6143]
            }
        }
    ]
};

// 4. Initialize map
function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11', // default style
        center: [-122.3321, 47.6062], // downtown Seattle
        zoom: 11,
        pitch: 0
    });

    map.on('load', () => {
        // Add a custom marker image (optional: use an image from Mapbox or a local URL)
        map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png', (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);

            // Add source and layer for restaurants
            map.addSource('restaurants', {
                type: 'geojson',
                data: restaurantsData
            });

            map.addLayer({
                id: 'restaurant-points',
                type: 'symbol',
                source: 'restaurants',
                layout: {
                    'icon-image': 'custom-marker',
                    'icon-size': 0.7,
                    'icon-allow-overlap': true,
                    'text-field': ['get', 'name'],
                    'text-offset': [0, 1.5],
                    'text-anchor': 'top',
                    'text-size': 11
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-halo-color': '#000000',
                    'text-halo-width': 1
                }
            });
        });

        // Initially hide all points (we'll show them per scene)
        map.setLayoutProperty('restaurant-points', 'visibility', 'none');
    });
}

// 5. Adjust storyboard size (for responsive)
function adjustStoryboardSize() {
    // no extra needed
}

// 6. Scrollama setup
function setupScrollama() {
    scriptPanel
        .setup({
            step: '.scene',
            offset: 0.5,      // trigger when middle of step enters viewport
            debug: false
        })
        .onStepEnter(handleSceneEnter)
        .onStepExit(handleSceneExit);
}

// 7. Handle scene enter
function handleSceneEnter(response) {
    const index = response.index;

    // Hide cover when scrolling down past scene 0
    if (index === 0) {
        document.getElementById('cover').style.visibility = 'hidden';
    }

    // Show the corresponding restaurant marker (if not already visible)
    // We'll filter the GeoJSON to show only the point for this scene
    const allFeatures = restaurantsData.features;
    const currentFeature = allFeatures.find(f => f.properties.scene === index);
    if (!currentFeature) return;

    // Create a temporary GeoJSON with just this feature
    const singleFeatureCollection = {
        type: 'FeatureCollection',
        features: [currentFeature]
    };

    // Update source data
    if (map.getSource('restaurants')) {
        map.getSource('restaurants').setData(singleFeatureCollection);
        map.setLayoutProperty('restaurant-points', 'visibility', 'visible');
    }

    // Fly to the restaurant
    map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 15,
        pitch: 30,            // slight tilt for effect
        bearing: 0,
        speed: 0.6,
        curve: 1
    });

    // Optionally change map style for a specific scene (demonstrate different map)
    if (index === 1) {
        map.setStyle('mapbox://styles/mapbox/light-v11');
    } else if (index === 3) {
        map.setStyle('mapbox://styles/mapbox/satellite-streets-v11');
    } else {
        // Revert to default style for others (if changed)
        // But avoid resetting unnecessarily
        const currentStyle = map.getStyle().name;
        if (currentStyle !== 'Streets' && index !== 1 && index !== 3) {
            map.setStyle('mapbox://styles/mapbox/streets-v11');
        }
    }
}

// 8. Handle scene exit
function handleSceneExit(response) {
    const index = response.index;

    if (index === 0 && response.direction === 'up') {
        // Scrolling back up to cover
        document.getElementById('cover').style.visibility = 'visible';
    }

    // Hide markers when exiting the scene (optional)
    // We could remove all markers, but we'll just hide them
    if (map.getLayer('restaurant-points')) {
        map.setLayoutProperty('restaurant-points', 'visibility', 'none');
    }
}

// 9. Initialize everything when DOM ready
window.addEventListener('load', () => {
    initMap();
    setupScrollama();
    adjustStoryboardSize();

    // Add resize listener
    window.addEventListener('resize', adjustStoryboardSize);
});

