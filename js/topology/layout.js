var jsonStr = '';
var tree;
var centerTabs;
var topology = null;
$(function() {
    topology = new Kinetic.Topology({
        container: "container",
        // 		// width: $("#mainArea").width()-$("#toolbar").width()-5,
        // 		// height: $("#mainArea").height()-5,
        // 		// width: $("#centerTabs").width(),
        // height: $("#centerTabs").height(),
        width: $("#centerTabs").width() - 10,
        height: 740,
        backgroundImage: "", //./icon/background.png",
        connectorImage: "./icon/2.png",
        toolbar: {
            container: 'toolbar',
            data: [
                { id: 'router', name: 'ROUTER', image: './icon/device/router.png', width: '85%', height: '85%' },
                { id: 'server', name: 'server', image: './icon/device/server.png', width: '85%', height: '85%' },
                { id: 'network', name: 'network', image: './icon/device/network.png', width: '85%', height: '85%' },
                { id: 'subnet', name: 'subnet', image: './icon/device/subnet.png', width: '85%', height: '85%' }
            ]
        }
    });

    //loadJson();
    displayExperienceName();
    $('#menuBtn1').bind('click', saveJson);
    $('#menuBtn2').bind('click', loadJson);
    $('#menuBtn3').bind('click', deleteAll);
    $('#menuBtn4').bind('click', help);
    $('#menuBtn5').bind('click', ajaxRequest);
    $('#menuBtn6').linkbutton('disable');
    $('#logout').bind('click', logout);
    // $('#expTopoList').bind('change',expTopoListChange);
    // expTopoListChange();
    //	 window.onbeforeunload = function(){
    //	 	return "本页面要求您确认您要离开 - 您的实验数据可能不会被保存。"
    //	 };
    window.onbeforeunload = endExp;


});
//拓扑示例，根据id变换拓扑图
function expTopoListChange(data) {
    jsonStr = data;
    loadJson();
}


function saveJson() {
    jsonStr = topology.toJson();
    $.messager.alert("操作提示", "保存成功！", "info");
    var options = {
        title: "保存的数据",
        msg: jsonStr,
        showType: 'slide',
        timeout: 5000,
        width: 500,
        height: 400
    };
    $.messager.show(options);
}
//loadJson();
function loadJson() {
    //jsonStr = '{"devices":[{"id":"5cb4c811-36de-4dd1-bf0e-e364db4ebc6e","name":"ubuntu12-03","src":"./icon/device/extnet.png","x":"100","y":"240","width":"96","height":"73"},{"id":"e031bf9f-f232-4331-8e37-79b4f1cfc1e7","name":"project01-router01","src":"./icon/device/Router_Icon.png","x":"480","y":"125","width":"78","height":"49"},{"id":"20f23a71-badc-43be-8f96-5422f2c9dc2c","name":"project01-net02","src":"./icon/device/Application_Icon.png","x":"669","y":"236","width":"62","height":"73"}],"lines":[{"srcDeviceId":"20f23a71-badc-43be-8f96-5422f2c9dc2c","dstDeviceId":"5cb4c811-36de-4dd1-bf0e-e364db4ebc6e","stroke":"black","strokeWidth":1},{"srcDeviceId":"20f23a71-badc-43be-8f96-5422f2c9dc2c","dstDeviceId":"e031bf9f-f232-4331-8e37-79b4f1cfc1e7","stroke":"black","strokeWidth":1}]}';
    topology.load(jsonStr);
}

function deleteAll() {
    var jsonStrDel = '{"devices":[],"lines":[]}';
    topology.load(jsonStrDel);
}

function help() {}

function deleteDevice() {
    topology.deleteCurrentObject();
}

//提交实验
function ajaxRequest() {
    var inputJsonData = topology.toJson();
    var ajaxOptions = new AJAXOptions();
    var experimentname = $('#expTopoList option:selected').val();
    ajaxOptions.data = {
        "dictData": inputJsonData,
        "requestType": "submit",
        "experimentname": experimentname
    };
    ajaxOptions.beforeSend = function() {
        $.messager.progress({
            text: '正在分配资源',
        });
        $.messager.progress('bar').addClass('pro');
    };
    ajaxOptions.complete = function() {
        //AJAX请求完成时隐藏loading提示  
        $.messager.progress('close');
    };
    ajaxOptions.success = success;
    $.ajax(ajaxOptions);
}

//结束实验，释放资源
function endExp() {
    var inputJsonData = '';
    var ajaxOptions = new AJAXOptions();
    ajaxOptions.data = {
        "dictData": inputJsonData
    };
    ajaxOptions.url = '../ajax/Topo_releaseTopo';
    ajaxOptions.async = false;
    ajaxOptions.beforeSend = function() {
        $.messager.progress({
            text: '正在释放资源'
        });
        $.messager.progress('bar').addClass('pro');
    };
    ajaxOptions.complete = function() {
        //AJAX请求完成时隐藏loading提示  
        $.messager.progress('close');
    };
    ajaxOptions.success = endExpSuccess;

    //	ajaxOptions.error=console.log(ajaxOptions);
    $.ajax(ajaxOptions);
}

function success(data) {
    device2Url = data;
    json = JSON.parse(JSON.stringify(device2Url));
    var result = json["result"];
    var requestSize = json["requestSize"];

    if (result == 'notLogin') {
        createAndHideAlert("未登录，请先登录！");
        window.location.href = 'login.html';
    } else if (result == 'insufficient') {
        createAndHideAlert("操作提示", "请求资源不足，请稍后再试！", "info");
    } else if (result == 'reSubmit') {
        $.messager.alert("操作提示", "您已提交过实验，无需重复提交", "info");
    } else if (result == 'confirm') {
        var requestSec = requestSize * 10;
        var requestMin = 0;
        while (requestSec >= 60) {
            requestSec = requestSec - 60;
            requestMin++;
        }
        if (requestMin == 0 && requestSec) {
            var infoMsg = "前面有" + requestSize + "人在排队，大概需要等待" + requestSec + "秒，您确定要继续提交么？"
        } else if (requestSec == 0 && requestMin) {
            var infoMsg = "前面有" + requestSize + "人在排队，大概需要等待" + requestMin + "分，您确定要继续提交么？"
        } else {
            var infoMsg = "前面有" + requestSize + "人在排队，大概需要等待" + requestMin + "分" + requestSec + "秒，您确定要继续提交么？"
        }
        $.messager.confirm("操作提示", infoMsg, function(data) {
            if (data) {
                var inputJsonData = topology.toJson();
                var ajaxOptions = new AJAXOptions();
                ajaxOptions.data = {
                    "dictData": inputJsonData,
                    "requestType": "confirmSubmit"
                };
                ajaxOptions.beforeSend = function() {
                    $.messager.progress({
                        text: '正在分配资源',
                    });
                    $.messager.progress('bar').addClass('pro');
                };
                ajaxOptions.complete = function() {
                    $.messager.progress('close');
                };
                ajaxOptions.success = success;
                $.ajax(ajaxOptions);
            }
        });
    } else if (result == 'success') {
        $('#menuBtn5').linkbutton('disable');
        $('#menuBtn5').unbind('click', ajaxRequest);
        $('#menuBtn6').linkbutton('enable');
        $('#menuBtn6').bind('click', endExp);
        $.messager.show({
            title: '友情提示',
            msg: '资源分配成功!',
            timeout: 3000,
            showType: 'slide'
        });
    }
}

function endExpSuccess(data) {
    device2Url = '';
    json = JSON.parse(JSON.stringify(data));
    var result = json["result"];
    if (result != 'success') {
        if (result == 'notLogin') {
            createAndHideAlert("未登录，请先登录！");
            window.location.href = 'login.html';
        }
        return;
    }
    $('#menuBtn5').linkbutton('enable');
    $('#menuBtn5').bind('click', ajaxRequest);
    $('#menuBtn6').linkbutton('disable');
    $('#menuBtn6').unbind('click', endExp);
    $.messager.show({
        title: '友情提示',
        msg: '资源释放成功!',
        timeout: 3000,
        showType: 'slide'
    });
}
//实验指导书， html都在/webroot/home路径
function displayExperienceName() {
    var data = [{
        "text": '操作配置类实验',
        "children": [{
            "text": '配置路由器实验',
            "attributes": {
                "url": "oproute.html"
            }
        }, {
            "text": '常用网络命令实验',
            "attributes": {
                "url": "opcmd.html"
            }
        }, {
            "text": '配置二层交换机实验',
            "attributes": {
                "url": "openswitch.html"
            }
        }, {
            "text": '配置http服务器实验',
            "attributes": {
                "url": "openhttp.html"
            }
        }, {
            "text": 'web查看路由信息实验',
            "attributes": {
                "url": "opwebroute.html"
            }
        }]
    }, {
        "text": '数据链路层实验',
        /*			"children": [{
        				"text": 'tcp/udp实验',
        				"attributes":{   
         	            "url":"tcpUdp.html" 
        		        }
        			}]  */
        "children": [{
            "text": '以太网帧分析实验',
            "attributes": {
                "url": "ethernet.html"
            }
        }]
    }, {
        "text": '网络层实验',
        /*		"children": [{
				"text": 'RIP实验',
				"attributes":{   
		            "url":"netRip.html" 
		        }
			},{
				"text": 'OSPF实验',
				"attributes":{   
		            "url":"netOspf.html" 
		        }
			}] */
        "children": [{
            "text": 'IP/ICMP实验',
            "attributes": {
                "url": "ipicmp.html"
            }
        }, {
            "text": 'ARP实验',
            "attributes": {
                "url": "arp.html"
            }
        }, {
            "text": '路由表学习实验',
            "attributes": {
                "url": "routeTable.html"
            }
        }, {
            "text": '静态路由实验',
            "attributes": {
                "url": "staticroute.html"
            }
        }, {
            "text": 'RIP实验',
            "attributes": {
                "url": "netRip.html"
            }
        }, {
            "text": 'OSPF实验',
            "attributes": {
                "url": "netOspf.html"
            }
        }]
    }, {
        "text": '传输层实验',
        /*			"children": [{
        				"text": 'tcp/udp实验',
        				"attributes":{   
         	            "url":"tcpUdp.html" 
        		        }
        			}]  */
        "children": [{
            "text": 'NAT虚拟服务器实验',
            "attributes": {
                "url": "natservice.html"
            }
        }, {
            "text": 'Tcp协议分析实验',
            "attributes": {
                "url": "tcpUdp.html"
            }
        }]
    }, {
        "text": '应用层实验',
        "children": [{
            "text": 'HTTP实验',
            "attributes": {
                "url": "http.html"
            }
        }, {
            "text": 'FTP实验',
            "attributes": {
                "url": "ftp.html"
            }
        }]
    }];

    //实验指导书移位
    tree = $('#experienceName').tree({
        data: data,
        lines: true,
        onClick: function(node) {
            addExperienceBook(node);
        }
    });
}

function addExperienceBook(node) {
    exBook = $('#experienceBook');

    divInner = '<iframe src="' + node.attributes.url + '" frameborder="0" style="border:0;padding:0px;margin:0px;width:98%;height:670px;"></iframe>';
    exBook.html(divInner);

}

function addTab(node) {
    centerTabs = $('#centerTabs');
    if (centerTabs.tabs('exists', node.text)) {
        centerTabs.tabs('select', node.text)
    } else {
        if (node.attributes && node.attributes.url && node.attributes.url.length > 0) {
            centerTabs.tabs('add', {
                title: node.text,
                closable: true,
                fit: true,
                content: '<iframe src="' + node.attributes.url + '" frameborder="0" style="border:0;padding:0px;margin:0px;width:100%;height:480px;"></iframe>'
            });
        } else {
            if (node.state == 'open') {
                $('#experienceName').tree('collapse', node.target);
            } else {
                $('#experienceName').tree('expand', node.target);
            }
        }
    }
}

function logout() {
    window.location.href = 'logout.jsp';
}
