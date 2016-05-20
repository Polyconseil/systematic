/* global google */

// Those variables are local to the file, thanks to the module architecture.
let isLoading = false
let globalResolve = null
let promise = new Promise((resolve) => {
  globalResolve = resolve
})

export default {
  __name__: 'lazy-gmaps-loader',  // TODO(vperron): is there a way to get the file name instead ?

  load: function () {
    if (typeof google === 'undefined' || !google.maps) {
      // Ensure it loads only once
      if (!isLoading) {
        // When initMap is called, it calls our promise's 'resolve' function
        // TODO(vperron): Dynamically generate the callback name to be set in window
        window.initMap = globalResolve
        let script = document.createElement('script')
        script.src = 'http://maps.googleapis.com/maps/api/js?language=en&callback=initMap'
        document.body.appendChild(script)
        isLoading = true
      }
    } else {
      // Google maps already loaded, resolve.
      globalResolve()
    }
    return promise
  },
}
