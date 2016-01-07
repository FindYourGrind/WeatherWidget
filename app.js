var WeatherWidgetApp = angular.module('WeatherWidgetApp', ['ngStorage']);

WeatherWidgetApp.controller('WeatherWidgetController', function($scope, $http, $localStorage) {

    /*
        CONTROL
     */

    //Getting weather data from http://api.openweathermap.org by city name and country (2-3 literals)
    $scope.getWeather = function(data) {
        if(data) {
            //if data from text input ok reset the error
            $scope.error.inputData = '';
            //do request
            $http({
                method: 'GET',
                url: 'http://api.openweathermap.org/data/2.5/weather?q=' +
                      data +
                     '&units=metric&appid=2de143494c0b295cca9337e1e96b00e0'
            }).then(function successCallback(response) {
                //set weather data
                $scope.weather = response.data;
                //get location
                var region = '' + response.data.name + ',' + response.data.sys.country;
                //check for existing
                var index = $scope.$storage.locations.indexOf(region);
                if(index < 0) {
                    //create new bookmark
                    $scope.$storage.locations.push(region);
                    $scope.$storage.activeLocation = $scope.$storage.locations.length - 1;
                } else {
                    //activate existing bookmark
                    $scope.$storage.activeLocation = index;
                }
                //construct full image name
                $scope.weatherIcon = $scope.getWeatherImage($scope.weather.weather[0]['icon']);
            }, function errorCallback(err) {
                //request error
                $scope.weather = err;
            });
        }
        else{
            if($scope.$storage.activeLocation != -1) {
                //if data from text input is incorrect - set the error
                $scope.error.inputData = 'Please, type correct region'
            } else {
                //no bookmarks
                $scope.error.inputData = 'Type new region'
            }
        }
    };

    //construct full weather image name
    $scope.getWeatherImage = function(img){
        return img + '.png'
    };

    //delete bookmark
    $scope.deleteBookmark = function(region){
        var index = $scope.$storage.locations.indexOf(region);
        if(index === $scope.$storage.activeLocation){
            //shift if we on the active
            $scope.$storage.activeLocation--;
            $scope.getWeather($scope.$storage.locations[$scope.$storage.activeLocation])
        }
        //delete
        $scope.$storage.locations.splice(index,1);
    };

    /*
        MODEL
     */

    //Model for location text input
    $scope.inputData = {
        text: '',
        pattern: /\s*\w{1,},\s*\w{2,3}\s*$/
    };

    //Weather data from http://api.openweathermap.org
    $scope.weather = '';
    //Name of weather icon from http://api.openweathermap.org
    $scope.weatherIcon = '';
    //Different errors
    $scope.error = {
        inputData: ''
    };

    //Local storage for saving states between page reloads
    $scope.$storage = $localStorage.$default({
        'locations': ['New York,US', 'Kiev,UA'],
        'activeLocation': 0
    });

    //Start initialization
    $scope.getWeather($scope.$storage.locations[$scope.$storage.activeLocation])

    $scope.app = {
        imageUrl: "http://openweathermap.org/img/w/" + $scope.weatherIcon
    };
    var random = (new Date()).toString();
    $scope.imageSource = $scope.app.imageUrl + "?cb=" + random;
});

//Standard directive for Enter key event
WeatherWidgetApp.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});