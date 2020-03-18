'use strict';

(function () {

  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;

  var MAIN_PIN_WIDTH = 65;
  var MAIN_PIN_HEIGHT = 80;
  var MARGIN_TOP = 130;

  var ESCAPE = 'Escape';
  var ENTER = 'Enter';
  var NUM_PAD_ENTER = 'NumpadEnter';

  var URL = 'https://js.dump.academy/keksobooking/data';

  var DEFAULT_AVATAR = 'img/muffin-grey.svg';

  var DEFAULT_MAIN_PIN_ADDRESS = '600, 350';
  var DEFAULT_MAIN_PIN_STYLE_TOP = 375 + 'px';
  var DEFAULT_MAIN_PIN_STYLE_LEFT = 570 + 'px';

  var ANY = 'any';

  var MAX_POST_COUNT = 4;

  var FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];

  var map = document.querySelector('.map');
  var main = document.querySelector('main');
  var notice = document.querySelector('.notice');
  var mapPins = document.querySelector('.map__pins');
  var adForm = document.querySelector('.ad-form');
  var mapPinMain = map.querySelector('.map__pin--main');
  var mapFiltersContainer = document.querySelector('.map__filters-container');
  var mapFilters = mapFiltersContainer.querySelector('.map__filters');
  var timeElementsForm = document.querySelector('.ad-form__element--time');
  var filtersFieldsetList = mapFiltersContainer.querySelectorAll('select');
  var adFieldsetList = notice.querySelectorAll('fieldset');
  var typeElement = adForm.elements['type'];
  var priceElement = adForm.elements['price'];
  var addressElement = adForm.elements['address'];
  var timeInForm = adForm.elements['timein'];
  var timeOutForm = adForm.elements['timeout'];
  var roomNumber = adForm.elements['rooms'];
  var capacityNumber = adForm.elements['capacity'];
  var typeElementFilter = mapFilters.elements['housing-type'];
  var priceElementFilter = mapFilters.elements['housing-price'];
  var roomCountFilter = mapFilters.elements['housing-rooms'];
  var guestsCountFilter = mapFilters.elements['housing-guests'];
  var featuresElementsFilter = mapFilters.elements['features'];
  var fileChooserAvatar = adForm.elements['avatar'];
  var fileChooserPhoto = adForm.elements['images'];
  var avatar = adForm.querySelector('.ad-form-header__preview img');
  var roomImage = adForm.querySelector('.ad-form__photo');
  var resetButton = adForm.querySelector('.ad-form__reset');
  var card = document.querySelector('#card').content.querySelector('article');
  var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
  var errorMessage = document.querySelector('#error').content.querySelector('.error');
  var successMessage = document.querySelector('#success').content.querySelector('.success');

  var cardElement = null;
  var posts = null;

  var previousPin = null;

  var ImageAttribute = {
    alt: 'Фотография жилья',
    width: 45,
    height: 40
  };

  var HttpMethod = {
    GET: 'GET',
    POST: 'POST',
  };

  var StatusCode = {
    Ok: 200,
    NotFound: 404,
    BadRequest: 400,
    ServerError: 500,
  };


  var MinPriceByType = {
    bungalo: 0,
    flat: 1000,
    house: 5000,
    palace: 10000
  };

  var RoomsValuesByGuests = {
    1: ['1', '2', '3'],
    2: ['2', '3'],
    3: ['3'],
    0: ['100']
  };

  var TypeOfHouse = {
    'flat': 'Квартира',
    'bungalo': 'Бунгало',
    'house': 'Дом',
    'palace': 'Дворец'
  };

  var PriceValueFilters = {
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

  var debouncesRenderPins = window.debounce(renderPins);

  function getCardClickHandler(post) {
    return function (pinEvent) {
      var pinElement = pinEvent.currentTarget;
      if (previousPin) {
        previousPin.classList.remove('map__pin--active');
      }
      pinElement.classList.add('map__pin--active');
      previousPin = pinElement;

      var notCard = !cardElement;
      if (notCard) {
        cardElement = card.cloneNode(true);
        document.addEventListener('keydown', function (event) {
          if (event.key === ESCAPE) {
            cardElement.classList.add('hidden');
            previousPin.classList.remove('map__pin--active');
          }
        });

        cardElement.querySelector('.popup__close').addEventListener('click', function () {
          cardElement.classList.add('hidden');
          previousPin.classList.remove('map__pin--active');
        }
        );
      }

      cardElement.querySelector('.popup__avatar').src = post.author.avatar;
      cardElement.querySelector('.popup__title').textContent = post.offer.title;
      cardElement.querySelector('.popup__text--address').textContent = post.offer.address;
      cardElement.querySelector('.popup__text--price').textContent = post.offer.price + 'Р/ночь';
      cardElement.querySelector('.popup__type').textContent = TypeOfHouse[post.offer.type];
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
        img.setAttribute('alt', ImageAttribute['alt']);
        img.setAttribute('width', ImageAttribute['width']);
        img.setAttribute('height', ImageAttribute['height']);
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

    xhr.open(HttpMethod['GET'], URL);

    xhr.onload = function () {
      callback(xhr.response);
    };

    xhr.send();
  }


  function renderPins() {
    if (!posts) {
      return;
    }

    hideMapCard();

    removePins();

    var fragment = document.createDocumentFragment();

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (fragment.children.length > MAX_POST_COUNT) {
        break;
      }

      var isValidPost = validatePost(post);

      if (!isValidPost) {
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
  }

  function hideMapCard() {
    if (map.querySelector('.map__card') !== null) {
      map.querySelector('.map__card').classList.add('hidden');
    }
  }

  function removePins() {
    mapPins.querySelectorAll('.map__pin:not(.map__pin--main)')
      .forEach(function (pin) {
        pin.remove();
      });
  }

  function validatePost(post) {
    var typeFilter = typeElementFilter.value;
    var priceFilter = priceElementFilter.value;
    var roomFilter = roomCountFilter.value;
    var guestsFilter = guestsCountFilter.value;

    if (!('offer' in post)) {
      return false;
    }

    if (typeFilter !== ANY && typeFilter !== post.offer.type) {
      return false;
    }

    if (priceFilter !== ANY && (!(post.offer.price <= PriceValueFilters[priceFilter]['max'] && post.offer.price > PriceValueFilters[priceFilter]['min']))) {
      return false;
    }

    if (roomFilter !== ANY && +roomFilter !== post.offer.rooms) {
      return false;
    }

    if (guestsFilter !== ANY && +guestsFilter !== post.offer.guests) {
      return false;
    }

    var notFeatures = false;

    for (var j = 0; j < featuresElementsFilter.length; j++) {
      var feature = featuresElementsFilter[j];
      if (!feature.checked) {
        continue;
      }


      if (post.offer.features.includes(feature.value)) {
        continue;
      }

      notFeatures = true;
    }

    if (notFeatures) {
      return false;
    }

    return true;
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

    validateRoomNumber();

    getPosts(function (result) {
      posts = result;

      renderPins();
    });
  }

  function validatePrice() {
    var price = +priceElement.value;
    var minPrice = MinPriceByType[typeElement.value];

    if (price < minPrice) {
      priceElement.setCustomValidity('Минимальная цена для этого типа жилья - ' + minPrice + ' рублей');
    } else {
      priceElement.setCustomValidity('');
    }
  }

  function validateRoomNumber() {
    var aviableValues = RoomsValuesByGuests[capacityNumber.value];

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
    var offsetLeft = (documentWidth - mapPins.offsetWidth) / 2 + (MAIN_PIN_WIDTH / 2);


    function handleMouseMove(moveEvent) {
      var pageY = moveEvent.pageY;
      var pageX = moveEvent.pageX;

      var left = pageX < offsetLeft ? 0 : pageX - offsetLeft;
      var top = pageY < MARGIN_TOP ? MARGIN_TOP - (MAIN_PIN_HEIGHT / 2) : pageY - (MAIN_PIN_HEIGHT / 2);

      if (pageX > mapPins.offsetWidth + offsetLeft - MAIN_PIN_WIDTH) {
        left = mapPins.offsetWidth - MAIN_PIN_WIDTH;
      }

      if (top > mapPins.offsetHeight - MAIN_PIN_HEIGHT) {
        top = mapPins.offsetHeight - MAIN_PIN_HEIGHT;
      }

      mapPinMain.style.top = top + 'px';
      mapPinMain.style.left = left + 'px';

      addressElement.value = Math.round(left + (MAIN_PIN_WIDTH / 2)) + ', ' + (top + (MAIN_PIN_HEIGHT / 2));
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }

  function renderSuccess() {
    var successElement = successMessage.cloneNode(true);

    document.addEventListener('keydown', function (event) {
      if (event.key === ESCAPE) {
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
      if (event.key === ESCAPE) {
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
        img.setAttribute('alt', ImageAttribute['alt']);
        img.setAttribute('width', ImageAttribute['width']);
        img.setAttribute('height', ImageAttribute['height']);
        roomImage.appendChild(img);
      });

      reader.readAsDataURL(file);
    }
  });

  mapPinMain.addEventListener('keydown', function (event) {
    if (event.key === ENTER || event.code === NUM_PAD_ENTER) {
      activatePage();
    }
  });

  mapFilters.addEventListener('change', function () {
    debouncesRenderPins();
  });

  typeElement.addEventListener('change', function () {
    priceElement.placeholder = MinPriceByType[typeElement.value];
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
    mapFilters.reset();

    map.classList.add('map--faded');
    adForm.classList.add('ad-form--disabled');


    mapPinMain.style.top = DEFAULT_MAIN_PIN_STYLE_TOP;
    mapPinMain.style.left = DEFAULT_MAIN_PIN_STYLE_LEFT;

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

    avatar.src = DEFAULT_AVATAR;

    roomImage.querySelectorAll('img').forEach(function (item) {
      item.remove();
    });

    addressElement.value = DEFAULT_MAIN_PIN_ADDRESS;
    addressElement.disabled = true;

    hideMapCard();
  }

  resetButton.addEventListener('click', function (event) {
    event.preventDefault();
    resetForm();
  });

  adForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var formData = new FormData(adForm);
    formData.append(addressElement.name, addressElement.value);

    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.open(adForm.method, adForm.action);

    xhr.addEventListener('load', function () {
      if (xhr.status >= StatusCode['BadRequest'] && xhr.status < StatusCode['ServerError']) {
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

  addressElement.value = DEFAULT_MAIN_PIN_ADDRESS;
  addressElement.disabled = true;
}());
