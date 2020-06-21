export class APIHelper {
    constructor() {
        this.APIKey = 'AIzaSyBYnKM88MomSm_Y5OI57p8-h7x1m8C_bWQ';
        this.baseURL = {
            streetViewStatic: 'https://maps.googleapis.com/maps/api/streetview?',
            placesNearbySearch: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?',
            placesDetails: ''
        }
    }
    streetViewStaticURL(lat, lng, size = "250x200") {
        const parametersURL = `location=${lat},${lng}&size=${size}&key=${this.APIKey}`;
        return this.baseURL.streetViewStatic + parametersURL;
    }
}