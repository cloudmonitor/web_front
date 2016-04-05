var portList_len = 0;
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
           // console.log(data);
            var rounters = JSON.parse(data)['routers'];
            for (var i = 0; i < rounters.length; i++) {
                if (rounters[i].id == id) {
                    cur_router = rounters[i];
                }
            }
            //console.log(JSON.stringify(cur_router));
            $(".routerDesc_name").text(cur_router.name);
            $(".routerDesc_id").text(cur_router.id);
            $(".routerDesc_proId").text(cur_router.tenant_id);
            $(".routerDesc_status").text(cur_router.status ? "运行中" : "未运行");
            $(".routerDesc_managerStatus").text(cur_router.admin_state_up ? "上" : "下");
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
                   // console.log(data);
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
        }
    });
    //------------------概况end

    //-----------------设置网关start
    var router_id;
    $(".setExtNet").click(function() {
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
            alert("请选择外部网络！！！");
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
        // alert($(".routerDesc_managerStatus").text());
        if ($(".routerDesc_managerStatus").text() == "上") {
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
        url: config["host"] + "/router_ports/" + $(".routerDesc_id").text() + "?token=" + window.localStorage.token,
        success: function(data) {
          console.log(data);
          
        }
    });

});
$(".addInteface_OK").click(function() {

    var port_create = {
        "port": {
            "network_id": "a87cc70a-3e15-4acf-8205-9b711a3531b7",
            "name": "private-port",
            "admin_state_up": true
        }
    }

    $.ajax({
        type: "POST",
        data: JSON.stringify(port_create),
        contentType: "application/json",
        url: config["host"] + "/router/"++"/add_router_interface?token=" + window.localStorage.token,
        success: function(data) {

        }
    });
});
//---------删除接口
$(document).on("change", ".port_check", function() {
    if ($(".port_check:checked").length != 0) {
        $(".deleteport").attr("disabled", false);
    } else {
        $(".deleteport").attr("disabled", true);
    }
});
//-----多删
$(".deleteport").click(function() {
    var port_ids = [];
    var i = 0;
    $(".port_check:checked").each(function() {
        port_ids[i++] = $(this).attr("id");
    });
    deleteAjax("'" + port_ids + "'");
});
//----单删
$(document).on("click", ".deletePortSimple", function() {
    deleteAjax("['" + $(this).attr("id") + "']");
});

function deleteAjax(data) {
    $.ajax({
        type: "POST",
        data: data,
        contentType: "application/json",
        url: config["host"] + "/router/"++"/remove_router_interface?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });
}

function sertPortList(data) {
    var str = '<tr>' +
        '<td><input type="checkbox" class="port_check" id="' + data.id + '"></td>' +
        '<td><a href="network_firewall_strategy_desc.html">' + (data.name == "" ? "(" + data.id.substr(0, 13) + ")" : data.name) + '</a></td>' +
        '<td>' + data.fixed_ips[0].ip_address + '</td>' +
        '<td>' + (data.status == "ACTIVE" ? "运行中" : "未运行") + '</td>' +
        '<td>' + (data['binding:vnic_type'] == 'normal' ? "内部接口" : "外部接口") + '</td>' +
        '<td>' + (data.admin_state_up ? "上" : "下") + '</td>' +
        '<td>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn-default btn-sm btn-danger deletePortSimple" id="' + data.id + '">删除接口</button>' +
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
            alert("error!");
        }
    });
}
