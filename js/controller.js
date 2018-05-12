var app = angular.module("main", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "/views/list.html"
    })
    .when("/insert", {
        templateUrl : "/views/insert.html"
    })
  
    .when("/edit/:id/:name/:number/:job/:address", {
        templateUrl : "/views/edit.html",
        controller : "edit_contact_controller_route"
    })
    .when("/signin", {
        templateUrl : "/views/signin.html"
    }).when("/signup", {
        templateUrl : "/views/signup.html"
    }).when("/signout", {
        templateUrl : "/views/signout.html"
    });
});
 
    app.controller('control_add_contacts',function($scope,$http,$sce){
        $scope.add = function(){
            $http.post("http://localhost:3000/add_contact",{name:$scope.name,number:$scope.number,job:$scope.job,address:$scope.address}).then(
            function mySuccess(res){
                if(res.data.error == 0)
                    $scope.error= $sce.trustAsHtml(notif("Successfully inserted","success"));
                else
                    $scope.error= $sce.trustAsHtml(notif(res.data.error_mess,"danger"));
            },function myError(res){
                $scope.error = $sce.trustAsHtml(notif(res.data,"danger"));
            });
        };
    });

    function getAllContact(http,scope){
        http.get("http://localhost:3000/get_contact").then(
        function mySuccess(res){            
            scope.records= res.data.records;
        },function myError(res){
            scope.error = res;
        });
        scope.order = function(x){
            scope.orderby = x;
        }
    }
    function isAuth(http,scope,rootScope){
        http.get("http://localhost:3000/auth").then(
            function mySuccess(res){
                if(res.data.auth == true){
                    rootScope.auth = true;
                    rootScope.username = res.data.username;
                }                
            });
    }
    app.controller('control_list_contacts',function($scope,$http,$sce,$location,$rootScope){
        getAllContact($http,$scope);
        isAuth($http,$scope,$rootScope);
        $scope.delete = function(id,index){
            $http.delete("http://localhost:3000/del_contact/"+id).then(
            function mySuccess(res){
                if(res.data.error == 0){
                    $scope.error = $sce.trustAsHtml(notif("Deleted","success"));                    
                    $scope.records.splice(index,1);
                }else{
                    $scope.error = $sce.trustAsHtml(notif(res.data.error_mess,"danger"));
                }
            },function myError(res){
                $scope.error = $sce.trustAsHtml(notif(res.data,"danger"));
            });
        };

    });
    app.controller("edit_contact_controller_route",function($scope,$routeParams){
        $scope.id       = $routeParams.id;
        $scope.name     = $routeParams.name;
        $scope.number   = $routeParams.number;
        $scope.job      = $routeParams.job;
        $scope.address  = $routeParams.address;
    });
    app.controller("control_update_contacts",function($scope,$http,$sce){
        $scope.edit = function(){
            $http.post("http://localhost:3000/upd_contact",
                {"id":$scope.id,"name":$scope.name,"number":$scope.number,"job":$scope.job,"address":$scope.address}).then(
                function mySuccess(res){
                    if(res.data.error == 0)                    
                        $scope.error = $sce.trustAsHtml(notif("Successful updated","success"));
                    else
                        $scope.error = $sce.trustAsHtml(notif(res.data.error_mess,"danger"));
                },function myError(res){
                    $scope.error = $sce.trustAsHtml(notif(res.data,"danger"));
                });
        }
    });
    app.controller("member_control_signout",function($scope,$http,$location){
        $scope.signout = function(){
            $http.delete("http://localhost:3000/signout").then(
                function mySuccess(res){
                    if(res.data.error == 0){
                        $scope.auth = "";
                    }
                },function myError(res){
                    $scope.error = res;
                });
        }
    });     
    app.controller("member_control_signup",function($scope,$http,$sce){
        $scope.signup = function(){
            $http.post("http://localhost:3000/signup",
                {"username":$scope.username,"password":$scope.password,"email":$scope.email}).then(
                function mySuccess(res){
                    if(res.data.error == 0)
                        $scope.error = $sce.trustAsHtml(notif("Successful sign up .","success"));
                    else
                        $scope.error = $sce.trustAsHtml(notif(res.data.error_mess,"danger"));
                },function myError(res){
                    $scope.error = $sce.trustAsHtml(notif(res.data,"danger"));
                });
        }
    });    
    app.controller("member_control_signin",function($scope,$http,$rootScope,$location,$sce){
        $scope.signin = function(){
            $http.post("http://localhost:3000/signin",
                {"username":$scope.username,"password":$scope.password}).then(
                function mySuccess(res){
                    
                    if(Object.keys(res.data).length == 0  ){
                        $scope.error = $sce.trustAsHtml(notif("username or password is wrong","danger"));
                    }else{
                        $scope.error = "succ";                        
                        $rootScope.auth = true;
                        $location.path("/");
                    }
                },function myError(res){
                    $scope.error = res;
                });
        }
    }); 
    app.controller("member_control_signout",function($scope,$http,$rootScope,$location,$sce){
        $rootScope.signout = function(){
            $http.delete("http://localhost:3000/signout").then(
                function mySuccess(res){
                    $scope.error = res.data;
                    $rootScope.auth = null;
                    $location.path("/");
                });
        }
    });     
    function notif(text,type){
        switch(type){
            case "danger":
                out = "<div class='alert alert-danger'>";
                break;
            case "warning":
                out = "<div class='alert alert-warning '>";
                break;
            case "success":
                out = "<div class='alert alert-success'>";
                break;                                
        }
        out += text+"</div>";    
        return out;
    }    
    angular.bootstrap(document.getElementById("list_contacts"), ['list_contacts']);
