var places = [
    {id: 01, type: 'cafe', title: 'Il Caffe', location:{lat: -23.5869946, lng: -46.6056592}},
    {id: 02, type: 'cafe', title: 'Espaço Intuição - bendito café', location:{lat: -23.5930909, lng: -46.6063406}},
    {id: 03, type: 'cafe', title: 'Sweet Lamour Café', location:{lat: -23.59494, lng: -46.6013998}},
    {id: 04, type: 'cafe', title: 'Café Museu', location:{lat: -23.592377, lng: -46.6014334}},
    {id: 05, type: 'cafe', title: 'Café Moinho', location:{lat: -23.5894519, lng: -46.6196099}},
    {id: 06, type: 'restaurante', title: 'A Galeta Dourada', location:{lat: -23.588889, lng: -46.6111243}},
    {id: 07, type: 'restaurante', title: 'Feijão de Corda', location:{lat: -23.5873994, lng: -46.6114217}},
    {id: 08, type: 'restaurante', title: 'Magic Chicken', location:{lat: -23.5869897, lng: -46.6112558}},
    {id: 09, type: 'restaurante', title: 'La Cumparsita', location:{lat: -23.5857109, lng: -46.6061113}},
    {id: 10, type: 'restaurante', title: 'Novilho de Prata', location:{lat: -23.592112, lng: -46.6203427}},
    {id: 11, type: 'bar', title: 'Sampa Jazz Bar', location:{lat: -23.5881649, lng: -46.6165315}},
    {id: 12, type: 'bar', title: 'Boteco São Jorge', location:{lat: -23.5866931, lng: -46.6055235}},
    {id: 13, type: 'bar', title: 'Venezas Bar', location:{lat: -23.5867904, lng: -46.6064541}},
    {id: 14, type: 'bar', title: 'Beer Rock Club', location:{lat: -23.5910716, lng: -46.6072403}},
    {id: 15, type: 'bar', title: 'Coronel Santinho', location:{lat: -23.5993395, lng: -46.6131555}},
];

var markers = [];

var Place = function(data) {
    this.id = ko.observable(data.id);
    this.type = ko.observable(data.type);
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
};

var ViewModel = function() {
    var self = this;

    this.cafeList = ko.observableArray([]);
    this.restaurantList = ko.observableArray([]);
    this.barList = ko.observableArray([]);
    this.allLists = ko.computed(function() {
        return this.cafeList().concat(this.restaurantList(), this.barList());
    }, this);

    places.forEach(function(place){
        switch (place.type) {
            case 'cafe':
                self.cafeList.push(new Place(place));
                break;
            case 'restaurante':
                self.restaurantList.push(new Place(place));
                break;
            default:
                self.barList.push(new Place(place));
        }
    });

    this.createMarkers = function(markersList, locations, bounds, largeInfoWindow) {
        for(var i = 0 ; i < locations.length ; i++) {
            var position = locations[i].location();
            var title = locations[i].title();
            var id = locations[i].id();
            var type = locations[i].type();
            var marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: id,
                type: type
            });
            markersList.push(marker);
            bounds.extend(marker.position);
            marker.addListener('click', function(){
                self.populateInfoWindow(this, largeInfoWindow);
            });
            self.showListings(markersList);
        }
    }

    this.populateInfoWindow = function(marker, infowindow) {
        if(infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('');
            infowindow.marker = marker;
            infowindow.addListener('closeclick', function(){
                infowindow.marker = null;
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;
            function getStreetView(data, status) {
                if(status == google.maps.StreetViewStatus.OK) {
                   var nearStreetViewLocation = data.location.latLng;
                   var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                   infowindow.setContent('<div class="opa">' + marker.title + '</div><div id="pano"></div>');
                   var panoramaOptions = {
                       position: nearStreetViewLocation,
                       pov: {
                           heading: heading,
                           pitch: 30
                       }
                   };
                   var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
                } else {
                    infowindow.setContent('<div>' + marker.title + '</div>' +
                       '<div>No Street View Found</div>')
                }
            }
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            infowindow.open(map, marker);
        }
    }

    this.showListings = function(list) {
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0 ; i < list.length ; i++) {
            list[i].setMap(map);
            bounds.extend(list[i].position);
        }
        map.fitBounds(bounds);
    }

    this.hideListings = function(list) {
        for(var i = 0 ; i < list.length ; i++) {
            list[i].setMap(null);
        }
    }

    this.showMarkers = function(list) {
        debugger
    }

    $('.button-collapse').sideNav({
        menuWidth: 300, // Default is 300
        edge: 'left', // Choose the horizontal origin
        closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: true, // Choose whether you can drag to open on touch screens
    });

    $('.collapsible').collapsible();
}



function initMap() {
    // Carrega estilos para personalizar mapa
    var styles = (typeof customMap !== 'undefined') ? customMap : '';

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        styles: styles,
        center: {lat: -23.588420, lng: -46.610592},
    });

    var largeInfoWindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    viewModel.createMarkers(markers, viewModel.allLists(), bounds, largeInfoWindow);

}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
