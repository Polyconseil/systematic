// import _ from 'lodash'
import L from 'leaflet'

import './img/img.jpg'

import './maps/leaflet-google.js'
import GoogleMapsApiLoader from './maps/maps-loader.js'

const MAP_DIV_ID = 'fabulousmap'

const MAP_SETTINGS = {
  maxZoom: 20,
  minZoom: 0,
  zoomControl: true,
  scrollWheelZoom: true,
  attributionControl: false,
  fadeAnimation: false,
}


L.Icon.Default.imagePath = 'dist/images'

import 'leaflet/dist/leaflet.css'
import mapStyles from './map.css'


function createMapElement (id) {
  const mapElement = document.createElement('div')
  mapElement.id = id
  document.body.appendChild(mapElement)
  // Reset style
  document.getElementById(MAP_DIV_ID).classList.add(mapStyles.map)
}

createMapElement(MAP_DIV_ID)

// Init raw leaflet map (no tiles)
let map = new L.Map(MAP_DIV_ID, {
  maxZoom: MAP_SETTINGS.maxZoom,
  minZoom: MAP_SETTINGS.minZoom,
  zoomControl: MAP_SETTINGS.zoomControl,
  scrollWheelZoom: MAP_SETTINGS.scrollWheelZoom,
  attributionControl: MAP_SETTINGS.attributionControl,
  fadeAnimation: MAP_SETTINGS.fadeAnimation,
})

map.setView([48.859, 2.341], 12)

L.control.scale({
  imperial: MAP_SETTINGS.imperialScale,
  position: 'bottomleft',
}).addTo(map)

GoogleMapsApiLoader().then(() => {
  map.addLayer(new L.Google())
})

export default 'alacarte'
