var myApp = angular.module('myApp', ['ngRoute']);

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

//----------------------------控制器-----------------------------------------//
// 根控制器
myApp.controller('myCtrl', myCtrl);

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

// 网络与安全 -- 浮动IP
myApp.controller('floatingIPCtrl', floatingIPCtrl);

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

// -----------------------------控制器函数实现-----------------------------------------//
function myCtrl($scope) {
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
}

function floatingIPCtrl($scope, $http) {
    $("head title").text("浮动IP");
    // 变量初始化
    $scope.item_count = 0;
    $scope.disAlloc = false;

    // 获得ip项目列表
    $scope.getIPlists = function() {
        var url = config.host + "/floatingips?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            console.info("获取floating_ips:\n%o", response.data);
            console.info("取回了数据条数", response.data.floating_ips.length);
            $scope.items = response.data.floating_ips;
            $scope.item_count = $scope.items.length;
            $scope.item_desc = ($scope.item_count > 1) ? ("items") : ("item");
            $scope.noItemNotice = ($scope.item_count) ? false : true;
        }, function(response) {
            console.error(response.statusText);
            $scope.item_count = 0;
            $scope.item_desc = "item";
            $scope.noItemNotice = true;
        });
    }();
    // 获取资源池
    $scope.getExtNet = function() {
        var url = config.host + "/floatingips/extnet?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            $scope.resLists = response.data.floating_ip_pools;
            $scope.resName = $scope.resLists[0].name;
            console.info("资源池%o", $scope.resLists);
        }, function(response) {
            console.error("资源池获取失败", response.statusText);
            $scope.resLists = [{ "name": "-" }];
        });

    }();
    // 更新进度条  -- 页面初始化,分配浮动IP成功后
    var updateProcessBar = function() {
        var MULTI = $scope.MULTI;
        var widthBase = $scope.item_count * MULTI + (($scope.item_count) ? "%" : '');
        var widthIncrease = MULTI + "%";
        console.info("widthBase:", widthBase);
        console.info("widthIncrease:", widthIncrease);
        // 设置模态框中进度条长度
        $("#widthBase").css("width", widthBase);
        $("#widthIncrease").css("width", widthIncrease);
    };
    // 请求最大可用IP数目
    $scope.getMaxTotalFloatingIps = function() {
        var url = config["host"] + "/limits?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            // 请求成功
            maxTotalFloatingIps = response.data.limits.absolute.maxTotalFloatingIps;
            console.info("最大可用配额: ", maxTotalFloatingIps);
            $scope.maxFloatingIP = maxTotalFloatingIps;
            $scope.MULTI = Math.round(100 / maxTotalFloatingIps);
            console.info("倍数:", $scope.MULTI);
            updateProcessBar();
        }, function(response) {
            // 请求失败
            console.error("IP最大可用配额请求失败", response.statusText);
            $scope.maxFloatingIP = '-';
            $("#widthBase").css("width", widthBase);
            $("#widthIncrease").css("width", widthIncrease);
        });
    }();
    // 全选按钮
    $scope.freeIP = true;
    $scope.all = false;
    $scope.chooseAll = function() {
        if ($scope.item_count) {
            $scope.itemChecked = $scope.all;
            $scope.freeIP = !$scope.all;
        }
    };
    // 表格中的checkbox
    $scope.changeState = function() {
        var checkedNum = $("tbody input[type='checkbox']:checked").length;
        console.info("勾选的条目数:", checkedNum);
        $scope.freeIP = !(checkedNum > 0);
        $scope.all = (checkedNum === $scope.item_count);
    };
    // 释放IP 模态框
    $scope.confirmDel = function() {
        $scope.ipDeletes = [];
        var ipDeletesIDs = [];
        var checkedItem = $("tbody input[type='checkbox']:checked");
        var checkedNum = checkedItem.length;
        for (var i = 0, checkedNum; i < checkedNum; i++) {
            // 获取要删除条目的ip
            $scope.ipDeletes.push($(checkedItem[i]).next().text());
            // 获取要删除条目的id
            ipDeletesIDs.push($(checkedItem[i]).next().next().text());
        }
        // 向后台请求删除IP
        $scope.deleteIPs = function() {
            var url = config.host + "/floatingips/release?token=" + window.localStorage.token;
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': "application/json",
                },
                data: JSON.stringify({ "floating_ip_ids": ipDeletesIDs })
            };
            console.info("要删除的条目id:\n%o", ipDeletesIDs);
            $http(req).then(function(response) {
                console.info("删除成功后返回的数据:%o", response.data);
                // 删除成功   返回数据{"id1":202, "id2":200}
                var delSucItems = $scope.items;
                var SUCCESS = 202;
                for (var i = 0, len = ipDeletesIDs.length; i < len; i++) {
                    var deleStat = response.data[ipDeletesIDs[i]];
                    if (deleStat === SUCCESS) {
                        // 删除成功
                        delSucItems = $.grep(delSucItems, function(obj) {
                            return obj.id != ipDeletesIDs[i];
                        });
                        console.info("未删除的条目:", delSucItems);
                    }
                }
                $scope.items = delSucItems;
                $scope.item_count = $scope.items.length;
                $("#delete-confirm").modal('hide');
            }, function(data) {
                console.error("请求失败:", data.statusText);
            });
        };
    };

    // 分配浮动IP 模态框
    $scope.allocIPModal = function() {
        if ($scope.item_count === $scope.maxFloatingIP) {
            allocIPDis = true;
        } else {
            allocIPDis = false;
        }
        // 分配浮动IP
        $scope.allocIP = function() {
            var url = config.host + "/floatingips/allocate?token=" + window.localStorage.token;
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': "application/json",
                },
                data: JSON.stringify({ "pool": $scope.resName })
            };
            console.info("提交的数据:", $scope.resName);
            $http(req).then(function(response) {
                // 请求成功
                console.info("分配成功:", response.data);
                $scope.items.push(response.data);
                $("#newIP").modal('hide');
                updateProcessBar();
            }, function(response) {
                // 请求失败
            });
        };
    }
}
