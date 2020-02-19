'use strict';

// этот класс переключает карту из неактивного состояния в активное
var map = document.querySelector('.map');


var mapPins = document.querySelector('.map__pins');
var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');

var PIN_WIDTH = 50;
var PIN_HEIGHT = 70;

var POSTS_COUNT = 8;

// Данные для генерации массивов
var POSTS_TITLES = ['Современная квартира неподалеку от центра Токио', 'Прекрасный лофт для самого привередливого кекса', 'Бунгало для экономного кекса', 'Комната в центре Токио', 'Элегантная дворец в центре Токио', 'Милая, уютная квартирка в центре Токио', 'Хай-тек квартира в самом модном квартале', 'Комфортабельная квартира в центре Токио'];
var POSTS_TYPES = ['palace', 'flat', 'house', 'bungalo'];
var POSTS_FEATURES = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
var POSTS_CHECK_IN = ['12:00', '13:00', '14:00'];
var POSTS_CHECK_OUT = ['12:00', '13:00', '14:00'];
var POSTS_PHOTOS = ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'];

function getPhotos() {
  return POSTS_PHOTOS.filter(function () {
    return Math.random() > 0.5;
  });
}

function getFeatures() {
  return POSTS_FEATURES.filter(function () {
    return Math.random() > 0.5;
  });
}

function getRandomItemFromArray(array) {
  var index = getRandomNumber(0, array.length - 1);

  return array[index];
}

function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

/* функция для создания массива из 8 сгенерированных JS объектов.
Каждый объект массива ‐ описание похожего объявления неподалёку
 */
function getPosts() {
  var posts = [];
  for (var i = 0; i < POSTS_COUNT; i++) {
    var location = {
      x: getRandomNumber(PIN_WIDTH / 2, 1200 - PIN_WIDTH / 2),
      y: getRandomNumber(170, 705),
    };
    var features = getFeatures();

    posts.push({
      author: {
        avatar: 'img/avatars/user0' + (i + 1) + '.png',
      },
      offer: {
        title: POSTS_TITLES[i],
        address: location.x + ', ' + location.y,
        price: getRandomNumber(1000, 10000),
        type: getRandomItemFromArray(POSTS_TYPES),
        rooms: getRandomNumber(1, 3),
        guests: getRandomNumber(1, 4),
        checkin: getRandomItemFromArray(POSTS_CHECK_IN),
        checkout: getRandomItemFromArray(POSTS_CHECK_OUT),
        features: features,
        description: 'Описание',
        photos: getPhotos(),
      },
      location: location
    });
  }

  return posts;
}

function renderPost(postElement, template) {
  var left = (postElement.location.x - (PIN_WIDTH / 2)) + 'px';
  var top = (postElement.location.y - PIN_HEIGHT) + 'px';

  template.style.left = left;
  template.style.top = top;
  template.querySelector('img').src = postElement.author.avatar;
  template.querySelector('img').alt = postElement.offer.title;
  return template;
}

function createPins() {
  var posts = getPosts();

  var fragment = document.createDocumentFragment();
  for (var i = 0; i < posts.length; i++) {
    var template = pinTemplate.cloneNode(true);
    template = renderPost(posts[i], template);
    fragment.appendChild(template);
  }
  mapPins.appendChild(fragment);
}

createPins();


var notice = document.querySelector('.notice');
var selectFieldsets = notice.querySelectorAll('fieldset');
var mapFilters = document.querySelector('.map__filters-container');
var mapFilterSelects = mapFilters.querySelectorAll('select');
var mapPinMain = map.querySelector('.map__pin--main');
var addressInput = notice.querySelector('#address');

var roomNumberValidity = notice.querySelector('#room_number');
var capacityCountValidity = notice.querySelector('#capacity');

// в неактивном состоянии страницы метка круглая, поэтому в поле адреса подставляются координаты центра метки;
function calculateInactivePinCoordinates() {
  var x = parseInt(mapPinMain.style.left, 10) + Math.round(65 / 2);
  var y = parseInt(mapPinMain.style.top, 10) + Math.round(65 / 2);
  addressInput.value = [x, y];
}
// при переходе страницы в активное состояние в поле адреса подставляются координаты острого конца метки
function calculateActivePinCoordinates() {
  var x = parseInt(mapPinMain.style.left, 10) + Math.round(65 / 2);
  var y = parseInt(mapPinMain.style.top, 10) + Math.round(65);
  addressInput.value = [x, y];
}


function activateForm() {
  for (var i = 0; i < selectFieldsets.length; i++) {
    selectFieldsets[i].removeAttribute('disabled', 'disabled');
  }
  for (var j = 0; j < mapFilterSelects.length; j++) {
    mapFilterSelects[j].removeAttribute('disabled', 'disabled');
  }
  var noticeForm = notice.querySelector('form');
  noticeForm.classList.remove('ad-form--disabled');
  map.classList.remove('map--faded');
  calculateActivePinCoordinates();
}

(function inactiveForm() {
  for (var i = 0; i < selectFieldsets.length; i++) {
    selectFieldsets[i].setAttribute('disabled', 'disabled');
  }
  for (var j = 0; j < mapFilterSelects.length; j++) {
    mapFilterSelects[j].setAttribute('disabled', 'disabled');
  }
  calculateInactivePinCoordinates();
})();


mapPinMain.addEventListener('mousedown', function (evt) {
  if (evt.button === 0) {
    activateForm();
  }
});

mapPinMain.addEventListener('keydown', function (evt) {
  if (evt.key === 'Enter') {
    activateForm();
  }
});

function checkValue() {
  if (roomNumberValidity.value >= capacityCountValidity.value) {
    return true;
  } else if (roomNumberValidity.value === '100' && capacityCountValidity.value === '0') {
    return true;
  }
  return false;
}

function checkValidity() {
  if (checkValue()) {
    capacityCountValidity.setCustomValidity('');
  } else {
    capacityCountValidity.setCustomValidity('Кол-во комнат должно соответствовать кол-во комнат');
  }
}

roomNumberValidity.addEventListener('click', function () {
  checkValidity();
});

capacityCountValidity.addEventListener('click', function () {
  checkValidity();
});

