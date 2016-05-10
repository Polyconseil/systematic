/* globals google */

let isLoading = false

// Get a global resolver in that library's scope.
let globalResolve = null
let promise = new Promise((resolve) => {
  globalResolve = resolve
})

export default function () {
  if (typeof google === 'undefined' || !google.maps) {
    // Ensure it loads only once
    if (!isLoading) {
      // When initMap is called, it calls our promise's 'resolve' function
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
}
