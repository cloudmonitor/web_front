// 计算 -- 概览页面js
var abstractApp = angular.module('abstractApp', []);
abstractApp.controller('abstractCtrl', function($scope, $http) {
    $scope.$parent.loadScript('js/lib/echarts.min.js');
    $scope.$parent.loadScript('js/config.js');
    $scope.$parent.loadScript('js/index.js');
    $("head title").text("概览");
    $(".nav-sidebar a[href='#/compute/abstract']").css({
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

    // 获取资源配额
    var getResList = function() {
        // 资源名称
        var nameHybid = {
            "nameUS": ["subnet", "network", "floatingip", "ram", "security_group_rule", "instances", "cores", "security_group", "router", "port"],
            "nameZH": ["子网", "网络", "浮动IP", "内存", "安全组规则", "实例数", "虚拟内核", "安全组", "路由", "端口"]
        };
        console.info("名字对象", nameHybid);

        var userID = JSON.parse(localStorage.token).tenant.id;
        console.info("用户ID:", userID);
        // var url = config.host + "/tenant_quota?token=" + window.localStorage.token;
        var url = config.host + "/tenant_used_quota?token=" + window.localStorage.token;
        // var url = "abstract.txt";
        // 请求资源总额
        var resTotal = {};
        var resUsed = {};
        $http.get(url).then(
            function(response) {
                // 请求成功
                var data = response.data;
                resTotal = data.total;
                resUsed = data.used;
                console.info("资源总额:", resTotal);
                console.info("资源使用:", resUsed);
                var resQuota = [];
                for (var i = 0, len = nameHybid.nameZH.length; i < len; i++) {
                    var ele = [];
                    var name = nameHybid.nameUS[i];
                    // 存放名称
                    ele[0] = nameHybid.nameZH[i];
                    // 存放已使用
                    ele[1] = resUsed[name];
                    // 存放总的数额
                    ele[2] = resTotal[name];
                    // 存放百分比
                    ele[3] = ((ele[2] != 0) ? (Math.round(ele[1] / ele[2] * 100) + "%") : 0);
                    resQuota.push(ele);
                }
                console.info("资源配额:", resQuota);
                $scope.resList = resQuota;
            },
            function(response) {
                // 请求失败
                console.error("资源总额请求失败");
                $scope.resList = [];
            }
        );



    }();
});
