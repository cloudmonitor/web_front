var myApp = angular.module('myApp', ['ngRoute']);
myApp.controller('myCtrl', function($scope) {
    $scope.loadScript = function(url, type, charset) {
        if (type === undefined) type = 'text/javascript';
        if (url) {
            var script = document.querySelector("script[src*='" + url + "']");
            // if (!script) {
            var heads = document.getElementsByTagName("head");
            if (heads && heads.length) {
                var head = heads[0];
                if (head) {
                    if (script) {
                        head.removeChild(script);
                    }
                    script = document.createElement('script');
                    script.setAttribute('src', url);
                    script.setAttribute('type', type);
                    if (charset) script.setAttribute('charset', charset);
                    head.appendChild(script);
                }
            }
            // }
            return script;
        }
    };
});
// configure our routes
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
        .when('/compute/instance-desc', {
            templateUrl: 'pages/compute/instance-desc.html',
            controller: 'instance-descCtrl'
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
        // 网络 -- 路由器详情
        .when('/net/routerDesc', {
            templateUrl: 'pages/net/router-desc.html',
            controller: 'routerDescCtrl'
        })
        // 网络 -- 浮动IP
        .when('/net/floatingIP', {
            templateUrl: 'pages/net/floatingIP.html',
            controller: 'aboutController'
        })
        // 主机监控
        .when('/monitor', {
            templateUrl: 'pages/host/monitor.html',
            controller: 'monitorCtrl'
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
        .when('/compute/instance_desc', {
            templateUrl: 'pages/compute/instance_desc.html',
            controller: 'instanceDesc'
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

// 计算 -- 概览页面js
myApp.controller('abstractCtrl', function($scope) {

    $scope.$parent.loadScript('js/lib/echarts.min.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/index.js', 'text/javascript', 'utf-8');
    $("head title").text("概览");
});
// 计算 -- 实例页面js
myApp.controller('instanceCtrl', function($scope) {

    $scope.$parent.loadScript('js/lib/moment.min.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/tool.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/instance.js', 'text/javascript', 'utf-8');
    $("head title").text("实例");
});

myApp.controller('instanceDesc', function($scope) {
    $scope.$parent.loadScript('js/lib/moment.min.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/tool.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/instance_desc.js', 'text/javascript', 'utf-8');
    $("head title").text("实例");
});


// 网络与安全 -- 拓扑
myApp.controller('topologyCtrl', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/topology/layout.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/topology/topology.js', 'text/javascript', 'utf-8');
    $("head title").text("拓扑");
});

// 网络与安全 -- 网络
myApp.controller('netCtrl', function($scope) {
    $scope.$parent.loadScript('js/lib/moment.min.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/tool.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_netInfo.js', 'text/javascript', 'utf-8');
    $("head title").text("网络");
});

// 计算 -- 网络详情
myApp.controller('netDesc', function($scope) {
    $scope.$parent.loadScript('js/net_desc.js', 'text/javascript', 'utf-8');
    $("head title").text("网络详情");
});

myApp.controller('subnetDesc', function($scope) {
    $scope.$parent.loadScript('js/net_desc_subNetDesc.js', 'text/javascript', 'utf-8');
    $("head title").text("网络");
});

myApp.controller('portnetDesc', function($scope) {
    $scope.$parent.loadScript('js/net_desc_portDesc.js', 'text/javascript', 'utf-8');
    $("head title").text("网络");
});

// 网络与安全 -- 安全组
myApp.controller('secGroupCtrl', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_SecurityGroup.js', 'text/javascript', 'utf-8');
    $("head title").text("安全组");
});
myApp.controller('secGroupDesc', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_SecurityGroup_desc.js', 'text/javascript', 'utf-8');
    $("head title").text("安全组");
});
// 网络与安全 -- 防火墙
myApp.controller('firewallCtrl', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_firewall.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/popover-firewall.js', 'text/javascript', 'utf-8');
    $("head title").text("防火墙");
});
myApp.controller('firewallDesc', function($scope) {
    $scope.$parent.loadScript('js/net_firewall_desc.js', 'text/javascript', 'utf-8');
    $("head title").text("防火墙");
});
myApp.controller('firewallstrategyDesc', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_firewall_policy_desc.js', 'text/javascript', 'utf-8');
    $("head title").text("防火墙");
});
myApp.controller('firewallruleDesc', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_firewall_rule_desc.js', 'text/javascript', 'utf-8');
    $("head title").text("防火墙");
});
myApp.controller('firewallstrategyDesc', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_firewall_policy_desc.js', 'text/javascript', 'utf-8');
    $("head title").text("防火墙");
});

// 网络与安全 -- 路由器
myApp.controller('routerCtrl', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_rounter.js', 'text/javascript', 'utf-8');
    $("head title").text("路由器");
});
// 网络与安全 -- 路由器
myApp.controller('routerDescCtrl', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_rounter_desc.js', 'text/javascript', 'utf-8');
    $("head title").text("路由器");
});

// 网络与安全 -- 浮动IP
myApp.controller('floatingIP', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_floatingIP.js', 'text/javascript', 'utf-8');
    $("head title").text("浮动IP");
});
// 网络与安全 -- 主机监控
myApp.controller('monitorCtrl', function($scope) {
    $scope.$parent.loadScript('js/lib/echarts.min.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/lib/moment.min.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/tool.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/monitor.js', 'text/javascript', 'utf-8');
    $("head title").text("主机监控");
});
// 信息 -- 基本信息
myApp.controller('base-infoCtrl', function($scope) {
    $scope.$parent.loadScript('js/user_base_info.js', 'text/javascript', 'utf-8');
    $("head title").text("基本信息");
});
// 信息 -- 账户信息
myApp.controller('account-infoCtrl', function($scope) {
    $("head title").text("账户信息");
});
