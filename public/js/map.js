mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose Form Mapbox's core styles,or make your own style with Mapbox Studio
    style:"mapbox://styles/mapbox/streets-v12",//style URL
    center: eveView.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

const marker=new mapboxgl.Marker({color:"red"})
.setLngLat(eveView.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset:25}).setHTML(
        `<h4>${eveView.eventName}</h4><p>Location is given after Registraction</p>`
    )
)
.addTo(map);