let mapElement = document.getElementById("map");
let pattern = document.querySelector('#window-template');
let dialog = Handlebars.compile(pattern.textContent);

ymaps.ready(init);

function getAddress(coords) {
    ymaps.geocode(coords).then(function (res) {
        let firstGeoObject = res.geoObjects.get(0);
        let addr = firstGeoObject.getAddressLine();

        return new Promise(resolve => resolve(addr));
    });
}


function init() {
    let map = new ymaps.Map('map', {
        center: [50.4617, 30.5095],
        zoom: 14,
        controls: ['zoomControl'],
        behaviors: ['drag']
    });


    map.options.set('yandexMapDisablePoiInteractivity', true);

    map.events.add('click', function (e) {
        var coords = e.get('coords');
        let position = e.get('position');
        let address;

        ymaps.geocode(coords).then(function (res) {
            let firstGeoObject = res.geoObjects.get(0);
             address = firstGeoObject.getAddressLine();
        });
        
        let obj = {
            address: `${address}`
        };

        console.log(obj);
        console.log(address);

        dialogHtml = dialog({
            address: address
        });
        let wnd = document.querySelector('#window');
        wnd.innerHTML = dialogHtml;

        wnd.style.display = 'block';
        wnd.style.left = `${position[0]}px`;
        wnd.style.top = `${position[1]}px`;

    });
}


