let mapElement = document.getElementById("map");
let pattern = document.querySelector('#window-template');
let dialog = Handlebars.compile(pattern.textContent);
let reviewsPattern = document.querySelector('#reviews-template');
let reviewsBlock = Handlebars.compile(reviewsPattern.textContent);
let map;

ymaps.ready(init);


function init() {
    map = new ymaps.Map('map', {
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
            return address;
        }).then(res => {
            dialogHtml = dialog({
                address: address
            });
            let wnd = document.querySelector('#window');
            wnd.innerHTML = dialogHtml;

            wnd.style.display = 'block';
            wnd.style.left = `${position[0]}px`;
            wnd.style.top = `${position[1]}px`;

            let addFeedbackBtn = document.querySelector('#add-feedback');
            let form = document.querySelector('#form');

            let placemarks = [];
            let feedbacks = [];
            addFeedbackBtn.addEventListener('click', () => {
                let name = document.querySelector('#name').value;
                let place = document.querySelector('#place').value;
                let comment = document.querySelector('#comment').value;

                placemarks.push({
                    latitude: coords[0],
                    longitude: coords[1],
                    hintContent: `<div class="map__hint">${address}</div>`,
                    balloonContent: [`${name}`,
                    `${place}`,
                    `${comment}`]
                });
                form.reset();
                feedbacks.push({
                    person: name,
                    place: place,
                    comment: comment
                });

                let feedbacksBlock = reviewsBlock({
                    feedbacks: feedbacks
                }
                );
                document.querySelector('#feedbacks').innerHTML = feedbacksBlock;

            });

            document.querySelector('#close')
                .addEventListener('click', () => {
                    renderCluster(placemarks);
                    wnd.style.display = 'none';
                });
        });

    });

}

function renderCluster(placemarks) {
    let geoObjects = [];

    for (var i = 0; i < placemarks.length; i++) {
        let geoObject = new ymaps.Placemark([placemarks[i].latitude, placemarks[i].longitude],
            {
                hintContent: placemarks[i].hintContent,
                balloonContentHeader: 'Метка №' + (i + 1),
                balloonContentBody: "Content body " + i,
                balloonContentFooter: 'Мацуо Басё'
            },
        );

        geoObject.events.add('click', event => {
            console.log(event);
            console.log(event.originalEvent.target)
            console.log(event.get('target'))
           
        })

        geoObjects.push(geoObject);
    }

    var clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        // Устанавливаем максимальное количество элементов в нижней панели на одной странице
        clusterBalloonPagerSize: 5
    });

    clusterer.add(geoObjects);
    map.geoObjects.add(clusterer);
}
