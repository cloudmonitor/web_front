$(function() {
    if (localStorage.net_tempInfo != null && localStorage.net_tempInfo != "undefined") {
        var networks = JSON.parse(localStorage.net_tempInfo)['networks'];
        localStorage.net = JSON.stringify(networks);
        rount_netInfo(networks);
    } else {
        $.ajax({
            type: "GET",
            url: config["host"] + "/networks?token=" + window.localStorage.token,
            success: function(data) {
                var networks = JSON.parse(data)['networks'];
                localStorage.net = JSON.stringify(networks);
                rount_netInfo(networks);
            },
            error: function() {
                alert("获取网络失败！");
            }
        });
    }
});
var router_len = 0;

//------------创建路由
$(".create_router").click(function() {
    $(".create_router_name").val("");
    $(".outNet_selected").empty();
    $(".outNet_selected").append(' <option value="test" selected>选择外网</option>');
    $.ajax({
        type: "GET",
        url: config["host"] + "/extnet?token=" + window.localStorage.token,
        success: function(data) {
            console.log(data);
            var ext_nets = JSON.parse(data)['ext_net'];
            var str = "";
            for (var i = 0; i < ext_nets.length; i++) {
                str += "<option value='" + ext_nets[i].id + "''>" + ext_nets[i].name + "</option>"
            }
            $(".outNet_selected").append(str);
        }
    });

});

$(".createRouter_OK").click(function() {
    //--------------提交前对数据的处理
    var name = $(".create_router_name").val();
    var status = $(".create_router_status").val();
    var outNet = $(".outNet_selected").val();
    if (name == "" || name == "undefined" || name == null) {
        alert("名称为必填项！");
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
    $.ajax({
        type: "POST",
        data: JSON.stringify(router_create),
        contentType: "application/json",
        url: config["host"] + "/router/create" + "?token=" + window.localStorage.token,
        success: function(data) {
            console.log(data);
            data = JSON.parse(data)['router'];
            console.log(localStorage.net);
            dealRouterInfo(data, JSON.parse(localStorage.net));
            $(".router_tr").remove();
            var footer_str = "<tr class='active tfoot-dsp router_tr'><td colspan='8'>Displaying <span id='item_count'>" + (++router_len) + "</span> items</td></tr>";
            $(".Router_footer").append(footer_str);
        }
    });


});

function rount_netInfo(networks) {
    $.ajax({
        type: "GET",
        url: config["host"] + "/routers?token=" + window.localStorage.token,
        success: function(data) {
            var rounters = JSON.parse(data)['routers'];
            for (var i = 0; i < rounters.length; i++) {
                var rounter = rounters[i];
                dealRouterInfo(rounter, networks);
            }
            router_len = rounters.length;
            var footer_str = "<tr class='active tfoot-dsp router_tr'><td colspan='8'>Displaying <span id='item_count'>" + router_len + "</span> items</td></tr>";
            $(".Router_footer").append(footer_str);

        }
    });
}

function dealRouterInfo(rounter, networks) {
    //---管理员状态
    if (rounter.admin_state_up == true)
        rounter.admin_state_up = "上";
    else
        rounter.admin_state_up = "下";
    //---外部网络
    if (rounter.external_gateway_info != null && rounter.external_gateway_info != "") {
        for (var j = 0; j < networks.length; j++) {
            if (networks[j].id == rounter.external_gateway_info.network_id) {
                setList(rounter, networks[j].name);
            }
        }
    } else {
        setList(rounter, "-");
    }
}

function setList(data, out_net) {
    var str = "<tr><td><input type='checkbox'></td><td><a href='#'>" + data.name + "</a></td><td>" + data.status + "</td><td>" + out_net + "</td>" +
        "<td>" + data.admin_state_up +
        "</td><td><div class='btn-group'><button type='button' class='btn btn-default btn-sm'>" +
        "创建快照" +
        "</button><button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>" +
        "切换下拉菜单" + "</span></button><ul class='dropdown-menu' role='menu'><li><a href='#'>" +
        "功能" + "</a></li><li><a href='#'>" + "另一个功能" + "</a></li><li><a href='#'>" + "其他" +
        "</a></li></ul></div></td></tr>";
    $(".rounter_info").append(str);
}
