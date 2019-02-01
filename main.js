// var pageNum = 1;
// var allDATA;
// const makeAjaxCall = function (page, array) {
//   $.ajax({
//     url: `https://api.openbrewerydb.org/breweries?by_city=${cityInput}&page=${page}&per_page=50`,
//     method: 'GET'
//   }).then(function (response) {
//     array.push(...response);
//     if (response.length == 50) {
//       page++;
//       return makeAjaxCall(page, array)
//     }
//   });
//   return array
// }
// const outputArray = makeAjaxCall(pageNum, []);
// setTimeout(function () {
//   allDATA = outputArray;
// }, 400);
// console.log(allDATA);

const cityInput = "seattle";
const beerReqs = [];
for (let page = 1; page <= 5; page++) {
  const beerReq = $.ajax({
    url: `https://api.openbrewerydb.org/breweries?by_city=${cityInput}&page=${page}&per_page=50`,
    method: 'GET'
  });
  beerReqs.push(beerReq);
}
Promise.all(beerReqs).then(function (responses) {
  let breweries = [];
  responses.forEach(function (response) {
    breweries = breweries.concat(response);
  });
  console.log(breweries);
});



var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('maps'), {
    center: { lat: 33.7760831, lng: -84.3965306 },
    zoom: 12
  });

  var geocoder = new google.maps.Geocoder();
  geocodeAddress(geocoder, map);
}


function geocodeAddress(geocoder, resultsMap) {
  var address = "3960 Church View Ln, Suwanee, GA 30024";
  geocoder.geocode({ 'address': address }, function (results, status) {
    // if (status === 'OK') {
    //   resultsMap.setCenter(results[0].geometry.location);
    //   var marker = new google.maps.Marker({
    //     map: resultsMap,
    //     position: results[0].geometry.location
    //   });
    // } else {
    //   alert('Geocode was not successful for the following reason: ' + status);
    // }
    console.log(results[0].geometry.location.lat());
    console.log(results[0].geometry.location.lng());
  });
}


// initial
// get current position
// render map with

// on click
// get address position
// render map with address
