import module from './leaflet-google-plugin'

describe('leaflet google plugin', () => {
  it('should export its own name', () => {
    expect(module.__name__).toEqual('leaflet-google-plugin')
  })
})
