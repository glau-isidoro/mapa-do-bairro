var places = [
    {id: 01, type: 'cafe', title: 'Il Caffe', location:{lat: -23.5869946, lng: -46.6056592}, foursquare: '506e139ce4b042ad0c2ce5d6'},
    {id: 02, type: 'cafe', title: 'Espaço Intuição - bendito café', location:{lat: -23.5930909, lng: -46.6063406}, foursquare: '553a8122498e8c49070ee746'},
    {id: 03, type: 'cafe', title: 'Sweet Lamour Café', location:{lat: -23.594978, lng: -46.6089961}, foursquare: '53af54c6498eaefb4f1f58d0'},
    {id: 04, type: 'cafe', title: 'Café Museu', location:{lat: -23.592377, lng: -46.6014334}, foursquare: '4cd56ddaa5b3468837c28d50'},
    {id: 05, type: 'cafe', title: 'Café Moinho', location:{lat: -23.5894519, lng: -46.6196099}, foursquare: '4c6ef6dd9c6d6dcb1e19ce7a'},
    {id: 06, type: 'restaurante', title: 'A Galeta Dourada', location:{lat: -23.588889, lng: -46.6111243}, foursquare: '4c544d14a724e21e6be22af6'},
    {id: 07, type: 'restaurante', title: 'Feijão de Corda', location:{lat: -23.5873994, lng: -46.6114217}, foursquare: '4c50d13b5ee81b8d095d37ff'},
    {id: 08, type: 'restaurante', title: 'Magic Chicken', location:{lat: -23.5869897, lng: -46.6112558}, foursquare: '4bba8a3f53649c746b3349fb'},
    {id: 09, type: 'restaurante', title: 'La Cumparsita', location:{lat: -23.5857109, lng: -46.6061113}, foursquare: '5006e846e4b0407dc5533edc'},
    {id: 10, type: 'restaurante', title: 'Novilho de Prata', location:{lat: -23.592112, lng: -46.6203427}, foursquare: '4b49f214f964a5207f7626e3'},
    {id: 11, type: 'bar', title: 'Sampa Jazz Bar', location:{lat: -23.5881649, lng: -46.6165315}, foursquare: '5283ff1011d2b180db3dcc3e'},
    {id: 12, type: 'bar', title: 'Boteco São Jorge', location:{lat: -23.5866931, lng: -46.6055235}, foursquare: '4b68bb28f964a520b7892be3'},
    {id: 13, type: 'bar', title: 'Venezas Bar', location:{lat: -23.5867904, lng: -46.6064541}, foursquare: '4b9c2263f964a5208d4d36e3'},
    {id: 14, type: 'bar', title: 'Beer Rock Club', location:{lat: -23.5910716, lng: -46.6072403}, foursquare: '54b991ac498eb31c0c7f7693'},
    {id: 15, type: 'bar', title: 'Coronel Santinho', location:{lat: -23.5993395, lng: -46.6131555}, foursquare: '524c8ba911d27e1594816789'},
];

var markers = [];
var largeInfoWindow;
var bounds;

var Place = function(data) {
    this.id = ko.observable(data.id);
    this.type = ko.observable(data.type);
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.foursquare = ko.observable(data.foursquare);
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


    this.createMarkers = function(locations, bounds, largeInfoWindow) {
        for(var i = 0 ; i < locations.length ; i++) {
            var position = locations[i].location();
            var title = locations[i].title();
            var id = locations[i].id();
            var type = locations[i].type();
            var foursquare = locations[i].foursquare();
            var marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: id,
                type: type,
                foursquare: foursquare
            });
            markers.push(marker);
            bounds.extend(marker.position);
            marker.addListener('click', function(){
                self.populateInfoWindow(this, largeInfoWindow);
            });
            self.showListings(markers);
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
            var foursquareInfos = self.foursquareInformation(marker.foursquare);
            console.log(foursquareInfos[1]);
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;
            function getStreetView(data, status) {
                if(status == google.maps.StreetViewStatus.OK) {
                   var nearStreetViewLocation = data.location.latLng;
                   var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                   infowindow.setContent('<div class="opa">' + marker.title + '</div>'+
                        '<div id="fq">'+
                            '<br>'+foursquareInfos[2]+' <a href="'+foursquareInfos[1]+'" target="_blank">Ver no FourSquare</a><br>'+
                            'Preço: '+foursquareInfos[3]+' | Avaliações: '+foursquareInfos[4]+
                        '</div>'+
                        '<div id="pano"></div>');
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


    this.foursquareInformation = function(id) {
        var foursquareInfos = [];
        var apiURL = "https://api.foursquare.com/v2/venues/" + id +
            "?client_id=VL1OKPG0QTU0HGGRPHB4TXWNTNCF5OOO05MWMBEKNZOKNIL5&"+
            "client_secret=BSEHUG3JWTQBE2W1IAMOTLSJCQFDICRVQJCQJ2V0GMLWSSSV&"+
            "v=20170606&intent=browse";

        $.getJSON(apiURL, function(data) {
                $.each( data, function( key, val ) {
                    if(key == 'response'){
                        foursquareInfos.push(true);
                        foursquareInfos.push(val['venue']['canonicalUrl']);
                        foursquareInfos.push(val['venue']['categories'][0]['name']);
                        foursquareInfos.push(val['venue']['price']['currency']);
                        foursquareInfos.push(val['venue']['rating']);
                    }
                });
            })
            .fail(function( jqxhr, textStatus, error ) {
                    var err = textStatus + ", " + error;
                    console.log( "Request Failed: " + err );
                    foursquareInfos.push(false);
        });

        return foursquareInfos;
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

    this.showMarker = function(place) {
        var index = markers.map(function(o) { return o.id; }).indexOf(place.id());
        viewModel.populateInfoWindow(markers[index],largeInfoWindow);
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

    largeInfoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    viewModel.createMarkers(viewModel.allLists(), bounds, largeInfoWindow);

}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
