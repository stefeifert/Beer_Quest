let beerInDist = [];

//////const beerArray ajax call//////
var pageNum = 1;

const makeAjaxCall = function (page, array) {
 $.ajax({
   url: `https://api.openbrewerydb.org/breweries?&page=${page}&per_page=50`,
   method: 'GET'
 }).then(function (response) {
   array.push(...response);
   if (response.length == 50) {
     page++;
     return makeAjaxCall(page, array)
   }
 });
 return array
}

const outputArray = makeAjaxCall(pageNum, []);
setTimeout(outputArray, 0);

//////const beerArray ajax call//////

// micro, regional, brewpub, large, planning, bar, contract, proprietor
// break by type?


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		let radlat1 = Math.PI * lat1/180;
		let radlat2 = Math.PI * lat2/180;
		let theta = lon1-lon2;
		let radtheta = Math.PI * theta/180;
		let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}


////////////W3 SCHOOLS GEOLOCATION/////////////
///vvv Refactored For Our Purposes vvv///
const getLocation = function() {
  if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(posiFun);
  } else { 
    console.log("Geolocation is not supported by this browser.");
  }
}

function posiFun (position) {
	lat1 = position.coords.latitude;
	lon1 = position.coords.longitude;
	return {
		lat1: lat1,
		lon1: lon1
	}
}


///^^^ Refactored For Our Purposes ^^^///

let radius = 10;
const distCheck = function () {
	$('#radius').val()
	beerInDist = []
	
  lat1 = lat1;
	lon1 = lon1;
	radius = $('#radius').val()
  
	for (i = 0; i<outputArray.length; i++) {
		lat2 = outputArray[i].latitude;
		lat2 = Number(lat2); 
		lon2 = outputArray[i].longitude;
		lon2 = Number(lon2);
		dist = distance(lat1, lon1, lat2, lon2)
	if (dist <= radius) {  //10 to var 
		beerInDist.push(outputArray[i].id) //push id to array
		}
	}
	whereBeer(beerInDist)
	return beerInDist
}

function whereBeer () {
	// console.log(beerInDist)
	for (i=0; i<outputArray.length; i++) {
		if (beerInDist.includes(outputArray[i].id)) {
			console.log(outputArray[i].name);
			console.log(outputArray[i].street);
			console.log(outputArray[i].city);
			console.log(outputArray[i].state);
			console.log(outputArray[i].postal_code);
			console.log(outputArray[i].website_url);
			console.log(outputArray[i].updated_at);
			console.log(outputArray[i].brewery_type);
			console.log(outputArray[i].tag_list);

		}
	}
}

let address = "New York";
function getAddress (e) {
	e.preventDefault()
	// console.log(outputArray)
	let street = $('#street').val()
	let city = $('#city').val()
	let state = $('#state').val()
	let zip = $('#zip').val()
	if (street !== '' || city !== '' || state !== '' || zip !== '') {
		address = (`${street}, ${city}, ${state}, ${zip}`)
	} else { 
		// getLocation()
		address = "New York"
	}
	initMap()
	return address
}

///vvv Gabe's Map Functions vvv///
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
  geocoder.geocode({ 'address': address }, function (results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
    lat1 = results[0].geometry.location.lat()
		lon1 = results[0].geometry.location.lng()
		// console.log(lat1, lon1)
		distCheck()
    return {
      lat1,
      lon1
    }
  });
}
///^^^ Gabe's Map Functions ^^^///

$('#submit').on('click', getAddress)


///vvv sort functions to add vvv//
/*
brewer_type: micro, regional, brewpub, large, planning, bar, contract, proprietor
tags {
			dog-friendly, patio, food-service, food-truck, tours
			}

/// returns ///

dist (as the beer-jay flies)
*/
///^^^ sort functions to add ^^^//


/// vvv form temp vvv ///
/*
<form>  <!--this form should be moved or replaced-->
<input type="text" id="street" placeholder="Address: 1234 Main St.">
<input type="text" id="city" placeholder="City: Heresville">
<input type="text" id="state" placeholder="State: Thereorado">
<input type="text" id="zip" placeholder="Zip Code: 90120">
<input type="text" id="radius" placeholder='Radius'>
<input type="submit" id="submit">
</form>
*/
/// end form ///