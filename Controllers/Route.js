var app = angular.module("productapp", ["ngRoute"]);
const mapboxToken = 'pk.eyJ1IjoiZmNwaGF0bG9jIiwiYSI6ImNsd3BhbmZ6NzE0ZzgybXJ6OWkydWQ5YnYifQ.y68hz5wbABat0CPaoRsr7g';  // Token API Mapbox
app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "main.html",
      controller: "main"
    })
    .when("/test", {
      templateUrl: "/newtemplate/index.html",
      controller: "main"
    }).when("/about", {
      templateUrl: "about.html"
    })
    .when("/hotels", {
      templateUrl: "hotels.html",
      controller: 'hotelsController'
    })
    .when("/login", {
      templateUrl: "login.html",
      controller: 'loginController'

    }).when('/myprofile', {
      templateUrl: "myprofile.html",
      controller: 'myprofileController'
    })
    .when("/register", {
      templateUrl: "register.html",
      controller: 'registerController'
    })
    .when('/verify', {
      templateUrl: 'login.html', // Đường dẫn đến template của trang xác minh
      controller: 'VerifyController' // Controller của trang xác minh
    }).when("/blogdetails", {
      templateUrl: "blog-single.html",
      controller: 'blogController'
    })
    .when("/blog", {
      templateUrl: "blog-home.html",
      controller: 'BlogHomeController'
    })
    .when("/hotelDetails", {
      templateUrl: "HotelDetails.html",
      controller: 'HotelDetailsController'
    })
    .when('/booking/:id', {
      templateUrl: "booking.html",
      controller: 'BookingController'
    }).when('/mybooking/:page', {
      templateUrl: "MyBooking.html",
      controller: 'MyBookingController'
    }).when('/paying/:id', {
      templateUrl: 'booking.html',
      controller: 'PaymentController'
    }).when('/nearhotels', {
      templateUrl: 'hotels.html',
      controller: 'nearhotelsController'
    })
    .when('/signup', {
      templateUrl: "signup.html",
      controller: "signup"
    });
});

const urlApi = "https://bookingapi.click";

app.controller('main', function ($scope, $http, $location, $filter,$timeout) {

  $http.get(urlApi + '/api/get_attraction').then(function (respone) {
    $scope.tours = respone.data.data;

    //console.log($scope.tours);


  });

  $http.get(urlApi + "/api/hotel/getService?type=free").then(function (response) {
    $scope.servicesFree = response.data.data
  });

  $http.get(urlApi + "/api/hotel/getService?type=luxury").then(function (response) {
    $scope.servicesLuxry = response.data.data
  });
  $http.get(urlApi + "/api/hotel/getService?type=vip").then(function (response) {
    $scope.servicesVip = response.data.data
  });

  $http.get(urlApi + '/api/get_top_tour_attraction').then(function (respone) {
    $scope.toursTop = respone.data.data;

    //console.log($scope.toursTop);


  });

  $http.get(urlApi + '/api/review/getAll').then(function (respone) {
    $scope.reviews = respone.data.data;

    //console.log($scope.reviews);


  });

  $http.get(urlApi + '/api/post/getPost?pageNum=0').then(function (response) {
    $scope.posts = response.data.data.content
  });

  today = new Date();
  $scope.dateNow = $filter('date')(today, 'yyyy/MM/dd')
  $scope.dateTomorrow = $filter('date')(today.setDate(today.getDate() + 1), 'yyyy/MM/dd')
  //console.log($scope.dateNow)
  //console.log($scope.dateTomorrow)
  $scope.searchHotels = function () {
    today = new Date();
    dateNowFormat = $filter('date')(today, 'yyyy/MM/dd')
    //console.log (dateNowFormat)
    if ($scope.searchQuery.start >= $scope.searchQuery.return){
      new Noty({
        text: 'checkin không được lớn hơn checkout',
        type: 'error',
        layout: 'topRight',
        timeout: 3000
    }).show();
    return;
    }
    today.setDate(today.getDate() - 1)
    if ($scope.searchQuery.start <= today){
      //console.log (today)
      new Noty({
        text: 'Ngày Checkin nhỏ hơn ngày hiện tại',
        type: 'error',
        layout: 'topRight',
        timeout: 3000
    }).show();
    return;
    }

    if ($scope.searchQuery.to == 'near'){
      $location.path('/nearhotels').search({
        start: $scope.formattedDate = $filter('date')($scope.searchQuery.start, 'yyyy/MM/dd'),
        return: $scope.formattedDate = $filter('date')($scope.searchQuery.return, 'yyyy/MM/dd'),
        hotelName: $scope.searchQuery.hotelName
      });
    }else{

    // Truyền tham số tìm kiếm qua URL1
    $location.path('/hotels').search({
      search: $scope.searchQuery.to,
      start: $scope.formattedDate = $filter('date')($scope.searchQuery.start, 'yyyy/MM/dd'),
      return: $scope.formattedDate = $filter('date')($scope.searchQuery.return, 'yyyy/MM/dd'),
      hotelName: $scope.searchQuery.hotelName,
      adults: $scope.searchQuery.adults,
      child: $scope.searchQuery.child
    });
  }
  };

  $scope.feedback = {
    rate: '1' // Đặt giá trị mặc định là '1'
};

$scope.toggleHotelNameInput = function() {
  if ($scope.searchQuery.to !== 'near') {
      $scope.showHotelNameInput = true;
  } else {
      $scope.showHotelNameInput = false;
  }
};
var timeoutPromise;
// Function to get hotel name suggestions based on user input with debounce
$scope.getHotelSuggestions = function() {
  if (timeoutPromise) {
      $timeout.cancel(timeoutPromise);
  }
  timeoutPromise = $timeout(function() {
      if ($scope.searchQuery.hotelName) {
          var params = {
              tour: $scope.searchQuery.to,
              find: $scope.searchQuery.hotelName
          };

          $http.get('http://bookingapi.click/api/hotel/get_hotel_name', { params: params })
              .then(function(response) {
                  if (response.data.status === 200) {
                      $scope.hotelSuggestions = response.data.data;
                      $scope.showHotelNameSuggestions = true;
                  } else {
                      console.error('Error fetching hotel suggestions:', response.data.message);
                      $scope.showHotelNameSuggestions = false;
                  }
              })
              .catch(function(error) {
                  console.error('Error fetching hotel suggestions:', error);
                  $scope.showHotelNameSuggestions = false;
              });
      } else {
          $scope.hotelSuggestions = [];
          $scope.showHotelNameSuggestions = false;
      }
  }, 500); // Thời gian debounce là 500ms
};

// Function to handle input change and debounce
$scope.handleInputChange = function() {
  $scope.getHotelSuggestions();
};


$scope.selectHotel = function(hotel) {
  $scope.searchQuery.hotelName = hotel.hotelName;
  $scope.showHotelNameSuggestions = false;
};


  $scope.submitfeedback = function (){
    if (localStorage.getItem('token')!=null){
      //console.log($scope.feedback)
      $http({
        url: urlApi + '/api/review/comment',
        method: "POST",
        data: JSON.stringify($scope.feedback),
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'), // Thay `yourAuthToken` bằng token của bạn
            'Content-Type': 'application/json'
        }
    })
    .then(function (response) {
        new Noty({
            text: 'Feedback thành công.',
            type: 'success',
            layout: 'topRight',
            timeout: 1000
        }).show();
    },
    function (response) { // optional
        // failed
    
        // Hiển thị Noty khi form không hợp lệ
        new Noty({
            text: response.data.message,
            type: 'error',
            layout: 'topRight',
            timeout: 3000
        }).show();
        //console.log(response.data.message)
    });
    
  }else{
    new Noty({
      text: 'Vui Lòng Đăng Nhập',
      type: 'error',
      layout: 'topRight',
      timeout: 1000
    }).show();
  }
}


});
app.controller('hotelsController', function ($scope, $http, $routeParams, $location,$filter) {
  // Lấy thông tin tìm kiếm từ URL
  var search = $routeParams.search;
  $scope.search = search
  var checkIn = $routeParams.start;
  $scope.checkIn = checkIn;
  var checkOut = $routeParams.return;
  $scope.checkOut = checkOut;
  var page = 0;
  var hotelName = '';
  if ($routeParams.hotelName != undefined){
  var hotelName = $routeParams.hotelName;
  }
  today = new Date();
    dateNowFormat = $filter('date')(today, 'yyyy/MM/dd')
    var dateString = checkIn; // Chuỗi ngày cần chuyển đổi
    var parts = dateString.split('/'); // Tách chuỗi thành các phần tử: năm, tháng, ngày
    var yearCheckIn = parseInt(parts[0]); // Chuyển đổi phần tử năm thành số nguyên
    var monthCheckIn = parseInt(parts[1]) - 1; // Chuyển đổi phần tử tháng thành số nguyên và trừ đi 1 vì index của tháng bắt đầu từ 0
    var dayCheckIn = parseInt(parts[2]); // Chuyển đổi phần tử ngày thành số nguyên

    var dateCheckIn = new Date(yearCheckIn, monthCheckIn, dayCheckIn);
    var dateString = checkOut; // Chuỗi ngày cần chuyển đổi
    var parts = dateString.split('/'); // Tách chuỗi thành các phần tử: năm, tháng, ngày
    var yearCheckOut = parseInt(parts[0]); // Chuyển đổi phần tử năm thành số nguyên
    var monthCheckOut = parseInt(parts[1]) - 1; // Chuyển đổi phần tử tháng thành số nguyên và trừ đi 1 vì index của tháng bắt đầu từ 0
    var dayCheckOut = parseInt(parts[2]); // Chuyển đổi phần tử ngày thành số nguyên
    
    var dateCheckOut = new Date(yearCheckOut, monthCheckOut, dayCheckOut); // Chuyển đổi chuỗi ngày trả vào đối tượng ngày

    //console.log(dateCheckIn >= dateCheckOut); // Kiểm tra xem đối tượng ngày đã được tạo thành công chưa
    //console.log(dateCheckOut);
    if (dateCheckIn >= dateCheckOut ){
      new Noty({
        text: 'checkin không được lớn hơn checkout',
        type: 'error',
        layout: 'topRight',
        timeout: 3000
    }).show();
    return;
    }
 



  $scope.page = page;
  
  const mapboxToken = 'pk.eyJ1IjoiZmNwaGF0bG9jIiwiYSI6ImNsd3BhbmZ6NzE0ZzgybXJ6OWkydWQ5YnYifQ.y68hz5wbABat0CPaoRsr7g';  // Token API Mapbox

  //console.log(checkIn)
  //console.log(checkOut)


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
  var apiUrl = urlApi + '/api/hotel/getHotel?search=' + search + '&checkIn=' + checkIn + '&checkOut=' + checkOut + '&pagenum=' + $scope.page+ '&hotelName='+hotelName;
  // Gửi yêu cầu GET đến API để lấy dữ liệu khách sạn và thông tin người dùng
  var hotelPromise = $http.get(apiUrl)
    .then(function (response) {
      // Lưu trữ dữ liệu từ yêu cầu API trong một biến
      var hotelData = response.data.data.content;

      // Gán dữ liệu vào $scope.hotels
      $scope.hotels = hotelData;

      // Trả về dữ liệu để sử dụng trong Promise tiếp theo
      $scope.totalPage = response.data.data.totalPage
      $scope.pages = Array.from({ length: $scope.totalPage }, (v, k) => k + 1);
      //console.log(response.data.data)

      return hotelData;
    })
    .catch(function (error) {
      console.error('Lỗi khi lấy dữ liệu khách sạn:', error);
    });

  // Gửi yêu cầu GET đến API để lấy thông tin người dùng
  var userPromise = $http.get(urlApi + '/api/auth/authorization', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      // Lưu trữ dữ liệu từ yêu cầu API trong một biến
      var userData = response.data;

      // Trả về dữ liệu để sử dụng trong Promise tiếp theo
      return userData;
    })
    .catch(function (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    });

  // Khi cả hai yêu cầu đã hoàn thành, sử dụng dữ liệu từ cả hai
  Promise.all([hotelPromise, userPromise])
    .then(function (dataArray) {
      // Lấy dữ liệu từ mỗi promise
      var hotelData = dataArray[0];
      var userData = dataArray[1];

      // Lặp qua từng khách sạn và tính khoảng cách
      angular.forEach($scope.hotels, function (hotel) {
        // Sử dụng hàm geocode để chuyển đổi địa chỉ của khách sạn thành tọa độ
        geocode(hotel.address)
          .then(function (coords) {
            // Sau khi có tọa độ của khách sạn, sử dụng tọa độ này và tọa độ của người dùng để tính khoảng cách
            geocode(userData.address)
              .then(function (userCoords) {
                // Gọi hàm getDirections để lấy lộ trình và tính khoảng cách
                getDirections(userCoords, coords)
                  .then(function (distance) {
                    // Sau khi có khoảng cách, gán giá trị vào thuộc tính distance của khách sạn
                    hotel.distance = distance.toFixed(2); // Lưu khoảng cách với 2 chữ số thập phân
                  })
                  .catch(function (error) {
                    console.error('Lỗi khi tính khoảng cách:', error);
                  });
              })
              .catch(function (error) {
                console.error('Lỗi khi lấy tọa độ người dùng:', error);
              });
          })
          .catch(function (error) {
            console.error('Lỗi khi lấy tọa độ của khách sạn:', error);
          });
      });


      // Sử dụng dữ liệu từ cả hai promise ở đây
      $http.get(urlApi + "/api/hotel/getService?type=free").then(function (response) {
        $scope.services = response.data.data
      });

      // Thực hiện các thao tác khác tại đây nếu cần
    });

  

    $scope.changepage = function (pagechange){
      $scope.page = pagechange;
      
  // Xây dựng URL của API với các tham số tìm kiếm
  var apiUrl = urlApi + '/api/hotel/getHotel?search=' + search + '&checkIn=' + checkIn + '&checkOut=' + checkOut + '&pagenum=' + $scope.page +'&hotelName='+hotelName;
  // Gửi yêu cầu GET đến API để lấy dữ liệu khách sạn và thông tin người dùng
  var hotelPromise = $http.get(apiUrl)
    .then(function (response) {
      // Lưu trữ dữ liệu từ yêu cầu API trong một biến
      var hotelData = response.data.data.content;

      // Gán dữ liệu vào $scope.hotels
      $scope.hotels = hotelData;

      // Trả về dữ liệu để sử dụng trong Promise tiếp theo
      $scope.totalPage = response.data.data.totalPage
      $scope.pages = Array.from({ length: $scope.totalPage }, (v, k) => k + 1);
      //console.log(response.data.data)

      return hotelData;
    })
    .catch(function (error) {
      console.error('Lỗi khi lấy dữ liệu khách sạn:', error);
    });

  // Gửi yêu cầu GET đến API để lấy thông tin người dùng
  var userPromise = $http.get(urlApi + '/api/auth/authorization', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      // Lưu trữ dữ liệu từ yêu cầu API trong một biến
      var userData = response.data;

      // Trả về dữ liệu để sử dụng trong Promise tiếp theo
      return userData;
    })
    .catch(function (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    });

  // Khi cả hai yêu cầu đã hoàn thành, sử dụng dữ liệu từ cả hai
  Promise.all([hotelPromise, userPromise])
    .then(function (dataArray) {
      // Lấy dữ liệu từ mỗi promise
      var hotelData = dataArray[0];
      var userData = dataArray[1];

      // Lặp qua từng khách sạn và tính khoảng cách
      angular.forEach($scope.hotels, function (hotel) {
        // Sử dụng hàm geocode để chuyển đổi địa chỉ của khách sạn thành tọa độ
        geocode(hotel.address)
          .then(function (coords) {
            // Sau khi có tọa độ của khách sạn, sử dụng tọa độ này và tọa độ của người dùng để tính khoảng cách
            geocode(userData.address)
              .then(function (userCoords) {
                // Gọi hàm getDirections để lấy lộ trình và tính khoảng cách
                getDirections(userCoords, coords)
                  .then(function (distance) {
                    // Sau khi có khoảng cách, gán giá trị vào thuộc tính distance của khách sạn
                    hotel.distance = distance.toFixed(2); // Lưu khoảng cách với 2 chữ số thập phân
                  })
                  .catch(function (error) {
                    console.error('Lỗi khi tính khoảng cách:', error);
                  });
              })
              .catch(function (error) {
                console.error('Lỗi khi lấy tọa độ người dùng:', error);
              });
          })
          .catch(function (error) {
            console.error('Lỗi khi lấy tọa độ của khách sạn:', error);
          });
      });

        // Hàm chuyển đến trang tiếp theo
  $scope.nextPage = function () {
    //console.log('next')
    if ($scope.currentPage < $scope.totalPage - 1) {
      $scope.currentPage++;
      $scope.pagechange($scope.currentPage)
    }
  };

  // Hàm chuyển đến trang trước
  $scope.previousPage = function () {
    //console.log('previous')
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      $$scope.pagechange($scope.currentPage)
    }
  };

      // Sử dụng dữ liệu từ cả hai promise ở đây
      $http.get(urlApi + "/api/hotel/getService?type=free").then(function (response) {
        $scope.services = response.data.data
      });

      // Thực hiện các thao tác khác tại đây nếu cần
    });
    }





});

app.controller('HotelDetailsController', function ($scope, $http, $routeParams, $routeParams, $location) {
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
  //console.log($scope.day)


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
  var apiUrl = urlApi + '/api/hotel/getHotelById?id=' + id + '&checkIn=' + checkIn + '&checkOut=' + checkOut;
  // Gửi yêu cầu GET đến API để lấy dữ liệu khách sạn và thông tin người dùng
  var hotelPromise = $http.get(apiUrl)
    .then(function (response) {
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


      //console.log(hotelData)
      // Trả về dữ liệu để sử dụng trong Promise tiếp theo
      return hotelData;
    })
    .catch(function (error) {
      console.error('Lỗi khi lấy dữ liệu khách sạn:', error);
    });

  $scope.chooseRoom = function () {
    var roomchoose = JSON.parse($scope.roomchoose)
    //console.log(roomchoose)
    $scope.roomName = roomchoose.roomName
    $scope.price = (roomchoose.price * $scope.day)
    $scope.bill.price = (roomchoose.price * $scope.day)
    $scope.bill.booking.roomBookingId = roomchoose.id
    //console.log($scope.price)
    //console.log($scope.day)
  }


  // Gửi yêu cầu GET đến API để lấy thông tin người dùng
  var userPromise = $http.get(urlApi + '/api/auth/authorization', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      // Lưu trữ dữ liệu từ yêu cầu API trong một biến
      var userData = response.data;
      $scope.userBook = response.data;
      //console.log ($scope.userBook)
      $scope.bill.booking.userBookingId = response.data.userId;
      var fullName = response.data.fullname;
      var parts = fullName.split(" "); // Tách chuỗi theo khoảng trắng
      var lastName = parts.pop(); // Lấy phần tử cuối cùng là họ (tên cuối cùng)
      var firstName = parts.join(" "); // Nối lại phần còn lại để lấy tên đệm và tên
      $scope.bill.lastName = lastName;
      $scope.bill.firstName = firstName;
      $scope.bill.phone = response.data.phone
      //console.log("Tên:", firstName);

      // Trả về dữ liệu để sử dụng trong Promise tiếp theo
      return userData;
    })
    .catch(function (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    });

  // Khi cả hai yêu cầu đã hoàn thành, sử dụng dữ liệu từ cả hai
  Promise.all([hotelPromise, userPromise])
    .then(function (dataArray) {
      // Lấy dữ liệu từ mỗi promise
      var hotelData = dataArray[0];
      var userData = dataArray[1];

      // Lặp qua từng khách sạn và tính khoảng cách
      // Sử dụng hàm geocode để chuyển đổi địa chỉ của khách sạn thành tọa độ
      geocode(hotelData.address)
        .then(function (coords) {
          // Sau khi có tọa độ của khách sạn, sử dụng tọa độ này và tọa độ của người dùng để tính khoảng cách
          geocode(userData.address)
            .then(function (userCoords) {
              // Gọi hàm getDirections để lấy lộ trình và tính khoảng cách
              getDirections(userCoords, coords)
                .then(function (distance) {
                  // Sau khi có khoảng cách, gán giá trị vào thuộc tính distance của khách sạn
                  hotelData.distance = distance.toFixed(2); // Lưu khoảng cách với 2 chữ số thập phân
                })
                .catch(function (error) {
                  console.error('Lỗi khi tính khoảng cách:', error);
                });
            })
            .catch(function (error) {
              console.error('Lỗi khi lấy tọa độ người dùng:', error);
            });
        })
        .catch(function (error) {
          console.error('Lỗi khi lấy tọa độ của khách sạn:', error);
        });


    })
  $scope.book = function () {
    if ($scope.bill.booking.roomBookingId == null) {
      // failed
      new Noty({
        text: 'Vui Lòng Chọn Phòng',
        type: 'error',
        layout: 'topRight',
        timeout: 5000
      }).show();
    } else if (localStorage.getItem('token') == null) {
      // failed
      new Noty({
        text: 'Vui Lòng Đăng Nhập',
        type: 'error',
        layout: 'topRight',
        timeout: 1000,
        callbacks: {
          onClose: function () {
            window.location.href = '#/login'; // Chuyển hướng về index.html sau khi Noty đóng
          }
        }
      }).show();
    } else {
      //console.log($scope.bill)
      $http({
        url: urlApi + '/api/booking/book',
        method: "POST",
        data: JSON.stringify($scope.bill)
      })
        .then(function (response) {
          new Noty({
            text: 'đặt hàng thành công vui lòng thanh toán',
            type: 'success',
            layout: 'topRight',
            timeout: 1000,
            callbacks: {
              onClose: function () {
                window.location = '#!/booking/' + response.data.data.id; // Chuyển hướng về index.html sau khi Noty đóng
              }
            }
          }).show();

        },
          function (response) { // optional
            // failed

            // Hiển thị Noty khi form không hợp lệ
            new Noty({
              text: response.data.message,
              type: 'error',
              layout: 'topRight',
              timeout: 3000
            }).show();
            //console.log(response.data.message)
          });
    }

  }

  $scope.bookVistor = function () {
    if ($scope.bill.booking.roomBookingId == null) {
      // failed
      new Noty({
        text: 'Vui Lòng Chọn Phòng',
        type: 'error',
        layout: 'topRight',
        timeout: 5000
      }).show();
    } else if (localStorage.getItem('token') == null) {
      // failed
      new Noty({
        text: 'Vui Lòng Đăng Nhập',
        type: 'error',
        layout: 'topRight',
        timeout: 1000,
        callbacks: {
          onClose: function () {
            window.location.href = '#/login'; // Chuyển hướng về index.html sau khi Noty đóng
          }
        }
      }).show();
    } else {
      //console.log($scope.bill)
      $http({
        url: urlApi + '/api/admin/bookVistor',
        method: "POST",
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'application/json'
        },
        data: JSON.stringify($scope.bill)
      })
        .then(function (response) {
          new Noty({
            text: 'Đặt Phòng Thành Công',
            type: 'success',
            layout: 'topRight',
            timeout: 1000,
            callbacks: {
              onClose: function () {
                window.location = '#!/booking/' + response.data.data.id; // Chuyển hướng về index.html sau khi Noty đóng
              }
            }
          }).show();

        },
          function (response) { // optional
            // failed

            // Hiển thị Noty khi form không hợp lệ
            new Noty({
              text: response.data.message,
              type: 'error',
              layout: 'topRight',
              timeout: 3000
            }).show();
            //console.log(response.data.message)
          });
    }

  }
})
app.controller('loginController', function ($scope, $http, $location) {
  if (localStorage.getItem("token") != null) {
    $location.path("/")
  }
  $scope.login = function () {
    var data = {
      email: $scope.email,
      password: $scope.password
    }
    //console.log(data)
    $http({
      url: urlApi + '/api/auth/login',
      method: "POST",
      data: JSON.stringify(data)
    })
      .then(function (response) {
        localStorage.setItem('token', response.data.accessToken)
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

          // Hiển thị Noty khi form không hợp lệ
          new Noty({
            text: response.data.message,
            type: 'error',
            layout: 'topRight',
            timeout: 3000
          }).show();
          //console.log(response.data.message)
        });

  }
});

app.controller('BlogHomeController', function ($scope, $http, $location, $routeParams) {
  pageNum = $routeParams.pageNum;
  search = $routeParams.search;
  if (pageNum == undefined) {
    pageNum = 1;
  }


  if (search != undefined) {
    //console.log("có search")
  }
  if (search == undefined) {
    search = '';
  }

  $scope.searchBlog = function (){
    if ($scope.search != null){
      window.location = '#!/blog?search='+$scope.search
    }
  }
  $http.get(urlApi + '/api/post/getPost?pageNum=' + (pageNum-1) + '&search=' + search, {
  })
    .then(response => {
      $scope.posts = response.data.data.content
      //console.log (response)
    $scope.totalPage = response.data.data.totalPage
    $scope.pages = Array.from({ length: $scope.totalPage }, (v, k) => k + 1);
    //console.log($scope.post)
      //console.log($scope.posts)
    })

    $scope.nextPage = function () {
      //console.log('next')
      if ($scope.currentPage < $scope.totalPage - 1) {
        $scope.currentPage++;
        $location.path('/mybooking/' + ($scope.currentPage + 1));
      }
    };
  
    // Hàm chuyển đến trang trước
    $scope.previousPage = function () {
      //console.log('previous')
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
        $location.path('/mybooking/' + ($scope.currentPage + 1));
      }
    };

});

app.controller('header', function ($scope, $http) {
  $scope.loged
  if (localStorage.getItem('token') != null) {
    $http.get(urlApi + '/api/auth/authorization', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        $scope.user = response.data
      }).catch(error => {
        window.location.reload = '#!/login'
        localStorage.removeItem("token");
      });
  }
  if (localStorage.getItem('token') == null) {
    $scope.loged = 'login'
  } else {
    $scope.loged = 'loged'
  }

  $scope.logout = function () {
    localStorage.removeItem('token')
    location.reload()
  }

});


app.controller('registerController', function ($scope, $http, $location) {
  if (localStorage.getItem("token") != null) {
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

  function isValidEmail(email) {
    // Sử dụng một biểu thức chính quy hoặc bất kỳ logic kiểm tra email nào bạn muốn ở đây
    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
} ;


  // Hàm đăng ký người dùng
  $scope.register = function () {
    $scope.user.city = $scope.selectedProvince.full_name;
    $scope.user.district = $scope.selectedDistrict.full_name;
    $scope.user.ward = $scope.selectedWard.full_name;
    //console.log($scope.user);
    //console.log (isValidEmail($scope.user.email))
    if (isValidEmail($scope.user.email)==false){
      $scope.error = 'email không hợp lệ';
      return
    }



    $http({
      url: urlApi + '/api/auth/register',
      method: "POST",
      data: JSON.stringify($scope.user)
    }).then(function (response) {
      //console.log(response);
      $scope.success = "Đăng ký thành công. Vui lòng xác minh tài khoản qua email.";
      $scope.error = "";
    }, function (response) {
      //console.log(response);
      $scope.error = response.data.message;
    });
  };
});

app.controller('VerifyController', function ($http, $routeParams, $scope) {
  // Controller logic cho trang xác minh
  // Bạn có thể truy cập vào các tham số trong URL thông qua $routeParams
  token = $routeParams.token;

  $http.get(urlApi + '/api/auth/verify?token=' + token).then(function (response) {
    //console.log(response)
    new Noty({
      text: "Xác Minh Thành Công",
      type: 'success',
      layout: 'topRight',
      timeout: 2000,
      callbacks: {
        onClose: function () {
          window.location.href = '#!/login'; // Chuyển hướng về index.html sau khi Noty đóng
        }
      }
    }).show();
  },
    function (response) { // optional
      // failed
      new Noty({
        text: response.data.message,
        type: 'error',
        layout: 'topRight',
        timeout: 5000
      }).show();
    });


});

app.controller('blogController', function ($http, $routeParams, $scope) {
  // Controller logic cho trang xác minh
  // Bạn có thể truy cập vào các tham số trong URL thông qua $routeParams
  id = $routeParams.id;

  $http.get(urlApi + '/api/post/getPostById?id=' + id).then(function (response) {

    $scope.post = response.data.data

    //console.log ($scope.post)


    
  },
    function (response) { // optional
      // failed
      $scope.error = response.data.message
    });

    $scope.searchBlog = function (){
      if ($scope.search != null){
        window.location = '#!/blog?search='+$scope.search
      }
    }

    $scope.postComment = function (){
      //console.log ($scope.post.postId)
      //console.log($scope.comment)
      
      var postData = {
        postid: $scope.post.postId,
        comment: $scope.comment
      };

      $http({
        url: urlApi + '/api/post/comment',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: JSON.stringify(postData)
      }).then(function (response) {
        new Noty({
          text: 'comment thành công',
          type: 'success',
          layout: 'topRight',
          timeout: 5000
        }).show();
        $scope.post.comments.push(response.data.data)
      }, function (response) {
        //console.log(response);
        $scope.error = response.data.message;
      });
      $scope.comment = ''
    }


});

app.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function () {
        scope.$apply(function () {
          modelSetter(scope, element[0].files[0]);
          // Gọi hàm uploadFile khi có sự thay đổi trong việc chọn file
          scope.uploadFile();
        });
      });
    }
  };
}]);

app.service('fileUpload', ['$http', function ($http) {
  this.uploadFileToUrl = function (file, uploadUrl) {
    var fd = new FormData();
    fd.append('file', file);

    return $http.post(uploadUrl, fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };
}]);

app.controller('myprofileController', function ($scope, $http, $location, fileUpload) {
  if (localStorage.getItem("token") == null) {
    $location.path("/")
  }

  $scope.uploadFile = function () {
    var file = $scope.myFile;
    //console.log('file is ', file);

    var uploadUrl = urlApi + "/api/file/upload";
    fileUpload.uploadFileToUrl(file, uploadUrl)
      .then(function (response) {
        //console.log('Upload response: ', response);
        if (response.data) {
          $scope.user.avatar = response.data.data.link;
        } else {
          $scope.uploadResponse = "No response received from server.";
        }
      })
      .catch(function (error) {
        console.error('Error uploading file: ', error);
        $scope.uploadResponse = "Error uploading file.";
      });
  };


  $http.get(urlApi + '/api/auth/authorization', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      $scope.user = response.data

      //console.log($scope.user)
    }).catch(error => {
      window.location.reload = '#!/login'
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

  $scope.changeProfile = function () {
    $http({
      url: urlApi + '/api/auth/update',
      method: "PUT",
      data: JSON.stringify($scope.user)
    }).then(function (response) {
      //console.log(response);
      $scope.success = "Cập Nhật Thành Công.";
      $scope.error = "";
    }, function (response) {
      //console.log(response);
      $scope.error = response.data.message;
    });
  }
})

app.controller('MyBookingController', function ($scope, $http, $location, $routeParams) {
  var page = $routeParams.page;
  if (page === undefined) {
    page = 0;
  } else {
    page -= 1;
  }
  $scope.page = page;

  if (localStorage.getItem("token") == null) {
    $location.path('/')
  }

  $http.get(urlApi + '/api/auth/getbill?page=' + page, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      $scope.bookings = response.data.data.content
      $scope.totalPage = response.data.data.totalPage
      $scope.pages = Array.from({ length: $scope.totalPage }, (v, k) => k + 1);
      ////console.log(response.data.data)
    }).catch(error => {
      window.location.reload = '#!/login'
    });

  $scope.currentPage = page;
  // Hàm chuyển đến trang tiếp theo
  $scope.nextPage = function () {
    ////console.log('next')
    if ($scope.currentPage < $scope.totalPage - 1) {
      $scope.currentPage++;
      $location.path('/mybooking/' + ($scope.currentPage + 1));
    }
  };

  // Hàm chuyển đến trang trước
  $scope.previousPage = function () {
    //console.log('previous')
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      $location.path('/mybooking/' + ($scope.currentPage + 1));
    }
  };
  $scope.bookingdetails = function (id) {
    $location.path('/booking/' + id);
  };


})

app.controller('BookingController', function ($scope, $http, $location, $routeParams) {
  var id = $routeParams.id;
  if (localStorage.getItem('token') == null) {
    $location.path('/')
  }


  $http.get(urlApi + '/api/auth/getBillUser/' + id, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  }).then(function (response) {
    //console.log(response);
    if (response.data.message == "success") {
      //console.log(response.data.data.booking.status)
      if (response.data.data.booking.status === "cancel") {
        //console.log = 'cancel'
        response.data.data.booking.status = 'Cancel'
      }
      $scope.booking = response.data.data
    } else {
      $location.path('/');
    }
  }, function (response) {
    //console.log(response);

  });

  $scope.payment = function (id) {
    $http.get(urlApi + '/api/createPaymentVnpay?bId=' + id).then(function (response1) {
      new Noty({
        text: 'Thanh Toán Qua VNPAY',
        type: 'success',
        layout: 'topRight',
        timeout: 1000,
        callbacks: {
          onClose: function () {
            window.location.href = response1.data.url; // Chuyển hướng về index.html sau khi Noty đóng
          }
        }
      }).show();
    }).catch(function (error) {
      console.error('Error fetching suggestions:', error);
    });
  }

})

app.filter('currencyVND', function () {
  return function (input) {
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
app.controller('PaymentController', function ($scope, $location, $routeParams, $http) {
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


  var apiUrl = urlApi + '/api/booking/paying/' + id + '?vnp_Amount=' + vnp_Amount + '&vnp_BankCode=' + vnp_BankCode + '&vnp_CardType=' +
    vnp_CardType + '&vnp_OrderInfo=' + vnp_OrderInfo + '&vnp_PayDate=' + vnp_PayDate + '&vnp_ResponseCode=' + vnp_ResponseCode + '&vnp_TmnCode=' + vnp_TmnCode + '&vnp_TransactionNo=' + vnp_TransactionNo
    + '&vnp_TransactionStatus=' + vnp_TransactionStatus + '&vnp_TxnRef=' + vnp_TxnRef + '&vnp_SecureHash=' + vnp_SecureHash;
  if (vnp_BankTranNo != undefined) {
    apiUrl += '&vnp_BankTranNo=' + vnp_BankTranNo
  }
  //console.log(apiUrl)
  $http.get(apiUrl)
    .then(function (response) {
      //console.log(response)
      new Noty({
        text: response.data.data,
        type: 'success',
        layout: 'topRight',
        timeout: 1000,
        callbacks: {
          onClose: function () {
            window.location = '#!/booking/' + id; // Chuyển hướng về index.html sau khi Noty đóng
          }
        }
      }).show();

    },
      function (response) { // optional
        // failed

        // Hiển thị Noty khi form không hợp lệ
        new Noty({
          text: response.data.message,
          type: 'error',
          layout: 'topRight',
          timeout: 3000
        }).show();
        //console.log(response.data.message)
      });
});
app.controller ('nearhotelsController', function($scope,$http,$location,$routeParams,$filter){
    // Lấy thông tin tìm kiếm từ URL
    var checkIn = $routeParams.start;
    $scope.checkIn = checkIn;
    var checkOut = $routeParams.return;
    $scope.checkOut = checkOut;
    var page = 0;
    today = new Date()
  
   
  
    dateNowFormat = $filter('date')(today, 'yyyy/MM/dd')
    var dateString = checkIn; // Chuỗi ngày cần chuyển đổi
    var parts = dateString.split('/'); // Tách chuỗi thành các phần tử: năm, tháng, ngày
    var yearCheckIn = parseInt(parts[0]); // Chuyển đổi phần tử năm thành số nguyên
    var monthCheckIn = parseInt(parts[1]) - 1; // Chuyển đổi phần tử tháng thành số nguyên và trừ đi 1 vì index của tháng bắt đầu từ 0
    var dayCheckIn = parseInt(parts[2]); // Chuyển đổi phần tử ngày thành số nguyên

    var dateCheckIn = new Date(yearCheckIn, monthCheckIn, dayCheckIn);
    var dateString = checkOut; // Chuỗi ngày cần chuyển đổi
    var parts = dateString.split('/'); // Tách chuỗi thành các phần tử: năm, tháng, ngày
    var yearCheckOut = parseInt(parts[0]); // Chuyển đổi phần tử năm thành số nguyên
    var monthCheckOut = parseInt(parts[1]) - 1; // Chuyển đổi phần tử tháng thành số nguyên và trừ đi 1 vì index của tháng bắt đầu từ 0
    var dayCheckOut = parseInt(parts[2]); // Chuyển đổi phần tử ngày thành số nguyên
    
    var dateCheckOut = new Date(yearCheckOut, monthCheckOut, dayCheckOut); // Chuyển đổi chuỗi ngày trả vào đối tượng ngày

    //console.log(dateCheckIn >= dateCheckOut); // Kiểm tra xem đối tượng ngày đã được tạo thành công chưa
    //console.log(dateCheckOut);
    if (dateCheckIn >= dateCheckOut ){
      new Noty({
        text: 'checkin không được lớn hơn checkout',
        type: 'error',
        layout: 'topRight',
        timeout: 3000
    }).show();
    return;
    }
  
    $scope.page = page;
    
    const mapboxToken = 'pk.eyJ1IjoiZmNwaGF0bG9jIiwiYSI6ImNsd3BhbmZ6NzE0ZzgybXJ6OWkydWQ5YnYifQ.y68hz5wbABat0CPaoRsr7g';  // Token API Mapbox
  
    //console.log(checkIn)
    //console.log(checkOut)
  
  
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
var apiUrl = urlApi + '/api/hotel/getAllHotel?checkIn='+checkIn+'&checkOut='+checkOut+'&pageSize=200000000';
//console.log(apiUrl)
// Lấy dữ liệu khách sạn từ API
var hotelPromise = $http.get(apiUrl)
  .then(function (response) {
    // Lưu trữ dữ liệu từ yêu cầu API trong một biến
    var hotelData = response.data.data.content;
    //console.log(response)
    // Gán dữ liệu vào $scope.hotels
    $scope.allhotels = hotelData;

    // Trả về dữ liệu để sử dụng trong Promise tiếp theo
    $scope.totalPage = response.data.data.totalPage;
    $scope.pages = Array.from({ length: $scope.totalPage }, (v, k) => k + 1);
    //console.log(response.data.data);

    return hotelData;
  })
  .catch(function (error) {
    console.error('Lỗi khi lấy dữ liệu khách sạn:', error);
  });

// Lấy vị trí hiện tại khi trang được tải
function getCurrentPosition() {
  if (!navigator.geolocation) {
    new Noty({
      text: "Không Lấy Được Vị Trí Từ Trình Duyệt Của Bạn",
      type: 'error',
      layout: 'topRight',
      timeout: 4000,
      callbacks: {
        onClose: function () {
          window.location.href = ''; // Chuyển hướng về index.html sau khi Noty đóng
        }
      }
    }).show();
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    $scope.currentPosition = [position.coords.longitude, position.coords.latitude];
    //console.log('Current position:', $scope.currentPosition);
  }, error => {
    console.error('Geolocation error:', error);
    new Noty({
      text: "Không Lấy Được Vị Trí Từ Trình Duyệt Của Bạn",
      type: 'error',
      layout: 'topRight',
      timeout: 4000,
      callbacks: {
        onClose: function () {
          window.location.href = ''; // Chuyển hướng về index.html sau khi Noty đóng
        }
      }
    }).show();
  });
}

getCurrentPosition()

// Khi yêu cầu dữ liệu khách sạn đã hoàn thành, sử dụng dữ liệu này
Promise.all([hotelPromise])
  .then(function(dataArray) {
    var hotelData = dataArray[0];
    var sortedHotels = []; // Danh sách sẽ chứa các khách sạn đã sắp xếp theo khoảng cách tăng dần

    // Lặp qua từng khách sạn và tính khoảng cách
    var promises = $scope.allhotels.map(function(hotel) {
      return new Promise(function(resolve, reject) {
        // Sử dụng hàm geocode để chuyển đổi địa chỉ của khách sạn thành tọa độ
        geocode(hotel.address)
          .then(function(coords) {
            // Gọi hàm getDirections để lấy lộ trình và tính khoảng cách
            getDirections($scope.currentPosition, coords)
              .then(function(distance) {
                // Thêm thông tin khoảng cách vào đối tượng khách sạn
                hotel.distance = distance.toFixed(2); // Lưu khoảng cách với 2 chữ số thập phân
                sortedHotels.push(hotel); // Thêm khách sạn vào danh sách đã sắp xếp
                resolve(); // Đánh dấu promise đã hoàn thành
              })
              .catch(function(error) {
                console.error('Lỗi khi tính khoảng cách:', error);
                reject(error); // Bắn lỗi nếu có lỗi xảy ra
              });
          })
          .catch(function(error) {
            console.error('Lỗi khi chuyển đổi địa chỉ:', error);
            reject(error); // Bắn lỗi nếu có lỗi xảy ra
          });
      });
      
    });
    Promise.all(promises).then(function() {
      // Sắp xếp danh sách khách sạn theo khoảng cách tăng dần
      sortedHotels.sort(function(a, b) {
          return a.distance - b.distance;
      });
  
      // Chọn 6 khách sạn đầu tiên trong danh sách đã sắp xếp
      var nearestHotels = sortedHotels.slice(0, 6);
      
      // Sử dụng $apply để cập nhật $scope.hotels
      $scope.$apply(function() {
          $scope.hotels = nearestHotels;
      });
  });
  

        // Sử dụng dữ liệu từ cả hai promise ở đây
        $http.get(urlApi + "/api/hotel/getService?type=free").then(function (response) {
          $scope.services = response.data.data
        });
  
        // Thực hiện các thao tác khác tại đây nếu cần
      });
  
    
  
  
})
app.directive('clickUpload', function () {
  return {
    link: function (scope, element) {
      element.bind('click', function () {
        document.getElementById('fileInput').click();
      });
    }
  };
});

