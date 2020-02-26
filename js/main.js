'use strict';

(function () {
  var map = document.querySelector('.map');
  var notice = document.querySelector('.notice');
  var mapPins = document.querySelector('.map__pins');
  var adForm = document.querySelector('.ad-form');
  var mapPinMain = map.querySelector('.map__pin--main');
  var mapFilters = document.querySelector('.map__filters-container');
  var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
  var card = document.querySelector('#card').content.querySelector('article');
  var timeElementsForm = document.querySelector('.ad-form__element--time');
  var typeElement = adForm.elements.type;
  var priceElement = adForm.elements.price;
  var addressElement = adForm.elements.address;
  var timeInForm = adForm.elements.timein;
  var timeOutForm = adForm.elements.timeout;
  var roomNumber = adForm.elements.rooms;
  var capacityNumber = adForm.elements.capacity;
  var adFieldsetList = notice.querySelectorAll('fieldset');
  var filtersFieldsetList = mapFilters.querySelectorAll('select');


  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;

  var minPriceByType = {
    bungalo: 0,
    flat: 1000,
    house: 5000,
    palace: 10000
  };

  var minRooms = {
    1: 1,
    2: 2,
    3: 3,
    0: 100
  };

  var typeOfHouse = {
    'flat': 'Квартира',
    'bungalo': 'Бунгало',
    'house': 'Дом',
    'palace': 'Дворец'
  };



  function getPosts(callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.open('GET', 'https://js.dump.academy/keksobooking/data');

    xhr.onload = function () {
      callback(xhr.response);
    };

    xhr.send();
  }

  function renderPins() {
    getPosts(function (posts) {
      var fragment = document.createDocumentFragment();
      for (var i = 0; i < posts.length; i++) {
        var post = posts[i];

        if (!('offer' in post)) {
          continue;
        }

        var template = pinTemplate.cloneNode(true);
        var left = (post.location.x - (PIN_WIDTH / 2)) + 'px';
        var top = (post.location.y - PIN_HEIGHT) + 'px';

        template.style.left = left;
        template.style.top = top;
        template.querySelector('img').src = post.author.avatar;
        template.querySelector('img').alt = post.offer.title;

        var cardElement = card.cloneNode(true);
        cardElement.querySelector('.popup__title').textContent = post.offer.title;
        cardElement.querySelector('.popup__text--address').textContent = post.offer.address;
        cardElement.querySelector('.popup__text--price').textContent = post.offer.price + 'Р/ночь';
        cardElement.querySelector('.popup__type').textContent = typeOfHouse[post.offer.type];
        cardElement.querySelector('.popup__text--capacity').textContent = post.offer.rooms + ' ' + 'комнаты для ' + post.offer.guests + ' гостей';
        cardElement.querySelector('.popup__text--time').textContent = 'Заезд после ' + post.offer.checkin + ' выезд до ' + post.offer.checkout;
        // cardElement.querySelector('.popup__features') = post.offer.features;
        cardElement.querySelector('.popup__description').textContent = post.offer.description;
        // cardElement.querySelector('.popup__photos').src = post.offer.photos;
        cardElement.querySelector('.popup__avatar').src = post.author.avatar;
        fragment.appendChild(template);
        mapPins.after(cardElement);
      }

      mapPins.appendChild(fragment);
      // var articles = document.querySelectorAll('.map__card');
      // articles.forEach(function (article) {
      //   article.setAttribute('hidden', 'hidden');
      // });
    });
  }


  function activatePage() {
    map.classList.remove('map--faded');
    adForm.classList.remove('ad-form--disabled');

    adFieldsetList.forEach(function (fieldset) {
      fieldset.disabled = false;
    });

    filtersFieldsetList.forEach(function (fieldset) {
      fieldset.disabled = false;
    });
  }

  function validatePrice() {
    var price = +priceElement.value;
    var minPrice = minPriceByType[typeElement.value];

    if (price < minPrice) {
      priceElement.setCustomValidity('Минимальная цена для этого типа жилья - ' + minPrice + ' рублей');
    } else {
      priceElement.setCustomValidity('');
    }
  }

  function validateRoomNumber() {
    var room = +roomNumber.value;
    var capacity = minRooms[capacityNumber.value];
    if (room === 100 && capacity === 100 || room !== 100 && capacity <= room) {
      roomNumber.setCustomValidity('');
    } else {
      roomNumber.setCustomValidity('Минимальное количество комнат для ' + capacity + ' гостей состовляет ' + capacity);
    }
  }

  mapPinMain.addEventListener('mousedown', function (event) {
    if (event.button === 0) {
      activatePage();
    }
  });

  mapPinMain.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.code === 'NumpadEnter') {
      activatePage();
    }
  });

  typeElement.addEventListener('change', function () {
    priceElement.placeholder = minPriceByType[typeElement.value];

    validatePrice();
  });

  priceElement.addEventListener('input', function () {
    validatePrice();
  });

  roomNumber.addEventListener('change', function () {
    validateRoomNumber();
  })

  capacityNumber.addEventListener('change', function () {
    validateRoomNumber();
  })

  adForm.addEventListener('submit', function (event) {
    event.preventDefault();
    validateRoomNumber();
  });

  timeElementsForm.addEventListener('change', function (event) {
    timeInForm.value = event.target.value;
    timeOutForm.value = event.target.value;
  });

  adFieldsetList.forEach(function (fieldset) {
    fieldset.disabled = true;
  });

  filtersFieldsetList.forEach(function (fieldset) {
    fieldset.disabled = true;
  });


  addressElement.value = '600, 350';
  addressElement.disabled = true;

  renderPins();


}());
