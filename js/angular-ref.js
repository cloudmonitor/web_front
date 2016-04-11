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
        .when('/compute/instance_desc', {
            templateUrl: 'pages/compute/instance_desc.html',
            controller: 'instanceDesc'
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

myApp.controller('routerdescCtrl', function($scope) {
    $scope.$parent.loadScript('js/config.js', 'text/javascript', 'utf-8');
    $scope.$parent.loadScript('js/net_rounter_desc.js', 'text/javascript', 'utf-8');
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
    // ip 数目
    $scope.item_count = 0;
    // 分配IP按钮默认启用
    $scope.disAlloc = false;
    // 关联浮动IP按钮默认启用
    $scope.associateClick = false;
    // 确定某个value值在对象数组中的位置，返回所在的下表
    var findValueIndex = function(key, value, objArray) {
        var array = $.grep(objArray, function(obj) {
            return obj[key] === value;
        });
        var index = objArray.indexOf(array[0]);
        return index;
    };

    // 获取资源池 (立即执行)
    $scope.getExtNet = function() {
        var url = config.host + "/extnet?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            $scope.resLists = response.data.ext_net;
            console.info("资源池数据: ", response.data);
            $scope.floating_network_id = $scope.resLists[0].id;
        }, function(response) {
            console.error("资源池获取失败", response.statusText);
            createAndHideAlert({
                "message": "资源池获取失败",
                "className": "alert-danger"
            });
            $scope.resLists = [{ "name": "-" }];
        });

    }();

    // 获得ip项目列表
    $scope.getIPlists = function() {
        var url = config.host + "/floatingips?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            var len = response.data.floatingips.length;
            console.info("获取floating_ips:\n%o", response.data);
            console.info("取回了数据条数", len);
            // 将资源池的名字合并到ip列表中 
            // data 是一个对象数组
            var dataIP = response.data.floatingips;
            var dataRes = $scope.resLists;
            for (var i = 0, len; i < len; i++) {
                for (var j = 0, len2 = dataRes.length; j < len2; j++) {
                    if (dataIP[i].floating_network_id === dataRes[j].id) {
                        dataIP[i].name = dataRes[j].name;
                        break;
                    } else {
                        dataIP[i].name = '-';
                    }
                }
            }
            console.info("dataIP ", dataIP);
            // 获取端口href
            $scope.getPortsID = function() {
                var url = config.host + "/ports?token=" + window.localStorage.token;
                $http.get(url).then(function(response) {
                    var ports = response.data.ports;
                    console.info("请求可用IP:", ports);
                    len = ports.length;
                    if (len != 0) {
                        // 获取端口成功
                        for (var i = 0, len1 = dataIP.length; i < len1; i++) {
                            if (!dataIP[i].port_id) {
                                // 没有固定IP地址
                                dataIP[i].href = "";
                            } else {
                                var indexOfIP = findValueIndex("id", dataIP[i].port_id, ports);
                                dataIP[i].href = "#/compute/instance_desc?" + ports[indexOfIP].device_id;
                            }
                        }
                    } else {
                        // 获取端口失败
                        for (var i = 0, len = dataIP.length; i < len; i++) {
                            dataIP[i].href = "";
                        }
                    }
                }, function(response) {
                    // 请求失败，返回空数组
                });
            }();
            console.info("拼接href后：", dataIP);
            $scope.items = dataIP;
            $scope.item_count = dataIP.length;
            $scope.item_desc = (dataIP.length > 1) ? ("items") : ("item");
        }, function(response) {
            console.error(response.statusText);
            createAndHideAlert({
                "message": "ip列表请求失败",
                "className": "alert-danger"
            });
            $scope.item_count = 0;
            $scope.item_desc = "item";
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
        // 设置剩余IP数目
        console.info("$scope.totalIP :", $scope.totalIP);
        $scope.maxFloatingIP = $scope.totalIP - $scope.item_count;
    };
    // 请求最大可用IP数目
    $scope.totalIP = 0;
    $scope.getMaxIp = function() {
        var url = config["host"] + "/limits?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            // 请求成功
            var maxTotalFloatingIps = response.data.limits.absolute.maxTotalFloatingIps;
            console.info("最大可用配额: ", maxTotalFloatingIps);
            $scope.MULTI = Math.round(100 / maxTotalFloatingIps);
            console.info("倍数:", $scope.MULTI);
            $scope.totalIP = maxTotalFloatingIps;
            updateProcessBar();
        }, function(response) {
            // 请求失败
            console.error("IP最大可用配额请求失败", response.statusText);
            $scope.maxFloatingIP = 0;
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
    // 释放多个IP 模态框
    $scope.confirmDel = function() {
        $scope.ipDeletes = [];
        var ipDeletesIDs = [];
        var checkedItem = $("tbody input[type='checkbox']:checked");
        var checkedNum = checkedItem.length;
        for (var i = 0, checkedNum; i < checkedNum; i++) {
            var obj = checkedItem[i];
            // 获取要删除条目的ip
            $scope.ipDeletes.push($(obj).attr('ip'));
            // 获取要删除条目的id
            ipDeletesIDs.push($(obj).attr('id'));
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
                // POST 请求成功
                console.info("删除成功后返回的数据:%o", response.data);
                // 返回数据{"id1":204, "id2":200}
                var delSucItems = $scope.items;
                var SUCCESS = 204;
                for (var i = 0, len = ipDeletesIDs.length; i < len; i++) {
                    var deleStat = response.data[ipDeletesIDs[i]];
                    if (deleStat === SUCCESS) {
                        // IP删除成功
                        createAndHideAlert({
                            "message": "<strong>成功 </strong>释放的浮动IP:<br>" + $scope.ipDeletes[i],
                            "className": "alert-success"
                        });
                        delSucItems = $.grep(delSucItems, function(obj) {
                            return obj.id != ipDeletesIDs[i];
                        });
                        console.info("未删除的条目:", delSucItems);
                    } else {
                        // IP删除失败
                        createAndHideAlert({
                            "message": "<strong>失败 </strong>未释放浮动IP:<br>" + $scope.ipDeletes[i],
                            "className": "alert-danger"
                        });
                    }
                }
                $scope.items = delSucItems;
                $scope.item_count = $scope.items.length;
                $("#delete-confirm").modal('hide');
                $scope.all = false;
                $scope.freeIP = true;
                updateProcessBar();
            }, function(data) {
                // POST请求失败
                console.error("请求失败:", data.statusText);
                createAndHideAlert({
                    "message": "IP删除请求失败",
                    "className": "alert-danger"
                });
            });
        };
    };

    // 分配浮动IP 模态框
    $scope.allocIPModal = function() {
        // 如果还有可用的IP，关联按钮可以点击($scope.allocIPDis = false)
        $scope.disAlloc = ($scope.maxFloatingIP == 0) ? true : false;
        // 分配浮动IP
        $scope.allocIP = function() {
            var url = config.host + "/floatingips/allocate?token=" + window.localStorage.token;
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': "application/json",
                },
                data: JSON.stringify({
                    "floatingip": {
                        "floating_network_id": $scope.floating_network_id
                    }
                })
            };
            console.info("提交的数据:", $scope.floating_network_id);
            $http(req).then(function(response) {
                // 请求成功
                console.info("分配成功:", response.data);
                var item = response.data.floatingip;
                // 分配成功后返回一条数据，还需要整合资源池的name属性
                var indexOfExt = findValueIndex("id", item.floating_network_id, $scope.resLists);
                if (indexOfExt != (-1)) {
                    // IP分配成功
                    item.name = $scope.resLists[indexOfExt].name;
                    $scope.items.push(item);
                    $("#newIP").modal('hide');
                    createAndHideAlert({
                        "message": "<strong>成功 </strong>分配IP:<br>" + item.floating_ip_address,
                        "className": "alert-success"
                    });
                    $scope.item_count = $scope.items.length;
                    updateProcessBar();
                } else {
                    // IP分配失败
                    createAndHideAlert({
                        "message": "<strong>失败 </strong>未能成功分配IP",
                        "className": "alert-danger"
                    });
                }
            }, function(response) {
                // 请求失败
                createAndHideAlert({
                    "message": "IP分配请求失败",
                    "className": "alert-danger"
                });
            });
        };
    };

    // 关联IP 模态框
    $scope.relIPBtn = function(event) {
        var ip = $(event.target).attr('ip');
        var id　 = $(event.target).attr('id');
        console.info("当前IP: ", ip);
        $scope.curFloatingIp = ip;
        $scope.floating_ip_id = id;
        var url = config.host + "/floatingips/disassociateport?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            // 请求成功
            console.info("要关联的IP: ", response.data);
            $scope.ipItems = response.data.disassociate_port;
            console.info("要显示的IP: ", $scope.ipItems);
            if ($scope.ipItems.length === 0) {
                // 不存在待关联的IP
                $scope.associateClick = true;
            } else {
                // 存在待关联的IP
                $scope.hasFixed_ip = $scope.ipItems[0].id;
                $scope.associateClick = false;
            }
            console.info("第一选项: ", $scope.hasFixed_ip);
            var indexOfID = findValueIndex("id", $scope.hasFixed_ip, $scope.ipItems);
            if (indexOfID != (-1)) {
                var device_id = $scope.ipItems[indexOfID].device_id;
                console.info("device_id = ", device_id);
            }
            // 提交 关联
            $scope.associateBtn = function() {
                var url = config.host + "/floatingips/associate/" + id + "?token=" + window.localStorage.token;
                console.info("url ", url);
                var req = {
                    method: 'POST',
                    url: url,
                    headers: {
                        'Content-Type': "application/json",
                    },
                    data: JSON.stringify({
                        "floatingip": {
                            "port_id": $scope.hasFixed_ip
                        }
                    })
                };
                $http(req).then(function(response) {
                    // POST请求成功
                    console.info("关联成功的返回数据:\n", response.data);
                    var fixed_ip = response.data.floatingip.fixed_ip_address;
                    console.info("关联成功固定IP地址：", fixed_ip);
                    $("#associateModal").modal('hide');
                    var index = findValueIndex("floating_ip_address", ip, $scope.items);
                    if (index != (-1)) {
                        // 关联成功
                        console.info("index :", index);
                        $scope.items[index].fixed_ip_address = fixed_ip;
                        $scope.items[index].href = "#/compute/instance_desc?" + device_id;
                        createAndHideAlert({
                            "message": "<strong>成功 </strong>关联IP:<br>" + $scope.items[index].floating_ip_address,
                            "className": "alert-success"
                        });
                    } else {
                        // 关联失败
                        createAndHideAlert({
                            "message": "<strong>失败 </strong>未能关联IP",
                            "className": "alert-danger"
                        });
                    }
                }, function(response) {
                    // 关联请求失败
                    console.error("关联失败：　", response.statusText);
                    createAndHideAlert({
                        "message": "<strong>失败 </strong>关联请求失败",
                        "className": "alert-danger"
                    });
                    // $("#associateModal").modal('hide');
                });
            };
        }, function(response) {
            // 请求失败
            console.error("端口获取失败: ", response.statusText);
            createAndHideAlert({
                "message": "<strong>失败 </strong>端口获取失败",
                "className": "alert-danger"
            });
        });
    };

    // 解除关联 模态框
    $scope.disAssociateBtn = function(event) {
        var ip = $(event.target).attr('ip');
        var id = $(event.target).attr('id');
        $scope.disassociateIP = ip;
        console.info("解除关联的id: ", id);
        var url = config.host + "/floatingips/associate/" + id + "?token=" + window.localStorage.token;
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': "application/json",
            },
            data: JSON.stringify({
                "floatingip": {
                    "port_id": null
                }
            })
        };
        $scope.disAssociate = function() {
            $http(req).then(function(response) {
                // 请求成功
                console.info("请求成功: ", response.data);
                var index = findValueIndex("floating_ip_address", ip, $scope.items);
                if (index != (-1)) {
                    // 解关联成功
                    console.info("索引index: ", index);
                    $scope.items[index].fixed_ip_address = null;
                    $scope.items[index].href = ""
                    createAndHideAlert({
                        "message": "<strong>成功 </strong>成功解除IP关联:<br>" + $scope.items[index].floating_ip_address,
                        "className": "alert-success"
                    });
                    $("#disassociateModal").modal('hide');
                }
            }, function(response) {
                // 请求失败
                console.error("请求失败 ", response.statusText);
                createAndHideAlert({
                    "message": "<strong>失败 </strong>解除关联请求失败",
                    "className": "alert-danger"
                });
            });
        };

    };

    // 释放单个浮动IP -- 删除浮动IP
    $scope.freeFloatIPBtn = function(event) {
        // 阻止链接的跳转
        // event.preventDefault();
        var ip = $(event.target).attr('ip');
        var id　 = $(event.target).attr('id');
        console.info("删除IP:", ip);
        console.info("删除IP的ID: ", id);
        $scope.freeFloatingIP = ip;
        var url = config.host + "/floatingips/release?token=" + window.localStorage.token;
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': "application/json",
            },
            data: JSON.stringify({ "floating_ip_ids": new Array(id) })
        };
        console.info("request.data", { "floating_ip_ids": new Array(id) });
        $scope.deleteOneIP = function() {
            $http(req).then(function(response) {
                // 删除 请求成功
                console.info("解关联成功：　", response.data);
                var SUCCESS = 204;
                if (response.data[id] === SUCCESS) {
                    // IP释放成功
                    createAndHideAlert({
                        "message": "<strong>成功 </strong> 解除绑定IP:<br>" + ip,
                        "className": "alert-success"
                    });
                    $scope.items = $.grep($scope.items, function(obj) {
                        return obj.id != id;
                    });
                    $scope.item_count = $scope.items.length;
                } else {
                    // IP释放失败
                    console.warn("IP释放失败")
                    createAndHideAlert({
                        "message": "<strong>失败 </strong> 未能释放固定IP",
                        "className": "alert-danger"
                    });
                }
                $("#freeFloatIpModal").modal('hide');
                updateProcessBar();
            }, function(response) {
                // 删除 请求失败
                console.error("请求失败");
                createAndHideAlert({
                    "message": "<strong>失败 </strong> 删除请求失败",
                    "className": "alert-danger"
                });
            });
        };
    };
}
