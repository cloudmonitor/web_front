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

//------------------------------------创建路由----start
$(".create_router").click(function() {
    $(".create_router_name").val("");
    $(".outNet_selected").empty();
    $(".outNet_selected").append(' <option value="test" selected>选择网络</option>');
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
//------------------------------------创建路由----end
//------------------------------------删除路由-----start
$(document).on('change', ".router_check", function() {
    if ($(".router_check:checked").length == 0)
        $(".delete_router").attr("disabled", true);
    else
        $(".delete_router").attr("disabled", false);
});
//--------多删
$(".delete_router").click(function() {
    var json_array = '{"router_ids":[';
    $(".router_check:checked").each(function() {
        if (json_array != '{"router_ids":[')
            json_array += ',"' + $(this).attr("id") + '"';
        else
            json_array += '"' + $(this).attr("id") + '"';
    });
    json_array += "]}";
    deleteAjax_routerInfo(json_array);
});
//------单删
$(document).on('click', ".delete_routerSimple", function() {
    var id = $(this).attr("id");
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
            console.log(data);
            var id_status = JSON.parse(data);
            for (var x in id_status) {
                if (id_status[x] == 204) {
                    alert(x + "删除成功！");
                    $(".router_tr").remove();
                    $("#" + x + "").parent().parent().remove();
                    var footer_str = "<tr class='active tfoot-dsp router_tr'><td colspan='8'>Displaying <span id='item_count'>" + (--router_len) + "</span> items</td></tr>";
                    $(".Router_footer").append(footer_str);
                } else
                    alert(x + "删除失败");
            }
        },
        error: function(data) {
            alert("error!");
        }
    });
}
//------------------------------------删除路由-----end
//----------------设置网关
var router_id;
$(document).on('click', ".setExtNet", function() {
    router_id = $(this).attr("id");
    $(".setoutNet_selected").empty();
    $(".setoutNet_selected").append(' <option value="test" >选择网络</option>');
    $.ajax({
        type: "GET",
        url: config["host"] + "/extnet?token=" + window.localStorage.token,
        success: function(data) {
            console.log(data);
            var ext_nets = JSON.parse(data)['ext_net'];
            var str = "";
            for (var i = 0; i < ext_nets.length; i++) {
                str += "<option name='" + ext_nets[i].name + "' value='" + ext_nets[i].id + "''>" + ext_nets[i].name + "</option>"
            }
            $(".setoutNet_selected").append(str);
        }
    });
    $(".router_name").val($(this).attr("name"));
    $(".router_id").val($(this).attr("id"));
});
$(document).on('click', ".addExtNet_ok", function() {
    var router_temp = {
        "router": {
            "external_gateway_info": {
                "network_id": null
            }
        }
    };
    var router = router_temp['router'];
    if ($(".setoutNet_selected").val() != "test")
        router['external_gateway_info']['network_id'] = $(".setoutNet_selected").val();
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
            var name = $(".setoutNet_selected").find("option:selected").text();
            $("td[id='" + router_id + "']").text(name);
        }
    });
});
//------------清除网关
$(document).on('click', ".delExtNet", function() {
    router_id = $(this).attr("id");
    if (confirm("确定清除网关？")) {
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
//-----------编辑路由
$(document).on('click', ".edit_router", function() {
    router_id = $(this).attr("id");
    $(".edit_router_id").val($(this).attr("id"));
    var infos = $(this).attr("name").split(":");
    $(".edit_router_name").val(infos[0]);
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

function setList(data, out_net) {
    var str = "<tr><td><input type='checkbox' class='router_check' id='" + data.id + "'></td>" +
        "<td><a href='#'>" + data.name + "</a></td>" +
        "<td>" + data.status + "</td>" +
        "<td id='" + data.id + "'>" + out_net + "</td>" +
        "<td>" + data.admin_state_up +
        "</td><td><div class='btn-group'>";
    if (out_net != "-")
        str += "<button type='button' id='" + data.id + "' class='btn btn-default btn-sm delExtNet' style='background:#CD3333'><font color='white'>清除网关</font>";
    else
        str += "<button type='button' id='" + data.id + "' name='" + data.name + "' class='btn btn-default btn-sm setExtNet'  data-toggle='modal' data-target='#modal_edit_extNet'>设置网关";
    str += "</button><button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>" +
        "切换下拉菜单" + "</span></button>" +
        "<ul class='dropdown-menu' role='menu'>" +
        "<li class='edit_router' id='" + data.id + "' name='" + data.name + ":" + data.admin_state_up + "' data-toggle='modal' data-target='#modal_edit_router'><a href='javascript:void(0)'>" + "编辑路由" + "</a></li>" +
        "<li class='delete_routerSimple' id='" + data.id + "'><a href='javascript:void(0)'>" + "<font color='red'>删除路由</font>" + "</a></li>" +
        "</ul></div></td></tr>";
    $(".rounter_info").append(str);
}

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
    //----名称的处理
    if(rounter.name=="")
        rounter.name="("+rounter.id.substr(0,13)+")";
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
