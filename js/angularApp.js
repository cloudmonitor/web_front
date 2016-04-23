var myApp = angular.module('myApp', ['ngRoute', 'abstractApp', 'floatingIPApp', 'keyPairApp', 'programApp', 'modifyPasswdApp']);

// 路由跳转
myApp.config(function($routeProvider) {
    $routeProvider
    // 默认加载的主页  计算--概览
        .when('/', {
            templateUrl: 'pages/compute/abstract.html',
            controller: 'abstractCtrl'
        })
        // 计算 -- 概览
        .when('/compute/abstract', {
            templateUrl: 'pages/compute/abstract.html',
            controller: 'abstractCtrl'
        })
        // 计算 -- 实例
        .when('/compute/instance', {
            templateUrl: 'pages/compute/instance.html',
            controller: 'instanceCtrl'
        })
        // 计算 -- 实例详情
        .when('/compute/instance_desc', {
            templateUrl: 'pages/compute/instance_desc.html',
            controller: 'instanceDescCtrl'
        })
        // 计算 -- 密钥对
        .when('/compute/key-pair', {
            templateUrl: 'pages/compute/key-pair.html',
            controller: 'keyPairCtrl'
        })
        // 网络 -- 拓扑
        .when('/net/topology', {
            templateUrl: 'pages/net/topology.html',
            controller: 'topologyCtrl'
        })
        // 网络 -- 网络
        .when('/net/net', {
            templateUrl: 'pages/net/net.html',
            controller: 'netCtrl'
        })
        // 网络 -- 安全组
        .when('/net/secGroup', {
            templateUrl: 'pages/net/secGroup.html',
            controller: 'secGroupCtrl'
        })
        // 网络 -- 防火墙
        .when('/net/firewall', {
            templateUrl: 'pages/net/firewall.html',
            controller: 'firewallCtrl'
        })
        // 网络 -- 路由器
        .when('/net/router', {
            templateUrl: 'pages/net/router.html',
            controller: 'routerCtrl'
        })
        .when('/net/routerDesc', {
            templateUrl: 'pages/net/router-desc.html',
            controller: 'routerdescCtrl'
        })
        // 网络 -- 浮动IP
        .when('/net/floatingIP', {
            templateUrl: 'pages/net/floatingIP.html',
            controller: 'floatingIPCtrl'
        })
        // 主机监控
        .when('/monitor', {
            templateUrl: 'pages/host/monitor.html',
            controller: 'monitorCtrl'
        })
        // 信息 -- 项目信息
        .when('/info/program', {
            templateUrl: 'pages/info/programList.html',
            controller: 'programCtrl'
        })
        // 信息 -- 修改密码
        .when('/info/modify-passwd', {
            templateUrl: 'pages/info/modify-passwd.html',
            controller: 'modifyPasswdCtrl'
        })
        // 信息 -- 基本信息
        .when('/info/base-info', {
            templateUrl: 'pages/info/base-info.html',
            controller: 'base-infoCtrl'
        })
        // 信息 -- 账户信息
        .when('/info/account-info', {
            templateUrl: 'pages/info/account-info.html',
            controller: 'account-infoCtrl'
        })
        .when('/net/net-desc', {
            templateUrl: 'pages/net/net-desc.html',
            controller: 'netDesc'
        })
        .when('/net/subnet-desc', {
            templateUrl: 'pages/net/subnet-desc.html',
            controller: 'subnetDesc'
        })
        .when('/net/port-desc', {
            templateUrl: 'pages/net/port-desc.html',
            controller: 'portnetDesc'
        })
        .when('/net/firewall-desc', {
            templateUrl: 'pages/net/firewall-desc.html',
            controller: 'firewallDesc'
        })
        .when('/net/firewall-strategy-desc', {
            templateUrl: 'pages/net/firewall-strategy-desc.html',
            controller: 'firewallstrategyDesc'
        })
        .when('/net/firewall-ruleDesc', { //----有问题1111
            templateUrl: 'pages/net/firewall-ruleDesc.html',
            controller: 'firewallruleDesc'
        })
        .when('/net/secGroup_desc', { //----有问题1111
            templateUrl: 'pages/net/secGroup_desc.html',
            controller: 'secGroupDesc'
        })
        .otherwise({
            redirectTo: '/'
        });
    // $locationProvider.html5Mode(true);
});

//----------------------------控制器-----------------------------------------//
// 根控制器
myApp.controller('myCtrl', myCtrl);

myApp.run(function($rootScope, $location, $templateCache) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if (localStorage.token == undefined) {
            localStorage.login_flag = "token";
            window.location.href = $location.absUrl().split("#")[0] + "login.html";
            return;
        }
        var expires = getTimeStr(JSON.parse(localStorage.token).expires);
        $.ajax({
            type: "OPTIONS",
            url: "/",
            complete: function(x) {
                var server_time = getTimeStr(new Object(x.getResponseHeader("Date")).expires);
                if (new Date(server_time).getTime() > new Date(expires).getTime()) {
                    localStorage.login_flag = "expires";
                    window.location.href = $location.absUrl().split("#")[0] + "login.html";
                }
            }
        })

    });
});

// 计算 -- 实例
myApp.controller('instanceCtrl', function($scope) {
    $scope.$parent.loadScript('js/lib/moment.min.js');
    $scope.$parent.loadScript('js/tool.js');
    $scope.$parent.loadScript('js/instance.js');
    $("head title").text("实例");
    $(".nav-sidebar a[href='#/compute/instance']").css({
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
});
// 计算 -- 实例详情
myApp.controller('instanceDescCtrl', function($scope) {
    $scope.$parent.loadScript('js/lib/moment.min.js');
    $scope.$parent.loadScript('js/tool.js');
    $scope.$parent.loadScript('js/instance_desc.js');
    $("head title").text("实例");
    $(".nav-sidebar a[href='#/compute/instance']").css({
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
});

// 网络与安全 -- 拓扑
myApp.controller('topologyCtrl', function($scope) {

    $scope.$parent.loadScript('js/tool.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/topology/layout.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/topology/topology.js', 'text/javascript', 'utf-8');
    $("head title").text("拓扑");
    $(".nav-sidebar a[href='#/net/topology']").css({
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
});

// 网络与安全 -- 网络
myApp.controller('netCtrl', function($scope) {
    $scope.$parent.loadScript('js/lib/moment.min.js');
    $scope.$parent.loadScript('js/tool.js');
    $scope.$parent.loadScript('js/net_netInfo.js');
    $("head title").text("网络");
    $(".nav-sidebar a[href='#/net/net']").css({
        "color": "#fff",
        "background-color": "#428bca"
    });
});
// 计算 -- 网络详情
myApp.controller('netDesc', function($scope) {
    $scope.$parent.loadScript('js/net_desc.js');
    $("head title").text("网络");
    $(".nav-sidebar a[href='#/net/net']").css({
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
});

// 网络与安全 -- 子网详情
myApp.controller('subnetDesc', function($scope) {
    $scope.$parent.loadScript('js/net_desc_subNetDesc.js');
    $("head title").text("网络");
    $(".nav-sidebar a[href='#/net/net']").css({
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
});
// 网络与安全 -- 端口详情
myApp.controller('portnetDesc', function($scope) {
    $scope.$parent.loadScript('js/net_desc_portDesc.js');
    $("head title").text("网络");
    $(".nav-sidebar a[href='#/net/net']").css({
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
});

// 网络与安全 -- 安全组
myApp.controller('secGroupCtrl', function($scope) {
    $scope.$parent.loadScript('js/config.js');
    $scope.$parent.loadScript('js/net_SecurityGroup.js');
    $("head title").text("安全组");
    $(".nav-sidebar a[href='#/net/secGroup']").css({
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
});
// 网络与安全 -- 安全组详情
myApp.controller('secGroupDesc', function($scope) {
    $scope.$parent.loadScript('js/net_SecurityGroup_desc.js');
    $("head title").text("安全组");
    $(".nav-sidebar a[href='#/net/secGroup']").css({
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
});

// 网络与安全 -- 防火墙
myApp.controller('firewallCtrl', function($scope) {
    $scope.$parent.loadScript('js/net_firewall.js');
    $scope.$parent.loadScript('js/popover-firewall.js');
    $("head title").text("防火墙");
    $(".nav-sidebar a[href='#/net/firewall']").css({
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
});
// 网络与安全 -- 防火墙详情
myApp.controller('firewallDesc', function($scope) {
    $scope.$parent.loadScript('js/net_firewall_desc.js');
    $("head title").text("防火墙");
    $(".nav-sidebar a[href='#/net/firewall']").css({
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
});
// 网络与安全 -- 防火墙策略详情
myApp.controller('firewallstrategyDesc', function($scope) {
    $scope.$parent.loadScript('js/net_firewall_policy_desc.js');
    $("head title").text("防火墙");
    $(".nav-sidebar a[href='#/net/firewall']").css({
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
});
// 网络与安全 -- 防火墙规则详情
myApp.controller('firewallruleDesc', function($scope) {
    $scope.$parent.loadScript('js/net_firewall_rule_desc.js');
    $("head title").text("防火墙");
    $(".nav-sidebar a[href='#/net/firewall']").css({
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
});


// 网络与安全 -- 路由器
myApp.controller('routerCtrl', function($scope) {
    $scope.$parent.loadScript('js/net_rounter.js');
    $("head title").text("路由器");
    $(".nav-sidebar a[href='#/net/router']").css({
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
});
// 网络与安全 -- 路由器详情
myApp.controller('routerdescCtrl', function($scope) {
    $scope.$parent.loadScript('js/net_rounter_desc.js');
    $("head title").text("路由器");
    $(".nav-sidebar a[href='#/net/router']").css({
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
});

// 网络与安全 -- 主机监控
myApp.controller('monitorCtrl', function($scope) {
    $scope.$parent.loadScript('js/lib/echarts.min.js');
    $scope.$parent.loadScript('js/lib/moment.min.js');
    $scope.$parent.loadScript('js/tool.js');
    $scope.$parent.loadScript('js/monitor.js');
    $("head title").text("主机监控");
    $(".nav-sidebar a[href='#/monitor']").css({
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
});

// 信息 -- 基本信息
myApp.controller('base-infoCtrl', function($scope) {
    $scope.$parent.loadScript('js/user_base_info.js');
    $("head title").text("基本信息");
    $(".nav-sidebar a[href='#/info/base-info']").css({
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
});
// 信息 -- 账户信息
myApp.controller('account-infoCtrl', function($scope) {
    $("head title").text("账户信息");
    $(".nav-sidebar a[href='#/info/account-info']").css({
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
});




// -----------------------------控制器函数实现-----------------------------------------//
function myCtrl($scope) {
    $scope.loadScript = function(url, type, charset) {
        if (type === undefined) type = 'text/javascript';
        if (url) {
            var script = document.querySelector("script[src*='" + url + "']");
            // if (!script) {
            var body = document.getElementsByTagName("body");
            if (body && body.length) {
                var body = body[0];
                if (body) {
                    if (script) {
                        body.removeChild(script);
                    }
                    script = document.createElement('script');
                    script.setAttribute('src', url);
                    script.setAttribute('type', type);
                    if (charset) script.setAttribute('charset', charset);
                    body.appendChild(script);
                }
            }
            // }
            return script;
        }
    };
}
