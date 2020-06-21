// import `.scss` files
import './scss/styles.scss';

// import GoogleMap class
import { GoogleMap } from './lib/map.js';

// export default UserList class
// I used `defaultExport` to state that variable name doesn't matter
import * as JSONData from './data/restaurant-data.json';

//Access array of restaurant data within object {[{data},{data}]} => [{data},{data}]
const data = JSONData.default;



const Map = new GoogleMap;
Map.initMap(data);