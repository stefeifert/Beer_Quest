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
getLocation()

///^^^ Refactored For Our Purposes ^^^///

let radius;
const distCheck = function (e) {
	e.preventDefault()
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
	console.log(beerInDist)
	for (i=0; i<outputArray.length; i++) {
		if (beerInDist.includes(outputArray[i].id)) {
			console.log(outputArray[i].name);
		}
	}
}


// ///vvvGabe's Map Functionsvvv///
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('maps'), {
    center: { lat: 33.7760831, lng: -84.3965306 },
    zoom: 12
  });

  var geocoder = new google.maps.Geocoder();
  geocodeAddress(geocoder, map);
}

function click (e) {
	e.preventDefault()
	geocodeAddress()
}

function geocodeAddress(geocoder) {
	let add = $('#address').val()
	let city = $('#city').val()
	let state = $('#state').val()
	let zip = $('#zip').val()
	if (zip !== '' || state !== '' || city !== '' ||  add !== ''){
	address = `${add} ${city} ${state} ${zip}`;
	} else {address = "3960 Church View Ln, Suwanee, GA 30024";}
  geocoder.geocode({ 'address': address }, function (results) {
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
		console.log(results[0].geometry.location.lon());
		
  });
}
// ///^^^Gabe's Map Functions^^^///

$('#submit').on('click', click)