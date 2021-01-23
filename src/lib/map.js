import { SidebarComponent } from './sidebar.js';

export class GoogleMap {
  constructor() {
    this.pos = {
      lat: 53.483456,
      lng: -2.235992,
    };
    this.service = '';
    this.data = [];
    this.filteredData = [];
    this.userSubmittedData = [];
    this.markers = [];
    this.Sidebar = new SidebarComponent();
    this.sidebarMapMarker = '';
    this.mobile = false;
    this.filter = {
      min: 0,
      max: 5,
    };
  }
  initMap(data) {
    //Initialise Google Map and the Places Service Libary
    this.data = data;
    const map = new google.maps.Map(document.querySelector('#map'), {
      center: this.pos,
      zoom: 17,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    this.service = new google.maps.places.PlacesService(map);

    this.mediaQuery(map);
    //init legend
    this.initLegend(map);
    //request user pos. If given center map to user pos & update markers, map and sidebar
    this.initGeolocation(map);
    //toggle points of interest from show to hide
    this.initTogglePoi(map);
    //initiate the sidebar component
    this.Sidebar.init(data);
    //initialise the filter functionality
    this.initFilter(map);
    //generate markers for the user pos from either placesAPI data or local JSON data
    this.generateMarkers(map, data, this.pos, 'purple');
    //add event listeners to the review buttons in the sidebar
    this.btnReviewsListener(data);
    //Event listener for the location search
    this.initLocationSearch(map);
    //Event listener for user to add a restaurant listing
    this.initAddRestaurant(map);
    //Event listeners for the map e.g. on drag end
    this.initMapListeners(map);
    console.log('map initialised');
  }
  //Updates map, markers, sidebar with filtered data. Function used when new data is received
  updateMarkersMapSidebar(map, data, pos, filter = this.filter) {
    this.pos = pos;
    map.setCenter(pos);
    this.userSubmittedData.forEach((dataItem) => this.data.push(dataItem));
    this.filterResults(map, data, filter);
    this.clearMarkers();
    this.generateMarkers(map, this.filteredData);
    this.Sidebar.clearRestaurants();
    this.Sidebar.clearInfoBox();
    this.Sidebar.init(this.filteredData);
    this.btnReviewsListener(this.filteredData);
  }
  //initialising functions
  initLocationSearch(map) {
    const searchForm = document.querySelector('#search-form');
    document.querySelector('#search-btn').addEventListener('click', () => {
      event.preventDefault();
      const query = searchForm.value;
      this.placesAPIQueryRequest(query).then((result) => {
        const pos = {
          lat: result[0].geometry.location.lat(),
          lng: result[0].geometry.location.lng(),
        };
        this.placesAPINearbyRequest(pos).then((results) => {
          this.data = this.modifyPlacesNearbyDataFormat(results);
          console.log(
            'location search by user - places query returned:',
            pos,
            'with Places Nearby Request made giving this data:',
            this.data
          );
          this.updateMarkersMapSidebar(map, this.data, pos);
        });
      });
    });
  }
  initAddRestaurant(map) {
    document
      .querySelector('#add-restaurant-btn')
      .addEventListener('click', () => {
        this.Sidebar.clearInfoBox();
        this.Sidebar.addRestaurant();

        const styles = [
          {
            featureType: 'poi',
            stylers: [
              {
                visibility: 'off',
              },
            ],
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [
              {
                visibility: 'off',
              },
            ],
          },
          {
            featureType: 'administrative',
            stylers: [
              {
                visibility: 'off',
              },
            ],
          },
        ];
        const sidebarMap = new google.maps.Map(
          document.querySelector('#add-restaurant-map'),
          {
            center: this.pos,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            draggableCursor:
              'url(http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_purple.png), auto',
            styles: styles,
          }
        );
        sidebarMap.addListener('click', (e) => {
          if (this.sidebarMapMarker) {
            this.sidebarMapMarker.setMap(null);
          }
          this.sidebarMapMarker = new google.maps.Marker({
            position: e.latLng,
            map: sidebarMap,
            icon: './assets/red/pink-pin.png',
            //icon: "src/assets/red/pink-pin.png"
          });
          sidebarMap.panTo(e.latLng);
          //update values in lat lng form
          document.querySelector('#add-new-lat').value = e.latLng.lat();
          document.querySelector('#add-new-lng').value = e.latLng.lng();
        });

        this.newRestaurantListener(map);
      });
  }
  initGeolocation(map) {
    //Initialise Geolocation
    const infoWindow = new google.maps.InfoWindow();
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent('Location found.');
          infoWindow.open(map);
          this.pos = pos;

          this.placesAPINearbyRequest(this.pos).then((results) => {
            this.data = this.modifyPlacesNearbyDataFormat(results);
            console.log(
              'New locaton from Geolocation:',
              this.pos,
              'So a Places Nearby Request was made:',
              this.data
            );
            this.updateMarkersMapSidebar(map, this.data, this.pos);
          });
        },
        () => {
          console.log('Geolocation failed');
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      console.log("Browser doesn't supoprt Geolocation");
      handleLocationError(false, infoWindow, map.getCenter());
    }
    const handleLocationError = (browserHasGeolocation, infoWindow, pos) => {
      infoWindow.setPosition(pos);
      infoWindow.setContent(
        browserHasGeolocation
          ? 'Error: The Geolocation service failed.'
          : "Error: Your browser doesn't support geolocation."
      );
      infoWindow.open(map);
    };
  }
  initTogglePoi(map) {
    //Create hide/show features button to toggle google maps generated icons.
    // Apply new JSON when the user chooses to hide/show features.
    document.getElementById('hide-poi').addEventListener('click', function () {
      map.setOptions({
        styles: styles['hide'],
      });
    });
    document.getElementById('show-poi').addEventListener('click', function () {
      map.setOptions({
        styles: styles['default'],
      });
    });
    const styles = {
      default: 'default',
      hide: [
        {
          featureType: 'poi.business',
          stylers: [
            {
              visibility: 'off',
            },
          ],
        },
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [
            {
              visibility: 'off',
            },
          ],
        },
        {
          featureType: 'poi.attraction',
          stylers: [
            {
              visibility: 'off',
            },
          ],
        },
      ],
    };
  }
  initFilter(map) {
    const min = [];
    const max = [];
    for (let i = 0; i < 5; i++) {
      min[i] = document.querySelector(`#astar-${i + 1}`);
      max[i] = document.querySelector(`#bstar-${i + 1}`);
    }
    min.forEach((star) => {
      star.addEventListener('click', () => {
        event.preventDefault();
        if (
          Number.parseInt(event.currentTarget.attributes.value.nodeValue) >
          this.filter.max
        ) {
          console.log('*Incorrect input*: User min value > max value');
          return;
        }
        this.filter.min = Number.parseInt(
          event.currentTarget.attributes.value.nodeValue
        );
        for (let i = 0; i < 5; i++) {
          if (i < this.filter.min) {
            min[i].classList.add('checked');
          } else {
            min[i].classList.remove('checked');
          }
        }
        console.log(
          `User filtered results with min:${this.filter.min} / max:${this.filter.max} rating`
        );
        this.updateMarkersMapSidebar(map, this.data, this.pos);
      });
    });
    max.forEach((star) => {
      star.addEventListener('click', () => {
        event.preventDefault();
        if (
          Number.parseInt(event.currentTarget.attributes.value.nodeValue) <
          this.filter.min
        ) {
          console.log('*Incorrect input*: User max value < min value');
          return;
        }
        this.filter.max = Number.parseInt(
          event.currentTarget.attributes.value.nodeValue
        );
        for (let i = 0; i < 5; i++) {
          if (i < this.filter.max) {
            max[i].classList.add('checked');
          } else {
            max[i].classList.remove('checked');
          }
        }
        console.log(
          `User filtered with min:${this.filter.min} / max:${this.filter.max} rating`
        );
        this.updateMarkersMapSidebar(map, this.data, this.pos);
      });
    });
  }
  initMapListeners(map) {
    map.addListener('dragend', () => {
      this.pos.lat = map.getCenter().lat();
      this.pos.lng = map.getCenter().lng();
      this.placesAPINearbyRequest(this.pos).then((results) => {
        this.data = this.modifyPlacesNearbyDataFormat(results);
        this.updateMarkersMapSidebar(map, this.data, this.pos);
      });
    });
  }
  initLegend(map) {
    const legendHTML = `
            <div id="style-selector-control" class="map-control">
                <h3>Toggle Google Markers</h3>
                <div id="marker-toggle-container">
                    <input type="radio" name="show-hide" id="hide-poi" class="selector-control">
                    <label for="hide-poi">Hide</label>
                    <input type="radio" name="show-hide" id="show-poi" class="selector-control" checked="checked">
                    <label for="show-poi">Show</label>
                </div>
            </div>
            <div id="search-container">
                <form class="example">
                    <input id="search-form" type="text" placeholder="Location..." name="search">
                    <button id="search-btn" type="submit"><i class="fa fa-search"></i></button>
                </form>
            </div>
            <div id="rating-filter-container">
                <h3>Display with raings:</h3>
                <div class="center above">
                    <h3>Min:</h3>
                    <span id="astar-1" value="1" class="fa fa-star"></span>
                    <span id="astar-2" value="2" class="fa fa-star"></span>
                    <span id="astar-3" value="3" class="fa fa-star"></span>
                    <span id="astar-4" value="4" class="fa fa-star"></span>
                    <span id="astar-5" value="5" class="fa fa-star"></span>
                </div>
                <div class="center below">
                    <h3>Max:</h3>
                    <span id="bstar-1" value="1" class="fa fa-star checked"></span>
                    <span id="bstar-2" value="2" class="fa fa-star checked"></span>
                    <span id="bstar-3" value="3" class="fa fa-star checked"></span>
                    <span id="bstar-4" value="4" class="fa fa-star checked"></span>
                    <span id="bstar-5" value="5" class="fa fa-star checked"></span>
                </div>
            </div>`;
    document.querySelector('#legend').innerHTML = legendHTML;
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(
      document.querySelector('#legend')
    );
  }
  //filters the data with user inputted values and stores filtered data in this.filteredData
  filterResults(map, data, filter = this.filter) {
    //filter with min value
    this.filteredData = data.filter((item) => item.avgRating >= filter.min);
    //filter with max value
    this.filteredData = this.filteredData.filter(
      (item) => item.avgRating <= filter.max
    );
  }
  //generate markers and add their event listeners for click, mouseover and mouse out
  generateMarkers(map, data = this.data, pos = this.pos, color = 'red') {
    data.forEach((restaurant) => {
      //console.log("marker file location: ", `./assets/${restaurant.markerColor}/restaurant.png`)
      let marker = new google.maps.Marker({
        position: {
          lat: restaurant.lat,
          lng: restaurant.lng,
        },
        map: map,
        icon: `./assets/${restaurant.markerColor}/restaurant.png`,
        //icon: `src/assets/${restaurant.markerColor}/restaurant.png`,
        mydata: restaurant.id,
      });

      marker.addListener('click', (e) => {
        const restaurant = data.find((item) => item.id === marker.mydata);
        this.getReviewInfoBox(restaurant);
        map.panTo(e.latLng);
      });

      //Add marker:hover infobox:
      let content = `
            <div>
                <h3 style="margin:0;">${restaurant.restaurantName}</h3>
            </div>`;
      let infoWindow = new google.maps.InfoWindow({
        content: content,
      });
      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker);
      });
      marker.addListener('mouseout', () => {
        infoWindow.close(map, marker);
      });

      this.markers.push(marker);
    });
    let marker = new google.maps.Marker({
      position: {
        lat: pos.lat,
        lng: pos.lng,
      },
      map: map,
      icon: './assets/red/arrow.png',
      //icon: "src/assets/red/arrow.png"
    });

    this.markers.push(marker);
  }
  clearMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
  }
  getReviewInfoBox(restaurant) {
    if (this.mobile) {
      this.reviewTabClicked(map);
    }
    this.Sidebar.clearInfoBox();
    if (restaurant.ratings.length > 0) {
      this.Sidebar.addInfoBox(restaurant.id);
    } else {
      this.placesAPIDetailsRequest(restaurant.placeId).then((results) => {
        this.modifyPlacesDetailsDataFormat(results, restaurant);
        console.log(
          'No reviews in data, so a Places API Request was made',
          restaurant,
          this.data
        );
        this.Sidebar.addInfoBox(restaurant.id, this.data);
      });
    }
  }
  btnReviewsListener(data = this.data) {
    //add event listeners to the review buttons in the sidebar
    const btnReviews = document.querySelectorAll('.btn-reviews');
    btnReviews.forEach((button) => {
      button.addEventListener('click', () => {
        const restaurant = data.find(
          (item) => item.id === event.currentTarget.id
        );
        this.getReviewInfoBox(restaurant);
      });
    });
  }
  newRestaurantListener(map) {
    //select data from the review for use when review is submitted by user
    const newName = document.querySelector('#add-new-name');
    const newAddress = document.querySelector('#add-new-address');
    const newRating = document.querySelector('#add-new-rating');
    const newLat = document.querySelector('#add-new-lat');
    const newLng = document.querySelector('#add-new-lng');
    //Event listener for cancel x button in top right
    document.querySelector('.x-button').addEventListener('click', () => {
      this.Sidebar.clearInfoBox();
    });
    //Add event listener to monitor when the user submits their review
    document
      .querySelector('#btn-submit-restaurant')
      .addEventListener('click', () => {
        event.preventDefault();
        const newRestaurantData = {
          restaurantName: newName.value,
          address: newAddress.value,
          lat: parseFloat(newLat.value, 10),
          lng: parseFloat(newLng.value, 10),
          avgRating: parseFloat(newRating.value, 10),
          ratings: [
            {
              stars: parseFloat(newRating.value, 10),
              comment: 'ok',
            },
          ],
          placeId: '',
          website: '',
          markerColor: 'mint',
          id: Date.now().toString(),
        };
        console.log(
          'New Restaurant added with the following data:',
          newRestaurantData
        );
        this.userSubmittedData.push(newRestaurantData);
        this.updateMarkersMapSidebar(map, this.data, this.pos);
      });
  }
  // Places API requests - Return a promise
  placesAPINearbyRequest(pos) {
    const request = {
      location: pos,
      radius: 500,
      type: 'restaurant',
      rankby: 'distance',
    };
    return new Promise((resolve, reject) => {
      this.service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
  }
  placesAPIDetailsRequest(placesId) {
    const request = {
      placeId: placesId,
      fields: [
        'name',
        'rating',
        'website',
        'price_level',
        'review',
        'user_ratings_total',
      ],
    };
    return new Promise((resolve, reject) => {
      this.service.getDetails(request, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(status);
        }
      });
    });
  }
  placesAPIQueryRequest(query) {
    const request = {
      query: query,
      fields: ['name', 'geometry'],
    };
    return new Promise((resolve, reject) => {
      this.service.findPlaceFromQuery(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
  }
  //Modify data received from Places API requests
  modifyPlacesDetailsDataFormat(result, place) {
    this.data.forEach((restaurant) => {
      if (restaurant.id === place.id) {
        restaurant.website = result.website;
        restaurant.priceLevel = result.price_level;
        if (result.reviews) {
          result.reviews.forEach((review) => {
            let rating = {
              stars: review.rating,
              comment: review.text,
            };
            restaurant.ratings.push(rating);
          });
        } else {
          console.log('Places API Details Request - contained no reviews');
        }
      }
    });
  }
  modifyPlacesNearbyDataFormat(data) {
    let newFormatData = [];
    data.forEach((result) => {
      let restaurantData = {
        address: result.vicinity,
        avgRating: result.rating,
        id: result.place_id,
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
        placeId: result.place_id,
        ratings: [],
        restaurantName: result.name,
        type: result.types,
        website: '',
        markerColor: 'red',
      };
      //${result.types[0]}, ${result.types[1]}, ${result.types[2]}
      newFormatData.push(restaurantData);
    });
    return newFormatData;
  }
  //media queries
  initMobileViewport(map) {
    this.mobile = true;
    //mobile
    console.log('Mobile viewport initialised');
    this.mobile = true;
    document.querySelector('#sidebar').style.display = 'none';

    //map tab clicked
    document.querySelector('#map-tab').addEventListener('click', () => {
      this.mapTabClicked(map);
    });

    //review tab clicked
    document.querySelector('#review-tab').addEventListener('click', () => {
      this.reviewTabClicked(map);
    });
  }
  reviewTabClicked(map) {
    //display review
    document.querySelector('#map').style.display = 'none';
    document.querySelector('#sidebar').style.display = 'flex';
    //map tab inactive
    document.querySelector('#map-tab').classList.add('map-inactive');
    document.querySelector('#map-tab').classList.remove('map-active');

    //review tab active
    document.querySelector('#review-tab').classList.add('review-active');
    document.querySelector('#review-tab').classList.remove('review-inactive');
  }
  mapTabClicked(map) {
    //display map
    document.querySelector('#map').style.display = 'flex';
    document.querySelector('#sidebar').style.display = 'none';

    //map tab active
    document.querySelector('#map-tab').classList.add('map-active');
    document.querySelector('#map-tab').classList.remove('map-inactive');

    //review tab inactive
    document.querySelector('#review-tab').classList.add('review-inactive');
    document.querySelector('#review-tab').classList.remove('review-active');
  }
  initDesktopViewport(map) {
    this.mobile = false;
    //desktop
    console.log('Desktop viewport initialised');
    this.mobile = false;
    document.querySelector('#sidebar').style.display = 'flex';
    document.querySelector('#map').style.display = 'flex';

    /*
        document.querySelector("#sidebar").style.display = "block";
        document.querySelector("#tabs").style.display = "none";
        document.querySelector("#container").style.marginTop = "0px";
        */
  }
  mediaQuery(map) {
    let mqMobile = window.matchMedia('(max-width: 568px)');
    mqMobile.addEventListener('change', (event) => {
      if (event.matches) {
        //Viewport is 568px or less (Mobile)
        this.initMobileViewport();
      } else {
        //Viewport is greater than 568px (Desktop)
        this.initDesktopViewport();
      }
    });

    if (mqMobile.matches) {
      //Viewport is 568px or less (Mobile)
      this.initMobileViewport(map);
    } else {
      //Viewport is greater than 568px (Desktop)
      this.initDesktopViewport(map);
    }
  }
}
