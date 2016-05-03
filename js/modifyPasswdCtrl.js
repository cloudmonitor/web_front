var modifyPasswdApp = angular.module('modifyPasswdApp', []);

modifyPasswdApp.controller('modifyPasswdCtrl', ['$scope', '$http', function($scope, $http) {
    $("#curr_userName").html(JSON.parse(window.localStorage.user).username);
    $(".curr_deviceName").html(localStorage.curr_tenant);
    $("head title").text("修改密码");
    $(".nav-sidebar a[href='#/info/modify-passwd']").css({
        "color": "#fff",
        "background-color": "#428bca"
    });
    var linkEle = $(".nav-sidebar li a");
    linkEle.click(function() {
        linkEle.css({
            "color": "#337ab7",
            "background-color": "transparent"
        });
    });

    $scope.showPasswd = function() {
        var isShow = $scope.checkPasswd;
        console.info("显示密码:", isShow);
        if (isShow) {
            // 显示密码
            $("input[type='password']").attr("type", "text");
        } else {
            $("input[type='text']").attr("type", "password");
        }
    };

    $scope.submitted = false;
    // 密码表单验证
    $scope.submitForm = function() {
        $scope.submitted = true;
        $scope.corPasswd = window.localStorage.password;
        var corPasswd = $scope.corPasswd;
        var curPasswd = $scope.curPasswd;
        var newPasswd = $scope.newPasswd;
        var confirmPasswd = $scope.confirmPasswd;

        console.info("正确密码:", corPasswd);
        console.info("当前密码:", curPasswd);
        console.info("新密码:", newPasswd);
        console.info("确认密码:", confirmPasswd);

        // 表单输入有误
        if ($scope.form.$invalid) return;

        // 当前密码输入有误
        if (curPasswd != corPasswd) return;

        // 两次密码输入不一致
        if (confirmPasswd != newPasswd) return;

        // 新密码与原密码相同
        if (newPasswd === curPasswd) return;

        // 修改密码POST请求
        var postModPasswd = function() {
            var user = JSON.parse(window.localStorage.user);
            var url = config.host + "/user/update/" + user.id + "?token=" + window.localStorage.token;
            console.info("user = ", user);

            // 请求的数据
            var data = {
                "user": {
                    "username": user.username,
                    "enabled": true,
                    "email": null,
                    "password": confirmPasswd
                }
            }
            console.info("请求数据data", data);

            // 请求的格式
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': "application/json",
                },
                data: JSON.stringify(data)
            };
            $http(req).then(
                function(response) {
                    // 请求成功
                    var data = response.data;
                    console.info("返回的信息:", data);
                    if (data.error) {
                        createAndHideAlert({
                            "message": "密码修改失败",
                            "className": "alert-warning"
                        });
                        return;
                    }
                    window.localStorage.password = confirmPasswd;
                    createAndHideAlert({
                        "message": "密码修改成功",
                        "className": "alert-success"
                    });
                },
                function(response) {
                    console.error("请求失败:", response.statusText);
                    createAndHideAlert({
                        "message": "密码修改请求失败",
                        "className": "alert-danger"
                    });
                }
            );
        }();

    };
}])
