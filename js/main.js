'use strict';

// этот класс переключает карту из неактивного состояния в активное
var map = document.querySelector('.map');
map.classList.remove('map--faded');


var mapPins = document.querySelector('.map__pins');
var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');

// кол-во элементов в массиве
var BOOKING_COUNT = 8;

// Данные для генерации массивов
var BOOK_TITLES = ['Современная квартира неподалеку от центра Токио', 'Прекрасный лофт для самого привередливого кекса', 'Бунгало для экономного кекса', 'Комната в центре Токио', 'Элегантная дворец в центре Токио', 'Милая, уютная квартирка в центре Токио', 'Хай-тек квартира в самом модном квартале', 'Комфортабельная квартира в центре Токио'];
var BOOK_ADDRESS = ['550, 300', '450, 230', '490, 320', '300, 250', '500, 350', '580, 330', '400, 300', '600, 350'];
var BOOK_PRICES = [2500, 4000, 3000, 1000, 8000, 8900, 3500, 2800];
var BOOK_TYPES = ['palace', 'flat', 'house', 'bungalo'];
var BOOK_COUNT_ROOMS = [1, 2, 3, 100];
var BOOK_COUNT_GUESTS = [1, 2, 3, 0];
var BOOK_CHECK_IN = ['12:00', '13:00', '14:00'];
var BOOK_CHECK_OUT = ['12:00', '13:00', '14:00'];

// функция для случайного выбора элемента из массива
var getRandom = function (array) {
  return Math.floor(Math.random() * array.length);
};

// функция для генерация случайного числа, координата x и y метки на карте
function getRandomLocation(min, max) {
  return String(Math.floor(Math.random() * (max - min)) + min);
}

/* функция для создания массива из 8 сгенерированных JS объектов.
Каждый объект массива ‐ описание похожего объявления неподалёку
 */
var bookingData = function () {
  var data = [];
  var dict = {};
  for (var i = 1; i <= BOOKING_COUNT; i++) {
    dict = {
      author: {
        avatar: 'img/avatars/user0' + i + '.png',
      },
      offer: {
        title: BOOK_TITLES[i],
        address: BOOK_ADDRESS[i],
        price: BOOK_PRICES[i],
        type: BOOK_TYPES[getRandom(BOOK_TYPES)],
        rooms: BOOK_COUNT_ROOMS[getRandom(BOOK_COUNT_ROOMS)],
        guests: BOOK_COUNT_GUESTS[getRandom(BOOK_COUNT_GUESTS)],
        checkin: BOOK_CHECK_IN[getRandom(BOOK_CHECK_IN)],
        checkout: BOOK_CHECK_OUT[getRandom(BOOK_CHECK_OUT)],
        features: ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'],
        description: 'описание',
        photos: ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'],
      },
      location: {
        x: getRandomLocation(1100, 604),
        y: getRandomLocation(130, 630),
      }
    };
    data.push(dict);
    dict = {};
  }

  return data;
};

var renderBook = function (bookItem, nodeElement) {
  nodeElement.style.left = (bookItem.location.x + 'px');
  nodeElement.style.top = (bookItem.location.y + 'px');
  nodeElement.querySelector('img').src = bookItem.author.avatar;
  nodeElement.querySelector('img').alt = bookItem.offer.title;
  return nodeElement;
};


var appendBook = function () {
  var fragment = document.createDocumentFragment();
  for (var i = 0; i < getBook.length; i++) {
    var element = pinTemplate.cloneNode(true);
    element = renderBook(getBook[i], element);
    fragment.appendChild(element);
  }
  mapPins.appendChild(fragment);
};


var getBook = bookingData();
appendBook(getBook);

