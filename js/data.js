'use strict';

(function () {
  var POSTS_TITLES = ['Современная квартира неподалеку от центра Токио', 'Прекрасный лофт для самого привередливого кекса', 'Бунгало для экономного кекса', 'Комната в центре Токио', 'Элегантная дворец в центре Токио', 'Милая, уютная квартирка в центре Токио', 'Хай-тек квартира в самом модном квартале', 'Комфортабельная квартира в центре Токио'];
  var POSTS_TYPES = ['palace', 'flat', 'house', 'bungalo'];
  var POSTS_FEATURES = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
  var POSTS_CHECK_IN = ['12:00', '13:00', '14:00'];
  var POSTS_CHECK_OUT = ['12:00', '13:00', '14:00'];
  var POSTS_PHOTOS = ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'];
  var POSTS_COUNT = 8;
  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;
  window.data = {
    POSTS_TITLES: POSTS_TITLES,
    POSTS_TYPES: POSTS_TYPES,
    POSTS_FEATURES: POSTS_FEATURES,
    POSTS_CHECK_IN: POSTS_CHECK_IN,
    POSTS_CHECK_OUT: POSTS_CHECK_OUT,
    POSTS_PHOTOS: POSTS_PHOTOS,
    POSTS_COUNT: POSTS_COUNT,
    width: PIN_WIDTH,
    height: PIN_HEIGHT,
  };
})();


function getPhotos() {
  return window.data.POSTS_PHOTOS.filter(function () {
    return Math.random() > 0.5;
  });
}

function getFeatures() {
  return window.data.POSTS_FEATURES.filter(function () {
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

(function getPosts() {
  var posts = [];
  for (var i = 0; i < window.data.POSTS_COUNT; i++) {
    var location = {
      x: getRandomNumber(window.data.width / 2, 1200 - window.data.width / 2),
      y: getRandomNumber(170, 705),
    };
    var features = getFeatures();

    posts.push({
      author: {
        avatar: 'img/avatars/user0' + (i + 1) + '.png',
      },
      offer: {
        title: window.data.POSTS_TITLES[i],
        address: location.x + ', ' + location.y,
        price: getRandomNumber(1000, 10000),
        type: getRandomItemFromArray(window.data.POSTS_TYPES),
        rooms: getRandomNumber(3, 1),
        guests: getRandomNumber(3, 1),
        checkin: getRandomItemFromArray(window.data.POSTS_CHECK_IN),
        checkout: getRandomItemFromArray(window.data.POSTS_CHECK_OUT),
        features: features,
        description: 'Описание',
        photos: getPhotos(),
      },
      location: location
    });
  }
  window.data = {
    posts: posts,
  };
})();

