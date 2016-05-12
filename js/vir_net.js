var port_len = 0;
$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/server_ports?token=" + window.localStorage.token,
        success: function(data) {
            // console.error(data);
            var ports = JSON.parse(data)['ports'];
            // console.error(data);
            for (var i = 0; i < ports.length; i++) {
                var port = ports[i];

                setVirNetInfo(port);
            }
            port_len = ports.length;
            $('.virNet_num').text(" " + port_len + " ");
        }
    });
    $.ajax({
        type: "GET",
        url: config["host"] + "/networks?token=" + window.localStorage.token,
        success: function(data) {
            localStorage.networksInfos = data;
        }
    });
    $.ajax({
        type: "GET",
        url: config["host"] + "/instances?token=" + window.localStorage.token,
        success: function(data) {
            localStorage.instanceInfos = data;
        }
    });
});

//---------创建虚拟网卡start
$('.create_virNet').unbind('click').on('click', function() {
    $('#interface-name').val('');
    $('#subnet-set').empty();
    $('#ip-address').val('');
    $('#ip-address').attr('placeholder', "如不填系统会自动分配");
    $('#sec-group').empty();
    $.ajax({
        type: "GET",
        url: config["host"] + "/subnets?token=" + window.localStorage.token,
        success: function(data) {
            var subnets = JSON.parse(data)['subnets'];
            var str = '<option value="test">请选择一个子网</option>';
            for (var i = 0; i < subnets.length; i++) {
                str += '<option value="' + subnets[i].id + '">' + subnets[i].name + '</option>';
            }
            $('#subnet-set').html(str);

        }
    });
    $.ajax({
        type: "GET",
        url: config["host"] + "/security_groups?token=" + window.localStorage.token,
        success: function(data) {
            var security_groups = JSON.parse(data)['security_groups'];
            var str = '<option value="test">请选择一个安全组</option>';
            for (var i = 0; i < security_groups.length; i++) {
                str += '<option value="' + security_groups[i].id + '">' + security_groups[i].name + '</option>'
            }
            $('#sec-group').html(str);
        }
    });
});

$('.subNet_Div').change(function() {
    $('.subNet_Div').removeClass('has-error');
});

$('.sec_Div').change(function() {
    $('.sec_Div').removeClass('has-error');
});

$('.create_virNetOK').unbind('click').on('click', function() {
    var sunbet = $('#subnet-set').val();
    var sec = $('#sec-group').val();
    if (sunbet == 'test' || sec == 'test') {
        if (sunbet == 'test')
            $('.subNet_Div').addClass('has-error');
        if (sec == 'test')
            $('.sec_Div').addClass('has-error');
        return false;
    }
    var virNet = {
        "port": {
            "name": "",
            "network_id": "",
            "security_groups": [],
            "fixed_ips": [{
                "subnet_id": "",
                "ip_address": ""
            }]
        }
    };
    virNet.port.name = $('#interface-name').val();
    var networks = JSON.parse(localStorage.networksInfos)['networks'];
    var flag = false;
    for (var i = 0; i < networks.length; i++) {
        var subnets = networks[i].subnets;
        for (var j = 0; j < subnets.length; j++) {
            var sub_id = subnets[j];
            if (sub_id == $('#subnet-set').val()) {
                virNet.port.network_id = networks[i].id;
                flag = true;
                break;
            }
        }
        if (flag)
            break;
    }
    if ($('#ip-address').val() != "")
        virNet.port.fixed_ips[0].ip_address = $('#ip-address').val();
    else
        delete virNet.port.fixed_ips[0].ip_address;
    virNet.port.fixed_ips[0].subnet_id = $('#subnet-set').val();
    virNet.port.security_groups[0] = $('#sec-group').val();
    console.error(JSON.stringify(virNet));
    submit_virNet(virNet);
});

function submit_virNet(virNet) {
    $.ajax({
        type: "POST",
        data: JSON.stringify(virNet),
        contentType: "application/json",
        url: config["host"] + "/port/create" + "?token=" + window.localStorage.token,
        success: function(data) {
            var info = JSON.parse(data)['NeutronError'];
            if (info != undefined)
                createAndHideAlert(info.message);
            else {
                router_all.reload();
                /*                var port = JSON.parse(data)['port'];
                                setVirNetInfo(port);
                                $('.virNet_num').text(" " + (++port_len) + " ");*/
            }
        }
    });
}
//---------创建虚拟网卡end
//---------删除虚拟网卡start
$('.deleteVirNet').unbind('click').on('click', function() {
    var ports = { "port_ids": [] };
    var index = 0;
    $(".vir_check:checked").each(function() {
        ports.port_ids[index++] = $(this).attr('port_id');
    });
    $.ajax({
        type: "POST",
        data: JSON.stringify(ports),
        contentType: "application/json",
        url: config["host"] + "/port/delete" + "?token=" + window.localStorage.token,
        success: function(data) {
            var info = JSON.parse(data)['NeutronError'];
            if (info != undefined)
                createAndHideAlert(info.message);
            else {
                port_len -= $(".vir_check:checked").length;
                $(".vir_check:checked").each(function() {
                    $("input[port_id='" + $(this).attr('port_id') + "'").parent().parent().remove();
                });
                $('.virNet_num').text(" " + port_len + " ");
            }
        }
    });
});
//---------删除虚拟网卡end
//----------------全选的控制
$(document).on("change", ".all_virCheck", function() {
    var isChecked = $(this).prop("checked");
    $(".vir_check").prop("checked", isChecked);
    if (isChecked) {
        $('.deleteVirNet').attr("disabled", false);
        $(".deleteFromInstance").attr("disabled", true);
        $(".bindInstance").attr("disabled", true);
    } else {
        $('.deleteVirNet').attr("disabled", true);
        $(".deleteFromInstance").attr("disabled", true);
        $(".bindInstance").attr("disabled", true);
    }
});

$(document).on('change', ".vir_check", function() {
    if ($(".vir_check:checked").length == $(".vir_check").length) {
        $('.deleteVirNet').attr("disabled", false);
        $(".deleteFromInstance").attr("disabled", false);
        $(".all_virCheck").prop("checked", true);
        $(".bindInstance").attr("disabled", true);
    } else if ($(".vir_check:checked").length > 0) {
        if ($(".vir_check:checked").length == 1) {
            $(".deleteFromInstance").attr("disabled", false);
            $(".bindInstance").attr("disabled", false);
        } else {
            $(".deleteFromInstance").attr("disabled", true);
            $(".bindInstance").attr("disabled", true);
        }
        $('.deleteVirNet').attr("disabled", false);
        $(".all_virCheck").prop("checked", false);
    } else {
        $('.deleteVirNet').attr("disabled", true);
        $(".deleteFromInstance").attr("disabled", true);
        $(".all_virCheck").prop("checked", false);
        $(".bindInstance").attr("disabled", true);
    }
});
//---------绑定云主机start
$('.bindInstance').unbind('click').on('click', function() {
    var instance_flag = $(".vir_check:checked").attr('instance_flag');
    if (instance_flag != "未绑定") {
        createAndHideAlert("该网卡已经绑定云主机！");
        $('.vir_check').attr("checked", false);
        return false;
    }
    var name = $(".vir_check:checked").attr('name');
    $('.virNet_name').text(name);
    // console.error(localStorage.instanceInfos);
    var instances = JSON.parse(localStorage.instanceInfos)['servers'];
    var str = '';
    for (var i = 0; i < instances.length; i++) {
        var instance = instances[i];
        str += '<option name="' + instance.name + '" value="' + instance.id + '">' + instance.name + '</option>';
    }
    $('#instance_set').html(str);
    if (instance_flag != "未绑定")
        $('#instance_set option[name="' + instance_flag + '"]').attr("selected", true);
});
$('.submit_bindINfo').unbind('click').on('click', function() {
    var bindInfo = {
        "interfaceAttachment": {
            "port_id": ""
        }
    }
    var instance_id = $('#instance_set').val();
    var port_id = $(".vir_check:checked").attr('port_id');
    bindInfo.interfaceAttachment.port_id = port_id;
    console.error(JSON.stringify(bindInfo), instance_id);
    $.ajax({
        type: "POST",
        data: JSON.stringify(bindInfo),
        contentType: "application/json",
        url: config["host"] + "/touch_interface/" + instance_id + "?token=" + window.localStorage.token,
        success: function(data) {
            if (JSON.parse(data)['NeutronError'] != undefined || JSON.parse(data)['badRequest'] != undefined) {
                createAndHideAlert(data);
            } else {
                window.location.reload();
            }
        }
    });
});
//---------绑定云主机end
//---------从云主机卸载start
$('.deleteFromInstance').unbind('click').on('click', function() {
    var servers_id = $(".vir_check:checked").attr('id');
    var port_id = $(".vir_check:checked").attr('port_id');
    var instance_flag = $(".vir_check:checked").attr('instance_flag');
    if (instance_flag == "未绑定") {
        createAndHideAlert("该网卡未绑定云主机！");
        $('.vir_check').attr("checked", false);
        return false;
    }
    $.ajax({
        type: "GET",
        url: config["host"] + "/detach_interface/" + servers_id + "/" + port_id + "?token=" + window.localStorage.token,
        success: function(data) {
            var info = JSON.parse(data)['NeutronError'];
            if (info != undefined)
                createAndHideAlert(info.message);
            else {
                window.location.reload();
            }
        }
    });
});
//---------从云主机卸载end
function setVirNetInfo(data) {
    var str = '<tr><td><input type="checkbox" class="vir_check" port_id="' + data.id + '" id="' + data.device_id + '" instance_flag="' + (data.device_name == undefined ? '未绑定' : data.device_name) + '" name="' + (data.name == '' ? data.id : data.name) + '"></td>' +
        '<td>' + (data.name == '' ? '(' + data.id.substr(0, 13) + ')' : data.name) + '</td>' +
        '<td>' + data.fixed_ips[0].ip_address + '</td>' +
        '<td>' + data.fixed_ips[0].subnet_name + '</td>' +
        '<td>' + (data.floating_ip == undefined ? '无' : data.floating_ip) + '</td>' +
        '<td class="' + data.id + '">' + (data.device_name == undefined ? '未绑定' : data.device_name) + '</td>' +
        '<td>' + (data.status == 'ACTIVE' ? '运行中' : '未运行') + '</td>';
    if (data.security_groups.length != 0)
        str += '<td><a href="#/net/secGroup_desc?' + data.security_groups[0] + '">' + "(" + data.security_groups[0].substr(0, 13) + ")" + '</a></td>';
    else
        str += '<td>' + "无" + '</a></td>';
    str += '</tr>';
    $(".virNet_body").append(str);
}
