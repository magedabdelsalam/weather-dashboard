$(document).ready(function () {

    var cities = ["Cairo"];
    var storedCities = JSON.parse(localStorage.getItem("cities"));
    var apiKey = "caccde44d5d35cb32c1e548278843b75";
    // Call submitted city api and display it's weather, uv index, and forecast
    $("#searchForm").submit(function(event){
        event.preventDefault();
        citySearch = String($("#searchCity").val().trim());
        $("#searchCity").val("");
        $("#searchCity").attr("placeholder","");
        $("#searchCity").attr("style","background: url(assets/load.gif) no-repeat 16px 8px; background-size: 30px");
        setTimeout(function(){ 
            $("#searchCity").attr("style","background: none;");
            cityApiCall(citySearch);
        }, 300);
    });

    // Call selected city api and display it's weather, uv index, and forecast
    $("#searchHistory").on("click", ".cityHistory", function(event){
        event.preventDefault();
        console.log($(this).text());
        $(".cityHistory").attr("style","background:transparent; color:#212529;");
        $(this).addClass("text-light bg-secondary");
        cityApiCall($(this).text());
    });

    $("#degree").on("click", function() {
        if ($(this).text() == $(this).data("text-swap")) {
            $(this).text($(this).data("text-original"));
            $(this).data("unit","°F");
        } else {
            $(this).data("text-original", $(this).text());
            $(this).text($(this).data("text-swap"));
            $(this).data("unit","°C");
        }
        initilizeSearchHistory();
    });

    // Use searched city to call for its weather api and display it
    function cityApiCall(citySearch){
        var degree = $("#degree").text();
        var degreeUnit = $("#degree").data("unit");

        cityQueryURL =
        "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&units=" + degree + "&apikey=" + apiKey;

        $.ajax({
        url: cityQueryURL,
        method: "GET",
        }).then(function(response){

            console.log(response);

            var cityName = response.name;
            console.log(cityName);

            var cityCountry = response.sys.country;
        
            var cityDate =  new Date();  
            console.log(cityDate);
        
            var cityCondition = response.weather[0].icon;
            console.log(cityCondition);

            if (cityCondition.includes("d")){
                $("#cityWeather").removeClass("text-light bg-secondary");
                $("#cityWeather").addClass("text-secondary bg-light");
            } else if (cityCondition.includes("n")){
                $("#cityWeather").removeClass("text-secondary bg-light");
                $("#cityWeather").addClass("text-light bg-secondary");
            }
        
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

            $("#searchCity").attr("placeholder","Search city");

            // Add to array if it's not already included. If it is, reposition to top of array.
            if(!cities.includes(cityName)){
                cities.unshift(cityName);
                if(cities.length > 5){
                    cities.pop();
                };
                var storeCities = localStorage.setItem("cities",JSON.stringify(cities));
                displaySearchHistory(cities);
                $("#searchHistory li").first().addClass("text-light bg-secondary");
            } else if (cities.includes(cityName)){
                displaySearchHistory(cities);
                $("#"+cityName).addClass("text-light bg-secondary");
            };
        
            $("#cityName").text(cityName + ", " + cityCountry);
            $("#cityDate").text(cityDate.toString().substr(0, 15) + " ");
            $("#cityCondition").attr("src","https://openweathermap.org/img/wn/" + cityCondition + "@2x.png");
            $("#cityCondition").attr("alt",response.weather[0].description);
            $("#cityTemp").text("Temp: " + cityTemp + " " + degreeUnit);
            $("#cityWind").text("Wind Speed: " + cityWind + " MPH");
            $("#cityHum").text("Humiditiy: " + cityHum + "%");

            uvApiCall(cityLat,cityLon);
            forecastApiCall(cityName);

            $("#mapid").remove();
            var cityMapEl = $("<div id='mapid'>");
            $("#cityMap").append(cityMapEl);
            var cityMap = L.map('mapid').setView([cityLat, cityLon], 10);
            console.log(cityMap);

            L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                minZoom: 1,
                id: 'mapbox/light-v10',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: 'pk.eyJ1IjoiZGFnYWRlZ28iLCJhIjoiY2lvbjFyNGh3MDA2bnRybTQycHZ1b3JhciJ9.xAZRQIVTJjMLT0lcogOFbg'
            }).addTo(cityMap);

            L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={appId}', {
                attribution: '<a href="https://www.openweathermap.org/">OpenWeatherMap</a>',
                layer: 'wind_new',
                appId: 'caccde44d5d35cb32c1e548278843b75'
            }).addTo(cityMap);
        }).fail(function(){
            $("#searchCity").attr("placeholder","Try again, city not found");
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
        var degree = $("#degree").text();
        var degreeUnit = $("#degree").data("unit");

        var forecastQueryUrl =
        "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=" + degree + "&appid=" + apiKey;

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
                var forecastEl = $("<div class='cityForecastDay col-lg p-4 mr-lg-3 my-2 card'>");
                $("#cityForecast").append(forecastEl);
                
                if (forecastList[i].sys.pod === "d"){
                    forecastEl.addClass("text-secondary bg-light");
                } else if (forecastList[i].sys.pod === "n"){
                    forecastEl.addClass("text-light bg-secondary");
                }

                var forecastDateEl = $("<h3 id='cityForcastDate'>")
                forecastDate.setDate(forecastDate.getDate() + 1)
                forecastDateEl.text(forecastDate.toString().substr(0, 15));
                forecastEl.append(forecastDateEl);

                var forecastConditionEl = $("<img>");
                forecastConditionEl.attr("src","https://openweathermap.org/img/wn/" + forecastList[i].weather[0].icon + "@2x.png");
                forecastConditionEl.attr("alt",forecastList[i].weather[0].description);
                forecastEl.append(forecastConditionEl);
            
                var forecastTempEl = $("<p id='cityForecastTemp'>");
                forecastTempEl.text("Temp: " + forecastList[i].main.temp + " " + degreeUnit);
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
            var cityNameHistoryEl = $("<li class='cityHistory list-group-item'>");
            cityNameHistoryEl.text(cities[i]);
            cityNameHistoryEl.attr("id",cities[i]);
            $("#searchHistory").append(cityNameHistoryEl);
        } 
    }

    // Display stored search history
    function initilizeSearchHistory(){
        if(storedCities != null || storedCities === 0){
            cities = storedCities;
        }
        displaySearchHistory(cities);
        $("#searchHistory li").first().addClass("text-light bg-secondary");
        cityApiCall($("#searchHistory li").first().text());
    }

    initilizeSearchHistory();
});