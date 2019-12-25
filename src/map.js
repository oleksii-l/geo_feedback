const modal = document.getElementById('modal');
const modalCloseBtn = document.getElementById('modal-close');
const addBtn = document.getElementById('add-review-btn');
let inputName = document.getElementById('reviews-name');
let inputPlace = document.getElementById('reviews-place');
let textarea = document.getElementById('reviews-comment');
const reviewsBlock = document.getElementById('reviews');

let coords;
let position;
let placemarks = [];

async function geocodeCoords(coords) {
    const address = await ymaps.geocode(coords);
    const modalHeaderTitle = document.getElementById('modal-header-title');
    modalHeaderTitle.innerText = address.geoObjects.get(0).getAddressLine();
}

function clearForm() {
    inputName.value = '';
    inputPlace.value = '';
    textarea.value = '';
}

const init = () => {
    const map = new ymaps.Map('map', {
        center: [50.4617, 30.5095],
        zoom: 14,
        controls: ['zoomControl'],
        behaviors: ['drag']
    });

    let clusterer = new ymaps.Clusterer({
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: "cluster#balloonCarousel",
        clusterBalloonCycling: false,
        clusterBalloonPagerSize: 5,
        hideIconOnBalloonOpen: false
    });

    map.geoObjects.add(clusterer);

    map.events.add('click', event => {
        coords = event.get('coords');
        position = event.get('position');

        reviewsBlock.innerHTML = "Здесь пока никто ничего не писал...";
        geocodeCoords(coords);
        showModal(position, modal);
    });

    map.geoObjects.events.add('click', event => {
        if (event.get('target').options._name === 'geoObject') {
            event.preventDefault();

            let coordsPosition = event.get('position');
            coords = event.get('target').geometry._coordinates;

            reviewsBlock.innerHTML = '';
            placemarks.forEach(function (marker) {
                if (marker.coords === coords) {
                    reviewsBlock.innerHTML += generateReviewItem(marker.reviews);
                }
            });
            geocodeCoords(coords);
            showModal(coordsPosition, modal);
        }
    });

    addBtn.addEventListener('click', event => {
        event.preventDefault();

        if (!inputName.value || !inputPlace.value || !textarea.value) {
            alert('Заполните все поля формы!');
        } else {
            let placemark = new ymaps.Placemark(coords);
            const modalHeaderTitleText = document.getElementById('modal-header-title').textContent;
            placemark.properties.set('address', modalHeaderTitleText);
            placemark.properties.set('coord', coords);

            addReview(placemark);
            clearForm();
        }
    });

    function addReview(placemark) {
        data = {
            name: inputName.value,
            place: inputPlace.value,
            review: textarea.value
        };

        placemarks.push({
            id: placemark.properties.get('id'),
            coords,
            reviews: data
        });

        let address = placemark.properties.get('address');

        let objectMarker = new ymaps.GeoObject({
            geometry: { type: "Point", coordinates: coords },
            properties: {
                balloonContentHeader: `<span>${inputPlace.value}</span>`,
                balloonContentBody: `<a data-coords="${coords}" class="theAddress">${address}</a>`,
                balloonContentFooter: `<span>${textarea.value}</span>`
            }
        });

        map.geoObjects.add(objectMarker);
        clusterer.add(objectMarker);

        reviewsBlock.innerHTML = '';
        placemarks.forEach(function (marker) {
            if (marker.coords === coords) {
                reviewsBlock.innerHTML += reviewReturn(marker.reviews);
            }
        });
    }

    let mapClick = document.getElementById('map');

    mapClick.addEventListener('click', event => {
        if (event.target.classList.contains('theAddress')) {

            let balloonCoords = event.target.getAttribute('data-coords');
            geocodeCoords(balloonCoords);

            reviewsBlock.innerHTML = '';
            placemarks.forEach(function (marker) {
                if (marker.coords == balloonCoords) {
                    reviewsBlock.innerHTML += reviewReturn(marker.reviews);
                }
            });

            showModal(position, modal);
        }
    });
}

function showModal(coords, modal) {
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;
    let coordX = coords[0];
    let coordY = coords[1];

    if (coordX > (clientWidth - 390)) {
        coordX = clientWidth - 400;
    }
    if (coordY > (clientHeight - 560)) {
        coordY = clientHeight - 570;
    }

    modal.classList.add('active');
    modal.style.left = coordX + 'px';
    modal.style.top = coordY + 'px';
}

function generateReviewItem(review) {
    return `<li class="reviews__item">
                <div class="reviews__header">
                    <span class="reviews__name">${review.name}</span>
                    <span class="reviews__place">${review.place}</span>
                </div>
              <div class="reviews__text">${review.review}</div>
          </li>`;
}

modalCloseBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

ymaps.ready(init);
