/**
 * Created by lwj on 2016/12/28.
 */

var flow_entries_len = 0

$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/v1.0/sdn/get_flow_entries?token=" + window.localStorage.token,
        success: function(data) {
            $(".flow_entries_body").empty();
            $(".flow_entries_footer").empty();
            var flow_entries = JSON.parse(data);
            flow_entries_len = flow_entries.length;
            for (var i = 0; i < flow_entries.length; i++) {
                var flow_entry = flow_entries[i];
                set_flow_entries(flow_entry);
            }
            var footer_str = "<tr class='active tfoot-dsp flow_entries_footer_tr'><td colspan='8'>Displaying <span id='item_count'>" + flow_entries_len + "</span> items</td></tr>";
            $(".flow_entries_footer").append(footer_str);
        }
    });




    //----------------单个删除
    $(document).on("click", ".delete_flow_entry", function() {
        var flow_entry_name = $(this).parent().siblings().first().children(".flow_entry_check").attr("id");
        var json_array = '{"name":"' + flow_entry_name + '"}';
        console.log(json_array);
        $.ajax({
            type: "POST",
            data: json_array,
            contentType: "application/json",
            url: config["host"] + "/v1.0/sdn/delete_flow_entry?token=" + window.localStorage.token,
            success: function(data) {
                if (JSON.parse(data) == "success") {
                    createAndHideAlert( + "删除成功！");
                    // $("#" + flow_entry_name + "").parent().parent().remove();
                    // $(".flow_entries_footer_tr").empty();
                    // var str_footer = '<td colspan="8">Displaying <span id="item_count">' + (--flow_entries_len) + '</span> items</td>';
                    // $(".flow_entries_footer_tr").append(str_footer);
                    router_all.reload();
                } else
                    createAndHideAlert(flow_entry_name + "删除失败");
            },
            error: function(data) {

            }
        });

    });



    //----------------全选的控制
    $(document).on("change", ".flow_entries_check", function() {
        var isChecked = $(this).prop("checked");
        $(".flow_entry_check").prop("checked", isChecked);
        if (isChecked) {
            $(".delete_flow_entries").attr("disabled", false);
        } else {
            $(".delete_flow_entries").attr("disabled", true);
        }
    });

    //——————————————批量删除！！！！
    $(document).on("change", ".flow_entry_check", function() {
        if ($(".flow_entry_check:checked").length == $(".flow_entry_check").length) {
            $(".delete_flow_entries").attr("disabled", false);
            $(".flow_entries_check").prop("checked", true);
        } else if ($(".flow_entry_check:checked").length > 0) {
            $(".delete_flow_entries").attr("disabled", false);
            $(".flow_entries_check").prop("checked", false);
        } else {
            $(".delete_flow_entries").attr("disabled", true);
            $(".flow_entries_check").prop("checked", false);
        }
    });


    //--------多删
    $(".delete_flow_entries").click(function() {
        // var json_array = '[';
        $(".flow_entry_check:checked").each(function() {
            // if (json_array != '[')
            //     json_array += ',{"name":"' + $(this).attr("id") + '"}';
            // else
            //     json_array += '{"name":"' + $(this).attr("id") + '"}';
            var flow_entry_name_tmp = $(this).attr("id");
            var json_array = '{"name":"' + flow_entry_name_tmp + '"}';
            $.ajax({
                type: "POST",
                data: json_array,
                contentType: "application/json",
                url: config["host"] + "/v1.0/sdn/delete_flow_entry?token=" + window.localStorage.token,
                success: function(data) {
                    if (JSON.parse(data) == "success") {
                        createAndHideAlert( flow_entry_name_tmp + "删除成功！");
                        // $(this).parent().parent().remove();
                        // $(".flow_entries_footer_tr").empty();
                        // var str_footer = '<td colspan="8">Displaying <span id="item_count">' + (--flow_entries_len) + '</span> items</td>';
                        // $(".flow_entries_footer_tr").append(str_footer);
                    } else
                        createAndHideAlert( flow_entry_name_tmp + "删除失败");
                },
                error: function(data) {

                }
            });
        });
        router_all.reload();


    });

});

function set_flow_entries(flow_entry){
    var str = '<tr><td><input type="checkbox" class="flow_entry_check" id="' + flow_entry.flow_entry_name + '" /></td>' +
        '<td>' + flow_entry.flow_entry_name + '</td>' +
        '<td>' + flow_entry.instance_name + '</td>' +
        '<td>' + flow_entry["cookie"] + '</td>' +
        '<td>' + flow_entry["priority"] + '</td>' +
        '<td>' + JSON.stringify(flow_entry["match"]) + '</td>' +
        '<td>' + JSON.stringify(flow_entry["instructions"]) + '</td>' +
        '<td><a href="javascript:void(0)" class="btn btn-primary delete_flow_entry" style="background: white"><font style="color: black">' + "删除规则" +
    '</font></a></td></tr>';
    $(".flow_entries_body").append(str);
}


$('.create_flow_entry').unbind('click').on('click', function() {
    $('#flow_entry_name').val('');
    $('#cloud_instances').empty();
    $('#flow_entry_cookie').attr('placeholder', "0");
    $('#flow_entry_priority').attr('placeholder', "32768");
    $('#flow_ethernet_type').val('');
    $('#flow_src_mac').val('');
    $('#flow_dst_mac').val('');
    $('#flow_ip_protocol').val('');
    $('#flow_src_ip').val('');
    $('#flow_dst_ip').val('');
    $('#flow_ip_tos').val('');
    $('#flow_src_port').val('');
    $('#flow_dst_port').val('');
    $('#flow_actions').val('');
    $.ajax({
        type: "GET",
        url: config["host"] + "/instances?token=" + window.localStorage.token,
        success: function(data) {
            var servers = JSON.parse(data)['servers'];
            $("#cloud_instances").append('<option value="test">请选择云主机</option>');
            if (servers.length != 0) {
                for (var i = 0; i < servers.length; i++) {
                    $("#cloud_instances").append('<option value="' + servers[i].id + '">' + servers[i].name + '</option>');
                }

            }
        }
    });
});


$('.flow_entry_name_div').change(function() {
    $('.flow_entry_name_div').removeClass('has-error');
});

$('.cloud_instance_div').change(function() {
    $('.cloud_instance_div').removeClass('has-error');
});



$('.create_flow_entryOk').unbind('click').on('click', function() {
    var cloud_instances_val = $('#cloud_instances').val();
    var flow_entry_name_val = $('#flow_entry_name').val();
    if (cloud_instances_val == 'test' || flow_entry_name_val == "") {
        if (flow_entry_name_val == '' )
            $('.flow_entry_name_div').addClass('has-error');
        if (cloud_instances_val == 'test' )
            $('.cloud_instance_div').addClass('has-error');
        return false;
    }
    var flow_entry = {};
    flow_entry["name"] = flow_entry_name_val;
    if($('#flow_entry_cookie').val() != "")
        flow_entry["cookie"] = $('#flow_entry_cookie').val();
    if($('#flow_entry_priority').val() != "")
        flow_entry["priority"] = $('#flow_entry_priority').val();
    if($('#flow_ethernet_type').val() != "")
        flow_entry["eth_type"] = $('#flow_ethernet_type').val();
    if($('#flow_src_mac').val() != "")
        flow_entry["eth_src"] = $('#flow_src_mac').val();
    if($('#flow_dst_mac').val() != "")
        flow_entry["eth_dst"] = $('#flow_dst_mac').val();
    if($('#flow_ip_protocol').val() != "")
        flow_entry["ip_proto"] = $('#flow_ip_protocol').val();
    if($('#flow_src_ip').val() != "")
        flow_entry["ipv4_src"] = $('#flow_src_ip').val();
    if($('#flow_dst_ip').val() != "")
        flow_entry["ipv4_dst"] = $('#flow_dst_ip').val();
    if($('#flow_ip_tos').val() != "")
        flow_entry["ip_tos"] = $('#flow_ip_tos').val();
    if($('#flow_src_port').val() != "")
        flow_entry["tp_src"] = $('#flow_src_port').val();
    if($('#flow_dst_port').val() != "")
        flow_entry["tp_dst"] = $('#flow_dst_port').val();

    flow_entry["actions"] = $('#flow_actions').val();

    submit_flow_entry(flow_entry, cloud_instances_val);
});

function submit_flow_entry(flow_entry, instance_id) {
    $.ajax({
        type: "POST",
        data: JSON.stringify(flow_entry),
        contentType: "application/json",
        url: config["host"] + "/v1.0/sdn/add_flow_entry/"+ instance_id + "?token=" + window.localStorage.token,
        success: function(data) {
            if (JSON.parse(data) == "success"){
                flow_entries_len++;
                createAndHideAlert("成功添加规则");
                router_all.reload();
            }
            else {
                router_all.reload();
            }
        }
    });
}




