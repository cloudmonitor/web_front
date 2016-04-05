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
        $(".edit_router_id").val(router_id);
        $(".edit_router_name").val($(".routerDesc_name").text());
        if (infos[1] == "上")
            $(".managerStatus_selected option[value='up']").attr("selected");
        else
            $(".managerStatus_selected option[value='down']").attr("selected");
    });
    $(".editRouter_ok").click(function() {
        var router_temp = {
            "router": {
                "name": "",
                "admin_state_up": true
            }
        };
        var router = router_temp['router'];
        router.name = $(".edit_router_name").val();
        if ($(".managerStatus_selected").val() == "up")
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
