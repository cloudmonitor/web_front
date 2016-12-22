// 信息 -- 项目 
var programApp = angular.module('programApp', []);
programApp.controller('programCtrl', programCtrl);

// 项目控制器函数
function programCtrl($scope, $http, $route) {
    $("#curr_userName").html(JSON.parse(window.localStorage.user).username);
    $(".curr_deviceName").html(localStorage.curr_tenant);
    $("#lagout").unbind('click').click(function() {
        //alert(123);
        $('#myModal').modal('toggle')
        window.localStorage.clear();
        location.href = "#/";
        location.reload();
    });
    $scope.refresh = function() {
        $route.reload();
    }
    $("head title").text("项目");
    $(".nav-sidebar a[href='#/info/program']").css({
        "color": "#fff",
        "background-color": "#428bca"
    }).click(function() {
        $(".nav-sidebar a[href='#/info/program']").css({
            "color": "#fff",
            "background-color": "#428bca"
        })
    });
    var linkEle = $(".nav-sidebar li a[href!='#/info/program']");
    linkEle.click(function() {
        $(".nav-sidebar li a").css({
            "color": "#337ab7",
            "background-color": "transparent"
        });
    });
    // 初始化值
    $scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse = false; // set the default sort order
    $scope.searchFish = ''; // set the default search/filter term
    // 条目数为0
    $scope.itemCount = 0;

    // 获取项目列表
    var getProgramList = function() {
        var url = config.host + "/tenants?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            // 请求成功
            var data = response.data.tenants;
            console.info("返回的数据:", data);
            if (data === undefined) {
                // 项目列表为空
                createAndHideAlert({
                    "message": "项目列表为空",
                    "className": "alert-warning"
                });
                return;
            }
            // 项目列表非空
            $scope.programList = data;
            $scope.itemCount = data.length;
        }, function(response) {
            // 请求失败
            console.error("项目列表请求失败:", response.statusText);
            createAndHideAlert({
                "message": "项目列表请求失败",
                "className": "alert-danger"
            });
        });
    }();


    // 从localStorage中获取token值
    var projectName = function() {
        var token = JSON.parse(window.localStorage.token);
        var projectName = token.tenant.name;
        console.info("projectName = ", projectName);
        return projectName;
    };
    $scope.projectName = projectName();

    // 设置当前项目
    $scope.setProject = function(event) {
        var curProjectname = event.target.name;
        console.info("当前对象", curProjectname);
        var url = config.host + "/tenant/login?token=" + window.localStorage.token + "&tenantname=" + curProjectname;
        $http.get(url).then(
            function(response) {
                // get请求成功
                var data = response.data;
                if (data.error) {
                    // 设置当前失败
                    createAndHideAlert({
                        "message": "当前项目设置失败",
                        "className": "alert-danger"
                    });
                    return;
                }
                var token = JSON.stringify(data.access.token);
                console.info("旧的token:", window.localStorage.token);
                window.localStorage.token = token;
                console.info("新的token:", window.localStorage.token);
                $scope.projectName = curProjectname;
                createAndHideAlert({
                    "message": "成功切换到项目 " + "<strong>" + curProjectname + "</strong>",
                    "className": "alert-success"
                });
                // 设置顶部导航栏的项目名称
                $(".curr_deviceName").text(curProjectname);
            },
            function(response) {
                // get请求失败
                console.error("修改项目请求失败");
                createAndHideAlert({
                    "message": "修改项目请求失败",
                    "className": "alert-danger"
                });
            }
        );
    };

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
        console.info("已选项目长度:", len);
        $scope.all = (len === $scope.itemCount);
    };


}
