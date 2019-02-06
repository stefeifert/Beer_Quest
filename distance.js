let beerInDist = [];
const breweries = [{ latitude: 33.76, longitude: -84.39 }]
let radius = 0;
let address = "New York";
var map;
let activeInfoWindow = null;
let iniLoad = 0;

///vvv const beerArray ajax call vvv///
//
let outputArray = [];
const beerReqs = [];
for (let page = 1; page <= 161; page++) {
	const beerReq = axios.get(`https://api.openbrewerydb.org/breweries?page=${page}&per_page=50`);
	beerReq.catch(function (err) {
		return err;
	});
	beerReqs.push(beerReq);
}
Promise.all(beerReqs).then(function (responses) {
	responses.forEach(function (response) {
		if (response instanceof Error === false) {
			outputArray = outputArray.concat(response.data);
		}
	});
	console.log("here", outputArray);
	getLocation();
});

/// vvv current location functions vvv ///
//
const getLocation = function (e) {  //grabs current coords
	if (navigator.geolocation) {
		bounds = new google.maps.LatLngBounds();
		navigator.geolocation.getCurrentPosition(posiFun);
	} else {
		console.log("Geolocation is not supported by this browser.");
	}
}

const currentButtonOff = function (e) { //starts the show, on click!
	e.preventDefault()
	bounds = new google.maps.LatLngBounds(); //is this right? //taking it out
	if ($('#search').val() == '' && $('#searchM').val() == '') {  //if search is empty, then get local
		getLocation()
	} else {
		getAddress()  //else get add
	}
}

/// vvv address location vvv ///
//
function getAddress() { //turns search field into a readable address
	bounds = new google.maps.LatLngBounds();
	let search = $('#search').val()
	let searchM = $('#searchM').val()
	if (search == '' && searchM != '') {
		search = searchM
		initMap()
	}
	address = search
	initMap()
	// return address
}
//
function initMap() { //creates a map, this runs on initialize
	bounds = new google.maps.LatLngBounds();  //duplicate or needed? it DOES run on intial //clears pins
	map = new google.maps.Map(document.getElementById('maps'), {
		center: { lat: 33.7760831, lng: -84.3965306 },
		zoom: 12
	});
	var geocoder = new google.maps.Geocoder();
	geocodeAddress(geocoder, map);
	return bounds
}
//
function geocodeAddress(geocoder, resultsMap) { //translates address into coords
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
		lat1 = results[0].geometry.location.lat()  //translates coords
		lon1 = results[0].geometry.location.lng()
		loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
		if (iniLoad === 1) {
			bounds.extend(loc); // sets map boundry
		} else { iniLoad = 1 }
		distCheck()
		return {
			lat1,
			lon1,
			bounds
		}
	});
}
//
/// ^^^ address location ^^^ ///


//
function posiFun(position) { // makes coords useable
	lat1 = position.coords.latitude;
	lon1 = position.coords.longitude;
	const current = {
		lat: lat1,
		lng: lon1
	};
	currentMap(current)
}
//
function currentMap(current) {
	//run as alt to initMap if an address is not entered, ie runs above coords
	map = new google.maps.Map(document.getElementById('maps'), {
		center: { lat: lat1, lng: lon1 },
		zoom: 12
	});
	// map.setCenter(current);
	var marker = new google.maps.Marker({
		map: map,
		position: { lat: lat1, lng: lon1 }
	})
	distCheck()
}
/// ^^^ current location functions ^^^ ///

/// vvv Distance Between Coords from GeoDataSource vvv ///
//
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
//
function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		let radlat1 = Math.PI * lat1 / 180;
		let radlat2 = Math.PI * lat2 / 180;
		let theta = lon1 - lon2;
		let radtheta = Math.PI * theta / 180;
		let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180 / Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit == "K") { dist = dist * 1.609344 }
		if (unit == "N") { dist = dist * 0.8684 }
		return dist;
	}
}
//
/// ^^^ Distance Between Coords from GeoDataSource ^^^ ///

const distCheck = function () {
	radius = $('#radius').val()
	beerInDist = []
	lat1 = lat1;
	lon1 = lon1;
	if (radius === 0 || radius === undefined || radius === '') {
		radius = 10
	}
	else {
		radius = $('#radius').val()
	}
	for (i = 0; i < outputArray.length; i++) {
		lat2 = outputArray[i].latitude;
		lat2 = Number(lat2);
		lon2 = outputArray[i].longitude;
		lon2 = Number(lon2);
		dist = distance(lat1, lon1, lat2, lon2)
		if (dist <= radius) {
			beerInDist.push(outputArray[i].id)
		}
	}
	$('#radius').val('')
	whereBeer(beerInDist)
	return beerInDist
}

function whereBeer() {
	//this populates the local brewery information
	const breweries = []
	$('#breweries').empty()
	for (i = 0; i < outputArray.length; i++) {
		/// which ones? ///
		if (beerInDist.includes(outputArray[i].id)) {
			/// this one, push it ///
			breweries.push({
				latitude: Number(outputArray[i].latitude),
				longitude: Number(outputArray[i].longitude),
				name: outputArray[i].name
			})
			/// append ///
			$('#breweries').append(`
			<div class='card'>
			<h1>${outputArray[i].name}</h1>
			<p>${outputArray[i].street}</p>
			<p>${outputArray[i].city}, ${outputArray[i].state}</p>
			<p>Type of Brewery: ${outputArray[i].brewery_type}</p>
			<p class="website"><a href='${outputArray[i].website_url}' target='_blank'>CLICK HERE FOR MORE INFO</p>
			</div>
			`)
			// outputArray[i].postal_code);
			// ...updated_at);
			// ...tag_list);
			// ...phone	
		}
	} setMarkers(map, breweries)
}


function setMarkers(resultsMap, breweries) {
	for (let i = 0; i < breweries.length; i++) {
		var brew = breweries[i];
		const latLong = new google.maps.LatLng({ lat: brew.latitude, lng: brew.longitude });
		const mileage = google.maps.geometry.spherical.computeDistanceBetween(latLong, resultsMap.getCenter());
		const toMiles = Math.floor(mileage / 1609.344);
		let infoWindow = new google.maps.InfoWindow({
			content: "<h6 style='color:black'>" + brew.name + "</h6> <p style='color:black'>Approximately " + toMiles + " miles away</p>"
		});
		let marker = new google.maps.Marker({
			position: { lat: brew.latitude, lng: brew.longitude },
			title: brew.name,
			icon: 'beer_sign.png',
			animation: google.maps.Animation.DROP,
			map: resultsMap
		});
		google.maps.event.addListener(marker, 'click', function (e) {
			if (activeInfoWindow) activeInfoWindow.close();
			infoWindow.open(resultsMap, marker);
			activeInfoWindow = infoWindow;
		});
		google.maps.event.addListener(resultsMap, 'click', function () {
			infoWindow.close();
		});
		loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
		bounds.extend(loc);
	}
	map.fitBounds(bounds);
	map.panToBounds(bounds);
	$('#search').val('')
	$('#searchM').val('')
}

$('#submit').on('click', currentButtonOff)
$('#submitM').on('click', currentButtonOff)
 //set current location


/// vvv iceboxed type sorting vvv ///
//
// function tabToggle() {
// 	const type = $(this).attr('id')
// 	const ele = document.getElementById(`${type}`)
// 	ele.classList.toggle("active")
// }
//
// $('#types').on('click', '.type', tabToggle)
//
/// ^^^ iceboxed type sorting ^^^ ///

//barrel.png
//<div>Icons made by <a href="https://www.flaticon.com/authors/ddara" title="dDara">dDara</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

// beer_sign.png
// <div>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>