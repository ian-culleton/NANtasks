angular.module('profile', ['ui.bootstrap','ngAnimate'])
.controller('ProfileController', function($scope, $uibModal, $log, $window, Avatar, Proj) {

  var username = $window.localStorage.getItem('user.fridge');
  $scope.username = username[0].toUpperCase() + username.slice(1).toLowerCase();
  console.log("Username is ", $scope.username);
  $scope.uID = $window.localStorage.getItem('id.fridge');
  $scope.password = "password";
  console.log('profile stuff', $scope.username, $scope.uID, $scope.password);
  $scope.items = [$scope.username, 'password'];

  $scope.animationsEnabled = true;

  $scope.loadStuff = function() {
    Avatar.init();
    var user = $window.localStorage.getItem('user.fridge');
    Proj.getOneUser(user, function(res) {
      // $scope.user = res;
      Avatar.drawLocalAvatar(res.avatar[0], res.avatar[1]);
    });
  };
  $scope.open = function (size) {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'profile.html',
      controller: 'ProfileInstanceCtrl',
      size: size,
      resolve: {
        items: function() {
          return $scope.items;
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
    $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };


})

.controller('ProfileInstanceCtrl', function ($scope, $uibModalInstance, $window, items, $http, Proj, Avatar) {

  var username = $window.localStorage.getItem('user.fridge');
  $scope.username = username[0].toUpperCase() + username.slice(1).toLowerCase();
  $scope.uID = $window.localStorage.getItem('id.fridge');
  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.init = function () {
    $http({
      method:"GET",
      url: window.location.origin + "/api/allAssets/"
    }).then(function(resp) {
      $scope.catHats = resp.data.filter(function (file) {
        return !!~file.indexOf('hat');
      });
      $scope.catHeads = resp.data
        .filter(function (file) {
          return !!~file.indexOf('cat');
        }).map(function (file) {
          var image = new Image();
          image.src = "/assets/" + file;
          return image;
        });
    });
    var user = document
      .getElementsByClassName('current-user-greeting')[0]
      .innerHTML.slice(7);
    Proj.getOneUser(user, function(res) {
      $scope.user = res;
      $scope.avatarNum = res.avatar[0];
      $scope.hatNum = res.avatar[1];
      $scope.cavatar = $scope.catHeads[res.avatar[1]];
    });

    var img = loadImage("/assets/cat_0.png");//
    // $scope.cavatar = img;

    $scope.showAvatar();
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.toggleCat = function(num) {
    $scope.avatarNum = ($scope.avatarNum+num)%16;
    $scope.cavatar.src = "/assets/cat_" + $scope.avatarNum + ".png";
    $scope.drawHat();
  };

  $scope.showAvatar = function() {
    Avatar.drawAvatarOnProfile();
  };
  $scope.setHat = function(hat) {
    $scope.hatNum = hat;
    $scope.drawHat();
  };
  $scope.drawHat = function() {
    var canvas = document.getElementById('avatarCanvas');
    var brush = canvas.getContext("2d");
    var catHat = document.getElementsByClassName('catHat');

    console.log($scope.user);
    brush.drawImage($scope.cavatar, 0, 0);
    if ($scope.hatNum > 0) {
      brush.drawImage(catHat[$scope.hatNum], 23, 10);
    }
  };

  function loadImage(src) {
      var img = new Image();

      img.onload = $scope.showAvatar;
      img.src = src;
      return img;
  }
  $scope.saveAvatar = function() {
    // save canvas image as data url (png format by default)
      var canvas = document.getElementById('avatarCanvas');
      var dataURL = canvas.toDataURL();

      // set canvasImg image src to dataURL
      // so it can be saved as an image
      document.getElementsByClassName("avatar")[0].children[0].src = dataURL;
  };
  //sets data on profile-page creation
  // $scope.getAssets();
});
