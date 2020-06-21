import { avgStarRating } from '../util/average.js';
import { APIHelper } from '../util/apihelper.js';

export class SidebarInfoBox {
    constructor() {
        this.API = new APIHelper;
        this.data = '';
    }
    init(restaurantId, data) {
        //Assuming an empty #sidebar-info-box div
        this.data = data;
        const infoBoxData = data.find(item => item.id === restaurantId);
        //select info-box div and add class to change the css properties of the div
        const infoBox = document.querySelector("#sidebar-info-box");
        infoBox.classList.add("active-sidebar-component");

        infoBox.innerHTML = `

        <div id="info-box-title">
            <h2 id="info-box-restaurant-name">${infoBoxData.restaurantName}</h2>
            <button class="btn x-button">&#10006;</button>
        </div>
        <div class="resturant-image-container">
            <img class="resturant-image" src="${this.API.streetViewStaticURL(infoBoxData.lat, infoBoxData.lng)}">
        </div>
        <div id="sidebar-restaurant-info">
            <p>
                <b>Address:</b> ${infoBoxData.address}
            </p>
            <p>
                <b>Average Rating:</b> ${infoBoxData.avgRating}
            </p>
            <button class="btn-add-review">Add Review</button>
            <a class="btn-external" href="${infoBoxData.website}" target="_blank">Website</a>
            <div id="info-box-reviews">
                <h3>User Reviews</h3>

            </div>
        </div>`;

        //Display reviews/rating from the JSON data with accompanying
        const reviewContainer = document.querySelector("#info-box-reviews");
        infoBoxData.ratings.forEach(rating => {
            const review = document.createElement("div");
            review.setAttribute("class", "review");
            review.innerHTML = `
            <p><b>Review: </b>${rating.comment}</p>
            <p><b>Rating: </b>${rating.stars}</p>`;
            reviewContainer.appendChild(review);
        });

        //Add event listener to exit button
        document.querySelector(".x-button").addEventListener("click", () => {
            this.clear();
        });
        //Add event listener to add review button
        document.querySelector(".btn-add-review").addEventListener("click", () => {
            this.addReviewForm(infoBoxData);
        });
    }
    clear() {
        //Clear the sidebar-info-box div to remove all content and take up no space
        const infoBox = document.querySelector("#sidebar-info-box");
        infoBox.innerHTML = '';
        infoBox.classList.remove("active-sidebar-component");
    }
    addReviewForm(infoBoxData) {
        //Clear the contents of the sidebar-info-box 
        const infoBoxReview = document.querySelector("#sidebar-restaurant-info");
        infoBoxReview.innerHTML = `
        
        <div id="add-review-container">
            <h2>Leave a Review</h2>
            <div id="review-form">
                <form id="login-form" novalidate>
                    <p>
                        <div>
                            <b>Rating (1-5): </b>
                        </div>
                        <select id="review-stars">
                            <option value="1">1 star</option>
                            <option value="2">2 star</option>
                            <option value="3">3 star</option>
                            <option value="4">4 star</option>
                            <option value="5">5 star</option>
                        </select>
                    </p>
                    <p>
                        <div>
                            <b>Comment: </b>
                        </div>
                        <textarea type="text" class="form-textarea" rows="3" id="review-comment" placeholder="Best food ever!"></textarea>
                    </p>
                    <input type="submit" value="Submit Review" id="btn-submit-review" class="btn">
                </form>
            </div>
        </div>`;

        //select data from the review for use when review is submitted by user
        const restaurantName = document.querySelector("#info-box-restaurant-name");
        const reviewStars = document.querySelector("#review-stars");
        const reviewComment = document.querySelector("#review-comment");

        //Add event listener to monitor when the user submits their review
        document.querySelector("#btn-submit-review").addEventListener("click", () => {
            event.preventDefault();
            const reviewData = {
                restaurantName: restaurantName.textContent,
                ratings: {
                    stars: parseInt(reviewStars.value, 10),
                    comment: reviewComment.value
                }
            }
            this.submitReview(reviewData, infoBoxData);
        });
    }
    submitReview(reviewData, dataItem) {
        //add new review into dataset and update the average review of data item
        dataItem.ratings.push(reviewData.ratings);
        dataItem.avgRating = avgStarRating(dataItem.restaurantName, this.data);

        const sidebarRating = document.querySelector(`#rating-${dataItem.id}`);
        sidebarRating.innerHTML = `Rating: ${dataItem.avgRating}`;
        this.clear();
        console.log(`user submitted a review for ${dataItem.restaurantName}. User review: ${reviewData}`);
    }
    addRestaurant() {
        const infoBox = document.querySelector("#sidebar-info-box");
        infoBox.classList.add("active-sidebar-component");
        infoBox.innerHTML = `
        <div id="info-box-title">
            <h2 id="info-box-restaurant-name">Add Restaurant</h2>
            <button class="btn x-button">&#10006;</button>
        </div>

            <div id="add-restaurant">
                <form id="login-form" novalidate>
                    <p><b>Restaurant Name</b></p>
                    <p><input type="text" class="form-width" id="add-new-name" placeholder="Burger King"></p>
                    
                    <p><b>Address: </b></p>
                    <p><textarea type="text" class="form-width form-textarea" rows="3" cols="25" id="add-new-address" placeholder="Best food ever!"></textarea></p>
                    
                    <p><b>Average Rating (1-5): </b></p>
                    <p>
                        <select id="add-new-rating" class="form-width">
                            <option value="1">1 star</option>
                            <option value="2">2 star</option>
                            <option value="3">3 star</option>
                            <option value="4">4 star</option>
                            <option value="5">5 star</option>
                        </select>
                    </p>
                    
                    <p><b>Latitude & Longitude</b></p>
                    <div id="add-restaurant-map"></div>
                    <p class="lat-lng">
                        <input type="number" class="form-half-width" id="add-new-lat" placeholder="53.483">
                        <input type="number" class="form-half-width" id="add-new-lng" placeholder="-2.236">
                    </p>
                    
                    
                    <input type="submit" value="Submit Restaurant" id="btn-submit-restaurant" class="btn">
                </form>
            </div>
        
        `;
    }
}