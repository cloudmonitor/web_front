var net_len = 0;
$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/subnets?token=" + window.localStorage.token,
        success: function(data) {
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
                            server.admin_state_up = "上";
                        else
                            server.admin_state_up = "下";
                        //----子网
                        var sub_str = "";
                        var subnets = server['subnets'];
                        //console.log(subnets + "=====" + i);
                        var subnet_Info = "[";
                        for (var j = 0; j < subnets.length; j++) {
                            // alert(subnets.length);
                            for (var k = 0; k < subnet_infos.length; k++) {
                                //alert(subnets[i]+"=="+subnet_infos[j].id);
                                if (subnets[j] == subnet_infos[k].id) {
                                    // alert(subnets[i]);
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
                },
                error: function(data) {
                    alert("信息获取失败！");
                }
            });
        },
        error: function(data) {
            alert("配置获取失败！");
        }
    });

});
//-------------创建网络
$(".create_networkCancel").click(function() {
    $(".Createnetwork_name").val("");
});
$(".create_networkOk").click(function() {
    var network_json;
    var net_name = $(".Createnetwork_name").val();
    var net_managerStatus = $(".Createnetwork_managerStatus").val();
    alert($(".create_subnetwork").prop("checked"));
    if (!$(".create_subnetwork").prop("checked")) {
        var network = {
            "network": {
                "name": "",
                "admin_state_up": true
            }
        };
        if (net_name != "")
            network['network'].name = net_name;
        network['network'].admin_state_up = net_managerStatus == "up" ? true : false;
        network_json = "[" + JSON.stringify(network) + "]";
        createNetAjax(network_json);
    } else {
        var netWork_info = [{
            "network": {
                "name": "",
                "admin_state_up": true
            }
        }, {
            "subnet": {
                "network_id": "d32019d3-bc6e-4319-9c1d-6722fc136a22",
                "ip_version": 4,
                "cidr": "10.0.0.1"
            }
        }];
        var network = netWork_info[0]['network'];
        var subnet = netWork_info[1]['subnet'];
        if (net_name != "")
            network.name = net_name;
        network.admin_state_up = net_managerStatus == "up" ? true : false;
        //--------校验子网信息
        var subnet_name = $(".createSubnet_name").val();
        var subnet_addr = $(".createSubnet_addr").val();
        var subnet_IPselected = $(".createSubnet_IPselected").val();
        if (!$(".createSubnet_gatewallDisabled").is(":checked"))
            var subnet_name = $(".createSubnet_gateWayIP").val();
        if (subnet_name == "" || subnet_addr == "") {
            alert("名称和地址为必填项！");
        } else {

        }

    }
});

function createNetAjax(network_json) {
    $.ajax({
        type: "POST",
        data: network_json,
        contentType: "application/json",
        url: config['host'] + "/network/create?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });
}
//--------------删除
$(document).on("change", ".net_check", function() {
    if ($(".net_check:checked").length > 0) {
        $(".delete_nets").attr("disabled", false);
    } else {
        $(".delete_nets").attr("disabled", true);
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
    $(".editenetwork_managerStatus option[value='" + ($(this).attr("status") == "上" ? "up" : "down") + "']").attr('selected', true);
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
    updateNetAjax(net,id)
});

function updateNetAjax(net,id) {
    $.ajax({
        type: "POST",
        data: JSON.stringify(net),
        contentType: "application/json",
        url: config['host'] + "/network/update/"+id+"?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });
}


function setList(data, i, status) {
    var str = "<tbody><tr><td><input type='checkbox' class='net_check' id='" + data.id + "'></td><td><a href='#/net/net-desc?" + i + "&" + status + "'>" + data.name + "</a></td><td>" + data.subnets + "</td><td>" + data.shared + "</td>" +
        "<td>" + data.status + "</td><td>" + data.admin_state_up +
        "</td><td><div class='btn-group'>" +
        "<button type='button'id='" + data.id + "' name='" + data.name + "' status='" + data.admin_state_up + "' class='btn btn-default btn-sm edite_net_class' data-toggle='modal' data-target='#edite-net'>" + "编辑网络" + "</button>" +
        "<button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>" + "切换下拉菜单" + "</span></button>" +
        "<ul class='dropdown-menu' role='menu'>" +
        "<li><a href='javascript:void(0)'>" + "增加子网" + "</a></li>" +
        "<li class='deleteNetSimple' id='" + data.id + "'><a href='javascript:void(0)'><font color='red'>" + "删除网络" + "</font></a></li>" +
        "</ul></div></td></tr></tbody>";
    $(".instance_info").append(str);
}
