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
//0-32  16-31
//------------创建网络面板的控制--start
$(".create_networkCancel").click(function() {
    if (!flag) {
        $(".info_pic").removeClass("fa fa-angle-double-up");
        $(".info_pic").addClass("fa fa-angle-double-down");
        $(".subnet_multi").slideToggle();
        flag = true;
    }
    $("createnetwork_name").val("");
    $("subnet_name").val("");
    $(".subnet_check").prop("checked", true);
    $(".subnet_mangerStatuscheck").prop("checked", true);
});
//--------是否显示子网详细
var flag = true;
$(".choose_subnet").click(function() {
    $(".subnet_multi").slideToggle();
    if (flag) {
        $(".info_pic").removeClass("fa fa-angle-double-down");
        $(".info_pic").addClass("fa fa-angle-double-up");
        flag = false;
    } else {
        $(".info_pic").removeClass("fa fa-angle-double-up");
        $(".info_pic").addClass("fa fa-angle-double-down");
        flag = true;
    }
});
//-------是否显示子网
$(".subnet_check").change(function() {
    if ($(".subnet_check").is(":checked")) {
        $(".subNet_infos").fadeToggle();
    } else {
        $(".subNet_infos").fadeToggle();
    }
});

//------------创建网络面板的控制--end
//-------------创建网络
$(".create_networkOk").click(function() {
    var network_json;
    var net_managerStatus;
    var net_name = $(".createnetwork_name").val();
    if ($(".subnet_mangerStatuscheck").prop("checked"))
        net_managerStatus = true;
    else
        net_managerStatus = false;
    if (!$(".subnet_check").prop("checked")) {
        var network = [{
            "network": {
                "name": "",
                "admin_state_up": true
            }
        }];
        if (net_name != "")
            network[0]['network'].name = net_name;
        network[0]['network'].admin_state_up = net_managerStatus;
        createNetAjax(network);
    } else {
        var netWork_info = [{
            "network": {
                "name": "",
                "admin_state_up": true
            }
        }, {
            "subnet": {
                "name": "",
                "ip_version": 4,
                "cidr": ""
            }
        }];
        var network = netWork_info[0]['network'];
        var subnet = netWork_info[1]['subnet'];
        if (net_name != "")
            network.name = net_name;
        else
            network.name="";
        network.admin_state_up = net_managerStatus;
        //--------校验子网信息
        var subnet_name = $(".subnet_name").val();
        //---获取子网的地址
        var object = $(".radio_subnetaddr:checked");
        console.log($(".radio_subnetaddr:checked"));
        var num_1 = object.parent().siblings().eq(0).val();
        var num_2 = object.parent().siblings().eq(2).val();
        var num_3 = object.parent().siblings().eq(4).val();
        var num_4 = object.parent().siblings().eq(6).val();
        var num_5 = object.parent().siblings().eq(8).val();
        var str_ip = num_1 + "." + num_2 + "." + num_3 + "." + num_4 + "/" + num_5;
        subnet.name = subnet_name;
        subnet.cidr = str_ip;
        if (subnet_name == "") {
            alert("请填写子网名称和地址！");
        } else {
            createNetAjax(netWork_info);
        }
    }
});

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
