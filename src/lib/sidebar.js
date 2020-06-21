// resolve imports
import {
    SidebarInfoBox
} from './infobox.js';
import {
    avgStarRating
} from '../util/average.js';
import {
    APIHelper
} from '../util/apihelper.js';

export class SidebarComponent {
    constructor() {
        this.InfoBox = new SidebarInfoBox;
        this.API = new APIHelper;
        this.data = '';
    }
    init(data) {
        this.data = data;
        const sidebarRestaurants = document.querySelector("#sidebar-restaurants");
        sidebarRestaurants.innerHTML = '';


        this.data.forEach(restaurant => {
            if (restaurant.ratings.length > 0) {
                restaurant.avgRating = avgStarRating(restaurant.restaurantName, data);
            }

            let restaurantListing = document.createElement("div");
            restaurantListing.setAttribute("class", "restaurant-listing py-10");
            restaurantListing.innerHTML = `
            <h3>${restaurant.restaurantName}</h3>
            <p>${restaurant.address}</p>
            <p id="rating-${restaurant.id}">Rating: ${restaurant.avgRating}</p>
            <button id="${restaurant.id}" class="btn-reviews">More Info</button>`;

            sidebarRestaurants.appendChild(restaurantListing);
        })

    }
    clearInfoBox() {
        this.InfoBox.clear();
    }
    addInfoBox(restaurantId, data = this.data) {
        this.InfoBox.init(restaurantId, data);
    }
    clearRestaurants() {
        const sidebarRestaurants = document.querySelector("#sidebar-restaurants");
        sidebarRestaurants.innerHTML = '';
    }
    addRestaurant() {
        this.InfoBox.addRestaurant();
    }
}