

var locationForm = document.getElementById('location-form');
var selectValue;
var day, inverseDist, solarDecl,latRad, sunAngle, dli, R_a,lat,lng, factor;

//Transmittance value is constant and equal to 1.0. Transmittance type: No cover
var transmit=1.0;

//Constants
const k1 = (24 * 60)/Math.PI;
const solarConstant = 0.082;

//set up the map
var geocoder = new google.maps.Geocoder();
var marker = null;
var map = null;

// initialize(lt,lg) shows a location entered by the user on the map
function initialize(lt, lg) {

      var latitude = lt;
      var longitude = lg;
      var zoom = 6;

      var LatLng = new google.maps.LatLng(latitude, longitude);

      var mapOptions = {
        zoom: zoom,
        center: LatLng,
        panControl: false,
        scaleControl: true,
      }

      map = new google.maps.Map(document.getElementById('map'), mapOptions);
      if (marker && marker.getMap) marker.setMap(map);
      marker = new google.maps.Marker({
        position: LatLng,
        map: map,
        title: 'Drag Me!',
       // draggable: true,
      });

      google.maps.event.addListener(marker, 'dragend', function(marker) {
        var latLng = marker.latLng;     
      });

      // Resize stuff...
      google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
       google.maps.event.trigger(map, "resize");
        map.setCenter(center); 
  });


    }
    initialize (40.730824, -73.997330);
//Step 1.Calculate and set day of the year (1-366)
//For example, if today is January 1st, day of the year is 1
function setDay(k){
    
	//Two-dimensional array stores each month's median day N and day number of the year for that day N
	//For ex., Jan 1 is the day number 1 of the year

	var months = [ ['month','medianDay N', 'dayOfTheYear'], ['jan',15.5,15.5],['feb',14,45],['mar',15.5,74.5], 
	['apr',15,105],['may',15.5,135.5],['jun',15,166],['jul',15.5,196.5],['aug',15.5,227.5],
	['sept',15,258],['oct',15.5,288.5],['nov',15,319],['dec',15.5,349.5] ];
	
	//extract day number of the year for month k
	day = months[k][2];
}

// Step 2. Calculate and set the inverse distance

function setDistance(k){
	
	//first need to set day of the year
	setDay(k);
	//set inverse distance
	inverseDist = 1 + 0.033 * Math.cos(((2 * Math.PI) / 365 )* day);

}

//Step 3. Calculate and set the solar declination

function setSolarDec(k){

	//first need to set day of the year
	setDay(k);
	//set solar declination
	solarDecl = 0.409 * Math.sin((2 * Math.PI / 365) * day - 1.39);
}

//Step 4. Calculate the latitude in Radians

function setLatRad(){

	//set latitude in Radians
	latRad = (Math.PI/180) * lat;

}

//Step 5. Calculate the sunset hour angle

function setSunAngle(k){

	//first need to set latitude in Radians and solar declination
	setLatRad();
	setSolarDec(k);
	//set the sunset hour angle
	sunAngle = Math.acos(-Math.tan(latRad) * Math.tan(solarDecl));
}

//Step 6. Calculate R_a, extraterrestrial irradiance

function setR_a(k){

	//first need to compute all the variables used in calculation
	setDistance(k);
	setSunAngle(k);
	setLatRad();
	setSolarDec(k);

	//set R_a value
	R_a = ( (k1 * solarConstant) * inverseDist) * 
	(sunAngle * Math.sin(latRad) * Math.sin(solarDecl)
	+ Math.cos(latRad) * Math.cos(solarDecl) * Math.sin(sunAngle));
	}

//Final Step 7. Calculate the DLI, daily light integral

//the function accepts month number as input (not user input)
function findDli(k){

	//first set R_a value
	setR_a(k);
	//set dli value
	dli =  R_a * 1.0 * 2.04;
	return dli;
}



// Listen for submit button
locationForm.addEventListener('submit', geocode);

//function that extracts latitude and longitude values from Google geocoding API

function geocode(a){
a.preventDefault();
var location = document.getElementById('location-input').value;

axios.get('https://maps.googleapis.com/maps/api/geocode/json',{
params:{
address:location,

//Change the API key
key:'YOUR GOOGLE GEOCODING API KEY'
        }
      })
      .then(function(response){
      
        // output the full geocoding output to the console
        console.log(response);
        // Geometry - extracting location latitude and longitude
        lat = response.data.results[0].geometry.location.lat;
		lng = response.data.results[0].geometry.location.lng;
        
        var latitude = lat;
        var longitude = lng;
        initialize(latitude,longitude);
        
        
        
        for (var i = 1; i<=12;i++){
                //calculate dli for each month
                var monthDli = factor*findDli(i);
			    var output= monthDli.toFixed(1);
			    var month=""+i;
			    document.getElementById(month).innerHTML = output;
			    console.log("day number is" + day );
			    console.log ("Daily light integral: " + dli);
                console.log("latitude is" + lat );
                console.log("factor is " + factor);
			
			/* For debugging: - otherwise, remain commented out
            console.log("inverse distance number is" + inverseDist );
        	console.log("solar declination is" + solarDecl );
        	console.log("latitude in Radians is" + latRad );
        	console.log("sun Angle is" + sunAngle );
        	console.log("R_a is" + R_a );
        	console.log("transmittance is" + transmit);
			console.log("dli is" + dli);
			*/
		}
        

      })
      .catch(function(error){
        console.log(error);
      });

    }
    
    function handleClick() {

        var selectValue=document.getElementById("opList").value;
        
        //Consider the light factors
        if (selectValue ==""){
            factor = 1.0;
        }if (selectValue=="OutNoC"){
            factor = 1.0;
        } if (selectValue=="OutC"){
            factor = 0.7;
        } if (selectValue=="GrSun"){
            factor = 0.7;
        } if (selectValue =="GrCl"){
            factor = 0.47; 
        }
        return factor;

}

function setValue() {
	selectValue=document.getElementById("opList").value;
	
}

function init() {
    var button=document.getElementById("button");
    button.onclick=handleClick();
}

      
