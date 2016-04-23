$('#frame11').onload = function() {
    $('body').onkeydown = function() {
        $('#frame11').focus();
    };
};

//var device2Url = '{"result":"success","router_32D798BF-BE45-4EA3-8692-E0C443459838":"ROUTER033","printServer_AAA2BC72-D3C0-485C-AEE6-73606D676401":"ApplicationServer039"}';
var device2Url = '';
var debugMode = true;
var lines;
Kinetic.Topology = Kinetic.Class.extend({
    config: null,
    stage: null,
    layer: null,
    messageLayer: null,
    debugMode: false,
    toolbar: null,
    backGround: null,
    connector: null,
    devices: null, //设备列表
    lines: null, //连接线列表,
    loading: null,
    popmenu: null,
    currentObject: null,
    init: function(config) {
        this.config = config;
        this.devices = new Array();
        this.lines = new Array();
        this.toolbar = new Kinetic.Topology.Toolbar({
            toolbar: this.config.toolbar
        });
        // this.popmenu=new Kinetic.Topology.PopMenu({
        //  topology:this,
        //  popmenu:this.config.popmenu
        // });

        this.stage = new Kinetic.Stage({
            container: config.container,
            width: config.width,
            height: config.height
        });
        this.layer = new Kinetic.Layer();
        this.stage.add(this.layer);
        this.messageLayer = new Kinetic.Layer();
        this.stage.add(this.messageLayer);
        this.backGround = new Kinetic.Topology.Background({
            topology: this,
            backgroundImage: this.config.backgroundImage
        });
        $('#' + config.container).get(0).topology = this;
        $('#' + config.container).droppable({ //定义绘图区的事件
            onDragEnter: function() {
                $(this).addClass('over');
            },
            onDragLeave: function() {
                $(this).removeClass('over');
            },
            onDrop: function(e, source) {
                var that = this;
                var position = $("#" + $(source).attr("id") + "_proxy").position();
                $(this).removeClass('over');
                var img = $("img", $(source));
                var device = new Kinetic.Topology.Device({
                    topology: this.topology,
                    data: {
                        id: img.attr("id") + "_" + sequence.nextVal(),
                        name: img.attr("title"),
                        src: img.attr("src"),
                        //x:this.topology.getStage().getWidth()/2,y:this.topology.getStage().getHeight() / 2,width:'auto',height:'auto'}
                        x: position.left - $("#" + this.topology.config.toolbar.container).width(),
                        y: position.top,
                        width: '70px',
                        height: '70px'
                    }
                });
                var drawType = img.attr("title");
                if (drawType == "ROUTER") {
                    $(".createRouter_cancel").click(function() {
                        //  topology.deleteCurrentObject();
                    });
                    //-----------------------------------------------------创建路由start
                    //-----------------模态start
                    $(".button_modelShow").click();
                    $(".create_router_name").val("");
                    $(".outNet_selected").empty();
                    $(".outNet_selected").append('<option value="test" selected>选择网络</option>');
                    getExtNetInfo();
                    //-------------模态end
                    //-------------提交数据start
                    $(".createRouter_OK").click(function() {
                        //--------------提交前对数据的处理
                        var name = $(".create_router_name").val();
                        var status = $(".create_router_status").val();
                        var outNet = $(".outNet_selected").val();
                        if (name == "" || name == "undefined" || name == null) {
                            createAndHideAlert("名称为必填项！");
                            return;
                        }
                        if (status == "true")
                            status = true;
                        else
                            status = false;
                        if (outNet == "test")
                            outNet = null;
                        var router_create = {
                            "router": {
                                "name": "another_router",
                                "external_gateway_info": {
                                    "network_id": "8ca37218-28ff-41cb-9b10-039601ea7e6b"
                                },
                                "admin_state_up": true
                            }
                        };
                        var router = router_create['router'];
                        router.name = name;
                        router.admin_state_up = status;
                        if (outNet != null) {
                            router['external_gateway_info']['network_id'] = outNet
                        } else {
                            router['external_gateway_info'] = null;
                        }
                        //--------------数据的提交
                        console.error(JSON.stringify(router_create));
                        $.ajax({
                            type: "POST",
                            data: JSON.stringify(router_create),
                            contentType: "application/json",
                            url: config["host"] + "/router/create" + "?token=" + window.localStorage.token,
                            success: function(data) {
                                that.topology.addDevice(device);
                                window.location.reload();
                            }
                        });
                    });
                    //-------------提交数据end               
                } else if (drawType == "server") {
                    //--------启动云主机预备工作
                    setInstanceReadyInfo();
                    $(".start_cloudmonitor").click();
                } else if (drawType == "network") {
                    create_networkFun();
                    $(".create_net").click();
                } else {
                    create_subnetFun();
                    $(".add_subnetInfo").click();
                }
            }
        });
        this.connector = new Kinetic.Topology.Device.Connector({
            topology: this,
            src: this.config.connectorImage
        });
        this.loading = false;
        this.layer.on("mouseup", function(e) {

        });
    },
    containLine: function(srcDevice, dstDevice) {
        /*        console.log("_____________________containLine");
                console.log(this);*/
        var line = this.stage.get("#" + srcDevice.getId() + "_" + dstDevice.getId());
        if (line.length > 0) {
            return true;
        }
        line = this.stage.get("#" + dstDevice.getId() + "_" + srcDevice.getId());
        if (line.length > 0) {
            return true;
        }
        return false;
    },
    deleteCurrentObject: function() {
        var id = this.currentObject.id;
        var type = this.currentObject['config']['data'].device_name;
        var that = this;
        //---------------删除设备
        if (type == "router") {
            var json_array = '{"router_ids":["' + id + '"]}';
            $.ajax({
                type: "POST",
                data: json_array,
                contentType: "application/json",
                url: config["host"] + "/router/delete?token=" + window.localStorage.token,
                success: function(data) {
                    console.log(data);
                    var id_status = JSON.parse(data);
                    for (var x in id_status) {
                        if (id_status[x] == 204) {
                            that.currentObject.remove();
                            createAndHideAlert(x + "删除成功！");
                        } else
                            createAndHideAlert(x + "删除失败");
                    }
                },
                error: function(data) {
                    createAndHideAlert("error!");
                }
            });
        } else if (type == "network") {
            var nets = { "network_ids": [] };
            var net_ids = nets['network_ids'];
            net_ids[0] = id;
            $.ajax({
                type: "POST",
                data: JSON.stringify(nets),
                contentType: "application/json",
                url: config['host'] + "/network/delete?token=" + window.localStorage.token,
                success: function(data) {
                    var id_status = JSON.parse(data);
                    for (var x in id_status) {
                        if (id_status[x] == 204) {
                            that.currentObject.remove();
                            createAndHideAlert(x + "删除成功！");
                        } else
                            createAndHideAlert(x + "删除失败");
                    }
                }
            });
        } else {
            var servers = { "servers_ids": [] };
            var server_ids = servers['servers_ids'];
            server_ids[0] = id;
            $.ajax({
                type: "POST",
                data: JSON.stringify(servers),
                contentType: "application/json",
                url: config['host'] + "/servers/delete?token=" + window.localStorage.token,
                success: function(data) {
                    var id_status = JSON.parse(data);
                    for (var x in id_status) {
                        if (id_status[x] == 204) {
                            that.currentObject.remove();
                            createAndHideAlert(x + "删除成功！");
                        } else
                            createAndHideAlert(x + "删除失败");
                    }
                }
            });
        }

    },
    /////////////////////////////////////ctt-codeStart///////////////////////////////////////////////////////////////
    //点击设备全屏访问后新开远程tab
    visitCurrentObject: function(devName) {
        url = this.currentObject.id;
        json = JSON.parse(JSON.stringify(device2Url));
        var id = json[url];
        var hi = $(window).height() * 0.877;
        //        window.open('http://202.197.61.248/remoteDesktop/client.xhtml?id=' + id);

        //        function addTab(){
        centerTabs = $('#centerTabs');
        //          if (centerTabs.tabs('exists',node.text)) {
        //              centerTabs.tabs('select',node.text)
        //          } else {
        //              if (node.attributes && node.attributes.url && node.attributes.url.length > 0) {
        centerTabs.tabs('add', {
            title: devName,
            closable: true,
            fit: true,
            content: '<iframe id="frame11" class="frame111" onload="frame11.focus()" src="http://202.197.61.248/remoteDesktop/client.xhtml?id=' + id + '" frameborder="0" style="border:0;padding:5px;margin:5px;width:98%;height:' + hi + 'px;"></iframe>'
        });
        //                  $('.window-shadow').hide();  //window-mask  #infoDialog panel window
        //                  $('.window-mask').hide();
        //                  $('#infoDialog').hide();
        //                  $('.window').hide();

        $('#infoDialog').dialog('close');

        //              } else {
        //                  if (node.state=='open') {
        //                      $('#experienceName').tree('collapse',node.target);
        //                  } else {
        //                      $('#experienceName').tree('expand',node.target);
        //                  }   
        //              }
        //          }
        //        }
    },
    /////////////////////////////////////ctt-codeEnd///////////////////////////////////////////////////////////////   
    getCurrentObject: function() {
        return this.currentObject;
    },
    setCurrentObject: function(obj) {
        this.currentObject = obj;
    },
    getDevices: function() {
        return this.devices;
    },
    addDevice: function(device) {
        this.devices.push(device);
    },
    getLines: function() {
        return this.lines;
    },
    addLine: function(line) {
        this.lines.push(line);
    },
    getStage: function() {
        return this.stage;
    },
    getLayer: function() {
        return this.layer;
    },
    getConfig: function() {
        return this.config;
    },
    writeMessage: function(message) {
        if (this.debugMode) {
            var context = this.messageLayer.getContext();
            this.messageLayer.clear();
            context.font = "18pt Calibri";
            context.fillStyle = "black";
            context.fillText(message, 10, 25);
        }
    },
    getFitDevice: function(x, y) {
        for (var i = 0; i < this.devices.length; i++) {
            var fireRange = {
                x: this.devices[i].deviceImage.getX(),
                y: this.devices[i].deviceImage.getY(),
                width: this.devices[i].deviceImage.getWidth(),
                height: this.devices[i].deviceImage.getHeight(),
            };
            var r_w = Number(fireRange.x) + Number(fireRange.width);
            var t_h = Number(fireRange.y) + Number(fireRange.height);
            //console.error(">>>>",this.devices[i]);
            /*            console.error("x-->  ",x+" : "+fireRange.x+"--"+r_w);
                        console.error("y-->  ",y+" : "+fireRange.y+"--"+t_h);*/
            if ((x >= fireRange.x && x <= r_w) && (y >= fireRange.y && y <= t_h)) {
                return this.devices[i];
            }
        }
        return null;
    },
    toJson: function() {
        var jsonObj = {
            devices: [],
            lines: []
        };
        for (var i = 0; i < this.devices.length; i++) {
            var device = this.devices[i];
            var data = device.getConfig().data;
            data.eth1 = device.deviceImage.attrs.eth1;
            data.eth2 = device.deviceImage.attrs.eth2;
            data.eth3 = device.deviceImage.attrs.eth3;
            jsonObj.devices.push(data);
        }
        for (var i = 0; i < this.lines.length; i++) {
            var line = this.lines[i];
            var config = line.getConfig();
            var srcDeviceId = config.srcDevice.getId();
            var dstDeviceId = config.dstDevice.getId();
            var stroke = config.stroke;
            jsonObj.lines.push({
                srcDeviceId: srcDeviceId,
                dstDeviceId: dstDeviceId,
                srcIf: config.srcnic,
                dstIf: config.dstnic,
                srcip: config.srcip,
                dstip: config.dstip,
                stroke: stroke,
                strokeWidth: config.strokeWidth
            });
        }
        return JSON.stringify(jsonObj);
    },
    clear: function() {
        for (var i = 0; i < this.devices.length; i++) { //删除所有设备
            var device = this.devices[i];
            this.layer.remove(device.deviceImage);
        }
        for (var i = 0; i < this.lines.length; i++) { //删除所有线
            var line = this.lines[i];
            this.layer.remove(line.lineObject);
        }
        this.layer.draw();
        this.devices = [];
        this.lines = [];
    },
    load: function(jsonStr) {
        this.loading = true;

        if (jsonStr != null && jsonStr.length > 0) {
            this.clear();
            var jsonObj = JSON.parse(jsonStr);
            var deviceMap = [];
            for (var i = 0; i < jsonObj.devices.length; i++) {
                var data = jsonObj.devices[i];
                var device = new Kinetic.Topology.Device({
                    topology: this,
                    data: data
                });
                this.addDevice(device);
                deviceMap[device.getId()] = device;
            }
            this.loadLineAsync(this, jsonObj);
        }
    },
    loadLineAsync: function(instance, jsonObj) {
        // console.log(jsonObj.lines);
        lines = jsonObj.lines;

        //console.log(lines);
        var flag = true;
        for (var i = 0; i < instance.devices.length; i++) {
            if (instance.devices[i].getId() == null) {
                flag = false;
                break;
            }
        }
        instance.writeMessage(flag);
        if (flag) { //设备都已绘制完毕，可以绘线了
            this.loading = false;
            this.fitSizeAuto();
            //console.log(jsonObj.lines);
            for (var i = 0; i < jsonObj.lines.length; i++) {
                var line = jsonObj.lines[i];
                console.log(line);
                var srcDevice = instance.getDeviceById(line.srcDeviceId);
                var dstDevice = instance.getDeviceById(line.dstDeviceId);
                if (srcDevice != null && dstDevice != null) {
                    new Kinetic.Topology.Line({
                        topology: instance,
                        srcDevice: srcDevice,
                        dstDevice: dstDevice,
                        stroke: line.stroke,
                        strokeWidth: line.strokeWidth
                    });
                }
            }

        } else {
            setTimeout(function() { instance.loadLineAsync(instance, jsonObj); }, 300);
        }

    },
    getDeviceById: function(deviceId) {
        for (var i = 0; i < this.devices.length; i++) {
            var device = this.devices[i];
            // console.log(device.getId());
            if (device.getId() == deviceId) {
                return device;
            }
        }
        return null;
    },
    resize: function(width, height) {
        this.stage.setSize(width, height);
        this.stage.draw();
        //每一次调整画布大小，都要重新记录一下LineImageData，不然mounseover事件无法正确激发
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].lineObject.saveImageData();
        }
        this.getLayer().draw();
    },
    fitSizeAuto: function() {


    }
});
/**
类名：工具栏
描述：工具栏主类
constructor:
{
    topology:topology,
    backgroundImage:"../images/background.png",
}
*/
Kinetic.Topology.Background = Kinetic.Class.extend({
    config: null,
    init: function(config) {
        this.config = config;
        this.draw();
    },
    getConfig: function() {
        return this.config;
    },
    draw: function() {
        // alert("498")
        var imageObj = new Image();
        var instance = this;
        imageObj.onload = function() {
            var node = new Kinetic.Shape({
                drawFunc: function(context) {
                    var pattern = context.createPattern(imageObj, "repeat");
                    context.rect(0, 0, instance.config.topology.getStage().getWidth(), instance.config.topology.getStage().getHeight());
                    context.fillStyle = pattern;
                    context.fill();
                }
            });
            instance.config.topology.getLayer().add(node);
            instance.config.topology.getLayer().draw();
            node.moveToBottom();
            instance.config.topology.getLayer().draw();
        };
        imageObj.src = instance.config.backgroundImage;
    }
});
/**
类名：设备
描述：设备主类
constructor:
{
    topology:topology,
    data:{
        id:"router",name:"路由器",src:"../images/router.png",x:0,y:0,width:'auto',height:'auto'
    }
    callbackObj:..
}
*/
var object;
Kinetic.Topology.Device = Kinetic.Class.extend({
    config: null,
    lines: null, //与设置有关联的线
    deviceImage: null,
    fireRange: null,
    id: null,
    init: function(config) {
        this.config = config;
        this.draw();
        this.lines = new Array();
    },
    getConfig: function() {
        return this.config;
    },
    getLines: function() {
        return this.lines;
    },
    addLine: function(line) {
        this.lines.push(line);
    },
    getDeviceImage: function() {
        return this.deviceImage;
    },
    getId: function() {
        return this.id;
    },
    remove: function() {
        // alert(560);
        if (this.deviceImage != null) {
            if (this.lines != null && this.lines.length > 0) {
                for (var i = 0; i < this.lines.length; i++) {
                    this.lines[i].remove(); //删除与设备相关联的线
                }
            }
            var devices = this.config.topology.getDevices();
            if (devices != null && devices.length > 0) { //删除拓扑图中注册的设备信息
                var another = [];
                for (var i = 0; i < devices.length; i++) {
                    if (devices[i].getId() != this.getId()) {
                        another.push(devices[i]);
                    }
                }
                this.config.topology.devices = another;
            }
            this.config.topology.getLayer().remove(this.deviceImage); //删除设备图片
            this.config.topology.getLayer().draw();
            this.config.topology.connector.hide();
            this.lines = null;
        }

    },
    checkRange: function(x, y) {
        //this.config.topology.writeMessage("x: " + x + ", y: " + y);
        var device = this.deviceImage;
        this.fireRange = {
            x: device.getX() + device.getWidth() / 4,
            y: device.getY() + device.getHeight() / 4,
            width: device.getWidth() / 2,
            height: device.getHeight() / 2
        };
        if ((x >= this.fireRange.x && x <= this.fireRange.x + this.fireRange.width) && (y >= this.fireRange.y && y <= this.fireRange.y + this.fireRange.height)) {
            return true;
        } else {
            return false;
        }

    },
    syncConfig: function() {
        this.config.data.id = this.deviceImage.getId();
        this.config.data.x = this.deviceImage.getX();
        this.config.data.y = this.deviceImage.getY();
        this.config.data.width = this.deviceImage.getWidth();
        this.config.data.height = this.deviceImage.getHeight();
    },
    draw: function() {
        // alert(608);
        var imageObj = new Image();
        var config = this.config;
        var instance = this;
        imageObj.onload = function() {
            var initData = {
                x: config.data.x,
                y: config.data.y,
                image: imageObj,
                id: config.data.id,
                name: config.data.name,
                draggable: true,
                eth1: 'x.x.x.x',
                eth2: 'x.x.x.x',
                eth3: 'x.x.x.x'
            };

            if (config.data.width != 'auto') {
                initData.width = config.data.width;
            }
            if (config.data.height != 'auto') {
                initData.height = config.data.height;
            }
            var device = new Kinetic.Image(initData);
            config.topology.getLayer().add(device);
            config.topology.getLayer().draw();
            instance.id = initData.id;
            instance.deviceImage = device;
            instance.syncConfig();
            instance.bindEvent();
            config.topology.fitSizeAuto();
            if (instance.config.callbackObj) {
                instance.config.callbackObj.callback(instance);
            }
        };
        imageObj.src = config.data.src;
    },
    bindEvent: function() {
        //------信息的展示
        var config = this.config;
        var instance = this;
        var footer_str = "";
        //object.lines.
        this.deviceImage.on("click", function(evt) {
            document.body.style.cursor = "pointer";
            /*            console.log(instance.deviceImage.attrs);*/
            //if (instance.config.data.device_name != "ext_net") {
            $(".showInfoButton").click();
            // }
            if (evt.button == 0) {
                var footer_showInfo = "";
                setShowHeader(instance);
                var body_str = "";
                // alert(instance.config.data.device_name);
                /*网络的信息提示*/
                if (instance.config.data.device_name == "network") {
                    footer_showInfo = "» 查看网络详情 ";
                    body_str = '<B>Subnets</B><br/>';
                    var id_temp = instance.id;
                    var subnets = instance.config.data.subnets;
                    if (subnets != null && subnets != "undefined" && subnets.length != 0) {
                        for (var i = 0; i < subnets.length; i++) {
                            if (body_str != '<B>Subnets</B><br/>') {
                                body_str += '<br/><a class="close_model" href="javascript:void(0)" name="#/net/subnet-desc?' + subnets[i].id + '">' + subnets[i].id.substr(0, 10) + '...</a>  ' + subnets[i].cidr;
                            } else {
                                body_str += '<a  class="close_model" href="javascript:void(0)" name="#/net/subnet-desc?' + subnets[i].id + '">' + subnets[i].id.substr(0, 10) + '...</a>  ' + subnets[i].cidr;
                            }
                        }
                    }
                    footer_str = '<a class="close_model" href="javascript:void(0)" name="#/net/net-desc?' + instance.deviceImage.attrs.id + '" class="ttttt"  >' + footer_showInfo + '</a>';
                    $(".delete_device").attr("id", instance.id);
                    $(".devicebodyInfo").html(body_str);
                    $(".footer_str").html(footer_str);
                }
                /*外网的信息提示*/
                else if (instance.config.data.device_name == "ext_net") {
                    body_str = '';
                    var id_temp = instance.id;
                    //--------
                    $(".delete_device").attr("id", instance.id);
                    $(".devicebodyInfo").html(body_str);
                    $(".footer_str").html(footer_str);
                }
                /*路由的信息提示*/
                else if (instance.config.data.device_name == "router") {
                    footer_showInfo = "» 查看路由详情";
                    body_str = '<B>Interfaces</B><br/>';
                    var id_temp = instance.id;
                    //----------接口的信息处理
                    for (var i = 0; i < lines.length; i++) {
                        if (id_temp == lines[i].dstDeviceId) {
                            if (body_str != '<B>Interfaces</B><br/>') {
                                if (lines[i].device_owner == null || lines[i].device_owner == "undefined") {
                                    body_str += '<br/><a class="close_model" href="javascript:void(0)" name="#/net/port-desc?' + lines[i].id + '">' + lines[i].id.substr(0, 10) + '...' + '</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;none';
                                } else {
                                    body_str += '<br/><a class="close_model" href="javascript:void(0)" name="#/net/port-desc?' + lines[i].id + '">' + lines[i].id.substr(0, 10) + '...' + '</a>&nbsp;' + lines[i].fixed_ips[0].ip_address + " " + lines[i].device_owner + " " + lines[i].status;
                                }
                            } else {
                                if (lines[i].device_owner == null || lines[i].device_owner == "undefined") {
                                    body_str += '<a class="close_model" href="javascript:void(0)" name="#/net/port-desc?' + lines[i].id + '">' + lines[i].id.substr(0, 10) + '...' + '</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;none';
                                } else {
                                    body_str += '<a class="close_model" href="javascript:void(0)" name="#/net/port-desc?' + lines[i].id + '">' + lines[i].id.substr(0, 10) + '...' + '</a>&nbsp;' + lines[i].fixed_ips[0].ip_address + " " + lines[i].device_owner + " " + lines[i].status;
                                }
                            }
                        }
                    }
                    if (body_str == '<B>Interfaces</B><br/>') {
                        body_str += '&nbsp;&nbsp;&nbsp;暂未分配接口<br/>';
                        body_str += "<br/><B>防火墙</B><br/>";
                    } else {
                        body_str += "<br/><br/><B>防火墙</B><br/>";
                    }
                    //----防火墙的信息处理
                    setFireWallInfo(id_temp, body_str, instance, footer_showInfo);
                }
                /*实例的信息提示*/
                else if (instance.config.data.device_name == "server") {
                    footer_showInfo = "» 查看实例详情 ";
                    body_str = '<B>IP Addresses</B><br/>';
                    var id_temp = instance.id;
                    for (var i = 0; i < lines.length; i++) {
                        if (id_temp == lines[i].dstDeviceId) {
                            if (body_str != '<B>IP Addresses</B><br/>') {
                                body_str += '<br/>' + lines[i].fixed_ips[0].ip_address;
                            } else {
                                body_str += lines[i].fixed_ips[0].ip_address;
                            }
                        }
                    }
                    if (body_str == '<B>IP Addresses</B><br/>') {
                        body_str += '&nbsp;&nbsp;&nbsp;暂未分配IP<br/>';
                    }
                    //----防火墙的信息处理
                    body_str += "<br/><B>安全组</B><br/>";
                    setInstanceInfo(instance, body_str, footer_showInfo);
                }
                /*子网的信息提示*/
                else {
                    footer_showInfo = "» 查看子网详情 ";
                    body_str = '';
                    setSubnetInfo(instance, body_str, footer_showInfo);

                }
                // if (instance.config.data.device_name != "ext_net") {

                //  }
                $(".delete_device").click(function() {
                    deleteDevice();
                });
                /*                $("a").click(function() {
                                    $(".close_model_toupu").click();
                                });*/

                /* var infoContent = '<fieldset><legend>基本信息</legend><table class="basicInfoTable">'
                      +'<tr><th>设备名称:</th><td>'+instance.deviceImage.attrs.id;*/
                /*              if(instance.deviceImage.attrs.name != 'Switch'){
                                  infoContent += '<tr><th>eth1:</th><td>'+instance.deviceImage.attrs.eth1;
                               if(instance.deviceImage.attrs.name == 'ROUTER'){
                                   infoContent += '<tr><th>eth2:</th><td>'+instance.deviceImage.attrs.eth2
                                                +'<tr><th>eth3:</th><td>'+instance.deviceImage.attrs.eth3;
                               }  
                              }
                               infoContent += '</td></tr></table></fieldset>'
                                    +'<fieldset><legend>基本操作</legend><div class="basicOp">';
                                if (device2Url=='') {
                                    infoContent += '<a href="javascript:void(0);" onclick="deleteDevice();">删除设备</a>';
                                } else {
                                    infoContent += '<a href="javascript:void(0);" onclick="topology.visitCurrentObject(\''+instance.deviceImage.attrs.id+'\');">全屏访问</a>'
                                    +'<a href="">4X4访问</a></div></fieldset>';
                                }*/

                //---------------------------------------

                //---------------------------------------
                // $("#infoContent").html(infoContent);
                $('#infoDialog').dialog({
                    title: '设备信息',
                    width: 400,
                    //                height: 500,
                    closed: false,
                    cache: false,
                    draggable: false,
                    modal: true,
                    buttons: [{
                        text: '确定',
                        handler: function() { $('#infoDialog').dialog('close'); }
                    }, {
                        text: '取消',
                        handler: function() { $('#infoDialog').dialog('close'); }
                    }]
                });
            }

        });
        /////////////////////////////////////ctt-codeEnd///////////////////////////////////////////////////////////////
        this.deviceImage.on("mouseover", function(evt) {
            document.body.style.cursor = "pointer";

            var shape = evt.shape;
            // shape.style.backgroundColor = "#f40";
            // this.deviceImage.addClass('bbbb');
            shape.setStroke("gray");
            // this.setFill("blue");
            shape.setStrokeWidth(0.7);
            shape.getLayer().draw();
            instance.config.topology.setCurrentObject(instance);

        });
        this.deviceImage.on("mouseout", function(evt) {
            document.body.style.cursor = "default";
            var shape = evt.shape;
            shape.setStroke("white");
            shape.setStrokeWidth(0.1);
            shape.getLayer().draw();
        });
        //         this.deviceImage.on("mouseup", function(evt) {
        //            var shape = evt.shape;
        //            if(evt.button==2)
        //          {//右键击发菜单 
        // //              instance.config.topology.popmenu.show("device",evt);
        //             if(instance.config.data.name=="Switch"){
        //                 instance.config.topology.popmenu.show("line",evt);
        //             }else{
        //                 instance.config.topology.popmenu.show("device",evt);
        //             }
        //          }
        //         });
        //--------拖拽开始时触发
        this.deviceImage.on("dragstart", function(evt) {
            config.topology.connector.hide();
            var shape = evt.shape;
            shape.setShadow({
                color: "black",
                blur: 10,
                offset: [10, 10],
                alpha: 0.5
            });
            shape.getLayer().draw();
            //与其相关的线隐藏
            instance.config.topology.writeMessage(instance.getLines().length);
            for (var i = 0; i < instance.getLines().length; i++) {
                instance.getLines()[i].hide();
            }
        });
        //--------拖拽结束时触发
        this.deviceImage.on("dragend", function(evt) {
            var shape = evt.shape;
            shape.setShadow({
                color: "white",
                blur: 0,
                offset: [0, 0],
                alpha: 1
            });
            shape.getLayer().draw();
            //与其相关的线重绘后显示
            for (var i = 0; i < instance.getLines().length; i++) {
                instance.getLines()[i].redraw();
                instance.getLines()[i].show();
            }
            instance.syncConfig();
            instance.config.topology.fitSizeAuto();
        });
        //--------鼠标移动上触发
        this.deviceImage.on("mousemove", function(evt) {
            //alert("move");
            var shape = evt.shape;
            var mousePos = config.topology.getStage().getMousePosition();
            var x = mousePos.x;
            var y = mousePos.y;
            if (instance.checkRange(x, y)) { //显示连接器
                config.topology.connector.move(instance);
                config.topology.connector.show();
            } else { //隐藏连接器
                config.topology.connector.hide();
            }
            //config.topology.writeMessage( "x: " + (x) + ", y: " + (y)+"|left:"+shape.getX()+"top:"+shape.getY());

        });
    }
});
/**
类名：设备连接器
描述：设备连接器主类
constructor:
{
    topology:topology,
    src:connectorImage
}
*/
Kinetic.Topology.Device.Connector = Kinetic.Class.extend({
    config: null,
    device: null,
    connectorImage: null,
    isHide: false,
    onDrag: false,
    joinLine: null,
    init: function(config) {
        /*        console.log(".Device.Connector_init________________________");
                console.log(this);*/
        this.config = config;
        this.draw();
    },
    getConfig: function() {
        return this.config;
    },
    getDevice: function() {
        return this.device;
    },
    setDevice: function(device) {
        this.device = device;
    },
    getConnectorImage: function() {
        return this.connectorImage;
    },
    move: function(device) {
        //alert(910);
        if (!this.onDrag) {
            this.device = device;
            var shape = device.getDeviceImage();
            var x = shape.getX() + shape.getWidth() / 2 - 5;
            var y = shape.getY() + shape.getHeight() / 2 - 5;
            this.connectorImage.setX(x);
            this.connectorImage.setY(y);
            this.connectorImage.moveToTop();
            this.config.topology.getLayer().draw();
        }
    },
    show: function() {
        if (this.isHide && !this.onDrag) {
            this.isHide = false;
            this.connectorImage.show();
            this.connectorImage.setDraggable(true);
            this.config.topology.getLayer().draw();
        }
    },
    hide: function() {
        if (!this.isHide && !this.onDrag) {
            this.isHide = true;
            this.connectorImage.hide();
            this.connectorImage.setDraggable(false);
            this.config.topology.getLayer().draw();
        }
    },
    clear: function() {
        this.connectorImage.clear();
        this.config.topology.getLayer().draw();
    },
    restore: function() {
        this.draw();
    },
    draw: function() {
        //alert(946);
        var imageObj = new Image();
        var config = this.config;
        var instance = this;
        imageObj.onload = function() {
            var initData = {
                x: 5,
                y: 5,
                image: imageObj,
                id: "connector",
                name: "连接器",
                draggable: false
            };
            var connector = new Kinetic.Image(initData);

            config.topology.getLayer().add(connector);
            config.topology.getLayer().draw();
            instance.connectorImage = connector;
            instance.hide();
            instance.bindEvent();
        };
        imageObj.src = config.src;
    },
    bindEvent: function() {
        var instance = this;
        var config = instance.config;
        this.connectorImage.on("mouseover", function(evt) {
            document.body.style.cursor = "pointer";
            var shape = evt.shape;
            shape.getLayer().draw();
            instance.show();
        });
        this.connectorImage.on("mouseout", function(evt) {
            document.body.style.cursor = "default";
            var shape = evt.shape;
            shape.getLayer().draw();
            instance.hide();
        });
        this.connectorImage.on("dragstart", function(evt) {
            //alert(985);
            instance.onDrag = true;
            var device = instance.getDevice();
            var shape = device.getDeviceImage();
            var x = shape.getX() + shape.getWidth() / 2;
            var y = shape.getY() + shape.getHeight() / 2;

            var connector = evt.shape;
            instance.joinLine = new Kinetic.Line({
                points: [x, y, connector.getX(), connector.getY()],
                stroke: "green",
                strokeWidth: 1,
                lineJoin: "round",
                dashArray: [33, 10]
            });
            connector.getLayer().add(instance.joinLine);
            connector.getLayer().draw();
        });
        this.connectorImage.on("dragend", function(evt) {
            //------连线的处理
            var shape = evt.shape;
            var dstDevice = instance.config.topology.getFitDevice(shape.getX(), shape.getY());
            //如果连接器的终点是空白区域，就在终点位置建立一个与源设备一样的结点，并把它设置为终结点
            instance.onDrag = false;
            var connector_x = shape.getX();
            var connector_y = shape.getY();
            instance.move(instance.getDevice());
            instance.hide();
            shape.getLayer().remove(instance.joinLine);
            shape.getLayer().draw();
            instance.joinLine = null;
            if (dstDevice == null) {
                /*
                                var originalDevice = instance.getDevice(); //源结点
                                var config = originalDevice.getConfig().data;
                                var dstDeviceId = config.id.substring(0, config.id.lastIndexOf("_")) + "_" + sequence.nextVal();
                                dstDevice = new Kinetic.Topology.Device({
                                    topology: instance.config.topology,
                                    data: {
                                        id: dstDeviceId,
                                        name: config.name,
                                        src: config.src,
                                        x: connector_x,
                                        y: connector_y,
                                        width: 'auto',
                                        height: 'auto'
                                    },
                                    callbackObj: {
                                        instance: instance,
                                        callback: function(dstDevice) {
                                            new Kinetic.Topology.Line({
                                                topology: this.instance.config.topology,
                                                srcDevice: this.instance.getDevice(),
                                                dstDevice: dstDevice,
                                                stroke: 'black',
                                                strokeWidth: 1
                                            });
                                        }
                                    }
                                });
                                instance.config.topology.addDevice(dstDevice);*/
            } else {
                var origin_dev = instance.getDevice();
                var ori_dev = origin_dev['config']['data'].device_name;
                var des_dev = dstDevice['config']['data'].device_name;
                console.error(ori_dev + " : " + des_dev);
                var flag = false;
                if (ori_dev == 'ext_net' && des_dev == "router")
                    flag = true;
                if (ori_dev == 'router' && (des_dev == "ext_net" || des_dev == "network"))
                    flag = true;
                if (ori_dev == 'network' && (des_dev == "router" || des_dev == "subnet"))
                    flag = true;
                if (ori_dev == 'subnet' && (des_dev == "network" || des_dev == "server"))
                    flag = true;
                if (ori_dev == "server" && des_dev == "subnet")
                    flag = true;
                if (flag) {
                    if (dstDevice != null && dstDevice.getId() != instance.getDevice().getId() && !instance.config.topology.loading) { //连线
                        if (!instance.config.topology.containLine(instance.getDevice(), dstDevice)) {
                            var line = new Kinetic.Topology.Line({
                                topology: instance.config.topology,
                                srcDevice: instance.getDevice(),
                                dstDevice: dstDevice,
                                stroke: 'black',
                                strokeWidth: 1
                            });
                        }
                    }
                } else {
                    // console.error("该设备间不可连接！");
                    if (ori_dev == des_dev)
                        createAndHideAlert("该设备间不可连接！");
                }
            }

        });
        this.connectorImage.on("dragmove", function(evt) {
            //createAndHideAlert(1062);
            var connector = evt.shape;
            var device = instance.getDevice();
            var shape = device.getDeviceImage();
            var x = shape.getX() + shape.getWidth() / 2;
            var y = shape.getY() + shape.getHeight() / 2;
            //config.topology.writeMessage(x+","+y+","+connector.getX()+","+connector.getY()+","+instance.onDrag);
            if (instance.joinLine != null) {
                instance.joinLine.setPoints([x, y, connector.getX(), connector.getY()]);
                connector.getLayer().draw();
            }
        });
    }
});
/**
类名：连接线
描述：连接线主类
constructor:
{
    topology:topology,
    srcDevice:device,
    dstDevice:device,
    stroke:'blue',
    strokeWidth:1
}
*/
Kinetic.Topology.Line = Kinetic.Class.extend({
    config: null,
    lineObject: null,
    init: function(config) {
        this.config = config;
        this.draw();
        this.bindEvent();
    },
    getConfig: function() {
        return this.config;
    },
    getSrcDevice: function() {
        return this.config.srcDevice;
    },
    getDstDevice: function() {
        return this.config.dstDevice;
    },
    hide: function() {
        this.lineObject.hide();
        this.config.topology.getLayer().draw();
    },
    show: function() {
        this.lineObject.show();
        this.config.topology.getLayer().draw();
    },
    redraw: function() {
        //createAndHideAlert(1114);
        var srcElement = this.config.srcDevice.getDeviceImage();
        var dstElement = this.config.dstDevice.getDeviceImage();
        var x1 = srcElement.getX();
        var x2 = dstElement.getX();
        if (x1 > x2)
            x1 = srcElement.getX() + srcElement.getWidth() / 15; // + srcElement.getWidth() / 1;
        else
            x1 = srcElement.getX() + srcElement.getWidth() / 1 - srcElement.getWidth() / 15;
        var y1 = srcElement.getY() + srcElement.getHeight() / 2;
        if (x1 < x2)
            x2 = dstElement.getX() + srcElement.getWidth() / 15; //+ dstElement.getWidth() / 1;
        else
            x2 = dstElement.getX() + dstElement.getWidth() / 1 - srcElement.getWidth() / 15;
        var y2 = dstElement.getY() + dstElement.getHeight() / 2;
        this.lineObject.setPoints([x1, y1, x2, y2]);
        this.config.topology.getLayer().draw();
        this.lineObject.saveImageData();
    },
    remove: function() {
        createAndHideAlert(1126);
        if (this.lineObject != null) {
            var lines = this.config.topology.getLines();
            if (lines != null && lines.length > 0) { //删除拓扑图中注册的线信息
                var another = [];
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].lineObject.getId() != this.lineObject.getId()) {
                        another.push(lines[i]);
                    }
                }
                this.config.topology.lines = another;
            }
            this.config.topology.getLayer().remove(this.lineObject);
            this.lineObject.clearImageData();
            this.config.topology.getLayer().draw();
        }
    },
    draw: function() {
        // alert(1144);
        /*        console.log("Line_draw________________________");
                console.log(this);*/
        var srcElement = this.config.srcDevice.getDeviceImage();
        var dstElement = this.config.dstDevice.getDeviceImage();
        var x1 = srcElement.getX();
        var x2 = dstElement.getX();
        if (x1 > x2)
            x1 = srcElement.getX() + srcElement.getWidth() / 15; // + srcElement.getWidth() / 1;
        else
            x1 = srcElement.getX() + srcElement.getWidth() / 1 - srcElement.getWidth() / 15;
        var y1 = srcElement.getY() + srcElement.getHeight() / 2;
        if (x1 < x2)
            x2 = dstElement.getX() + srcElement.getWidth() / 15; //+ dstElement.getWidth() / 1;
        else
            x2 = dstElement.getX() + dstElement.getWidth() / 1 - srcElement.getWidth() / 15;
        var y2 = dstElement.getY() + dstElement.getHeight() / 2;
        //console.log(this.config.stroke+": "+this.config.strokeWidth+": "+this.config.srcDevice.getId()+": "+this.config.dstDevice.getId());
        this.lineObject = new Kinetic.Line({
            points: [x1, y1, x2, y2],
            stroke: this.config.stroke,
            strokeWidth: this.config.strokeWidth,
            lineCap: "round",
            lineJoin: "round",
            draggable: false,
            detectionType: "pixel",
            id: this.config.srcDevice.getId() + "_" + this.config.dstDevice.getId()
        });
        //console.log(this.lineObject);
        this.config.topology.getLayer().add(this.lineObject);
        this.lineObject.moveToBottom();
        this.lineObject.moveUp();
        this.config.topology.getLayer().draw();
        this.lineObject.saveImageData();
        this.config.srcDevice.addLine(this);
        this.config.dstDevice.addLine(this);
        this.config.topology.addLine(this);
    },
    bindEvent: function() {
        var instance = this;
        // this.lineObject.on("mouseup", function(evt) {
        //        var shape = evt.shape;
        //     instance.config.topology.writeMessage(evt.button);
        //     if(evt.button==2)
        //     {//右键击发菜单 
        //      instance.config.topology.popmenu.show("line",evt);
        //     }
        //    });
        /////////////////////////////////////ctt-codeStart///////////////////////////////////////////////////////////////
        this.lineObject.on("click", function(evt) {
            document.body.style.cursor = "pointer";
            $("#infoDialog").show();
            if (evt.button == 0) {
                var infoContent = '<fieldset id="srcEth" style="float:left;width:250px;height:100px;margin:10px 10px;"><legend>源设备</legend><table class="basicInfoTable">' + '<tr><th>名称:</th><td>' + instance.config.srcDevice.id + '</td></tr>';
                if (instance.config.srcDevice.deviceImage.attrs.name == 'ROUTER') {
                    infoContent += '<tr><th>网卡:</th><td><select><option value="1">网卡1</option>' + '<option value="2">网卡2</option><option value="3">网卡3</option></select></td></tr>' + '<tr><th>IP:</th><td><input type="text"></td></tr>';
                } else if (instance.config.srcDevice.deviceImage.attrs.name != 'Switch') {
                    infoContent += '<tr><th>网卡:</th><td><select><option value="1">网卡1</option></select></td></tr>' + '<tr><th>IP:</th><td><input type="text"></td></tr>';
                }
                infoContent += '</table></fieldset>' + '<fieldset id="dstEth" style="float:left;width:250px;height:100px;margin:10px 10px;"><legend>目的设备</legend><table class="basicInfoTable">' + '<tr><th>名称:</th><td>' + instance.config.dstDevice.id + '</td></tr>';
                if (instance.config.dstDevice.deviceImage.attrs.name == 'ROUTER') {
                    infoContent += '<tr><th>网卡:</th><td><select><option value="1">网卡1</option>' + '<option value="2">网卡2</option><option value="3">网卡3</option></select></td></tr>' + '<tr><th>IP:</th><td><input type="text"></td></tr>';
                } else if (instance.config.dstDevice.deviceImage.attrs.name != 'Switch') {
                    infoContent += '<tr><th>网卡:</th><td><select><option value="1">网卡1</option></select></td></tr>' + '<tr><th>IP:</th><td><input type="text"></td></tr>';
                }
                infoContent += '</table></fieldset>';
                if (device2Url == '') {
                    infoContent += '<fieldset><legend>基本操作</legend><div class="basicOp">' + '<a href="javascript:void(0);" onclick="deleteDevice();">删除</a>';
                }
                $("#infoContent").html(infoContent);
                $('#infoDialog').dialog({
                    title: '连线信息',
                    width: 600,
                    //                height: 300,
                    closed: false,
                    cache: false,
                    draggable: false,
                    modal: true,
                    buttons: [{
                        text: '确定',
                        handler: function() {
                            if ($('#srcEth select').val() == '1') {
                                instance.config.srcDevice.deviceImage.attrs.eth1 = $('#srcEth input').val();
                                instance.config.srcnic = 'eth1';
                                instance.config.srcip = instance.config.srcDevice.deviceImage.attrs.eth1;
                            } else if ($('#srcEth select').val() == '2') {
                                instance.config.srcDevice.deviceImage.attrs.eth2 = $('#srcEth input').val();
                                instance.config.srcnic = 'eth2';
                                instance.config.srcip = instance.config.srcDevice.deviceImage.attrs.eth2;
                            } else if ($('#srcEth select').val() == '3') {
                                instance.config.srcDevice.deviceImage.attrs.eth3 = $('#srcEth input').val();
                                instance.config.srcnic = 'eth3';
                                instance.config.srcip = instance.config.srcDevice.deviceImage.attrs.eth3;
                            }
                            if ($('#dstEth select').val() == '1') {
                                instance.config.dstDevice.deviceImage.attrs.eth1 = $('#dstEth input').val();
                                instance.config.dstnic = 'eth1';
                                instance.config.dstip = instance.config.dstDevice.deviceImage.attrs.eth1;
                            } else if ($('#dstEth select').val() == '2') {
                                instance.config.dstDevice.deviceImage.attrs.eth2 = $('#dstEth input').val();
                                instance.config.dstnic = 'eth2';
                                instance.config.dstip = instance.config.dstDevice.deviceImage.attrs.eth2;
                            } else if ($('#dstEth select').val() == '3') {
                                instance.config.dstDevice.deviceImage.attrs.eth3 = $('#dstEth input').val();
                                instance.config.dstnic = 'eth3';
                                instance.config.dstip = instance.config.dstDevice.deviceImage.attrs.eth3;
                            }
                            $('#infoDialog').dialog('close');
                        }
                    }, {
                        text: '取消',
                        handler: function() { $('#infoDialog').dialog('close'); }
                    }]
                });
            }

        });
        /////////////////////////////////////ctt-codeEnd///////////////////////////////////////////////////////////////
        this.lineObject.on("mouseover", function(evt) {
            document.body.style.cursor = "pointer";
            var shape = evt.shape;
            shape.setStrokeWidth(shape.getStrokeWidth() + 2);
            instance.config.topology.getLayer().draw();
            instance.lineObject.saveImageData();
            instance.config.topology.setCurrentObject(instance);
            //提示信息
            timer = setTimeout(function() {
                $(".showLineModel").show();
                var src_type = instance.config.srcDevice.config.data.device_name;
                var dts_type = instance.config.dstDevice.config.data.device_name;
                console.error(instance.config);
                var ip_addr, src_name, dst_name;
                //-----显示删除外网和路由间的线
                if (src_type == "ext_net" || dts_type == "ext_net") {
                    if (src_type == "router") {
                        ip_addr = instance.config.srcDevice.config.data['external_gateway_info']['external_fixed_ips'][0].ip_address;
                        src_name = instance.config.srcDevice.deviceImage.attrs.name;
                        dst_name = instance.config.dstDevice.deviceImage.attrs.name;
                    } else {
                        ip_addr = instance.config.dstDevice.config.data['external_gateway_info']['external_fixed_ips'][0].ip_address;
                        dst_name = instance.config.srcDevice.deviceImage.attrs.name;
                        src_name = instance.config.dstDevice.deviceImage.attrs.name;
                    }
                    $(".line_ids").html('<font color="white">路由: ( ' + src_name + ' )<br/>外网: ( ' + dst_name + ' ) <br/>网关: ' + ip_addr + '</font>');
                }
                //-----显示删除路由和网络间的线
                else if ((src_type == "router" && dts_type == "network") || (src_type == "network" && dts_type == "router")) {
                    if (src_type == "router") {
                        ip_addr = instance.config.srcDevice.config.data['external_gateway_info']['external_fixed_ips'][0].ip_address;
                        src_name = instance.config.srcDevice.deviceImage.attrs.name;
                        dst_name = instance.config.dstDevice.deviceImage.attrs.name;
                    } else {
                        ip_addr = instance.config.dstDevice.config.data['external_gateway_info']['external_fixed_ips'][0].ip_address;
                        dst_name = instance.config.srcDevice.deviceImage.attrs.name;
                        src_name = instance.config.dstDevice.deviceImage.attrs.name;
                    }
                    $(".line_ids").html('<font color="white">路由: ( ' + src_name + ' )<br/>外网: ( ' + dst_name + ' ) <br/>网关: ' + ip_addr + '</font>');
                }
                //-----显示删除网络和子网间的线
                else if ((src_type == "subnet" && dts_type == "network") || (src_type == "network" && dts_type == "subnet")) {
                    if (src_type == "subnet") {
                        ip_addr = instance.config.srcDevice.config.data['external_gateway_info']['external_fixed_ips'][0].ip_address;
                        src_name = instance.config.srcDevice.deviceImage.attrs.name;
                        dst_name = instance.config.dstDevice.deviceImage.attrs.name;
                    } else {
                        ip_addr = instance.config.dstDevice.config.data['external_gateway_info']['external_fixed_ips'][0].ip_address;
                        dst_name = instance.config.srcDevice.deviceImage.attrs.name;
                        src_name = instance.config.dstDevice.deviceImage.attrs.name;
                    }
                    $(".line_ids").html('<font color="white">路由: ( ' + src_name + ' )<br/>外网: ( ' + dst_name + ' ) <br/>网关: ' + ip_addr + '</font>');
                }
                //-----显示删除子网和主机间的线
                else if ((src_type == "subnet" && dts_type == "server") || (src_type == "server" && dts_type == "subnet")) {
                    if (src_type == "subnet") {
                        ip_addr = instance.config.srcDevice.config.data['external_gateway_info']['external_fixed_ips'][0].ip_address;
                        src_name = instance.config.srcDevice.deviceImage.attrs.name;
                        dst_name = instance.config.dstDevice.deviceImage.attrs.name;
                    } else {
                        ip_addr = instance.config.dstDevice.config.data['external_gateway_info']['external_fixed_ips'][0].ip_address;
                        dst_name = instance.config.srcDevice.deviceImage.attrs.name;
                        src_name = instance.config.dstDevice.deviceImage.attrs.name;
                    }
                    $(".line_ids").html('<font color="white">路由: ( ' + src_name + ' )<br/>外网: ( ' + dst_name + ' ) <br/>网关: ' + ip_addr + '</font>');
                }

            }, 500);





        });
        this.lineObject.on("mouseout", function(evt) {
            clearTimeout(timer);
            document.body.style.cursor = "default";
            var shape = evt.shape;
            shape.setStrokeWidth(shape.getStrokeWidth() - 2);
            instance.config.topology.getLayer().draw();
            instance.lineObject.saveImageData();
            instance.config.topology.writeMessage("mouseover");
        });
    }
});

/**
类名：工具栏
描述：工具栏主类
constructor:
{
    toolbar:{
        container:'toolbar',
        data:[
            {id:'router',name:'路由器',image:'Router_Icon_128x128.png',width:32,height:32}
        ]
    }
}
*/
Kinetic.Topology.Toolbar = Kinetic.Class.extend({
    config: null,
    init: function(config) {
        this.config = config;
        $("#" + this.config.toolbar.container).append("<span><font color='blue'><B>工具栏</B></font></span>");
        $("#" + this.config.toolbar.container).append(this.getHtml());
        for (var i = 0, n = this.config.toolbar.data.length; i < n; i++) {
            var data = this.config.toolbar.data[i];
            var toolkit = new Kinetic.Topology.Toolbar.Toolkit({
                container: this.config.toolbar.container + '_topology',
                data: data
            });
        }

        //      $("#"+this.config.toolbar.container).accordion({  
        //      });  
    },
    getConfig: function() {
        return this.config;
    },
    getHtml: function() {
        var html = "<div id='" + this.config.toolbar.container + "_topology' >";
        html += "</div>";
        return html;
    }
});
/**
类名：工具
描述：工具主类
constructor:
{
    container:'toolbar_topology',
    data:{id:'router',name:'路由器',image:'Router_Icon_128x128.png',width:32,height:32}
}
*/
Kinetic.Topology.Toolbar.Toolkit = Kinetic.Class.extend({
    config: null,
    init: function(config) {
        this.config = config;
        var container = $("#" + this.config.container);
        container.append(this.getHtml());
        this.bindEvent();
    },
    getConfig: function() {
        return this.config;
    },
    getHtml: function() {
        var html = "<div id='" + this.config.data.id + "_div' style='float:left'><img id='" + this.config.data.id + "' src='" + this.config.data.image + "' width='" + this.config.data.width + "px' height='" + this.config.data.height + "px' style='padding:2px;position:relative;z-index:100;border:solid white 1px' title='" + this.config.data.name + "'/>";
        if (this.config.data.name == "ROUTER")
            html += '<span>路由器</span></div>';
        else if (this.config.data.name == "server")
            html += '<span>云主机</span></div>';
        else if (this.config.data.name == "network")
            html += '<span>网&nbsp;&nbsp;络</span></div>';
        else
            html += '<span>子&nbsp;&nbsp;网</span></div>';
        return html;
    },
    bindEvent: function() {
        $("#" + this.config.data.id + "_div").draggable({ //可托动
            revert: true,
            proxy: function(source) {
                var cloneObj = $(source).clone().attr("id", $(source).attr("id") + "_proxy");
                var p = cloneObj.insertAfter(source);
                return p;
            }
        });
        //定义工具栏图片的鼠标事件
        $("#" + this.config.data.id).mouseover(function() {
            $(this).css("border", "solid black 1px");
        });
        $("#" + this.config.data.id).mouseout(function() {
            $(this).css("border", "solid white 1px");
        });
    }
});
/**
    constructor:
{
    topology:topology
    popmenu:{
        container:'mm',
        data:[
            {id:'menu_1',name:'删除',onclick:function(evt,instance){...},filter:"line"}
        ]
    }
}
*/
// Kinetic.Topology.PopMenu = Kinetic.Class.extend({
//  config:null,
//  init: function(config) {
//      this.config=config;
//      //$("#"+this.config.popmenu.container).html(this.getHtml());
//      $("#"+this.config.popmenu.container).menu({  
//      }); 
//      this.bindEvent();
//      $(document).bind('contextmenu',function(e){
//              return false;
//          });
//     },
//     getConfig:function(){
//      return this.config;
//     },
//     redraw:function(filter){
//      for(var i=0;i<this.config.popmenu.data.length;i++)
//      {//删除已有
//          var itemEl = $("#"+this.config.popmenu.data[i].id).get(0);
//          if(itemEl)
//          {
//              $('#mm').menu('removeItem', itemEl);
//          }
//      }
//      //重新添加
//      for(var i=0;i<this.config.popmenu.data.length;i++)
//      {
//          if(this.config.popmenu.data[i].filter=="all"||this.config.popmenu.data[i].filter==filter)
//          {
//              $('#mm').menu('appendItem', {
//                  id:this.config.popmenu.data[i].id,
//                  text: this.config.popmenu.data[i].name,
//                  iconCls: this.config.popmenu.data[i].iconCls,
//                  onclick: this.config.popmenu.data[i].onclick
//              });
//          }
//      }
//     },
//     getHtml:function(){
//      var html="";
//      for(var i=0;i<this.config.popmenu.data.length;i++)
//      {
//          html+="<div id='"+this.config.popmenu.data[i].id+"'>"+this.config.popmenu.data[i].name+"</div>";
//      }
//      return html;
//     },
//     bindEvent:function(){
//      for(var i=0;i<this.config.popmenu.data.length;i++)
//      {
//          if(this.config.popmenu.data[i].onclick)
//          {
//              var topology=this.config.topology;
//              $("#"+this.config.popmenu.data[i].id).click(this.config.popmenu.data[i].onclick); 
//          }
//      }
//     },
//     show:function(filter,e){
//      var id=this.config.popmenu.container;
//      var mousePos = this.config.topology.getStage().getMousePosition();
//         var x = mousePos.x;
//         var y = mousePos.y;
//         this.redraw(filter);
//      $('#'+id).menu('show', {
//                  left:  e.pageX,
//                  top:  e.pageY
//              });
//     },
//     hide:function(){
//      var id=this.config.popmenu.container;
//      $('#'+id).menu('hide');
//     }
// });

/**
类名：菜单
描述：菜单主类
constructor:
*/
Kinetic.Topology.Menu = Kinetic.Class.extend({
    config: null,
    init: function(config) {
        this.config = config;
    },
    getConfig: function() {
        return this.config;
    },
    getHtml: function() {}
});
/**
类名：菜单项
描述：菜单项主类
constructor:
*/
Kinetic.Topology.Menu.Item = Kinetic.Class.extend({
    config: null,
    init: function(config) {
        this.config = config;
    },
    getConfig: function() {
        return this.config;
    },
    getHtml: function() {}
});

/**
类名：序列
描述：序列主类
constructor:
*/
Kinetic.Topology.Sequence = Kinetic.Class.extend({
    seq: 0,
    init: function() {},
    nextVal: function() {
        return Math.uuid();
    }
});
var sequence = new Kinetic.Topology.Sequence({});

//test()
function test() {
    $('#frame11').onkeydown = function() {
        $('#frame11').focus();
    }
}
//------------拖拽处理
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var id = $(ev.target).attr("id");
    var parent_tag = $(ev.target).attr("parent_tag");
    var data = ev.dataTransfer.getData("Text");
    // createAndHideAlert(new String(id));
    var move_tag = $("#" + data).attr("tag");
    if (id == "selected_subnet") {
        $("#" + data).find("button").removeClass("net_add");
        $("#" + data).find("button").addClass("net_detract");
        $("#" + data).find("button").find("span").removeClass("fa-plus");
        $("#" + data).find("button").parent().addClass("selected_netTag");
        $("#" + data).find("button").find("span").addClass("fa-minus");
        //console.error(document.getElementById(data));
        ev.target.appendChild(document.getElementById(data));
    } else if (move_tag == parent_tag) {
        $("#" + data).find("button").removeClass("net_detract");
        $("#" + data).find("button").addClass("net_add");
        $("#" + data).find("button").find("span").removeClass("fa-minus");
        $("#" + data).find("button").parent().removeClass("selected_netTag");
        $("#" + data).find("button").find("span").addClass("fa-plus");
        ev.target.appendChild(document.getElementById(data));
    }
}

function createNetAjax(network_json) {
    console.log(JSON.stringify(network_json));
    $.ajax({
        type: "POST",
        data: JSON.stringify(network_json),
        contentType: "application/json",
        url: config['host'] + "/network/create?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });
}
//-------创建子网
function createSubnetAJAX(subnet) {
    console.log(JSON.stringify(subnet));
    var url_info = "/subnet/create";
    $.ajax({
        type: "POST",
        data: JSON.stringify(subnet),
        contentType: "application/json",
        url: config['host'] + url_info + "?token=" + window.localStorage.token,
        success: function(data) {
            if (JSON.parse(data)['subnet'] == null || JSON.parse(data)['subnet'] == "undefined") {
                console.log(data);
                alert("请检查子网配置格式！");
            } else {
                window.location.reload();
                window.location.href = "#/net/net";
            }
        }
    });
}

function setShowHeader(instance) {
    var status_str = '<br/>&nbsp;&nbsp;&nbsp;&nbsp;<font color="#CDC1C5">STATUS</font>   ' + instance.config.data.status;
    var model_type;
    if (instance.config.data.device_name == "ext_net")
        model_type = "外网";
    if (instance.config.data.device_name == "router")
        model_type = "路由";
    if (instance.config.data.device_name == "server")
        model_type = "实例";
    if (instance.config.data.device_name == "network")
        model_type = "网络";
    if (instance.config.data.device_name == "subnet") {
        status_str = "";
        model_type = "子网";
    }
    var title_Info = '<B><span style="text-align:center">' + model_type + '</span></B><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color="#CDC1C5">名称</font>   <B>' + instance.deviceImage.attrs.name + '</B><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color="#CDC1C5">ID</font>   ' + instance.deviceImage.attrs.id + status_str;
    $(".deviceTitle_Info").html(title_Info);
}

function setInstanceReadyInfo() {
    $(".img_list").empty();
    //-------镜像
    $.ajax({
        type: "GET",
        url: config["host"] + "/images?token=" + window.localStorage.token,
        success: function(data) {
            var images = JSON.parse(data)['images'];
            var imag_str = "";
            for (var i = 0; i < images.length; i++) {
                var imag = images[i];
                if (i % 2 == 0)
                    imag_str += '<div class="row">';
                imag_str += '<div class="col-sm-6 ">' +
                    '<button type="button" class="btn btn-default btn-block img_buttons" id="' + imag.id + '">' +
                    '<font >' + imag.name + '</font>' +
                    '</button>' +
                    '</div>';
                if (i % 2 != 0)
                    imag_str += "</div><br/>";
            }
            $(".img_list").append(imag_str);
        }
    });
    //-------云主机类型的获取
    $(".peizhi_select").empty();
    var flag = 0;
    var flavors_str = "";
    $.ajax({
        type: "GET",
        url: config["host"] + "/flavors?token=" + window.localStorage.token,
        success: function(data) {
            localStorage.instance_temp = data;
            flag++;
            flavors_local = data;
            var flavors = JSON.parse(data)['flavors'];
            sort_data(flavors);
            instance_Ram_Cpu(flavors[0].id, flavors);
        }
    });
    //-------子网的获得
    $(".subnetInfo_select").empty();
    $.ajax({
        type: "GET",
        url: config["host"] + "/new_subnets?token=" + window.localStorage.token,
        success: function(data) {
            var subnet_infos = JSON.parse(data)['subnets'];
            $.ajax({
                type: "GET",
                url: config["host"] + "/networks?token=" + window.localStorage.token,
                success: function(data) {
                    flag++;
                    var servers = JSON.parse(data)['networks'];
                    var option_str = "";
                    for (var j = 0; j < servers.length; j++) {
                        var server = servers[j];
                        option_str += '<optgroup label = "' + server.name + '" >';
                        for (var i = 0; i < subnet_infos.length; i++) {
                            var subnet_info = subnet_infos[i];
                            // console.error("server.id", server.id);
                            if (subnet_info.network_id == server.id) {
                                option_str += '<option id="' + server.id + '" name="' + subnet_info.id + '">' + subnet_info.name + '(' + subnet_info.cidr + ')' + '</option>';
                            }
                        }
                        option_str += '</optgroup>';
                    }
                    //console.error(option_str);
                    $(".subnetInfo_select").append(option_str);
                }
            });
        }
    });
    //---------键值对
    $(".key_select").empty();
    $.ajax({
        type: "GET",
        url: config["host"] + "/keypairs?token=" + window.localStorage.token,
        success: function(data) {
            var keypairs = JSON.parse(data)['keypairs'];
            var keypair_str = "";
            for (var i = 0; i < keypairs.length; i++) {
                var keypair = keypairs[i]['keypair'];
                keypair_str += '<option  name="' + keypair.name + '"> ' + keypair.name + ' </option>';
            }
            $(".key_select").append(keypair_str);
        }
    });
}
//---------由cpu数量决定ram的值显示
function setRAMInfo(cpu_checked, ram_temp) {
    var ram_str = '<div class="col-sm-2"></div>';
    var num = 0;
    var start_ram = 0;
    if (cpu_checked == 1) {
        num = 4;
        start_ram = 512;
    } else if (cpu_checked == 2) {
        num = 3;
        start_ram = 2;
    } else if (cpu_checked == 4) {
        num = 3;
        start_ram = 4;
    } else if (cpu_checked == 8) {
        num = 3;
        start_ram = 8;
    }
    var fist_num;
    for (var i = 0; i < num; i++) {
        var num_temp = ((num == 4 && i == 0) ? (start_ram + "M") : ((num == 4 && i != 0) ? (Math.pow(2, i - 1) + "G") : (start_ram * Math.pow(2, i) + "G")));
        if (i == 0)
            fist_num = num_temp;
        ram_str += '<div class="col-sm-2">' +
            '<button type="button" id="' + num_temp.substr(0, num_temp.length - 1) + '" class="btn btn-default Ram_type" style="width:100%;height:35px;position:relative;">' +
            '<font>' + num_temp + '</font>' +
            '</button>' +
            '</div>';
    }
    if (num == 3)
        ram_str += '<div class="col-sm-2"></div><div class="col-sm-2"></div>';
    else
        ram_str += '<div class="col-sm-2"></div>';
    $(".RAM_InfoShow").append(ram_str);
    //------RAM的相应更新
    if (ram_temp != 0) {
        if ($(".Ram_type[id='" + ram_temp + "']").length > 0)
            $(".Ram_type[id='" + ram_temp + "']").addClass("btn-primary");
        else {
            $(".Ram_type[id='" + fist_num.substr(0, fist_num.length - 1) + "']").addClass("btn-primary");
            setSelect();
        }
    }
}

//---------主机类型决定cpu和ram的选择
function instance_Ram_Cpu(curr_id, flavors) {
    var curr_instance;
    for (var i = 0; i < flavors.length; i++) {
        var flavor = flavors[i];
        if (flavor.id == curr_id) {
            curr_instance = flavor;
            break;
        }
    }
    $(".cpu_type").removeClass("btn-primary");
    $(".cpu_type[id='" + curr_instance.vcpus + "']").addClass("btn-primary");

    $(".RAM_InfoShow").empty();
    setRAMInfo(curr_instance.vcpus, 0);
    $(".Ram_type").removeClass("btn-primary");
    var ram_id = new Number(curr_instance.ram) / 1024;
    if (ram_id == 0.5)
        ram_id = 512;
    $(".Ram_type[id='" + ram_id + "']").addClass(" btn-primary ");
}
//---------cpu和ram的选择决定主机类型
function setSelect() {
    var flavors = JSON.parse(localStorage.instance_temp)['flavors'];
    var cpu_id = $(".cpu_type[class*='btn-primary']").attr('id');
    var ram_id = $(".Ram_type[class*='btn-primary']").attr('id');
    // console.error(cpu_id + " : " + ram_id);
    var curr_instance = 0;
    for (var i = 0; i < flavors.length; i++) {
        var flavor = flavors[i];
        var ram_id_1 = new Number(flavor.ram) / 1024;
        if (ram_id_1 == 0.5)
            ram_id_1 = 512;
        console.error(ram_id_1 + " : " + ram_id + "   ---   " + flavor.vcpus + '  :  ' + cpu_id);
        if (ram_id_1 == ram_id && flavor.vcpus == cpu_id) {
            $(".peizhi_select option[value='" + flavor.id + "']").prop("selected");
            curr_instance = flavor;
            break;
        }
    }
    if (curr_instance != 0)
        $(".peizhi_select option[value='" + curr_instance.id + "']").attr("selected", true);
    else {
        alert("暂无 CPU:" + cpu_id + " RAM:" + (ram_id == 512 ? (512 + "M") : (ram_id + "G")) + " 配置的主机!");
        $(".Ram_type[class*='btn-primary']").removeClass("btn-primary");
    }
}

function submit_instanceInfo() {
    //----------启动云主机----提交信息
    var instance = {
        "server": {
            "security_groups": [],
            "availability-zone": "",
            "name": "",
            "imageRef": "",
            "flavorRef": "",
            "max_count": 1,
            "network_info": [],
            "networks": [],
            "key_name": ""
        }
    };
    var server = instance['server'];
    //---------可用域
    //--------云主机名称
    var instanceName = $(".instance_name").val();
    if (instanceName != "")
        server.name = instanceName;
    if (instanceName == "") {
        alert("云主机名称必填！");
        $("#loading_monitor,#background_monitor").hide();
        return;
    }
    //---------云主机类型
    var instancetypeselect = $(".peizhi_select").val();
    server.flavorRef = instancetypeselect;
    //---------云主机数量
    //----------云主机启动源
    var selected_name = $(".img_buttons[class*='btn-primary']").attr("id");
    if ($(".img_buttons[class*='btn-primary']").length == 0) {
        alert("请选择镜像！");
        $("#loading_monitor,#background_monitor").hide();
        return;
    }
    server.imageRef = selected_name;
    //----------键值对
    var keyValue = $(".key_select").val();
    server.key_name = keyValue;
    //----------安全组
    //----------网络
    var server_id = $(".subnetInfo_select option:selected").attr("id");
    var subnet_id = $(".subnetInfo_select option:selected").attr("name");
    server.networks[0] = {
        "uuid": server_id,
    };
    server.network_info[0] = {
        "network_id": server_id,
        "subnet_id": subnet_id,
    };
    console.error(JSON.stringify(instance));
    //-------------------提交数据
    $.ajax({
        type: "POST",
        data: JSON.stringify(instance),
        contentType: "application/json",
        url: config["host"] + "/servers/create?token=" + window.localStorage.token,
        success: function(data) {
            $("#loading_monitor").empty("span");
            setTimeout(function() {
                window.location.reload();
            }, 1000);
        }
    });

}

function sort_data(flavors) {
    var data_arr = new Array();
    var flavor;
    var temp_num = 0;
    var temp_str = "";
    var opt_str = "";
    flavors.sort(compare("name"));
    for (var i = 0; i < flavors.length; i++) {
        flavor = flavors[i];
        var temp_str_1 = flavor.name.split("-")[0];
        if (temp_str != temp_str_1) {
            if (temp_str == "")
                opt_str += '<optgroup label="' + temp_str_1 + '">';
            else
                opt_str += '</optgroup><optgroup label="' + temp_str_1 + '">';
            opt_str += '<option value="' + flavor.id + '">' + flavor.name + '</option>';
            temp_str = temp_str_1;
        } else {
            opt_str += '<option value="' + flavor.id + '">' + flavor.name + '</option>';
        }
    }

    $(".peizhi_select").append(opt_str);
}

function compare(propertyName) {
    return function(object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (value2 < value1) {
            return 1;
        } else if (value2 > value1) {
            return -1;
        } else {
            return 0;
        }
    }
}

function setFireWallInfo(id_temp, body_str, instance, footer_showInfo) {
    $.ajax({
        type: "GET",
        url: config["host"] + "/routers?token=" + window.localStorage.token,
        success: function(data) {
            localStorage.router_temp = data;
            var allRounters = JSON.parse(data)['routers'];
            $.ajax({
                type: "GET",
                url: config["host"] + "/firewall_policies?token=" + window.localStorage.token,
                success: function(data) {
                    // console.log(data);
                    localStorage.policyTemp = data;
                    var allPolicys = JSON.parse(data)['firewall_policies'];
                    $.ajax({
                        type: "GET",
                        url: config["host"] + "/firewalls?token=" + window.localStorage.token,
                        success: function(data) {
                            localStorage.fireWallsInfo = data;
                            var fireWalls = JSON.parse(data)['firewalls'];
                            var fireWall;
                            var curr_fireWall;
                            var flag = false;
                            localStorage.routerInfo = "";
                            localStorage.policyInfo = "";
                            var routerInfo = "[";
                            var policyInfo = "[";
                            for (var i = 0; i < fireWalls.length; i++) {
                                fireWall = fireWalls[i];
                                //---------------------跳转信息的处理
                                //------路由
                                var routerIds = fireWall.router_ids;
                                var routerStr = "";
                                for (var j = 0; j < routerIds.length; j++) {
                                    if (routerInfo != "[")
                                        routerInfo += ",[";
                                    else
                                        routerInfo += "[";
                                    for (var k = 0; k < allRounters.length; k++) {
                                        var allRouter = allRounters[k];
                                        if (allRouter.id == routerIds[j]) {
                                            if (routerStr == "")
                                                routerStr += allRouter.name;
                                            else
                                                routerStr += "," + allRouter.name;
                                            routerInfo += JSON.stringify(allRouter) + "]";
                                        }
                                    }
                                }
                                //console.log(localStorage.routerInfo);
                                //------策略
                                var policyId = fireWall.firewall_policy_id;
                                var policyStr = "";
                                for (var m = 0; m < allPolicys.length; m++) {
                                    var policy = allPolicys[m];
                                    if (policy.id == policyId) {
                                        policyStr += policy.name;
                                        if (policyInfo == "[")
                                            policyInfo += JSON.stringify(policy);
                                        else
                                            policyInfo += "," + JSON.stringify(policy);
                                        break;
                                    }
                                }
                                //---------------------跳转信息的处理
                                var routerIds = fireWall.router_ids;
                                for (var j = 0; j < routerIds.length; j++) {
                                    if (routerIds[j] == id_temp) {
                                        curr_fireWall = fireWalls[i];
                                        flag = true;
                                        break;
                                    }
                                }
                                if (flag)
                                    break;
                            }
                            localStorage.policyInfo += policyInfo + "]";
                            localStorage.routerInfo += routerInfo + "]";
                            var rule_str = "";
                            if (curr_fireWall != undefined) {
                                body_str += '<font color="#C4C4C4"><B>名称&nbsp;&nbsp;</B></font><a class="close_model" href="javascript:void(0)" name="#/net/firewall-desc?' + curr_fireWall.id + '">' + curr_fireWall.name + '</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                                var policy_id = curr_fireWall.firewall_policy_id;
                                $.ajax({
                                    type: "GET",
                                    url: config["host"] + "/firewall_policies?token=" + window.localStorage.token,
                                    success: function(data) {
                                        var allPolicys = JSON.parse(data)['firewall_policies'];
                                        for (var m = 0; m < allPolicys.length; m++) {
                                            //  console.error(allPolicys[m].id + "  :   " + policy_id);
                                            if (allPolicys[m].id == policy_id) {
                                                var policy_rules = allPolicys[m].firewall_rules;
                                                if (policy_rules.length != 0) {
                                                    rule_str = '<table class="table table-striped">' +
                                                        '<thead>' +
                                                        '<tr>' +
                                                        '<th>名称</th>' +
                                                        '<th>源IP</th>' +
                                                        '<th>源端口</th>' +
                                                        '<th>目的IP</th>' +
                                                        '<th>目的端口</th>' +
                                                        '<th>动作</th>' +
                                                        '</tr>' +
                                                        '</thead>' +
                                                        '<tbody>';
                                                    body_str += "<br/><B>规则列表</B><br/>";
                                                    $.ajax({
                                                        type: "GET",
                                                        url: config["host"] + "/firewall_rules?token=" + window.localStorage.token,
                                                        success: function(data) {
                                                            localStorage.firewall_rules = data;
                                                            setRuleInfo(data, policy_rules, rule_str, body_str, instance, footer_showInfo);
                                                        }
                                                    });
                                                } else {
                                                    footer_str = '<a class="close_model" href="javascript:void(0)" name="#/net/routerDesc?' + instance.deviceImage.attrs.id + '" >' + footer_showInfo + '</a>';
                                                    $(".delete_device").attr("id", instance.id);
                                                    $(".devicebodyInfo").html(body_str);
                                                    $(".devicebodyInfo").append(rule_str);
                                                    $(".footer_str").html(footer_str);
                                                }
                                                //-------------防火墙规则
                                                break;
                                            }
                                        }
                                    }
                                });
                            } else {
                                body_str += "&nbsp;&nbsp;&nbsp;&nbsp;<font color='#C4C4C4'><B>未关联防火墙</B></font>";
                                footer_str = '<a class="close_model" href="javascript:void(0)" name="#/net/routerDesc?' + instance.deviceImage.attrs.id + '" >' + footer_showInfo + '</a>';
                                $(".delete_device").attr("id", instance.id);
                                $(".devicebodyInfo").html(body_str);
                                $(".footer_str").html(footer_str);
                            }
                        }
                    });
                }
            });
        }
    });
}

function setRuleInfo(data, policy_rules, rule_str, body_str, instance, footer_showInfo) {
    var fireWallRulers = JSON.parse(data)['firewall_rules'];
    var id = policy_rules[0];
    console.error("fireWallRulers", fireWallRulers);
    console.error("id", id);
    for (var i = 0; i < fireWallRulers.length; i++) {
        if (fireWallRulers[i].id == id) {
            var data = fireWallRulers[i];
            rule_str += '<tr>' +
                '<td><a class="close_model" href="javascript:void(0)" name="#/net/firewall-ruleDesc?' + data.id + '">' + data.name + '</a></td>' +
                '<td>' + data.source_ip_address + '</td>' +
                '<td>' + data.source_port + '</td>' +
                '<td>' + data.destination_ip_address + '</td>' +
                '<td>' + data.destination_port + '</td>' +
                '<td>' + (data.action == "allow" ? "允许" : "不允许") + '</td></tr>';
        }
    }
    rule_str += '</tbody></table>';
    footer_str = '<a class="close_model" href="javascript:void(0)" name="#/net/routerDesc?' + instance.deviceImage.attrs.id + '" >' + footer_showInfo + '</a>';
    $(".delete_device").attr("id", instance.id);
    $(".devicebodyInfo").html(body_str);
    $(".devicebodyInfo").append(rule_str);
    $(".footer_str").html(footer_str);
}
$(document).on("click", ".close_model", function() {
    $(".close_model_toupu").click();
    that = this;
    setTimeout(function() {
        location.href = $(that).attr("name");
    }, 200);

});
/*$(document).on("click", ".close_model", function() {
    $(".close_model_toupu").click();
});*/

function setSubnetInfo(instance, body_str, footer_showInfo) {
    var id = instance.id;
    $.ajax({
        type: "GET",
        url: config["host"] + "/subnets?token=" + window.localStorage.token,
        success: function(data) {
            var subnet_infos = JSON.parse(data)['subnets'];
            console.error(subnet_infos);
            for (var i = 0; i < subnet_infos.length; i++) {
                var subnet = subnet_infos[i];
                if (subnet.id == id) {
                    body_str += "<B>IP段 :           </B> " + subnet.cidr + "<br/>";
                    body_str += "<B>网关 :     </B> " + subnet.gateway_ip + "<br/>";
                    body_str += "<B>DHCP启用 :    </B> " + subnet.enable_dhcp + "<br/>";
                    body_str += "<B>DNS :</B> ";
                    for (var j = 0; j < subnet.dns_nameservers.length; j++) {
                        var dns_info = subnet.dns_nameservers[j];
                        body_str += dns_info + "&nbsp;nbsp;nbsp;nbsp;";
                    }
                    if (subnet.dns_nameservers.length == 0)
                        body_str += "暂未分配DNS";
                }
            }
            footer_str = '<a class="close_model" href="javascript:void(0)" name="#/net/subnet-desc?' + instance.deviceImage.attrs.id + '" >' + footer_showInfo + '</a>';
            $(".delete_device").attr("id", instance.id);
            $(".devicebodyInfo").html(body_str);
            $(".footer_str").html(footer_str);
        }
    });

}

function setInstanceInfo(instance, body_str, footer_showInfo) {
    var id = instance.id;
    $.ajax({
        type: "GET",
        url: config["host"] + "/security_groups?token=" + window.localStorage.token,
        success: function(data) {
            var securities = JSON.parse(data)['security_groups'];
            $.ajax({
                type: "GET",
                url: config["host"] + "/instances?token=" + window.localStorage.token,
                success: function(data) {
                    var servers = JSON.parse(data)['servers'];
                    for (var i = 0; i < servers.length; i++) {
                        var server = servers[i];
                        var rule_str = "";
                        //-----------得到当前实例
                        if (server.id == id) {
                            console.error("选中的虚拟机：", server);
                            var securities_names = server.security_groups;
                            //---------处理重复的
                            //console.error("1::", securities_names);
                            securities_names.sort(function(a, b) {
                                if (a.name > b.name)
                                    return 1;
                                else
                                    return -1;
                            });
                            // console.error("2::", securities_names);
                            var temp_name = 0;
                            var new_arr = [];
                            new_arr[0] = securities_names[0];
                            for (var m = 1; m < securities_names.length; m++) {
                                if (new_arr[temp_name].name != securities_names[m].name) {
                                    new_arr[++temp_name] = securities_names[m];
                                }
                            }
                            securities_names = new_arr;
                            img_num = securities_names.length;
                            for (var n = 1; n <= img_num; n++) {
                                sub1_flag[n] = true;
                            }
                            // console.error("3::", securities_names);
                            //---------处理重复的
                            var temp = 0;
                            var globle_num = 0;
                            for (var k = 0; k < securities_names.length; k++) {
                                var securities_name = securities_names[k].name;
                                // console.error("分配的安全组", securities_names);
                                for (var j = 0; j < securities.length; j++) {
                                    var security = securities[j];
                                    //   console.error("所有的安全组", securities);
                                    //---------找到匹配的安全组
                                    if (security.name == securities_name) {
                                        ++globle_num;
                                        rule_str = '<table class="table table-striped" >' +
                                            '<thead>' +
                                            '<tr>' +
                                            '<th>方向</th>' +
                                            '<th>端口范围</th>' +
                                            '<th>远端IP前缀</th>' +
                                            '</tr>' +
                                            '</thead>' +
                                            '<tbody>';
                                        //     console.error("匹配的安全组", security);
                                        temp++;
                                        body_str += '<span name="' + globle_num + '" class="rule_control"><font color="#5CACEE"><i class="fa fa-angle-double-down info_pic' + globle_num + '" ></i></font>' + (globle_num) + "、" +
                                            '名称&nbsp;&nbsp;</B>' + security.name + "</span>" + '&nbsp;&nbsp;<a class="close_model" href="javascript:void(0)" name="#/net/secGroup_desc?' + security.id + '">修改安全组<i class="fa fa-reply" aria-hidden="true"></i></a>';
                                        var securitys_rules = security.security_group_rules;
                                        //--------对应的安全组有规则
                                        body_str += "<br/><div class='" + globle_num + "Info" + "' hidden><font color='#C4C4C4'><B>规则列表</B></font><br/>";
                                        if (securitys_rules.length != 0) {
                                            for (var i = 0; i < securitys_rules.length; i++) {
                                                var rule = securitys_rules[i];
                                                //--------数据的处理
                                                if (rule.port_range_min != null && rule.port_range_min != rule.port_range_max)
                                                    rule.port_range_min = rule.port_range_min + ":" + rule.port_range_max;
                                                else if (rule.port_range_min == null)
                                                    rule.port_range_min = "任何";
                                                if (rule.remote_ip_prefix == null) {
                                                    if (rule.ethertype == "IPv4")
                                                        rule.remote_ip_prefix = "0.0.0.0/0";
                                                    else
                                                        rule.remote_ip_prefix = "::/0";
                                                }
                                                //--------数据的处理
                                                rule_str += '<tr>' +
                                                    '<td>' + (rule.direction == "egress" ? "出口" : "入口") + '</td>' +
                                                    '<td>' + rule.port_range_min + '</td>' +
                                                    '<td>' + rule.remote_ip_prefix + '</td></tr>';

                                            }
                                        } else { //--------对应的安全组没有规则
                                            rule_str += '<tr><td colspan="3"><center>' + "暂未分配规则" + '</center></td></tr>';
                                        }
                                        rule_str += '</tbody></table>';
                                        body_str += rule_str + "</div>";
                                        console.error(body_str);
                                    }
                                }
                            }
                            //------是否有安全组
                            if (temp > 0) {
                                footer_str = '<a class="close_model" href="javascript:void(0)" name="#/compute/instance_desc?' + instance.deviceImage.attrs.id + '" >' + footer_showInfo + '</a>';
                                $(".delete_device").attr("id", instance.id);
                                $(".devicebodyInfo").html(body_str);
                                $(".footer_str").html(footer_str);
                            } else {
                                footer_str = '<a class="close_model" href="javascript:void(0)" name="#/compute/instance_desc?' + instance.deviceImage.attrs.id + '" >' + footer_showInfo + '</a>';
                                $(".delete_device").attr("id", instance.id);
                                $(".devicebodyInfo").html(body_str);
                                rule_str = "<font color='#C4C4C4'><B>暂未分配安全组</B></font>";
                                $(".devicebodyInfo").append(rule_str);
                                $(".footer_str").html(footer_str);
                            }
                            break;
                        }
                    }
                }
            });
        }
    });
}
sub1_flag = [];
$(document).on("click", ".rule_control", function() {
    var id = $(this).attr("name");
    $("." + id + "Info").slideToggle();
    if (sub1_flag[id]) {
        $(".info_pic" + id).removeClass("fa fa-angle-double-down");
        $(".info_pic" + id).addClass("fa fa-angle-double-up");
        sub1_flag[id] = false;
    } else {
        $(".info_pic" + id).removeClass("fa fa-angle-double-up");
        $(".info_pic" + id).addClass("fa fa-angle-double-down");
        sub1_flag[id] = true;
    }
});


function getExtNetInfo() {
    $.ajax({
        type: "GET",
        url: config['host'] + "/extnet?token=" + window.localStorage.token,
        success: function(data) {
            var ext_nets = JSON.parse(data)['ext_net'];
            var str = "";
            for (var i = 0; i < ext_nets.length; i++) {
                str += "<option value='" + ext_nets[i].id + "''>" + ext_nets[i].name + "</option>"
            }
            $(".outNet_selected").append(str);
        }
    });
}
