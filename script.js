
var cities = ["Cairo"];
var storedCities = JSON.parse(localStorage.getItem("cities"))
var apiKey = "caccde44d5d35cb32c1e548278843b75";

// Call submitted city api and display it's weather, uv index, and forecast
$("#searchForm").submit(function(event){
    event.preventDefault();
    citySearch = String($("#searchCity").val().trim().charAt(0).toUpperCase() + $("#searchCity").val().trim().slice(1));
    cityApiCall(citySearch);
    if(citySearch){
        cities.unshift(citySearch);
        var storeCities = localStorage.setItem("cities",JSON.stringify(cities));
        console.log("Added city");
        displaySearchHistory(cities);
    }
    $("#searchHistory li").first().attr("style","background:#17a2b8; color:#fff;");
    $("#searchCity").val("");
});

// Call selected city api and display it's weather, uv index, and forecast
$("#searchHistory").on("click", ".cityHistory", function(event){
    event.preventDefault();
    console.log($(this).text());
    $(".cityHistory").attr("style","background:transparent; color:#212529;");
    $(this).attr("style","background:#17a2b8; color:#ffffff;");
    cityApiCall($(this).text());
});

// Use searched city to call for its weather api and display it
function cityApiCall(citySearch){
    cityQueryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&units=imperial&apikey=" + apiKey;

    $.ajax({
    url: cityQueryURL,
    method: "GET",
    }).then(function(response){

        console.log(response);

        var cityName = response.name;
        console.log(cityName);
    
        var cityDate =  new Date();  
        console.log(cityDate);
    
        var cityCondition = response.weather[0].icon;
        console.log(cityCondition);
    
        var cityTemp = response.main.temp;
        console.log(cityTemp);
    
        var cityHum = response.main.humidity;
        console.log(cityHum);
    
        var cityWind = response.wind.speed;
        console.log(cityWind);
    
        var cityLat = response.coord.lat;
        console.log(cityLat);
    
        var cityLon = response.coord.lon;
        console.log(cityLon);
    
        $("#cityName").text(cityName);
        $("#cityDate").text(cityDate.toString().substr(0, 15) + " ");
        $("#cityCondition").attr("src","https://openweathermap.org/img/wn/" + cityCondition + "@2x.png");
        $("#cityCondition").attr("alt",response.weather[0].description);
        $("#cityTemp").text("Temp: " + cityTemp + " °F");
        $("#cityWind").text("Wind Speed: " + cityWind + " MPH");
        $("#cityHum").text("Humiditiy: " + cityHum + "%");

        uvApiCall(cityLat,cityLon);
        forecastApiCall(cityName);
    });
};

// Use city latitude and city longtitude to call for its uv index api and display it
function uvApiCall(cityLat,cityLon){
    var uvQueryURL =
    "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityLat + "&lon=" + cityLon + "&appid=" + apiKey;

    $.ajax({
    url: uvQueryURL,
    method: "GET",
    }).then(function(response) {

        console.log(response);

        var cityUv = response.value;
        console.log(cityUv);
        var cityUvEl = $("#cityUv").text("UV Index: " + cityUv);
        if (cityUv <= 3){
            cityUvEl.attr("class","alert alert-success");
        } else if (cityUv <= 6){
            cityUvEl.attr("class","alert alert-warning");
        } else {
            cityUvEl.attr("class","alert alert-danger");
        }
    });
};

// Use city name to call for its forecast api and display it
function forecastApiCall(cityName){
    var forecastQueryUrl =
    "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=" + apiKey;

    $.ajax({
    url: forecastQueryUrl,
    method: "GET",
    }).then(function(response) {

        console.log(response);

        var forecastDate = new Date();
        console.log(forecastDate);

        var forecastList = response.list
        $("#cityForecast").empty();
        for(var i=0;i < 5;i++){
            var forecastEl = $("<div class='cityForecastDay col-lg text-white bg-info p-4 mr-lg-3 my-2 card'>");
            $("#cityForecast").append(forecastEl);
            var forecastDateEl = $("<h3 id='cityForcastDate'>")
            forecastDate.setDate(forecastDate.getDate() + 1)
            forecastDateEl.text(forecastDate.toString().substr(0, 15));
            forecastEl.append(forecastDateEl);

            var forecastConditionEl = $("<img>");
            forecastConditionEl.attr("src","https://openweathermap.org/img/wn/" + forecastList[i].weather[0].icon + "@2x.png");
            forecastConditionEl.attr("alt",forecastList[i].weather[0].description);
            forecastEl.append(forecastConditionEl);
        
            var forecastTempEl = $("<p id='cityForecastTemp'>");
            forecastTempEl.text("Temp: " + forecastList[i].main.temp + " °F");
            forecastEl.append(forecastTempEl);

            var forecastHumEl = $("<p id='cityForecastHum'>");
            forecastHumEl.text("Humiditiy: " + forecastList[i].main.humidity + "%");
            forecastEl.append(forecastHumEl);
        };
    });
};

// Display updated search history
function displaySearchHistory(cities){

    $("#searchHistory").empty();

    for(var i=0;i<cities.length;i++){
        if(i<5){
            var cityNameHistoryEl = $("<li class='cityHistory list-group-item'>");
            cityNameHistoryEl.text(cities[i]);
            $("#searchHistory").append(cityNameHistoryEl);
        }
    }
    
}

// Display stored search history
function initilizeSearchHistory(){
    if(storedCities != null || storedCities === 0){
        cities = storedCities;
    }
    displaySearchHistory(cities);
    $("#searchHistory li").first().attr("style","background:#17a2b8; color:#fff;");
    cityApiCall($("#searchHistory li").first().text());
}

initilizeSearchHistory();