$(function() {
    var flag=window.location.href.indexOf("&");
    //-----从网络进入的情况
    if (flag>=0) {
        var id_num = (window.location.href.split('?')[1]).split('&')[0];
        var manager_status = decodeURI(window.location.href.split('?')[1]).split('&')[1];

        var subnetInfos = localStorage.subnetInfo;
        var netInfo = JSON.parse(localStorage.net_tempInfo)['networks'][id_num];

        //---------显示网络信息
        setNetInfo(netInfo, manager_status);

        //-------子网
        var sunNetInfos = JSON.parse(subnetInfos);
        for (var i = 0; i < sunNetInfos.length; i++)
            set_subNet(sunNetInfos[i], sunNetInfos[i].id);

        //------端口
        $.ajax({
            type: "GET",
            url: config["host"] + "/ports?token=" + window.localStorage.token,
            success: function(data) {
                var port_Infos = JSON.parse(data)["ports"];
                localStorage.portInfos = data;
                var count_num = 0;
                for (var i = 0; i < port_Infos.length; i++) {
                    port_info = port_Infos[i];
                    if (port_info.network_id == netInfo.id) {
                        count_num++;
                        //----端口名字的处理
                        if (port_info.name == null || port_info.name == "") {
                            port_info.name = "(" + port_info.id.substr(0, 13) + ")";
                        }
                        //----端口的固定IP
                        var fixed_IPs = port_info.fixed_ips;
                        var fixed_ips_str = "";
                        for (var j = 0; j < fixed_IPs.length; j++) {
                            fixed_ips_str += fixed_IPs[j].ip_address + "<br/>";
                        }
                        //-----状态的变换
                        if (port_info.status == "ACTIVE") {
                            port_info.status = "运行中";
                        } else {
                            port_info.status = "状态待补充";
                        }
                        //-----管理员的状态变换
                        if (port_info.admin_state_up == true) {
                            port_info.admin_state_up = "上";
                        } else {
                            port_info.admin_state_up = "状态待补充";
                        }
                        setPortInfo(port_info, fixed_ips_str, port_info.id);
                    }
                }
                var footer_info = '<tfoot><tr class="active tfoot-dsp"><td colspan="6">Displaying <span id="item_count">' + count_num + '</span> items</td></tr></tfoot>';
                $(".port_infos").append(footer_info);
            },
            error: function(data) {
                alert("端口获取失败！");
            }
        });

    } else //-----从拓扑进入的情况
    {
        var id = window.location.href.split('?')[1]
        $.ajax({
            type: "GET",
            url: config["host"] + "/networks?token=" + window.localStorage.token,
            success: function(data) {
                //---------显示网络信息
                var servers = JSON.parse(data);
                var curr_net = 0;
                for (var i = servers['networks'].length - 1; i >= 0; i--) {
                    if (servers['networks'][i].id == id) {
                        if (servers['networks'][i].admin_state_up == true)
                            servers['networks'][i].admin_state_up = "上";
                        else
                            servers['networks'][i].admin_state_up = "下";
                        setNetInfo(servers['networks'][i], servers['networks'][i].admin_state_up);
                        curr_net = i;
                        break;
                    }
                }
                //---------显示子网
                $.ajax({
                    type: "GET",
                    url: config["host"] + "/subnets?token=" + window.localStorage.token,
                    success: function(data) {
                        var subnet_infos = JSON.parse(data)['subnets'];
                        //-----------------------------------
                        var subnets = servers['networks'][curr_net]['subnets'];

                        var subnet_Info = "[";
                        for (var j = 0; j < subnets.length; j++) {
                            // alert(subnets.length);
                            for (var k = 0; k < subnet_infos.length; k++) {
                                //alert(subnets[i]+"=="+subnet_infos[j].id);
                                if (subnets[j] == subnet_infos[k].id) {
                                    // alert(subnets[i]);
                                    if (subnet_Info = "[")
                                        subnet_Info += JSON.stringify(subnet_infos[k]);
                                    else
                                        subnet_Info += "," + JSON.stringify(subnet_infos[k]);
                                }
                            }
                        }
                        var subnetInfoTemp = subnet_Info + "]";
                        var sunNetInfos = JSON.parse(subnetInfoTemp);
                        for (var i = 0; i < sunNetInfos.length; i++)
                            set_subNet(sunNetInfos[i], sunNetInfos[i].id);
                        //------------------------------------                      
                        //----------------端口
                        $.ajax({
                            type: "GET",
                            url: config["host"] + "/ports?token=" + window.localStorage.token,
                            success: function(data) {
                                var port_Infos = JSON.parse(data)["ports"];
                                var count_num = 0;
                                for (var i = 0; i < port_Infos.length; i++) {
                                    port_info = port_Infos[i];
                                    if (port_info.network_id == servers['networks'][curr_net].id) {
                                        count_num++;
                                        //----端口名字的处理
                                        if (port_info.name == null || port_info.name == "") {
                                            port_info.name = "(" + port_info.id.substr(0, 13) + ")";
                                        }
                                        //----端口的固定IP
                                        var fixed_IPs = port_info.fixed_ips;
                                        var fixed_ips_str = "";
                                        for (var j = 0; j < fixed_IPs.length; j++) {
                                            fixed_ips_str += fixed_IPs[j].ip_address + "<br/>";
                                        }
                                        //-----状态的变换
                                        if (port_info.status == "ACTIVE") {
                                            port_info.status = "运行中";
                                        } else {
                                            port_info.status = "状态待补充";
                                        }
                                        //-----管理员的状态变换
                                        if (port_info.admin_state_up == true) {
                                            port_info.admin_state_up = "上";
                                        } else {
                                            port_info.admin_state_up = "状态待补充";
                                        }
                                        setPortInfo(port_info, fixed_ips_str, port_info.id);
                                    }
                                }
                                var footer_info = '<tfoot><tr class="active tfoot-dsp"><td colspan="6">Displaying <span id="item_count">' + count_num + '</span> items</td></tr></tfoot>';
                                $(".port_infos").append(footer_info);
                            },
                            error: function(data) {
                                alert("端口获取失败！");
                            }
                        });


                    },
                    error: function(data) {

                    }
                });

            },
            error: function(data) {

            }
        });
    }

});

function setNetInfo(netInfo, manager_status) {
    //--------网络概况
    $("#net_name").html(netInfo.name);
    $("#net_id").html(netInfo.id);
    $("#net_proId").html(netInfo.tenant_id);
    if (netInfo.status == "ACTIVE")
        $("#net_status").html("运行中");
    else
        $("#net_status").html("状态待补充");
    $("#net_managerStatus").html(manager_status);
    $("#net_shared").text(netInfo.shared);
    $("#net_outNet").html(netInfo.port_security_enabled);
    if (netInfo.mtu == "0")
        $("#net_mtu").html("未知");
    else
        $("#net_mtu").html(netInfo.mtu);
}

function set_subNet(data, i) {
    var str = '<tbody><tr><td><input type="checkbox"></td>' +
        '<td><a href="#/net/subnet-desc?' + i + '">' + data.name + '</a>' +
        '</td><td>' + data.cidr +
        '</td><td>' + 'ipv' + data.ip_version +
        '</td><td>' + data.gateway_ip +
        '</td><td><div class="btn-group"><button type="button" class="btn btn-default btn-sm">编辑子网</button>' +
        '<button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown"><span class="caret"></span>' +
        '<span class="sr-only">切换下拉菜单</span>' +
        '</button>' +
        '<ul class="dropdown-menu" role="menu">' +
        '<li><a href="#">功能</a></li>' +
        '<li><a href="#">另一个功能</a></li>' +
        '<li><a href="#">其他</a></li>' +
        '</ul>' +
        '</div>' +
        '</td>' +
        '</tr>' +
        '</tbody>';
    $(".sub_netInfo").append(str);
}


function setPortInfo(data, fixed_ips_str, i) {
    var str = '<tbody><tr><td><a href="#/net/port-desc?' + i + '">' + data.name +
        '</a></td><td>' + fixed_ips_str + '</td>' +
        '<td>' + data.device_owner + '</td>' +
        '<td>' + data.status + '</td>' +
        '<td>' + data.admin_state_up + '</td><td>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn-default btn-sm">编辑端口</button>' +
        '<button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">' +
        '<span class="caret"></span>' +
        '<span class="sr-only">切换下拉菜单</span>' +
        '</button>' +
        '<ul class="dropdown-menu" role="menu">' +
        '<li><a href="#">功能</a></li>' +
        '<li><a href="#">另一个功能</a></li>' +
        '<li><a href="#">其他</a></li>' +
        '</ul>' +
        '</div>' +
        '</td>' +
        '</tr>' +
        '</tbody>';
    $(".port_infos").append(str);
}