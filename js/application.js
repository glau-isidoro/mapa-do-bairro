var cafes = [
    {id: 01, title: 'Il Caffe', location:{lat: -23.5869946, lng: -46.6056592}},
    {id: 02, title: 'Espaço Intuição - bendito café', location:{lat: -23.5930909, lng: -46.6063406}},
    {id: 03, title: 'Sweet Lamour Café', location:{lat: -23.59494, lng: -46.6013998}},
    {id: 04, title: 'Café Museu', location:{lat: -23.592377, lng: -46.6014334}},
    {id: 05, title: 'Café Moinho', location:{lat: -23.5894519, lng: -46.6196099}},
];

var restaurantes = [
    {id: 06, title: 'A Galeta Dourada', location:{lat: -23.588889, lng: -46.6111243}},
    {id: 07, title: 'Feijão de Corda', location:{lat: -23.5873994, lng: -46.6114217}},
    {id: 08, title: 'Magic Chicken', location:{lat: -23.5869897, lng: -46.6112558}},
    {id: 09, title: 'La Cumparsita', location:{lat: -23.5857109, lng: -46.6061113}},
    {id: 10, title: 'Novilho de Prata', location:{lat: -23.592112, lng: -46.6203427}},
];

var bares = [
    {id: 11, title: 'Sampa Jazz Bar', location:{lat: -23.5881649, lng: -46.6165315}},
    {id: 12, title: 'Boteco São Jorge', location:{lat: -23.5866931, lng: -46.6055235}},
    {id: 13, title: 'Venezas Bar', location:{lat: -23.5867904, lng: -46.6064541}},
    {id: 14, title: 'Beer Rock Club', location:{lat: -23.5910716, lng: -46.6072403}},
    {id: 15, title: 'Coronel Santinho', location:{lat: -23.5993395, lng: -46.6131555}},
];

var markers = [];

var Place = function(data) {
    this.id = ko.observable(data.id);
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

    cafes.forEach(function(cafeItem){
        self.cafeList.push(new Place(cafeItem));
    });

    restaurantes.forEach(function(restaurantList){
        self.restaurantList.push(new Place(restaurantList));
    });

    bares.forEach(function(barItem){
        self.barList.push(new Place(barItem));
    });

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
        self.hideListings();
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0 ; i < list.length ; i++) {
            list[i].setMap(map);
            bounds.extend(list[i].position);
        }
        map.fitBounds(bounds);
    }

    this.hideListings = function() {
        for(var i = 0 ; i < markers.length ; i++) {
            markers[i].setMap(null);
        }
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
    var locations = viewModel.allLists();

    for(var i = 0 ; i < locations.length ; i++) {
        var position = locations[i].location();
        var title = locations[i].title();
        var id = locations[i].id();
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: id
        });
        markers.push(marker);
        bounds.extend(marker.position);
        marker.addListener('click', function(){
            viewModel.populateInfoWindow(this, largeInfoWindow);
        });
        viewModel.showListings(markers);
    }

}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
