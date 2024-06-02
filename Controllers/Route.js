var app = angular.module("productapp", ["ngRoute"]);
const mapboxToken = 'pk.eyJ1IjoiZmNwaGF0bG9jIiwiYSI6ImNsd3BhbmZ6NzE0ZzgybXJ6OWkydWQ5YnYifQ.y68hz5wbABat0CPaoRsr7g';  // Token API Mapbox
app.config(function($routeProvider) {
  $routeProvider
  .when("/", {
    templateUrl : "main.html",
    controller: "main"
  })
  .when("/hotels", {
    templateUrl : "hotels.html",
    controller : 'hotelsController'
  })
  .when("/login", {
    templateUrl : "login.html",
    controller : 'loginController'
    
  }) .when('/myprofile', {
    templateUrl : "myprofile.html",
    controller : 'myprofileController'
  })
  .when("/register", {
    templateUrl : "register.html",
    controller: 'registerController'
  })
  .when('/verify', {
    templateUrl: 'login.html', // Đường dẫn đến template của trang xác minh
    controller: 'VerifyController' // Controller của trang xác minh
  }).when("/blogdetails", {
    templateUrl : "blog-single.html",
    controller : 'blogController'
  })
  .when("/blog", {
    templateUrl : "blog-home.html",
    controller : 'BlogHomeController'
  })
  .when("/hotelDetails", {
    templateUrl : "HotelDetails.html",
    controller : 'HotelDetailsController'
  })
  .when ('/booking/:id', {
    templateUrl : "booking.html",
    controller : 'BookingController'
  }).when ('/mybooking/:page', {
    templateUrl : "MyBooking.html",
    controller : 'MyBookingController'
  }).when('/paying/:id', {
    templateUrl: 'booking.html',
    controller: 'PaymentController'
  }).when ('/signup',{
    templateUrl : "signup.html",
    controller : "signup"
  });
});

const urlApi = "http://103.69.87.92:8080";

app.controller ('main' , function($scope, $http, $location, $filter){

    $http.get(urlApi+'/api/get_attraction').then(function (respone){
        $scope.tours = respone.data.data;

        console.log($scope.tours);
      
        
    });

    $http.get (urlApi+"/api/hotel/getService?type=free").then(function (response){
       $scope.servicesFree = response.data.data
  });

  $http.get (urlApi+"/api/hotel/getService?type=luxury").then(function (response){
       $scope.servicesLuxry = response.data.data
  });
  $http.get (urlApi+"/api/hotel/getService?type=vip").then(function (response){
       $scope.servicesVip = response.data.data
  });

    $http.get(urlApi+'/api/get_top_tour_attraction').then(function (respone){
        $scope.toursTop = respone.data.data;

        console.log($scope.toursTop);
      
        
    });

    $http.get (urlApi+'/api/post/getPost?pageNum=0').then(function(response){
        $scope.posts = response.data.data.content
    });

    today = new Date();
    $scope.dateNow = $filter('date')(today, 'yyyy/MM/dd')
    $scope.dateTomorrow = $filter('date')(today.setDate(today.getDate() + 1), 'yyyy/MM/dd')
    console.log ($scope.dateNow)
    console.log ($scope.dateTomorrow)
    $scope.searchHotels = function() {
      // Truyền tham số tìm kiếm qua URL1
      $location.path('/hotels').search({
          search: $scope.searchQuery.to,
          start: $scope.formattedDate = $filter('date')($scope.searchQuery.start, 'yyyy/MM/dd'),
          return: $scope.formattedDate = $filter('date')($scope.searchQuery.return, 'yyyy/MM/dd'),
          adults: $scope.searchQuery.adults,
          child: $scope.searchQuery.child
      });
  };

    
});
app.controller('hotelsController', function($scope, $http, $routeParams,$location) {
  // Lấy thông tin tìm kiếm từ URL
  var search = $routeParams.search;
  var checkIn = $routeParams.start;
  $scope.checkIn = checkIn;
  var checkOut = $routeParams.return;
  $scope.checkOut = checkOut;
  var pagenum = 0;
  const mapboxToken = 'pk.eyJ1IjoiZmNwaGF0bG9jIiwiYSI6ImNsd3BhbmZ6NzE0ZzgybXJ6OWkydWQ5YnYifQ.y68hz5wbABat0CPaoRsr7g';  // Token API Mapbox

  console.log (checkIn)
  console.log (checkOut)

  
  function geocode(address) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}`;
    return $http.get(url).then(response => {
      if (response.data.features.length > 0) {
        return response.data.features[0].geometry.coordinates;
      } else {
        throw new Error('Không tìm thấy địa chỉ');
      }
    });

    
  }


  

  // Hàm để lấy lộ trình và tính khoảng cách giữa hai tọa độ
  function getDirections(coords1, coords2) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords1[0]},${coords1[1]};${coords2[0]},${coords2[1]}?geometries=geojson&access_token=${mapboxToken}`;
    return $http.get(url).then(response => {
      if (response.data.routes.length > 0) {
        return response.data.routes[0].distance / 1000; // Chuyển đổi từ mét sang km
      } else {
        throw new Error('Không tìm thấy lộ trình');
      }
    });
  }

  

  

  // Xây dựng URL của API với các tham số tìm kiếm
  var apiUrl = urlApi+'/api/hotel/getHotel?search=' + search + '&checkIn=' + checkIn + '&checkOut=' + checkOut + '&pagenum=' + pagenum;
  // Gửi yêu cầu GET đến API để lấy dữ liệu khách sạn và thông tin người dùng
var hotelPromise = $http.get(apiUrl)
.then(function(response) {
  // Lưu trữ dữ liệu từ yêu cầu API trong một biến
  var hotelData = response.data.data.content;

  // Gán dữ liệu vào $scope.hotels
  $scope.hotels = hotelData;

  // Trả về dữ liệu để sử dụng trong Promise tiếp theo
  return hotelData;
})
.catch(function(error) {
  console.error('Lỗi khi lấy dữ liệu khách sạn:', error);
});

// Gửi yêu cầu GET đến API để lấy thông tin người dùng
var userPromise = $http.get(urlApi+'/api/auth/authorization', {
headers: {
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
}
})
.then(function(response) {
  // Lưu trữ dữ liệu từ yêu cầu API trong một biến
  var userData = response.data;
 
  // Trả về dữ liệu để sử dụng trong Promise tiếp theo
  return userData;
})
.catch(function(error) {
  console.error('Lỗi khi lấy thông tin người dùng:', error);
});

// Khi cả hai yêu cầu đã hoàn thành, sử dụng dữ liệu từ cả hai
Promise.all([hotelPromise, userPromise])
.then(function(dataArray) {
  // Lấy dữ liệu từ mỗi promise
  var hotelData = dataArray[0];
  var userData = dataArray[1];

  // Lặp qua từng khách sạn và tính khoảng cách
angular.forEach($scope.hotels, function(hotel) {
  // Sử dụng hàm geocode để chuyển đổi địa chỉ của khách sạn thành tọa độ
  geocode(hotel.address)
    .then(function(coords) {
      // Sau khi có tọa độ của khách sạn, sử dụng tọa độ này và tọa độ của người dùng để tính khoảng cách
      geocode(userData.address)
        .then(function(userCoords) {
          // Gọi hàm getDirections để lấy lộ trình và tính khoảng cách
          getDirections(userCoords, coords)
            .then(function(distance) {
              // Sau khi có khoảng cách, gán giá trị vào thuộc tính distance của khách sạn
              hotel.distance = distance.toFixed(2); // Lưu khoảng cách với 2 chữ số thập phân
            })
            .catch(function(error) {
              console.error('Lỗi khi tính khoảng cách:', error);
            });
        })
        .catch(function(error) {
          console.error('Lỗi khi lấy tọa độ người dùng:', error);
        });
    })
    .catch(function(error) {
      console.error('Lỗi khi lấy tọa độ của khách sạn:', error);
    });
});


  // Sử dụng dữ liệu từ cả hai promise ở đây
  $http.get (urlApi+"/api/hotel/getService?type=free").then(function (response){
     $scope.services = response.data.data
  });

  // Thực hiện các thao tác khác tại đây nếu cần
});





});

app.controller ('HotelDetailsController', function ($scope, $http, $routeParams, $routeParams,$location){
  var id = $routeParams.id;
  var checkIn = $routeParams.start;
  var checkOut = $routeParams.return;
  $scope.checkIn = checkIn;
  $scope.checkOut = checkOut;
  
  $scope.bill = {
    booking: {
      checkIn: checkIn,
      checkOut: checkOut // Thêm thuộc tính checkOut vào booking
    }
  };

  const mapboxToken = 'pk.eyJ1IjoiZmNwaGF0bG9jIiwiYSI6ImNsd3BhbmZ6NzE0ZzgybXJ6OWkydWQ5YnYifQ.y68hz5wbABat0CPaoRsr7g';  // Token API Mapbox
  function geocode(address) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}`;
    return $http.get(url).then(response => {
      if (response.data.features.length > 0) {
        return response.data.features[0].geometry.coordinates;
      } else {
        throw new Error('Không tìm thấy địa chỉ');
      }
    });
  }

  var In = new Date($routeParams.start);
  var Out = new Date($routeParams.return);
  var timeDifference = Out.getTime() - In.getTime();
  $scope.day = timeDifference / (1000 * 3600 * 24);
  console.log ($scope.day)
  
  
  // Hàm để lấy lộ trình và tính khoảng cách giữa hai tọa độ
  function getDirections(coords1, coords2) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords1[0]},${coords1[1]};${coords2[0]},${coords2[1]}?geometries=geojson&access_token=${mapboxToken}`;
    return $http.get(url).then(response => {
      if (response.data.routes.length > 0) {
        return response.data.routes[0].distance / 1000; // Chuyển đổi từ mét sang km
      } else {
        throw new Error('Không tìm thấy lộ trình');
      }
    });
  }
  
  // Xây dựng URL của API với các tham số tìm kiếm
  var apiUrl = urlApi+'/api/hotel/getHotelById?id='+id+'&checkIn='+checkIn+'&checkOut='+checkOut;
  // Gửi yêu cầu GET đến API để lấy dữ liệu khách sạn và thông tin người dùng
var hotelPromise = $http.get(apiUrl)
.then(function(response) {
  // Lưu trữ dữ liệu từ yêu cầu API trong một biến
  var hotelData = response.data.data;

  // Gán dữ liệu vào $scope.hotels
  $scope.hotel = hotelData;


  $scope.servicesFree = [];
for (let i = 0; i < hotelData.listService.length; i++) {
    if (hotelData.listService[i].servicePrice === 0) {
        $scope.servicesFree.push(hotelData.listService[i]);
    }
}
$scope.servicesLuxury = [];
for (let i = 0; i < hotelData.listService.length; i++) {
    if (hotelData.listService[i].servicePrice >= 100000 && hotelData.listService[i].servicePrice < 1000000) {
        $scope.servicesLuxury.push(hotelData.listService[i]);
    }
}

$scope.servicesVip = [];
for (let i = 0; i < hotelData.listService.length; i++) {
    if (hotelData.listService[i].servicePrice >= 1000000) {
        $scope.servicesVip.push(hotelData.listService[i]);
    }
}
$scope.price = $scope.hotel.price * $scope.day


  console.log(hotelData)
  // Trả về dữ liệu để sử dụng trong Promise tiếp theo
  return hotelData;
})
.catch(function(error) {
  console.error('Lỗi khi lấy dữ liệu khách sạn:', error);
});

$scope.chooseRoom = function (){
  var roomchoose = JSON.parse($scope.roomchoose)
  console.log(roomchoose)
  $scope.roomName = roomchoose.roomName
  $scope.price = (roomchoose.price * $scope.day)
  $scope.bill.price = (roomchoose.price * $scope.day)
  $scope.bill.booking.roomBookingId = roomchoose.id
  console.log($scope.price)
  console.log($scope.day)
}


// Gửi yêu cầu GET đến API để lấy thông tin người dùng
var userPromise = $http.get(urlApi+'/api/auth/authorization', {
headers: {
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
}
})
.then(function(response) {
  // Lưu trữ dữ liệu từ yêu cầu API trong một biến
  var userData = response.data;
  $scope.bill.booking.userBookingId = response.data.userId;
  var fullName = response.data.fullname;
var parts = fullName.split(" "); // Tách chuỗi theo khoảng trắng
var lastName = parts.pop(); // Lấy phần tử cuối cùng là họ (tên cuối cùng)
var firstName = parts.join(" "); // Nối lại phần còn lại để lấy tên đệm và tên
 $scope.bill.lastName = lastName;
 $scope.bill.firstName = firstName;
 $scope.bill.phone = response.data.phone
console.log("Tên:", firstName);

  // Trả về dữ liệu để sử dụng trong Promise tiếp theo
  return userData;
})
.catch(function(error) {
  console.error('Lỗi khi lấy thông tin người dùng:', error);
});

// Khi cả hai yêu cầu đã hoàn thành, sử dụng dữ liệu từ cả hai
Promise.all([hotelPromise, userPromise])
.then(function(dataArray) {
  // Lấy dữ liệu từ mỗi promise
  var hotelData = dataArray[0];
  var userData = dataArray[1];

  // Lặp qua từng khách sạn và tính khoảng cách
  // Sử dụng hàm geocode để chuyển đổi địa chỉ của khách sạn thành tọa độ
  geocode(hotelData.address)
    .then(function(coords) {
      // Sau khi có tọa độ của khách sạn, sử dụng tọa độ này và tọa độ của người dùng để tính khoảng cách
      geocode(userData.address)
        .then(function(userCoords) {
          // Gọi hàm getDirections để lấy lộ trình và tính khoảng cách
          getDirections(userCoords, coords)
            .then(function(distance) {
              // Sau khi có khoảng cách, gán giá trị vào thuộc tính distance của khách sạn
              hotelData.distance = distance.toFixed(2); // Lưu khoảng cách với 2 chữ số thập phân
            })
            .catch(function(error) {
              console.error('Lỗi khi tính khoảng cách:', error);
            });
        })
        .catch(function(error) {
          console.error('Lỗi khi lấy tọa độ người dùng:', error);
        });
    })
    .catch(function(error) {
      console.error('Lỗi khi lấy tọa độ của khách sạn:', error);
    });
    

})
$scope.book = function (){
  if ($scope.bill.booking.roomBookingId == null){
     // failed
     new Noty({
       text: 'Vui Lòng Chọn Phòng',
       type: 'error',
       layout: 'topRight',
       timeout: 5000
   }).show();
  }else if (localStorage.getItem('token')==null){
     // failed
     new Noty({
       text: 'Vui Lòng Đăng Nhập',
       type: 'error',
       layout: 'topRight',
       timeout: 1000,
       callbacks: {
         onClose: function() {
             window.location.href = '#/login'; // Chuyển hướng về index.html sau khi Noty đóng
         }
     }
   }).show();
  }else{
   console.log ($scope.bill)
   $http({
    url: urlApi+'/api/booking/book',
    method: "POST",
    data:  JSON.stringify($scope.bill) 
})
.then(function(response) {
    new Noty({
      text: 'đặt hàng thành công vui lòng thanh toán',
      type: 'success',
      layout: 'topRight',
      timeout: 1000,
      callbacks: {
          onClose: function() {
            window.location = '#!/booking/'+response.data.data.id; // Chuyển hướng về index.html sau khi Noty đóng
          }
      }
  }).show();

}, 
function(response) { // optional
        // failed
        
        // Hiển thị Noty khi form không hợp lệ
        new Noty({
          text: response.data.message,
          type: 'error',
          layout: 'topRight',
          timeout: 3000
      }).show();
        console.log (response.data.message)
});
  }
  
}
})
app.controller('loginController', function($scope, $http, $location){
  if (localStorage.getItem("token")!= null){
    $location.path("/")
  }
  $scope.login = function (){
  var data = {
    email: $scope.email,
    password: $scope.password
  }
  console.log (data)
  $http({
    url: urlApi+'/api/auth/login',
    method: "POST",
    data:  JSON.stringify(data) 
})
.then(function(response) {
        localStorage.setItem('token', response.data.accessToken)
        // Hiển thị Noty khi form không hợp lệ
new Noty({
  text: "đăng nhập thành công",
  type: 'success',
  layout: 'topRight',
  timeout: 1000,
  callbacks: {
      onClose: function() {
          window.location.href = ''; // Chuyển hướng về index.html sau khi Noty đóng
      }
  }
}).show();

}, 
function(response) { // optional
        // failed
        
        // Hiển thị Noty khi form không hợp lệ
        new Noty({
          text: response.data.message,
          type: 'error',
          layout: 'topRight',
          timeout: 3000
      }).show();
        console.log (response.data.message)
});
  
  }
});

app.controller('BlogHomeController', function($scope, $http, $location,$routeParams){
  pageNum = $routeParams.pageNum;
  search = $routeParams.search;
  if (pageNum == undefined){
    pageNum = 0;
  }

  
  if (search != undefined){
    console.log ("có search")
  }
  if (search == undefined){
    search = '';
  }
    $http.get(urlApi+'/api/post/getPost?pageNum='+pageNum+'&search='+search, {
  })
  .then(response => {
   $scope.posts = response.data.data
   console.log ($scope.posts.content)
})

});

app.controller('header', function($scope,$http){
  $scope.loged
  if (localStorage.getItem('token')!=null){
  $http.get(urlApi+'/api/auth/authorization', {
    headers: {
        'Authorization': 'Bearer '+localStorage.getItem('token'),
        'Content-Type': 'application/json'
    }
  })
  .then(response => {
   $scope.user = response.data
}).catch(error => {
  window.location.reload= '#!/login'
  });
  }
  if (localStorage.getItem('token') == null){
    $scope.loged = 'login'
  }else {
    $scope.loged = 'loged'
  }

  $scope.logout = function (){
    localStorage.removeItem('token')
    location.reload()
  }
  
});


app.controller('registerController', function ($scope, $http,$location) {
  if (localStorage.getItem("token")!= null){
    $location.path("/")
  }
  // Fetch provinces
  $http.get('https://esgoo.net/api-tinhthanh/1/0.htm').then(function (response) {
      $scope.provinces = response.data.data;
  });

  // Fetch districts based on selected province
  $scope.fetchDistricts = function (provinceId) {
      $http.get('https://esgoo.net/api-tinhthanh/2/' + provinceId + '.htm').then(function (response) {
          $scope.districts = response.data.data;
          $scope.wards = []; // clear wards when province changes
      });
  };

  // Fetch wards based on selected district
  $scope.fetchWards = function (districtId) {
      $http.get('https://esgoo.net/api-tinhthanh/3/' + districtId + '.htm').then(function (response) {
          $scope.wards = response.data.data;
      });
  };

  // Hàm để lấy gợi ý địa chỉ khi người dùng nhập liệu
  $scope.getAddressSuggestions = function () {
      if (!$scope.user.address) {
          $scope.addressSuggestions = [];
          $scope.showAddressSuggestions = false;
          return;
      }

      const mapboxToken = 'pk.eyJ1IjoiZmNwaGF0bG9jIiwiYSI6ImNsd3BhbmZ6NzE0ZzgybXJ6OWkydWQ5YnYifQ.y68hz5wbABat0CPaoRsr7g'; // Token API Mapbox
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent($scope.user.address)}.json?access_token=${mapboxToken}&autocomplete=true&limit=5&bbox=102.14441,8.17966,109.464638,23.393395&language=vi&country=VN`;
      $http.get(url).then(function (response) {
          $scope.addressSuggestions = response.data.features;
          $scope.showAddressSuggestions = true;
      }).catch(function (error) {
          console.error('Error fetching suggestions:', error);
      });
  };

  // Hàm để chọn gợi ý địa chỉ
  $scope.selectAddressSuggestion = function (suggestion) {
      $scope.user.address = suggestion.place_name;
      $scope.addressSuggestions = [];
      $scope.showAddressSuggestions = false;
  };

  // Hàm đăng ký người dùng
  $scope.register = function () {
      $scope.user.city = $scope.selectedProvince.full_name;
      $scope.user.district = $scope.selectedDistrict.full_name;
      $scope.user.ward = $scope.selectedWard.full_name;
      console.log($scope.user);

      $http({
          url: urlApi+'/api/auth/register',
          method: "POST",
          data: JSON.stringify($scope.user)
      }).then(function (response) {
          console.log(response);
          $scope.success = "Đăng ký thành công. Vui lòng xác minh tài khoản qua email.";
          $scope.error = "";
      }, function (response) {
          console.log(response);
          $scope.error = response.data.message;
      });
  };
});

app.controller('VerifyController', function($http,$routeParams,$scope) {
  // Controller logic cho trang xác minh
  // Bạn có thể truy cập vào các tham số trong URL thông qua $routeParams
  token = $routeParams.token;

  $http.get(urlApi+'/api/auth/verify?token='+token).then(function(response) {
        console.log (response)
        new Noty({
          text: "Xác Minh Thành Công",
          type: 'success',
          layout: 'topRight',
          timeout: 2000,
          callbacks: {
              onClose: function() {
                  window.location.href = '#!/login'; // Chuyển hướng về index.html sau khi Noty đóng
              }
          }
        }).show();
    },
    function(response) { // optional
      // failed
      new Noty({
        text: response.data.message,
        type: 'error',
        layout: 'topRight',
        timeout: 5000
    }).show();
});


});

app.controller('blogController', function($http,$routeParams,$scope) {
  // Controller logic cho trang xác minh
  // Bạn có thể truy cập vào các tham số trong URL thông qua $routeParams
  id = $routeParams.id;

  $http.get(urlApi+'/api/post/getPostById?id='+id).then(function(response) {
        
        $scope.post = response.data.data
        console.log ($scope.post)
    },
    function(response) { // optional
      // failed
      $scope.error = response.data.message
});


});

app.directive('fileModel', ['$parse', function ($parse) {
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;

          element.bind('change', function() {
              scope.$apply(function() {
                  modelSetter(scope, element[0].files[0]);
                  // Gọi hàm uploadFile khi có sự thay đổi trong việc chọn file
                  scope.uploadFile();
              });
          });
      }
  };
}]);

app.service('fileUpload', ['$http', function ($http) {
  this.uploadFileToUrl = function(file, uploadUrl) {
      var fd = new FormData();
      fd.append('file', file);

      return $http.post(uploadUrl, fd, {
          transformRequest: angular.identity,
          headers: { 'Content-Type': undefined }
      });
  };
}]);

app.controller ('myprofileController', function ($scope,$http,$location,fileUpload){
  if (localStorage.getItem("token")== null){
    $location.path("/")
  }

  $scope.uploadFile = function() {
    var file = $scope.myFile;
    console.log('file is ', file);

    var uploadUrl = urlApi+"/api/file/upload";
    fileUpload.uploadFileToUrl(file, uploadUrl)
        .then(function(response) {
            console.log('Upload response: ', response);
            if (response.data) {
                $scope.user.avatar = response.data.data.link;
            } else {
                $scope.uploadResponse = "No response received from server.";
            }
        })
        .catch(function(error) {
            console.error('Error uploading file: ', error);
            $scope.uploadResponse = "Error uploading file.";
        });
};


  $http.get(urlApi+'/api/auth/authorization', {
    headers: {
        'Authorization': 'Bearer '+localStorage.getItem('token'),
        'Content-Type': 'application/json'
    }
  })
  .then(response => {
   $scope.user = response.data
   
   console.log($scope.user)
}).catch(error => {
  window.location.reload= '#!/login'
  });


  // Fetch provinces
  $http.get('https://esgoo.net/api-tinhthanh/1/0.htm').then(function (response) {
      $scope.provinces = response.data.data;
  });

  // Fetch districts based on selected province
  $scope.fetchDistricts = function (provinceId) {
      $http.get('https://esgoo.net/api-tinhthanh/2/' + provinceId + '.htm').then(function (response) {
          $scope.districts = response.data.data;
          $scope.wards = []; // clear wards when province changes
      });
  };

  // Fetch wards based on selected district
  $scope.fetchWards = function (districtId) {
      $http.get('https://esgoo.net/api-tinhthanh/3/' + districtId + '.htm').then(function (response) {
          $scope.wards = response.data.data;
      });
  };

  // Hàm để lấy gợi ý địa chỉ khi người dùng nhập liệu
  $scope.getAddressSuggestions = function () {
      if (!$scope.user.address) {
          $scope.addressSuggestions = [];
          $scope.showAddressSuggestions = false;
          return;
      }

      const mapboxToken = 'pk.eyJ1IjoiZmNwaGF0bG9jIiwiYSI6ImNsd3BhbmZ6NzE0ZzgybXJ6OWkydWQ5YnYifQ.y68hz5wbABat0CPaoRsr7g'; // Token API Mapbox
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent($scope.user.address)}.json?access_token=${mapboxToken}&autocomplete=true&limit=5&bbox=102.14441,8.17966,109.464638,23.393395&language=vi&country=VN`;
      $http.get(url).then(function (response) {
          $scope.addressSuggestions = response.data.features;
          $scope.showAddressSuggestions = true;
      }).catch(function (error) {
          console.error('Error fetching suggestions:', error);
      });
  };

  // Hàm để chọn gợi ý địa chỉ
  $scope.selectAddressSuggestion = function (suggestion) {
      $scope.user.address = suggestion.place_name;
      $scope.addressSuggestions = [];
      $scope.showAddressSuggestions = false;
  };
  
  $scope.changeProfile = function (){
    $http({
      url: urlApi+'/api/auth/update',
      method: "PUT",
      data: JSON.stringify($scope.user)
  }).then(function (response) {
      console.log(response);
      $scope.success = "Cập Nhật Thành Công.";
      $scope.error = "";
  }, function (response) {
      console.log(response);
      $scope.error = response.data.message;
  });
  }
})

app.controller ('MyBookingController', function ($scope,$http,$location,$routeParams){
  var page = $routeParams.page;
  if (page === undefined){
    page = 0;
  }else {
    page -= 1;
  }
  $scope.page = page;
  
  if (localStorage.getItem("token")==null){
    $location.path('/')
  }

  $http.get(urlApi+'/api/auth/getbill?page='+page, {
    headers: {
        'Authorization': 'Bearer '+localStorage.getItem('token'),
        'Content-Type': 'application/json'
    }
  })
  .then(response => {
   $scope.bookings = response.data.data.content
   $scope.totalPage = response.data.data.totalPage
   $scope.pages = Array.from({ length: $scope.totalPage }, (v, k) => k + 1);
   console.log(response.data.data)
}).catch(error => {
  window.location.reload= '#!/login'
  });

  $scope.currentPage = page;
  // Hàm chuyển đến trang tiếp theo
  $scope.nextPage = function() {
    console.log('next')
    if ($scope.currentPage < $scope.totalPage - 1) {
      $scope.currentPage++;
      $location.path('/mybooking/' + ($scope.currentPage + 1));
    }
  };

  // Hàm chuyển đến trang trước
  $scope.previousPage = function() {
    console.log('previous')
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      $location.path('/mybooking/' + ($scope.currentPage + 1));
    }
  };
  $scope.bookingdetails = function(id) {
    $location.path('/booking/' + id);
  };
  
  
})

app.controller('BookingController',function($scope,$http,$location,$routeParams){
    var id = $routeParams.id;
    console.log(id)
    if (localStorage.getItem('token')==null){
      $location.path('/')
    }


    $http.get(urlApi+'/api/auth/getBillUser/'+id, {
      headers: {
          'Authorization': 'Bearer '+localStorage.getItem('token'),
          'Content-Type': 'application/json'
      }
    }).then(function (response) {
      console.log(response);
      if (response.data.message == "success"){
        console.log (response.data.data.booking.status)
        if (response.data.data.booking.status === "cancel"){
          console.log = 'cancel'
          response.data.data.booking.status = 'Cancel'
        }
      $scope.booking = response.data.data
      }else{
        $location.path ('/');
      }
  }, function (response) {
      console.log(response);
      
  });

  $scope.payment = function (id){
    $http.get(urlApi+'/api/createPaymentVnpay?bId='+id).then(function (response1) {
      new Noty({
        text: 'Thanh Toán Qua VNPAY',
        type: 'success',
        layout: 'topRight',
        timeout: 1000,
        callbacks: {
            onClose: function() {
                window.location.href = response1.data.url; // Chuyển hướng về index.html sau khi Noty đóng
            }
        }
    }).show();
  }).catch(function (error) {
      console.error('Error fetching suggestions:', error);
  });
  }

    })

app.filter('currencyVND', function() {
  return function(input) {
    if (!input) {
      return '';
    }
    // Ensure the input is a number
    let value = parseFloat(input);
    if (isNaN(value)) {
      return input;
    }
    // Convert the number to a string and use regex to add commas as thousand separators
    let formattedValue = value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedValue;
  };
});
app.controller('PaymentController', function($scope, $location, $routeParams,$http) {
  // Capture route parameter 'id' using $routeParams

      id = $routeParams.id
      vnp_Amount = $routeParams.vnp_Amount,
      vnp_BankCode = $routeParams.vnp_BankCode,
      vnp_BankTranNo = $routeParams.vnp_BankTranNo,
      vnp_CardType = $routeParams.vnp_CardType,
      vnp_OrderInfo = $routeParams.vnp_OrderInfo,
      vnp_PayDate = $routeParams.vnp_PayDate,
      vnp_ResponseCode = $routeParams.vnp_ResponseCode,
      vnp_TmnCode = $routeParams.vnp_TmnCode,
      vnp_TransactionNo = $routeParams.vnp_TransactionNo,
      vnp_TransactionStatus = $routeParams.vnp_TransactionStatus,
      vnp_TxnRef = $routeParams.vnp_TxnRef,
      vnp_SecureHash = $routeParams.vnp_SecureHash

  
      var apiUrl = urlApi+'/api/booking/paying/'+id+'?vnp_Amount='+vnp_Amount+'&vnp_BankCode='+vnp_BankCode+'&vnp_CardType='+
      vnp_CardType+'&vnp_OrderInfo='+vnp_OrderInfo+'&vnp_PayDate='+vnp_PayDate+'&vnp_ResponseCode='+vnp_ResponseCode+'&vnp_TmnCode='+vnp_TmnCode+'&vnp_TransactionNo='+vnp_TransactionNo
      +'&vnp_TransactionStatus='+vnp_TransactionStatus+'&vnp_TxnRef='+vnp_TxnRef+'&vnp_SecureHash='+vnp_SecureHash;
      if (vnp_BankTranNo != undefined){
        apiUrl += '&vnp_BankTranNo='+vnp_BankTranNo
      }
      console.log(apiUrl)
      $http.get(apiUrl)
    .then(function(response) {
      console.log(response)
        new Noty({
          text: response.data.data,
          type: 'success',
          layout: 'topRight',
          timeout: 1000,
          callbacks: {
              onClose: function() {
                window.location = '#!/booking/'+id; // Chuyển hướng về index.html sau khi Noty đóng
              }
          }
      }).show();
    
    }, 
    function(response) { // optional
            // failed
            
            // Hiển thị Noty khi form không hợp lệ
            new Noty({
              text: response.data.message,
              type: 'error',
              layout: 'topRight',
              timeout: 3000
          }).show();
            console.log (response.data.message)
    });
});
app.directive('clickUpload', function() {
  return {
      link: function(scope, element) {
          element.bind('click', function() {
              document.getElementById('fileInput').click();
          });
      }
  };
});
