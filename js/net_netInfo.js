var net_len = 0;
$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/subnets?token=" + window.localStorage.token,
        success: function(data) {
            $("#loading_monitor1,#background_monitor1").hide();
            var subnet_infos = JSON.parse(data)['subnets'];
            localStorage.subnets_tempInfo = data;
            /*            localStorage.subnetInfo=data;*/
            $.ajax({
                type: "GET",
                url: config["host"] + "/networks?token=" + window.localStorage.token,
                success: function(data) {
                    localStorage.net_tempInfo = data;
                    var servers = JSON.parse(data);
                    var count_num = 0;
                    for (var i = servers['networks'].length - 1; i >= 0; i--) {
                        var server = servers['networks'][i];
                        if (server.admin_state_up == true)
                            server.admin_state_up = "激活";
                        else
                            server.admin_state_up = "未激活";
                        //----子网
                        var sub_str = "";
                        var subnets = server['subnets'];
                        //console.log(subnets + "=====" + i);
                        var subnet_Info = "[";
                        for (var j = 0; j < subnets.length; j++) {
                            // createAndHideAlert(subnets.length);
                            for (var k = 0; k < subnet_infos.length; k++) {
                                //createAndHideAlert(subnets[i]+"=="+subnet_infos[j].id);
                                if (subnets[j] == subnet_infos[k].id) {
                                    // createAndHideAlert(subnets[i]);
                                    sub_str += "<b>" + subnet_infos[k].name + "</b> " + subnet_infos[k].cidr + "<br/>";
                                    if (subnet_Info = "[")
                                        subnet_Info += JSON.stringify(subnet_infos[k]);
                                    else
                                        subnet_Info += "," + JSON.stringify(subnet_infos[k]);
                                }
                            }
                        }
                        if (sub_str != "") {
                            count_num++;
                            server.subnets = sub_str;
                            localStorage.subnetInfo = subnet_Info + "]";
                        }
                        setList(server, i, encodeURI(server.admin_state_up));
                    };
                    net_len = servers['networks'].length;
                    var footer_str = "<tfoot><tr class='active tfoot-dsp'><td colspan='7'>Displaying <span id='item_count'>" + net_len + "</span> items</td></tr></tfoot>";
                    //var footer_str='<div style="background:#E5E5E5" style="height:5rem;width:50rem">'+'Displaying  '+count_num+'  items'+'</div>';
                    $(".instance_info").append(footer_str);
                    if (net_len == 10) {
                        $(".add_netbutton").text("创建网络(配额用尽)");
                        $(".add_netbutton").parent().attr("disabled", true);
                    }
                },
                error: function(data) {
                    createAndHideAlert("信息获取失败！");
                }
            });
        },
        error: function(data) {
            createAndHideAlert("配置获取失败！");
        }
    });

});
//0-32  16-31
create_networkFun();

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
//----------------全选的控制
$(document).on("change", ".all_check", function() {
    var isChecked = $(this).prop("checked");
    $(".net_check").prop("checked", isChecked);
    if (isChecked) {
        $(".delete_nets").attr("disabled", false);
    } else {
        $(".delete_nets").attr("disabled", true);
    }
});
//--------------删除
$(document).on("change", ".net_check", function() {
    if ($(".net_check:checked").length == $(".net_check").length) {
        $(".delete_nets").attr("disabled", false);
        $(".all_check").prop("checked", true);
    } else if ($(".net_check:checked").length > 0) {
        $(".delete_nets").attr("disabled", false);
        $(".all_check").prop("checked", false);
    } else {
        $(".delete_nets").attr("disabled", true);
        $(".all_check").prop("checked", false);
    }
});
//------多删
$(".delete_nets").click(function() {
    var nets = { "network_ids": [] };
    var net_ids = nets['network_ids'];
    var i = 0;
    $(".net_check:checked").each(function() {
        net_ids[i++] = this.id;
    });
    $("#loading_monitor1,#background_monitor1").show();
    deleteNetAjax(nets);
});
//----单删
$(document).on("click", ".deleteNetSimple", function() {
    var nets = { "network_ids": [] };
    var net_ids = nets['network_ids'];
    net_ids[0] = this.id;
    deleteNetAjax(nets);
});

function deleteNetAjax(nets) {
    console.log(JSON.stringify(nets));
    $.ajax({
        type: "POST",
        data: JSON.stringify(nets),
        contentType: "application/json",
        url: config['host'] + "/network/delete?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });
}
//----------编辑网络
$(".edite_networkCancel").click(function() {
    $(".editenetwork_name").val("");
    $(".editenetwork_id").val("");
});
$(document).on("click", ".edite_net_class", function() {
    $(".editenetwork_name").val($(this).attr("name"));
    $(".editenetwork_id").val($(this).attr("id"));
    $(".editenetwork_managerStatus option[value='" + ($(this).attr("status") == "激活" ? "up" : "down") + "']").attr('selected', true);
});
$(".edite_networkOk").click(function() {
    var name = $(".editenetwork_name").val();
    var id = $(".editenetwork_id").val();
    var status = $(".editenetwork_managerStatus").val();
    var net = {
        "network": {
            "name": "sample_network",
            "admin_state_up": true
        }
    };
    net['network'].name = name;
    net['network'].admin_state_up = (status == "up" ? true : false);
    updateNetAjax(net, id)
});

function updateNetAjax(net, id) {
    $.ajax({
        type: "POST",
        data: JSON.stringify(net),
        contentType: "application/json",
        url: config['host'] + "/network/update/" + id + "?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });
}
//---------------创建子网面板配置
var sub1_flag = true;
$(".createchoose_subnet").click(function() {
    $(".createsubnet_multi").slideToggle();
    if (sub1_flag) {
        $(".info_pic2").removeClass("fa fa-angle-double-down");
        $(".info_pic2").addClass("fa fa-angle-double-up");
        sub1_flag = false;
    } else {
        $(".info_pic2").removeClass("fa fa-angle-double-up");
        $(".info_pic2").addClass("fa fa-angle-double-down");
        sub1_flag = true;
    }
});
var sub2_flag = true;
$(".showmoresubnetInfo").click(function() {
    $(".showMoreInfo").slideToggle();
    if (sub2_flag) {
        $(".info_pic3").removeClass("fa fa-angle-double-down");
        $(".info_pic3").addClass("fa fa-angle-double-up");
        sub2_flag = false;
    } else {
        $(".info_pic3").removeClass("fa fa-angle-double-up");
        $(".info_pic3").addClass("fa fa-angle-double-down");
        sub2_flag = true;
    }
});
$(".subnet_opengateway").change(function() {
    if (!$(".subnet_opengateway").is(":checked"))
        $(".creategateway_adrr").attr("disabled", true);
    else
        $(".creategateway_adrr").attr("disabled", false);
});
$(document).on("click", ".create_subnet", function() {
    $(".private_selected").empty();
    $(".private_selected").append('<option value="test">选择私有网络</option>');
    var servers = JSON.parse(localStorage.net_tempInfo)['networks'];
    var server;
    var str = "";
    for (var i = 0; i < servers.length; i++) {
        server = servers[i];
        str += '<option value="' + server.id + '">' + server.name + '</option>';
    }
    $(".private_selected").append(str);
});
//---------创建子网
$(".create_subnetworkOk").click(function() {
    //------子网名称
    var sub_name = $(".createsubnet_name").val();
    //------私有网络ID
    var private_net = $(".private_selected").val();
    //---获取子网的地址
    var object = $(".createradio_subnetaddr:checked");
    var num_1 = object.parent().siblings().eq(0).val();
    var num_2 = object.parent().siblings().eq(2).val();
    var num_3 = object.parent().siblings().eq(4).val();
    var num_4 = object.parent().siblings().eq(6).val();
    var num_5 = object.parent().siblings().eq(8).val();
    var str_ip = num_1 + "." + num_2 + "." + num_3 + "." + num_4 + "/" + num_5;
    //------------开启网关判断
    var gateWay;
    if ($(".subnet_opengateway").prop("checked")) {
        gateWay = $(".creategateway_adrr").val();
    }
    //--------DHCP
    var dhcp;
    if ($(".subnet_openDHCP").prop("checked")) {
        dhcp = true;
    } else {
        dhcp = false;
    }

    //--------数据提交
    var subnet = {
        "subnet": {
            "name": "",
            "network_id": "",
            "ip_version": 4,
            "cidr": "10.0.0.1",
            "gateway_ip": "",
            "enable_dhcp": false,
            "allocation_pools": [],
            "dns_nameservers": []
        }
    }
    var subnetInfo = subnet['subnet'];
    if (sub_name == "") {
        createAndHideAlert("子网名称必填！");
        return;
    }
    subnetInfo.name = sub_name;
    if (private_net == "test") {
        createAndHideAlert("请选择私有网络！");
        return;
    }
    subnetInfo.network_id = private_net;
    subnetInfo.cidr = str_ip;
    if (gateWay == "")
        delete subnetInfo.gateway_ip;
    else
        subnetInfo.gateway_ip = gateWay;
    subnetInfo.enable_dhcp = dhcp;
    //--------地址池
    if ($(".Addrpool").val() != "") {
        var arr = $(".Addrpool").val().split("\n");

        var temp_arr = [];
        var temp;
        var object = { "start": "", "end": "" };
        for (var i = 0; i < arr.length; i++) {
            temp = arr[i].split(",");
            if (temp.length % 2 != 0) {
                createAndHideAlert("地址池起始地址有误！");
                return;
            }
            object.start = temp[0];
            object.end = temp[1];
            temp_arr[i] = object;
        }
        subnetInfo.allocation_pools = temp_arr;
    }
    //--------DNS服务
    if ($(".DNSserver").val() != "") {
        var arr = $(".DNSserver").val().split("\n");
        for (var i = 0; i < arr.length; i++) {
            subnetInfo.dns_nameservers[i] = arr[i];
        }
    }
    createSubnetAJAX(subnet);
});

function createSubnetAJAX(subnet) {
    console.log(JSON.stringify(subnet));
    $.ajax({
        type: "POST",
        data: JSON.stringify(subnet),
        contentType: "application/json",
        url: config['host'] + "/subnet/create?token=" + window.localStorage.token,
        success: function(data) {
            if (JSON.parse(data)['subnet'] == null || JSON.parse(data)['subnet'] == "undefined") {
                console.log(data);
                createAndHideAlert("请检查子网配置格式！");
            } else
                window.location.reload();
        }
    });
}

function setList(data, i, status) {
    var str = "<tbody><tr><td><input type='checkbox' class='net_check' id='" + data.id + "'></td><td><a href='#/net/net-desc?" + i + "&" + status + "id_start" + data.id + "'>" + data.name + "</a></td><td>" + data.subnets + "</td><td>" + (data.shared == false ? '否' : '是') + "</td>" +
        "<td>" + (data.status == 'ACTIVE' ? '运行中' : '未运行') + "</td><td>" + data.admin_state_up +
        "</td><td><div class='btn-group'>" +
        "<button type='button'id='" + data.id + "' name='" + data.name + "' status='" + data.admin_state_up + "' class='btn btn-default btn-sm edite_net_class' data-toggle='modal' data-target='#edite-net'>" + "编辑网络" + "</button>" +
        "<button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>" + "切换下拉菜单" + "</span></button>" +
        "<ul class='dropdown-menu' role='menu'>" +
        "<li class='create_subnet' data-toggle='modal' data-target='#create-subnet'><a href='javascript:void(0)'>" + "增加子网" + "</a></li>" +
        "<li class='deleteNetSimple' id='" + data.id + "'><a href='javascript:void(0)'><font color='red'>" + "删除网络" + "</font></a></li>" +
        "</ul></div></td></tr></tbody>";
    $(".instance_info").append(str);
}
