var imapConfigApp = angular.module('imapConfigApp', []);
imapConfigApp.controller('imapConfigCtrl', function($scope) {
    $scope.data = {
        host:"",
        port:"",
        user:"",
        password:"",
        configRecords:[]
    };

    $scope.setIMAP = function(id){
        document.getElementById("overlay").style.display = "block";
        let isCreate = true;
        if($scope.data.configRecords.length > 0){
            isCreate = false;
            for(let idx = 0; idx < $scope.data.configRecords.length; idx++){
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
                    "group":"IMAP",
                    "key":"host",
                    "value":$scope.data.host
                },
                {
                    "group":"IMAP",
                    "key":"port",
                    "value":$scope.data.port
                },
                {
                    "group":"IMAP",
                    "key":"user",
                    "value":$scope.data.user
                },
                {
                    "group":"IMAP",
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
            httpPostAsync("../../web/postman/api/ConfigEmail", $scope.data.configRecords, httpCallback);
        }else{
            httpPutAsync("../../web/postman/api/ConfigEmail", $scope.data.configRecords, httpCallback);
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
        httpGetAsync("../../web/postman/api/ConfigEmail?group=IMAP", {}, httpCallback);

    };

    $scope.init();
});