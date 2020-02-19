'use strict';


(function () {
  var mapPins = document.querySelector('.map__pins');
  var pinsTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;
  window.pin = {
    map: mapPins,
    template: pinsTemplate,
    width: PIN_WIDTH,
    height: PIN_HEIGHT,
  };
})();

(function createPins() {
  var posts = window.data.posts;

  var fragment = document.createDocumentFragment();
  for (var i = 0; i < posts.length; i++) {
    var template = window.pin.template.cloneNode(true);
    template = renderPost(posts[i], template);
    fragment.appendChild(template);
  }
  window.pin.map.appendChild(fragment);
})();

function renderPost(postElement, template) {
  var left = (postElement.location.x - (window.pin.width / 2)) + 'px';
  var top = (postElement.location.y - window.pin.height) + 'px';

  template.style.left = left;
  template.style.top = top;
  template.querySelector('img').src = postElement.author.avatar;
  template.querySelector('img').alt = postElement.offer.title;
  return template;
}

// 7. Личный проект: больше деталей (часть 2) module3-task3
var card = document.querySelector('#card').content.querySelector('article');
for (var i = 0; i < window.data.posts.length; i++) {
  var cardElement = card.cloneNode(true);
  var cardTitle = cardElement.querySelector('.popup__title');
  var popupAddress = cardElement.querySelector('.popup__text--address');
  var offerPrice = cardElement.querySelector('.popup__text--price');
  var popupType = cardElement.querySelector('.popup__type');
  var offerRoom = cardElement.querySelector('.popup__text--capacity');
  var popupTime = cardElement.querySelector('.popup__text--time');
  var popupFeatures = cardElement.querySelector('.popup__features');
  cardTitle.textContent = window.data.posts[i].offer.title;
  popupAddress.textContent = window.data.posts[i].offer.address;
  offerPrice.textContent = window.data.posts[i].offer.price + 'Р/ночь';
  popupType.textContent = window.data.posts[i].offer.type;
  offerRoom.textContent = window.data.posts[i].offer.rooms + ' ' + 'комнаты для ' + window.data.posts[i].offer.guests + ' гостей';
  popupTime.textContent = 'Заезд после ' + window.data.posts[i].offer.checkin + ' выезд до ' + window.data.posts[i].offer.checkout;
  popupFeatures = '?';
  window.pin.map.after(cardElement);
}

