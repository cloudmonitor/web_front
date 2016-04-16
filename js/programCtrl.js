// 信息 -- 项目 
var programApp = angular.module('programApp', []);
programApp.controller('programCtrl', programCtrl);

// 项目控制器函数
function programCtrl($scope, $http) {
    $("head title").text("项目");
    $(".nav-sidebar a[href='#/info/program']").css({
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
    // 初始化值
    // 条目数为0
    $scope.itemCount = 0;
    // 获取项目列表
    var getProgramList = function() {
        var url = config.host + "/tenants?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            // 请求成功
            var data = response.data.tenants;
            var len = data.length;
            console.info("返回的数据:", data);
            if (len) {
                // 项目列表非空
                $scope.programList = data;
                $scope.itemCount = len;
            } else {
                // 项目列表为空
                createAndHideAlert({
                    "message": "项目列表为空",
                    "className": "alert-warning"
                });
            }
        }, function(response) {
            // 请求失败
            console.error("项目列表请求失败:", response.statusText);
            createAndHideAlert({
                "message": "项目列表请求失败",
                "className": "alert-danger"
            });
        });
    }();

    // checkbox全选
    $scope.chooseAllBtn = function() {
        // 列表长度为零, 无需更改列表项勾选状态
        if ($scope.itemCount === 0) return;
        $scope.one = $scope.all;
    };

    // checkbox列表项
    $scope.chooseOne = function() {
        var checkedItems = $("tbody td input[type='checkbox']:checked");
        var len = checkedItems.length;
        $scope.all = (len === $sope.itemCount);
    };


}
