'use strict';

(function () {
  var map = document.querySelector('.map');
  var main = document.querySelector('main');
  var notice = document.querySelector('.notice');
  var mapPins = document.querySelector('.map__pins');
  var adForm = document.querySelector('.ad-form');
  var mapPinMain = map.querySelector('.map__pin--main');
  var mapFiltersContainer = document.querySelector('.map__filters-container');
  var mapFilters = mapFiltersContainer.querySelector('.map__filters');
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
  var filtersFieldsetList = mapFiltersContainer.querySelectorAll('select');
  var typeElementFilter = mapFilters.elements['housing-type'];
  var priceElementFilter = mapFilters.elements['housing-price'];
  var roomCountFilter = mapFilters.elements['housing-rooms'];
  var guestsCountFilter = mapFilters.elements['housing-guests'];
  var featuresElementsFilter = mapFilters.elements.features;
  var errorMessage = document.querySelector('#error').content.querySelector('.error');
  var successMessage = document.querySelector('#success').content.querySelector('.success');
  var resetButton = adForm.querySelector('.ad-form__reset');
  var fileChooserAvatar = document.querySelector('.ad-form__field input[type=file]');
  var fileChooserPhoto = document.querySelector('.ad-form__upload input[type=file]');
  var adAvatarPreview = adForm.querySelector('.ad-form-header__preview');
  var avatar = adAvatarPreview.querySelector('img');
  var roomImage = adForm.querySelector('.ad-form__photo');


  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;

  var FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];

  var cardElement = null;
  var posts = null;

  var previousPin = null;

  var maxPostCount = 5;


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

  var priceValueFilters = {
    low: {
      min: 0,
      max: 10000,
    },
    middle: {
      min: 10000,
      max: 50000,
    },
    high: {
      min: 50000,
      max: 100000000,
    }
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
    if (!posts) {
      return;
    }

    mapPins.querySelectorAll('.map__pin:not(.map__pin--main)')
      .forEach(function (pin) {
        pin.remove();
      });

    var fragment = document.createDocumentFragment();


    var typeFilter = typeElementFilter.value;
    var priceFilter = priceElementFilter.value;
    var roomFilter = roomCountFilter.value;
    var guestsFilter = guestsCountFilter.value;

    posts.forEach(function (post) {
      if (!('offer' in post)) {
        return;
      }

      // 1. Filter by type
      if (typeFilter !== 'any' && typeFilter !== post.offer.type) {
        return;
      }

      // 2. Filter by price
      if (priceFilter !== 'any' && (!(post.offer.price <= priceValueFilters[priceFilter]['max'] && post.offer.price > priceValueFilters[priceFilter]['min']))) {
        return;
      }

      // 3. Filter by room number
      if (roomFilter !== 'any' && +roomFilter !== post.offer.rooms) {
        return;
      }

      // 4. Filter by guests count
      if (guestsFilter !== 'any' && +guestsFilter !== post.offer.guests) {
        return;
      }

      // 5. Filter by features
      var notFeatures = false;

      featuresElementsFilter.forEach(function (feature) {
        if (!feature.checked) {
          return;
        }

        if (post.offer.features.includes(feature.value)) {
          return;
        }

        notFeatures = true;
      });

      if (notFeatures) {
        return;
      }

      var pinElement = pinTemplate.cloneNode(true);
      var left = (post.location.x - (PIN_WIDTH / 2)) + 'px';
      var top = (post.location.y - PIN_HEIGHT) + 'px';

      pinElement.style.left = left;
      pinElement.style.top = top;
      pinElement.querySelector('img').src = post.author.avatar;
      pinElement.querySelector('img').alt = post.offer.title;
      pinElement.addEventListener('click', getCardClickHandler(post));

      pinElement.addEventListener('click', function (event) {
        pinElement.classList.add('map__pin--active');
        var currentPin = event.currentTarget;
        if (previousPin !== null && previousPin !== currentPin) {
          previousPin.classList.remove('map__pin--active');
        }
        previousPin = currentPin;

      });

      fragment.appendChild(pinElement);
    });

    mapPins.appendChild(fragment);

    mapFiltersContainer.addEventListener('change', function () {
      if (map.querySelector('.map__card') !== null) {
        map.querySelector('.map__card').classList.add('hidden');
      }
    });
  }


  function activatePage() {
    if (!map.classList.contains('map--faded')) {
      return;
    }

    map.classList.remove('map--faded');
    adForm.classList.remove('ad-form--disabled');

    adFieldsetList.forEach(function (fieldset) {
      fieldset.disabled = false;
    });

    filtersFieldsetList.forEach(function (fieldset) {
      fieldset.disabled = false;
    });

    getPosts(function (result) {
      posts = result.length > maxPostCount ? result.slice(0, maxPostCount) : result;

      renderPins();
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

    function handleMouseMove(moveEvent) {
      var pageY = moveEvent.pageY;
      var pageX = moveEvent.pageX;

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

      addressElement.value = Math.round(left + (mainPinWidth / 2)) + ', ' + (top + (mainPinHeight / 2));
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }

  function renderSuccess() {
    var successElement = successMessage.cloneNode(true);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        successElement.remove();
      }
    });

    successElement.addEventListener('click', function () {
      successElement.remove();
    });

    main.appendChild(successElement);
    resetForm();
  }

  function renderError() {
    var errorElement = errorMessage.cloneNode(true);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        errorElement.remove();
      }
    });

    errorElement.addEventListener('click', function () {
      errorElement.remove();
    });

    main.appendChild(errorElement);
    resetForm();
  }

  fileChooserAvatar.addEventListener('change', function () {
    var file = fileChooserAvatar.files[0];
    var fileName = file.name.toLowerCase();

    var matches = FILE_TYPES.some(function (it) {
      return fileName.endsWith(it);
    });

    if (matches) {
      var reader = new FileReader();

      reader.addEventListener('load', function () {
        avatar.src = reader.result;
      });

      reader.readAsDataURL(file);
    }
  });

  fileChooserPhoto.addEventListener('change', function () {
    var file = fileChooserPhoto.files[0];
    var fileName = file.name.toLowerCase();

    var matches = FILE_TYPES.some(function (it) {
      return fileName.endsWith(it);
    });

    if (matches) {
      var reader = new FileReader();

      reader.addEventListener('load', function () {
        var img = document.createElement('img');
        img.setAttribute('src', reader.result);
        img.setAttribute('alt', 'Фотография жилья');
        img.setAttribute('width', '45');
        img.setAttribute('height', '40');
        roomImage.appendChild(img);
      });

      reader.readAsDataURL(file);
    }
  });

  mapPinMain.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.code === 'NumpadEnter') {
      activatePage();
    }
  });

  mapFilters.addEventListener('change', function () {
    renderPins();
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

  function resetForm() {
    adForm.reset();

    map.classList.add('map--faded');
    adForm.classList.add('ad-form--disabled');

    mapPinMain.style.top = 375 + 'px';
    mapPinMain.style.left = 570 + 'px';

    adFieldsetList.forEach(function (fieldset) {
      fieldset.disabled = true;
    });

    filtersFieldsetList.forEach(function (fieldset) {
      fieldset.disabled = true;
    });

    mapPins.querySelectorAll('.map__pin:not(.map__pin--main)')
    .forEach(function (pin) {
      pin.remove();
    });

    avatar.src = 'img/muffin-grey.svg';
    roomImage.querySelectorAll('img').forEach(function (item) {
      item.remove();
    });

    map.querySelector('.map__card').classList.add('hidden');

    addressElement.value = '600, 350';
    addressElement.disabled = true;

  }

  resetButton.addEventListener('click', function (event) {
    event.preventDefault();
    resetForm();
  });

  adForm.addEventListener('submit', function (event) {
    event.preventDefault();
    validateRoomNumber();

    var formData = new FormData(adForm);
    formData.append(addressElement.name, addressElement.value);

    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.open(adForm.method, adForm.action);

    xhr.addEventListener('load', function () {
      if (xhr.status >= 400 && xhr.status < 500) {
        renderError();
      } else {
        renderSuccess();
      }
    });

    xhr.send(formData);
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
