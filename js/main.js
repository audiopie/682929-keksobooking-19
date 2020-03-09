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
  var cardElement = null;
  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;

  var minPriceByType = {
    bungalo: 0,
    flat: 1000,
    house: 5000,
    palace: 10000
  };

  var roomsValuesByGuests = {
    1: ['1', '2', '3'],
    2: ['2', '3'],
    3: ['3'],
    0: ['100']
  };

  var typeOfHouse = {
    'flat': 'Квартира',
    'bungalo': 'Бунгало',
    'house': 'Дом',
    'palace': 'Дворец'
  };

  function getCardClickHandler(post) {
    return function () {
      var notCard = !cardElement;
      if (notCard) {
        cardElement = card.cloneNode(true);
        document.addEventListener('keydown', function (event) {
          if (event.key === 'Escape') {
            cardElement.classList.add('hidden');
          }
        });

        cardElement.querySelector('.popup__close').addEventListener('click', function () {
          cardElement.classList.add('hidden');
        }
        );
      }

      cardElement.querySelector('.popup__avatar').src = post.author.avatar;
      cardElement.querySelector('.popup__title').textContent = post.offer.title;
      cardElement.querySelector('.popup__text--address').textContent = post.offer.address;
      cardElement.querySelector('.popup__text--price').textContent = post.offer.price + 'Р/ночь';
      cardElement.querySelector('.popup__type').textContent = typeOfHouse[post.offer.type];
      cardElement.querySelector('.popup__text--capacity').textContent = post.offer.rooms + ' ' + 'комнаты для ' + post.offer.guests + ' гостей';
      cardElement.querySelector('.popup__text--time').textContent = 'Заезд после ' + post.offer.checkin + ' выезд до ' + post.offer.checkout;

      var features = document.createElement('ul');
      features.className = 'popup__features';
      post.offer.features.forEach(function (feature) {
        var li = document.createElement('li');
        li.setAttribute('class', 'popup__feature popup__feature--' + feature);
        features.appendChild(li);
      });
      cardElement.querySelector('.popup__features').replaceWith(features);

      var photos = document.createElement('div');
      photos.className = 'popup__photos';
      post.offer.photos.forEach(function (photo) {
        var img = document.createElement('img');
        img.setAttribute('class', 'popup__photo');
        img.setAttribute('src', photo);
        img.setAttribute('alt', 'Фотография жилья');
        img.setAttribute('width', '45');
        img.setAttribute('height', '40');
        photos.appendChild(img);
      });
      cardElement.querySelector('.popup__photos').replaceWith(photos);

      cardElement.querySelector('.popup__description').textContent = post.offer.description;

      cardElement.classList.remove('hidden');

      if (notCard) {
        mapPins.after(cardElement);
      }
    };
  }

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

        var pinElement = pinTemplate.cloneNode(true);
        var left = (post.location.x - (PIN_WIDTH / 2)) + 'px';
        var top = (post.location.y - PIN_HEIGHT) + 'px';

        pinElement.style.left = left;
        pinElement.style.top = top;
        pinElement.querySelector('img').src = post.author.avatar;
        pinElement.querySelector('img').alt = post.offer.title;
        pinElement.addEventListener('click', getCardClickHandler(post));

        fragment.appendChild(pinElement);
      }
      mapPins.appendChild(fragment);
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

    renderPins();
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
    var aviableValues = roomsValuesByGuests[capacityNumber.value];

    if (aviableValues.includes(roomNumber.value)) {
      roomNumber.setCustomValidity('');
    } else {
      roomNumber.setCustomValidity('Количество комнат должно быть: ' + aviableValues.join(' или '));
    }
  }

  function handleMouseDown(event) {
    if (event.button !== 0) {
      return;
    }

    activatePage();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    var documentWidth = document.documentElement.offsetWidth;
    var offsetLeft = (documentWidth - mapPins.offsetWidth) / 2 + (65 / 2);

    var mainPinWidth = 65;
    var mainPinHeight = 80;

    function handleMouseMove() {
      var pageY = event.pageY;
      var pageX = event.pageX;

      var left = pageX < offsetLeft ? 0 : pageX - offsetLeft;
      var top = pageY < 130 ? 130 - (mainPinHeight / 2) : pageY - (mainPinHeight / 2);

      if (pageX > mapPins.offsetWidth + offsetLeft - mainPinWidth) {
        left = mapPins.offsetWidth - mainPinWidth;
      }

      if (top > mapPins.offsetHeight - mainPinHeight) {
        top = mapPins.offsetHeight - mainPinHeight;
      }

      mapPinMain.style.top = top + 'px';
      mapPinMain.style.left = left + 'px';

      addressElement.value = (left + Math.round(mainPinWidth / 2)) + ', ' + (top - 90);
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }

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
  });

  capacityNumber.addEventListener('change', function () {
    validateRoomNumber();
  });

  adForm.addEventListener('submit', function (event) {
    event.preventDefault();
    validateRoomNumber();
  });

  timeElementsForm.addEventListener('change', function (event) {
    timeInForm.value = event.target.value;
    timeOutForm.value = event.target.value;
  });

  mapPinMain.addEventListener('mousedown', handleMouseDown);

  adFieldsetList.forEach(function (fieldset) {
    fieldset.disabled = true;
  });

  filtersFieldsetList.forEach(function (fieldset) {
    fieldset.disabled = true;
  });

  addressElement.value = '600, 350';
  addressElement.disabled = true;
}());
