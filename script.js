// define global variables
var cities = [];
var storedCities = JSON.parse(localStorage.getItem("cities"))
var apiKey = "caccde44d5d35cb32c1e548278843b75";

// display search history
function displaySearchHistory(){
    $("#searchHistory").empty();
    if(storedCities != null || storedCities === 0){
        cities = storedCities;
    }
    for(var i=0;i<cities.length;i++){
        var cityNameHistoryEl = $("<li class='cityHistory list-group-item'>");
        cityNameHistoryEl.text(cities[i]);
        $("#searchHistory").append(cityNameHistoryEl);
    }
}

// display city weather
function displayCityWeather(citySearch){
    var cityQueryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&units=imperial&apikey=" + apiKey;
    console.log(citySearch);
    console.log(cityQueryURL);

    $.ajax({
    url: cityQueryURL,
    method: "GET",
    }).then(function(response) {

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

        var uvQueryURL =
        "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityLat + "&lon=" + cityLon + "&appid=" + apiKey;
        console.log(uvQueryURL);
    
        $.ajax({
        url: uvQueryURL,
        method: "GET",
        }).then(function(response) {
    
            console.log(response);
    
            var cityUv = response.value;
            console.log(cityUv);
            var cityUvEl = $("#cityUv").text("UV Index: " + cityUv);
            if (cityUv <= 2){
                cityUvEl.attr("class","alert alert-success");
            } else if (cityUv <= 5){
                cityUvEl.attr("class","alert alert-warning");
            } else {
                cityUvEl.attr("class","alert alert-danger");
            }
    
        });
    
        $("#cityName").text(cityName + " - " + cityDate.toString().substr(0, 15) + " ");
        $("#cityCondition").attr("src","https://openweathermap.org/img/wn/" + cityCondition + "@2x.png");
        $("#cityCondition").attr("alt",response.weather[0].description);
        $("#cityTemp").text("Temp: " + cityTemp + " °F");
        $("#cityWind").text("Wind Speed: " + cityWind + " MPH");
        $("#cityHum").text("Humiditiy: " + cityHum + "%");
    
        var forecastQueryUrl =
        "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=" + apiKey;
        console.log(forecastQueryUrl);
    
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
                var forecastEl = $("<div class='cityForecastDay col-lg text-white bg-dark p-4 mr-lg-3 my-2 card'>");
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

    });

};

displaySearchHistory();
displayCityWeather("Cairo");

// Update search history with new searched city, save it to local storage, and show it's weather data
$("#searchBtn").submit(function(event){
    event.preventDefault();
    citySearch = $("#searchCity").val().trim();
    if(!citySearch){
        return;
    } else {
        console.log(citySearch);
        cities.unshift(citySearch);
        var storeCities = localStorage.setItem("cities",JSON.stringify(cities));
        displaySearchHistory();
        $("#searchCity").val("");
    }
    console.log(citySearch);
    displayCityWeather(citySearch);
});

// Dispaly weather data and highlight selected city
$("#searchHistory").on("click", ".cityHistory", function(event){
    event.preventDefault();
    console.log($(this).text());
    $(".cityHistory").attr("style","background:transparent; color:#343a40;");
    $(this).attr("style","background:#343a40; color:#ffffff;");
    displayCityWeather($(this).text());
});