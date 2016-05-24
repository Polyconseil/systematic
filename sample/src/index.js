/*
 * Imports section.
 * Order them as follows:
 *
 * - External libraries (jQuery, Leaflet, Fetch, ...)
 * - Business-owned libraries, if any;
 * - Internal imports from within the app.
 */
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'


import LazyGoogleMapsApi from './lazy-gmaps-loader.js'
import LeafletGooglePlugin from './leaflet-google-plugin.js'

// Test image import, as a sample.
import sampleImage from './img/img.jpg'
// Test local CSS rules
import mapStyles from './map.css'


L.Icon.Default.imagePath = 'dist/images'

const MAP_DIV_ID = 'fabulousmap'

const MAP_SETTINGS = {
  maxZoom: 20,
  minZoom: 0,
  zoomControl: true,
  scrollWheelZoom: true,
  attributionControl: false,
  fadeAnimation: false,
}

function createMapElement (id) {
  const mapElement = document.createElement('div')
  mapElement.id = id
  document.body.appendChild(mapElement)
  // Reset style
  document.getElementById(MAP_DIV_ID).classList.add(mapStyles.map)
}

// Init raw leaflet map (no tiles yet)
createMapElement(MAP_DIV_ID)

let map = new L.Map(MAP_DIV_ID, {
  maxZoom: MAP_SETTINGS.maxZoom,
  minZoom: MAP_SETTINGS.minZoom,
  zoomControl: MAP_SETTINGS.zoomControl,
  scrollWheelZoom: MAP_SETTINGS.scrollWheelZoom,
  attributionControl: MAP_SETTINGS.attributionControl,
  fadeAnimation: MAP_SETTINGS.fadeAnimation,
})

let parisLatLng = [48.859, 2.341]
map.setView(parisLatLng, 12)

L.control.scale({
  imperial: MAP_SETTINGS.imperialScale,
  position: 'bottomleft',
}).addTo(map)

let sampleIcon = L.icon({
  iconUrl: sampleImage,
  iconSize: [150, 84],
})
L.marker(parisLatLng, {icon: sampleIcon}).addTo(map)

// Add tiles as soon as Google Maps API is loaded
LazyGoogleMapsApi.load().then(() => {
  LeafletGooglePlugin.load()
  map.addLayer(new L.Google())
})
