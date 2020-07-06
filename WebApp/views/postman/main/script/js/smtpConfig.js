var smtpConfigApp = angular.module('smtpConfigApp', []);
smtpConfigApp.controller('smtpConfigCtrl', function($scope) {
    $scope.data = {
        host:"",
        port:"",
        user:"",
        password:"",
        configRecords:[]
    };

    $scope.setSMTP = function(id){
        document.getElementById("overlay").style.display = "block";
        let isCreate = true;
        if($scope.data.configRecords.length > 0){
            isCreate = false;
            for(let idx = 0; idx < $scope.data.configRecords.length; idx++){
                //let rsConfig = $scope.data.configRecords[idx];
                if($scope.data.configRecords[idx].key === 'host'){
                    $scope.data.configRecords[idx].value = $scope.data.host;
                }
                if($scope.data.configRecords[idx].key === 'port'){
                    $scope.data.configRecords[idx].value = $scope.data.port;
                }
                if($scope.data.configRecords[idx].key === 'user'){
                    $scope.data.configRecords[idx].value = $scope.data.user;
                }
                if($scope.data.configRecords[idx].key === 'password'){
                    $scope.data.configRecords[idx].value = $scope.data.password;
                }
            }
        }else{
            $scope.data.configRecords = [
                {
                    "group":"SMTP",
                    "key":"host",
                    "value":$scope.data.host
                },
                {
                    "group":"SMTP",
                    "key":"port",
                    "value":$scope.data.port
                },
                {
                    "group":"SMTP",
                    "key":"user",
                    "value":$scope.data.user
                },
                {
                    "group":"SMTP",
                    "key":"password",
                    "value":$scope.data.password
                }
            ];
        }

        let httpCallback = function(response){
            $scope.$apply(function(){
                $scope.init();
            });
        }
        
        if(isCreate){
            httpPostAsync("../../web/postman/api/ConfigEmailIMAP", $scope.data.configRecords, httpCallback);
        }else{
            httpPutAsync("../../web/postman/api/ConfigEmailIMAP", $scope.data.configRecords, httpCallback);
        }

    }

    $scope.init = function(){
        document.getElementById("overlay").style.display = "block";

        let httpCallback = function(response){
            let res = JSON.parse(response);

            $scope.$apply(function(){
                
                $scope.data.configRecords = res;
                for(let idx = 0; idx < res.length; idx++){
                    let rsConfig = res[idx];
                    if(rsConfig.key === 'host'){
                        $scope.data.host = rsConfig.value;
                    }
                    if(rsConfig.key === 'port'){
                        $scope.data.port = rsConfig.value;
                    }
                    if(rsConfig.key === 'user'){
                        $scope.data.user = rsConfig.value;
                    }
                    if(rsConfig.key === 'password'){
                        $scope.data.password = rsConfig.value;
                    }
                }

                document.getElementById("overlay").style.display = "none";
            });
        };
        httpGetAsync("../../web/postman/api/ConfigEmail?group=SMTP", {}, httpCallback);

    };

    $scope.init();
});