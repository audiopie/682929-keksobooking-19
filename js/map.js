'use strict';

// этот класс переключает карту из неактивного состояния в активное
(function () {
  var main = document.querySelector('.map');
  var notice = document.querySelector('.notice');
  var selectFieldset = notice.querySelectorAll('fieldset');
  var mapContainerFilters = document.querySelector('.map__filters-container');
  var mapFilterSelects = document.querySelectorAll('select');
  var mainPin = document.querySelector('.map__pin--main');
  var addressInput = notice.querySelector('#address');
  var roomNumberValidity = document.querySelector('#room_number');
  var capacityCountValidity = document.querySelector('#capacity');
  window.map = {
    main: main,
    notice: notice,
    selectFieldset: selectFieldset,
    containerFilters: mapContainerFilters,
    filterSelects: mapFilterSelects,
    mainPin: mainPin,
    addressInput: addressInput,
    roomNumberValidity: roomNumberValidity,
    capacityCountValidity: capacityCountValidity,
  };
})();


// в неактивном состоянии страницы метка круглая, поэтому в поле адреса подставляются координаты центра метки;
function calculateInactivePinCoordinates() {
  var x = parseInt(window.map.mainPin.style.left, 10) + Math.round(65 / 2);
  var y = parseInt(window.map.mainPin.style.top, 10) + Math.round(65 / 2);
  window.map.addressInput.value = [x, y];
}
// при переходе страницы в активное состояние в поле адреса подставляются координаты острого конца метки
function calculateActivePinCoordinates() {
  var x = parseInt(window.map.mainPin.style.left, 10) + Math.round(65 / 2);
  var y = parseInt(window.map.mainPin.style.top, 10) + Math.round(65);
  window.map.addressInput.value = [x, y];
}


function activateForm() {
  for (var i = 0; i < window.map.selectFieldset.length; i++) {
    window.map.selectFieldset[i].removeAttribute('disabled');
  }
  for (var j = 0; j < window.map.filterSelects.length; j++) {
    window.map.filterSelects[j].removeAttribute('disabled');
  }
  var noticeForm = window.map.notice.querySelector('form');
  noticeForm.classList.remove('ad-form--disabled');
  window.map.main.classList.remove('map--faded');
  calculateActivePinCoordinates();
}

(function inactiveForm() {
  for (var i = 0; i < window.map.selectFieldset.length; i++) {
    window.map.selectFieldset[i].setAttribute('disabled', 'disabled');
  }
  for (var j = 0; j < window.map.filterSelects.length; j++) {
    window.map.filterSelects[j].setAttribute('disabled', 'disabled');
  }
  calculateInactivePinCoordinates();
})();

(function () {
  window.map.mainPin.addEventListener('mousedown', function (evt) {
    if (evt.button === 0) {
      activateForm();
    }
  });

  window.map.mainPin.addEventListener('keydown', function (evt) {
    if (evt.key === 'Enter') {
      activateForm();
    }
  });
})();


function checkValue() {
  if (window.map.roomNumberValidity.value >= (window.map.capacityCountValidity.value)) {
    return true;
  } else if (window.map.roomNumberValidity.value === '100' && window.map.capacityCountValidity.value === '0') {
    return true;
  }
  return false;
}

function checkValidity() {
  if (checkValue()) {
    window.map.capacityCountValidity.setCustomValidity('');
  } else {
    window.map.capacityCountValidity.setCustomValidity('Кол-во комнат должно соответствовать кол-во комнат');
  }
}

(function () {
  window.map.roomNumberValidity.addEventListener('click', function () {
    checkValidity();
  });

  window.map.capacityCountValidity.addEventListener('click', function () {
    checkValidity();
  });
})();

