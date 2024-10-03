var app = angular.module("productapp", ["ngRoute"]);
const mapboxToken = 'pk.eyJ1IjoiZmNwaGF0bG9jIiwiYSI6ImNsd3BhbmZ6NzE0ZzgybXJ6OWkydWQ5YnYifQ.y68hz5wbABat0CPaoRsr7g';  // Token API Mapbox
app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "main.html",
      controller: "main"
    })
    .when("/login", {
      templateUrl: "login.html",
      controller: 'loginController'

    });
});

const urlApi = "https://bookingapi.click";

app.controller('main', function ($scope, $http, $location, $filter,$timeout) {
      if (localStorage.getItem("token")== null){
        window.location.href = "https://travelbook.com.vn/#!/login";
      }
      if (localStorage.getItem("orderId")== null){
        window.location.href = "#!/login";
      }

      $http({
        url: urlApi + '/api/restaurant/getmenu?pageNum=0&&pageSize=8+&&orderId='+localStorage.getItem("orderId"),
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'), // Thay `yourAuthToken` bằng token của bạn
          'Content-Type': 'application/json'
      }
      })
        .then(function (response) {
          $scope.menu = response.data.data.content;
          console.log($scope.menu)
        },
          function (response) { // optional
            // failed
            if (response.data.message == 'No value present'){
              new Noty({
                text: "Không có mã đơn này trong hệ thống",
                type: 'error',
                layout: 'topRight',
                timeout: 3000
              }).show();
            }else{
            // Hiển thị Noty khi form không hợp lệ
            new Noty({
              text: response.data.message,
              type: 'error',
              layout: 'topRight',
              timeout: 3000
            }).show();
          }
            //console.log(response.data.message)
          });
});

app.controller('loginController', function ($scope, $http, $location) {
  if (localStorage.getItem("token")== null){
    window.location.href = "https://travelbook.com.vn/#!/login";
  }
  if (localStorage.getItem("orderId") != null) {
    $location.path("/")
  }
  $scope.login = function () {
      var orderId = $scope.orderId;
    //console.log(orderId)
    $http({
      url: urlApi + '/api/restaurant/getmenu?pageNum=0&&pageSize=8+&&orderId='+orderId,
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'), // Thay `yourAuthToken` bằng token của bạn
        'Content-Type': 'application/json'
    }
    })
      .then(function (response) {
        localStorage.setItem('orderId', orderId)
        // Hiển thị Noty khi form không hợp lệ
        new Noty({
          text: "đăng nhập thành công",
          type: 'success',
          layout: 'topRight',
          timeout: 1000,
          callbacks: {
            onClose: function () {
              window.location.href = ''; // Chuyển hướng về index.html sau khi Noty đóng
            }
          }
        }).show();

      },
        function (response) { // optional
          // failed
          if (response.data.message == 'No value present'){
            new Noty({
              text: "Không có mã đơn này trong hệ thống",
              type: 'error',
              layout: 'topRight',
              timeout: 3000
            }).show();
          }else{
          // Hiển thị Noty khi form không hợp lệ
          new Noty({
            text: response.data.message,
            type: 'error',
            layout: 'topRight',
            timeout: 3000
          }).show();
        }
          //console.log(response.data.message)
        });

  }
});

app.directive('clickUpload', function () {
  return {
    link: function (scope, element) {
      element.bind('click', function () {
        document.getElementById('fileInput').click();
      });
    }
  };
});

