'use strict';

(function () {
  var map = document.querySelector('.map');
  var notice = document.querySelector('.notice');
  var mapPins = document.querySelector('.map__pins');
  var adForm = document.querySelector('.ad-form');
  var mapPinMain = map.querySelector('.map__pin--main');
  var mapFilters = document.querySelector('.map__filters-container');
  var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
  var typeElement = adForm.elements.type;
  var priceElement = adForm.elements.price;
  var addressElement = adForm.elements.address;
  var adFieldsetList = notice.querySelectorAll('fieldset');
  var filtersFieldsetList = mapFilters.querySelectorAll('select');

  var minPriceByType = {
    bungalo: 0,
    flat: 1000,
    house: 5000,
    palace: 10000
  };

  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;

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

        fragment.appendChild(template);
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

  adForm.addEventListener('submit', function (event) {
    event.preventDefault();
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
