var locations = [
  {title: 'Empire State Building', location: {lat: 40.748541, lng: -73.985758}},
  {title: 'Time Square', location: {lat: 40.758895, lng: -73.985131}},
  {title: 'Central Park', location: {lat: 40.782865, lng: -73.965355}},
  {title: 'United Nations', location: {lat: 40.749548, lng: -73.969259}},
  {title: 'Metropolitan Museum of Arts', location: {lat: 40.779437, lng: -73.963244}},
  {title: 'Columbia University', location: {lat: 40.807536, lng: -73.962573}}
];
var markers = [];
var map;
var largeInfowindow;

function mapError() {
    $('#map').text("map error");
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.99802439999996},
        zoom: 13
    });

    largeInfowindow = new google.maps.InfoWindow();

    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', markerClickListener);
        bounds.extend(markers[i].position);
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);

}

function markerClickListener () {
    var marker = this;
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.DROP);
    }
    populateInfoWindow(marker, largeInfowindow);
}

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title +
                    '&format=json&callback=wikiCallback';

        var invalid = true;

        var wikiStr = '<ul id="wikipedia-links">Relevant Wikipedia articles';
        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            success: function( response ) {
              var articleList = response[1];
              for (var i = 0; i < articleList.length; i++) {
                  articleStr = articleList[i];
                  wikiStr = wikiStr + '<li><a href="http://en.wikipedia.org/wiki/' + articleStr + '">' +
                  articleStr + '</a></li>';
              }

              wikiStr = wikiStr + '</ul>';
              infowindow.setContent('<div>' + marker.title  + wikiStr + '</div>');
              invalid = false;
            }
        });

        if(invalid){
            infowindow.setContent('<div>' + marker.title +
              '<p>fail to get wikipedia resources</p>' + '</div>');
        }
        infowindow.open(map, marker);

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick',function(){
            infowindow.close();

        });
    }
}

var Loc = function(data, id){
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.location.lat);
    this.lng = ko.observable(data.location.lng);
    this.location = ko.observable(data.location);
    this.id = ko.observable(id);
};

var ViewModel = function() {
    var self = this;
    this.locList = ko.observableArray([]);
    this.showInfo = function(id){
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].id === id) {
                if (markers[i].getAnimation() !== null) {
                    markers[i].setAnimation(null);
                } else {
                    markers[i].setAnimation(google.maps.Animation.DROP);
                }
                populateInfoWindow(markers[i], largeInfowindow);
            }
        }
    };
    var i = 0;
    locations.forEach(function(loc, i) {
        self.locList.push(new Loc(loc, i));
        i++;
    });


    this.currentLoc = ko.observable(this.locList()[0]);

    this.setCurrent = function(loc){
        self.currentLoc(loc);
        self.showInfo(self.currentLoc().id());
    };

    this.rmv = function (){
        var r = $('#filter_input').val();
        $('li:contains('+r+')').remove();

        for (var i = 0; i < locations.length; i++) {
            if (locations[i].title.indexOf(r) != -1) {
                markers[i].setVisible(false);
            }
        }
    };
    var clicked = false;
    this.toggle = function() {
        $('#left').toggle();
        if (!clicked) {
            $('#map').css("left", "50px");
            clicked = true;
        } else {
            $('#map').css("left", "320px");
            clicked = false;
        }
    };


};






ko.applyBindings(new ViewModel());

