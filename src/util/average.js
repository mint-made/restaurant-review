/*calculates avg star rating (1dp) taking in the name of the restaurant and data
restaurantName is used as a key to access corresponding data where the ratings
can then be averaged
*/
export function avgStarRating(restaurantName, data) {
    const dataItem = data.find(item => item.restaurantName === restaurantName);
    let sum = 0;
    dataItem.ratings.forEach(rating => {
        sum += rating.stars;
    });
    const avgRating = sum / dataItem.ratings.length;
    return avgRating.toFixed(1);
}