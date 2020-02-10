'use strict';

// этот класс переключает карту из неактивного состояния в активное
var map = document.querySelector('.map');
map.classList.remove('map--faded');

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

function renderPosts() {
  var posts = getPosts();

  var fragment = document.createDocumentFragment();
  for (var i = 0; i < posts.length; i++) {
    var template = pinTemplate.cloneNode(true);
    template = renderPost(posts[i], template);
    fragment.appendChild(template);
  }
  mapPins.appendChild(fragment);
}

renderPosts();
