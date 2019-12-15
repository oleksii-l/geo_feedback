let mapElement = document.getElementById("map");
let pattern = document.querySelector('#window-template');
let dialog = Handlebars.compile(pattern.textContent);

ymaps.ready(init);

function getAddress(coords) {
    ymaps.geocode(coords).then(function (res) {
        let firstGeoObject = res.geoObjects.get(0);

        return firstGeoObject.getAddressLine();
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
        let address = getAddress(coords);

        let obj = {
            address: `${this.address}`
        }

        dialogHtml = dialog({
            address: address
        });
        let wnd = document.querySelector('#window');
        wnd.innerHTML = dialogHtml;

        wnd.style.display = 'block';
        wnd.style.left = `${position[0]}px`;
        wnd.style.top = `${position[1]}px`;
        ;
    });
}


