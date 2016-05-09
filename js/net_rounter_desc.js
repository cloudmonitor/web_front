var portList_len = 0;
var routerTable_len = 0;
$(function() {
    //------------------概况start
    var id_extNet = window.location.href.split("?")[1];
    var id = id_extNet.split("&")[0];
    var extNet_temp = id_extNet.split("&")[1];
    var cur_router;
    $.ajax({
        type: "GET",
        url: config["host"] + "/routers?token=" + window.localStorage.token,
        success: function(data) {
            // console.log("", data);
            var rounters = JSON.parse(data)['routers'];
            for (var i = 0; i < rounters.length; i++) {
                if (rounters[i].id == id) {
                    cur_router = rounters[i];
                    break;
                }
            }
            //console.log(JSON.stringify(cur_router));
            $(".routerDesc_name").text(cur_router.name);
            $(".routerDesc_id").text(cur_router.id);
            $(".routerDesc_proId").text(cur_router.tenant_id);
            $(".routerDesc_status").text(cur_router.status ? "运行中" : "未运行");
            $(".routerDesc_managerStatus").text(cur_router.admin_state_up ? "激活" : "未激活");
            var extgatewall_info = cur_router.external_gateway_info;
            if (cur_router.external_gateway_info == null) {
                $(".extnet_table").hide();
                $(".delNetDiv").hide();
            } else {
                $(".setNetDiv").hide();
                //console.log(JSON.stringify(extgatewall_info));
                $(".extnet_tr").remove();
                $(".extnet_netname").text(extNet_temp);
                $(".extnet_netid").text(extgatewall_info.network_id);
                var ext_fixedIp = extgatewall_info.external_fixed_ips;
                var str = "<b>子网ID</b>";
                if (ext_fixedIp.length == 0) {
                    $(".extnet_extfixIP").text("无");
                } else {
                    // console.log(ext_fixedIp);
                    for (var i = 0; i < ext_fixedIp.length; i++) {
                        str += ext_fixedIp[i]['subnet_id'] + "<br/><b>IP 地址</b>" + ext_fixedIp[i]['ip_address'];
                    }
                    $(".extnet_extfixIP").append(str);
                }
                $(".extnet_snat").text(extgatewall_info.enable_snat ? "激活" : "未激活");
            }
            //------------------接口start
            $.ajax({
                type: "GET",
                url: config["host"] + "/router_ports/" + $(".routerDesc_id").text() + "?token=" + window.localStorage.token,
                success: function(data) {
                    localStorage.portInfos = data;
                    var ports = JSON.parse(data)['ports'];
                    for (var i = 0; i < ports.length; i++) {
                        var port = ports[i];
                        sertPortList(port);
                    }
                    portList_len = ports.length;
                    var footerStr = '<tr class="active tfoot-dsp">' +
                        '<td colspan="8">Displaying <span id="item_count">' + portList_len + '</span> items</td></tr>';
                    $(".port_footer").append(footerStr);
                }
            });
            //------------------接口end
            //------------------静态路由表start
            localStorage.routerTable = JSON.stringify(cur_router.routes);
            var routes = cur_router.routes;
            if (routes.length == 0) {
                $('.deleteRouteTables').hide();
                $('.routerTables_check').hide();
            }
            for (var i = 0; i < routes.length; i++) {
                var route = routes[i];
                sertrouterTableList(route);
            }
            routerTable_len = routes.length;
            var footerStr = '<tr class="active tfoot-dsp">' +
                '<td colspan="8">Displaying <span id="item_count">' + routerTable_len + '</span> items</td></tr>';
            $(".static_routerTable_footer").append(footerStr);
            //------------------静态路由表end
        }
    });
    //------------------概况end

    //-----------------设置网关start
    var router_id;
    $(".setExtNet").unbind('click').click(function() {
        $(".router_id").val("");
        $(".router_name").val("");
        $(".setoutNetdesc_selected").empty();
        $(".setoutNetdesc_selected").append(' <option value="test" selected>选择网络</option>');
        $.ajax({
            type: "GET",
            url: config["host"] + "/extnet?token=" + window.localStorage.token,
            success: function(data) {
                var ext_nets = JSON.parse(data)['ext_net'];
                var str = "";
                for (var i = 0; i < ext_nets.length; i++) {
                    str += "<option value='" + ext_nets[i].id + "''>" + ext_nets[i].name + "</option>"
                }
                $(".setoutNetdesc_selected").append(str);
                $(".router_iddesc").val($(".routerDesc_id").text());
                $(".router_namedesc").val($(".routerDesc_name").text());
                router_id = $(".routerDesc_id").text();
            }
        });
    });
    $(document).on('click', ".setExtNetdesc_ok", function() {
        var router_temp = {
            "router": {
                "external_gateway_info": {
                    "network_id": null
                }
            }
        };
        var router = router_temp['router'];
        if ($(".setoutNetdesc_selected").val() != "test")
            router['external_gateway_info']['network_id'] = $(".setoutNetdesc_selected").val();
        else {
            createAndHideAlert("请选择外部网络！！！");
            return;
        }
        $.ajax({
            type: "POST",
            data: JSON.stringify(router_temp),
            contentType: "application/json",
            url: config["host"] + "/router/update/" + router_id + "?token=" + window.localStorage.token,
            success: function(data) {
                console.log(data);
                window.location.href = "#/net/router";
            }
        });
    });
    //-----------------设置网关end
    //------------------编辑路由start
    //-----------编辑路由
    $(document).on('click', ".edit_routerdesc", function() {
        router_id = $(".routerDesc_id").text();
        $(".edit_routerdesc_id").val(router_id);
        $(".edit_routerdesc_name").val($(".routerDesc_name").text());
        // createAndHideAlert($(".routerDesc_managerStatus").text());
        if ($(".routerDesc_managerStatus").text() == "激活") {
            $(".managerStatusdesc_selected option[value='up']").attr("selected", true);
        } else {
            $(".managerStatusdesc_selected option[value='down']").attr("selected", true);
        }
    });
    $(".editRouterdesc_ok").click(function() {
        var router_temp = {
            "router": {
                "name": "",
                "admin_state_up": true
            }
        };
        var router = router_temp['router'];
        router.name = $(".edit_routerdesc_name").val();
        if ($(".managerStatusdesc_selected").val() == "up")
            router.admin_state_up = true;
        else
            router.admin_state_up = false;
        $.ajax({
            type: "POST",
            data: JSON.stringify(router_temp),
            contentType: "application/json",
            url: config["host"] + "/router/update/" + router_id + "?token=" + window.localStorage.token,
            success: function(data) {
                window.location.reload();
            }
        });
    });
    //------------------编辑路由end
});

//---------添加接口
$(".addport").click(function() {
    $(".inteface_id").val($(".routerDesc_id").text());
    $(".inteface_name").val($(".routerDesc_name").text());
    $(".port_subNetselected").empty();
    $.ajax({
        type: "GET",
        url: config["host"] + "/routers/disconnect_subnet?token=" + window.localStorage.token,
        success: function(data) {
            var subnets = JSON.parse(data)['subnets'];
            if (subnets.length == 0)
                $(".port_subNetselected").append('<option>没有可用的子网</option>');
            else {
                $(".port_subNetselected").append('<option value="test">选择子网</option>');
            }
            $.ajax({
                type: "GET",
                url: config["host"] + "/networks?token=" + window.localStorage.token,
                success: function(data) {
                    var networks = JSON.parse(data)['networks'];
                    for (var i = 0; i < subnets.length; i++) {
                        var subnet = subnets[i];
                        var port_name = subnet.name;
                        var port_cidr = subnet.cidr;
                        var net_id = subnet.network_id;
                        var net_name = "";
                        for (var j = 0; j < networks.length; j++) {
                            if (net_id == networks[j].id) {
                                net_name = networks[j].name;
                                break;
                            }
                        }
                        var option = '<option value="' + subnet.id + '">' + net_name + ':' + port_cidr + "(" + port_name + ")" + '</option>'
                        $(".port_subNetselected").append(option);
                    }
                }
            });
        }
    });
});
$(".addInteface_OK").click(function() {
    router_id = $(".routerDesc_id").text();
    var port_create = {
        "subnet_id": ""
    }
    if ($(".port_subNetselected").val() != "test") {
        port_create.subnet_id = $(".port_subNetselected").val();
        $.ajax({
            type: "POST",
            data: JSON.stringify(port_create),
            contentType: "application/json",
            url: config["host"] + "/router/" + router_id + "/add_router_interface?token=" + window.localStorage.token,
            success: function(data) {
                location.reload();
            }
        });
    } else {
        createAndHideAlert("子网字段必选！");
    }

});
//----------------全选的控制
$(document).on("change", ".all_check", function() {
    var isChecked = $(this).prop("checked");
    $(".port_check").prop("checked", isChecked);
    if (isChecked) {
        $(".deleteport").attr("disabled", false);
    } else {
        $(".deleteport").attr("disabled", true);
    }
});
//---------删除接口
$(document).on("change", ".port_check", function() {
    if ($(".port_check:checked").length == $(".port_check").length) {
        $(".deleteport").attr("disabled", false);
        $(".all_check").prop("checked", true);
    } else if ($(".port_check:checked").length > 0) {
        $(".deleteport").attr("disabled", false);
        $(".all_check").prop("checked", false);
    } else {
        $(".deleteport").attr("disabled", true);
        $(".all_check").prop("checked", false);
    }
});
//-----多删
$(".deleteport").click(function() {
    var i = 0;
    var router_ports = {
        "router_ports": [{
            "subnet_id": "a2f1f29d-571b-4533-907f-5803ab96ead1"
        }, {
            "subnet_id": "a2f1f29d-571b-4533-907f-5803ab96ead1"
        }]
    }
    $(".port_check:checked").each(function() {
        router_ports['router_ports'][i++]['subnet_id'] = $(this).attr("id");
    });

    deleteAjax(router_ports);
});
//----单删
$(document).on("click", ".deletePortSimple", function() {
    var router_ports = {
        "router_ports": [{
            "subnet_id": "a2f1f29d-571b-4533-907f-5803ab96ead1"
        }]
    }
    router_ports['router_ports'][0]['subnet_id'] = $(this).attr("id");
    deleteAjax(router_ports);
});

function deleteAjax(data) {
    router_id = $(".routerDesc_id").text();
    console.log(JSON.stringify(data));
    $.ajax({
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        url: config["host"] + "/router/" + router_id + "/remove_router_interface?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });
}

function sertPortList(data) {
    var str = '<tr>' +
        '<td><input type="checkbox" class="port_check" id="' + data['fixed_ips'][0]['subnet_id'] + '"></td>' +
        '<td><a href="#/net/port-desc?' + data.id + '">' + (data.name == "" ? "(" + data.id.substr(0, 13) + ")" : data.name) + '</a></td>' +
        '<td>' + data.fixed_ips[0].ip_address + '</td>' +
        '<td>' + (data.status == "ACTIVE" ? "运行中" : "未运行") + '</td>' +
        '<td>' + (data['binding:vnic_type'] == 'normal' ? "内部接口" : "外部接口") + '</td>' +
        '<td>' + (data.admin_state_up ? "激活" : "未激活") + '</td>' +
        '<td>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn-default btn-sm btn-danger deletePortSimple" id="' + data['fixed_ips'][0]['subnet_id'] + '">删除接口</button>' +
        '</div>' +
        '</td>' +
        '</tr>';

    $(".port_descbody").append(str);
}
//------------清除网关
$(document).on('click', ".delExtNetdesc", function() {
    router_id = $(".routerDesc_id").text();
    if (confirm("确定清除网关？") == true) {
        var router_temp = {
            "router": {
                "external_gateway_info": null
            }
        };
        $.ajax({
            type: "POST",
            data: JSON.stringify(router_temp),
            contentType: "application/json",
            url: config["host"] + "/router/update/" + router_id + "?token=" + window.localStorage.token,
            success: function(data) {
                window.location.reload();
            }
        });
    }
});

//------单删
$(document).on('click', ".delete_routerdescSimple", function() {
    var id = $(".routerDesc_id").text();
    var json_array = '{"router_ids":["' + id + '"]}';
    deleteAjax_routerInfo(json_array);
});

function deleteAjax_routerInfo(json_array) {
    console.log(json_array);
    $.ajax({
        type: "POST",
        data: json_array,
        contentType: "application/json",
        url: config["host"] + "/router/delete?token=" + window.localStorage.token,
        success: function(data) {
            window.location.href = "#/net/router";
        },
        error: function(data) {
            createAndHideAlert("error!");
        }
    });
}

//---------------静态路由表
function sertrouterTableList(data) {
    var str = '<tr>' +
        '<td><input type="checkbox" class="routerTable_check" id="' + data.nexthop + '"></td>' +
        '<td>' + data.destination + '</td>' +
        '<td>' + data.nexthop + '</td>' +
        '<td>' +
        '<button type="button" class="btn btn-danger delete_simpleRouter" id="' + data.nexthop + '" >' +
        '删除静态路由表</button>' +
        '</td>' +
        '</tr>';

    $(".static_routerTable_body").append(str);
}
//----------------全选的控制
$(document).on("change", ".routerTables_check", function() {
    var isChecked = $(this).prop("checked");
    $(".routerTable_check").prop("checked", isChecked);
    if (isChecked) {
        $(".deleteRouteTables").attr("disabled", false);
    } else {
        $(".deleteRouteTables").attr("disabled", true);
    }
});
//---------删除接口
$(document).on("change", ".routerTable_check", function() {
    if ($(".routerTable_check:checked").length == $(".routerTable_check").length) {
        $(".deleteRouteTables").attr("disabled", false);
        $(".routerTables_check").prop("checked", true);
    } else if ($(".routerTable_check:checked").length > 0) {
        $(".deleteRouteTables").attr("disabled", false);
        $(".routerTables_check").prop("checked", false);
    } else {
        $(".deleteRouteTables").attr("disabled", true);
        $(".routerTables_check").prop("checked", false);
    }
});
$('.addRouterTable').click(function() {
    $('.dst_CIDR').val("");
    $('.next_dst').val("");

});
$(".createRouteTable_OK").click(function() {
    router_id = $(".routerDesc_id").text();
    var val1 = $('.dst_CIDR').val();
    var val2 = $('.next_dst').val();
    var routerTables = JSON.parse(localStorage.routerTable);
    if (val1 == '' || val2 == "") {
        createAndHideAlert("目的CIDR和下一跳都是必填项!");
        return false;
    }
    var router_new = { "destination": val1, "nexthop": val2 };
    var router_temp = {
        "router": {
            "routes": []
        }
    };
    var len = routerTables.length;
    if (len != 0) {
        router_temp.router.routes = routerTables;
        router_temp.router.routes[len] = router_new;
    } else {
        router_temp.router.routes[0] = router_new;
    }
    $.ajax({
        type: "POST",
        data: JSON.stringify(router_temp),
        contentType: "application/json",
        url: config["host"] + "/router/update/" + router_id + "?token=" + window.localStorage.token,
        success: function(data) {
            if (data.NeutronError != undefined) {
                createAndHideAlert("无效的路由格式！");
                return false;
            } else {
                localStorage.routerTable = JSON.stringify(JSON.parse(data)['router']['routes']);
                $(".static_routerTable_body").empty();
                var data = JSON.parse(data)['router']['routes'];
                if (routerTable_len == 0) {
                    $('.deleteRouteTables').show();
                    $('.routerTables_check').show();
                }
                for (var i = 0; i < data.length; i++)
                    sertrouterTableList(data[i]);
                routerTable_len++;
                var footerStr = '<tr class="active tfoot-dsp">' +
                    '<td colspan="8">Displaying <span id="item_count">' + routerTable_len + '</span> items</td></tr>';
                $(".static_routerTable_footer").empty();
                $(".static_routerTable_footer").append(footerStr);
            }

        }
    });
});
$(".deleteRouteTables").click(function() {
    var routerTables = JSON.parse(localStorage.routerTable);
    var ids = [];
    var index = 0;
    $(".routerTable_check:checked").each(function() {
        ids[index++] = $(this).attr('id');
    });
    var router_temp = {
        "router": {
            "routes": []
        }
    };
    var new_len = 0;
    router_id = $(".routerDesc_id").text();
    for (var i = 0; i < routerTables.length; i++) {
        var table = routerTables[i];
        for (var j = 0; j < ids.length; j++) {
            if (table.nexthop == ids[j]) {
                continue;
            }
            router_temp['router']['routes'][new_len++] = routerTables[i];
        }
    }
    console.error("删除后", JSON.stringify(router_temp));
    $.ajax({
        type: "POST",
        data: JSON.stringify(router_temp),
        contentType: "application/json",
        url: config["host"] + "/router/update/" + router_id + "?token=" + window.localStorage.token,
        success: function(data) {
            console.error(data);
            if (data.NeutronError != undefined) {
                createAndHideAlert("无效的路由格式！");
                return false;
            } else {
                localStorage.routerTable = JSON.stringify(JSON.parse(data)['router']['routes']);
                $(".static_routerTable_body").empty();
                var data = JSON.parse(data)['router']['routes'];
                if (routerTable_len == 0) {
                    $('.deleteRouteTables').show();
                    $('.routerTables_check').show();
                }
                for (var i = 0; i < data.length; i++)
                    sertrouterTableList(data[i]);
                routerTable_len -= ids.length;
                var footerStr = '<tr class="active tfoot-dsp">' +
                    '<td colspan="8">Displaying <span id="item_count">' + routerTable_len + '</span> items</td></tr>';
                $(".static_routerTable_footer").empty();
                $(".static_routerTable_footer").append(footerStr);
            }
        }
    });
});
$(document).on("click", ".delete_simpleRouter", function() {
    var routerTables = JSON.parse(localStorage.routerTable);
    var id = $(this).attr('id');
    var router_temp = {
        "router": {
            "routes": []
        }
    };
    var new_len = 0;
    router_id = $(".routerDesc_id").text();
    for (var i = 0; i < routerTables.length; i++) {
        var table = routerTables[i];
        if (table.nexthop == id) {
            continue;
        }
        router_temp['router']['routes'][new_len++] = routerTables[i];
    }
    console.error("删除后", JSON.stringify(router_temp));
    $.ajax({
        type: "POST",
        data: JSON.stringify(router_temp),
        contentType: "application/json",
        url: config["host"] + "/router/update/" + router_id + "?token=" + window.localStorage.token,
        success: function(data) {
            console.error(data);
            if (data.NeutronError != undefined) {
                createAndHideAlert("无效的路由格式！");
                return false;
            } else {
                localStorage.routerTable = JSON.stringify(JSON.parse(data)['router']['routes']);
                $(".static_routerTable_body").empty();
                var data = JSON.parse(data)['router']['routes'];
                if (routerTable_len == 0) {
                    $('.deleteRouteTables').show();
                    $('.routerTables_check').show();
                }
                for (var i = 0; i < data.length; i++)
                    sertrouterTableList(data[i]);
                routerTable_len--;
                var footerStr = '<tr class="active tfoot-dsp">' +
                    '<td colspan="8">Displaying <span id="item_count">' + routerTable_len + '</span> items</td></tr>';
                $(".static_routerTable_footer").empty();
                $(".static_routerTable_footer").append(footerStr);
            }
        }
    });
});
