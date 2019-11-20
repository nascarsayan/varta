import React, { Component } from 'react'
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react'
// import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react'

export class MapContainer extends Component {
  state = {
    ind: {
      lat: [6.5546079, 35.6745457],
      lng: [68.1113787, 97.395561]
    },
    activeMarker: {},
    selectedPlace: {
      title: ''
    },
    showingInfoWindow: false
  }

  onMapClicked = () => {
    if (this.state.showingInfoWindow)
      this.setState({
        activeMarker: null,
        showingInfoWindow: false
      })
  }
  render() {
    const {
      state: {
        ind: {
          lat,
          lng
        },
        selectedPlace: {
          title,
        }
      },
      props: {
        points
      },
      onMapClicked,
    } = this
    return (
      <React.Fragment>
        <div>
          {title}
        </div>
        <Map
          style={{
            width: '100%',
            height: '90vh',
            position: 'relative',
          }}
          google={this.props.google}
          zoom={5}
          onClick={onMapClicked}
          initialCenter={{
            lat: (lat[0] + lat[1]) / 2,
            lng: (lng[0] + lng[1]) / 2,
          }}>
          {(points).map((point, i) => {
            const coord = point.place.bounding_box.coordinates[0]
            const lat = coord.reduce((acc, nxt) => parseFloat(acc) + parseFloat(nxt[1]), 0) / coord.length
            const lng = coord.reduce((acc, nxt) => parseFloat(acc) + parseFloat(nxt[0]), 0) / coord.length
            let url = null
            try {
              url = point.entities.urls[0].url
            } catch {
              url = 'https://twitter.com/'
            }
            return (
              <Marker
                name={point.place.name}
                key={`${i}`}
                onClick={() => window.open(url, '_blank')}
                position={{ lat, lng }}
                title={point.text}
              />)
          })}
        </Map>
      </React.Fragment>
    );
  }
}



export default GoogleApiWrapper({
  apiKey: 'AIzaSyBFh8igN1Toe_7D4RrFpLouR_F64HcgHkw'
})(MapContainer)