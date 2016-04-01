/*
  localStorage.routerInfo=routerInfo;
  localStorage.policyInfo=policyInfo;
  localStorage.fireWallsInfo=JSON.stringify(fireWalls);
*/
var rules_len = 0;
var policy_len = 0;
var fireWall_len = 0;
var router_FreeNum = 0;
$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/routers?token=" + window.localStorage.token,
        success: function(data) {
            localStorage.router_temp = data;
            var allRounters = JSON.parse(data)['routers'];
            router_FreeNum = allRounters.length;
            $.ajax({
                type: "GET",
                url: config["host"] + "/firewall_policies?token=" + window.localStorage.token,
                success: function(data) {
                    // console.log(data);
                    localStorage.policyTemp = data;
                    var allPolicys = JSON.parse(data)['firewall_policies'];
                    $.ajax({
                        type: "GET",
                        url: config["host"] + "/firewalls?token=" + window.localStorage.token,
                        success: function(data) {
                            var fireWalls = JSON.parse(data)['firewalls'];
                            localStorage.fireWallsInfo = JSON.stringify(fireWalls);
                            localStorage.routerInfo = "";
                            localStorage.policyInfo = "";
                            var routerInfo = "[";
                            var policyInfo = "[";
                            for (var i = 0; i < fireWalls.length; i++) {
                                var fireWall = fireWalls[i];
                                //-----状态的转换
                                if (fireWall.status == "ACTIVE")
                                    fireWall.status = "运行中";
                                else
                                    fireWall.status = "非激活";
                                //-----管理员状态的转换
                                if (fireWall.admin_state_up == true || fireWall.admin_state_up == 'true')
                                    fireWall.admin_state_up = "上";
                                else
                                    fireWall.admin_state_up = "下";
                                //-----描述的判断
                                if (fireWall.description == "" || fireWall.description == null) {
                                    fireWall.description = "无";
                                }
                                //------路由
                                var routerIds = fireWall.router_ids;
                                var routerStr = "";
                                for (var j = 0; j < routerIds.length; j++) {
                                    if (routerInfo != "[")
                                        routerInfo += ",[";
                                    else
                                        routerInfo += "[";
                                    for (var k = 0; k < allRounters.length; k++) {
                                        var allRouter = allRounters[k];
                                        if (allRouter.id == routerIds[j]) {
                                            router_FreeNum--;
                                            if (routerStr == "")
                                                routerStr += allRouter.name;
                                            else
                                                routerStr += "," + allRouter.name;
                                            routerInfo += JSON.stringify(allRouter) + "]";
                                        }
                                    }
                                }
                                //console.log(localStorage.routerInfo);
                                //------策略
                                var policyId = fireWall.firewall_policy_id;
                                var policyStr = "";
                                for (var m = 0; m < allPolicys.length; m++) {
                                    var policy = allPolicys[m];
                                    if (policy.id == policyId) {
                                        policyStr += policy.name;
                                        if (policyInfo == "[")
                                            policyInfo += JSON.stringify(policy);
                                        else
                                            policyInfo += "," + JSON.stringify(policy);
                                        break;
                                    }
                                }

                                setFireWallList(fireWall, routerStr, policyStr, i);
                            }
                            localStorage.policyInfo += policyInfo + "]";
                            localStorage.routerInfo += routerInfo + "]";
                            fireWall_len = fireWalls.length;
                            var footer_str = "<tr class='active tfoot-dsp fireWall_tr'><td colspan='8'>Displaying <span id='item_count'>" + fireWall_len + "</span> items</td></tr>";
                            $(".fireWall_footer").append(footer_str);
                        },
                        error: function(data) {
                            alert("信息获取失败");
                            console.log(data);
                        }
                    });
                },
                error: function(data) {
                    alert("信息获取失败");
                    console.log(data);
                }
            });

        },
        error: function(data) {
            alert("路由信息获取失败！");
            console.log(data);
        }
    });

    //-------------防火墙规则
    $.ajax({
        type: "GET",
        url: config["host"] + "/firewall_rules?token=" + window.localStorage.token,
        success: function(data) {
            localStorage.temp_rules = data;
            var fireWallRulers = JSON.parse(data)['firewall_rules'];
            //-------获得规则
            $.ajax({
                type: "GET",
                url: config["host"] + "/firewall_policies?token=" + window.localStorage.token,
                success: function(data) {
                    var policies = JSON.parse(data)['firewall_policies'];
                    localStorage.policyTemp = data;
                    localStorage.policyInfo = data;
                    for (var i = 0; i < fireWallRulers.length; i++) {
                        var rules = "";
                        var id_temp = 0;
                        for (var j = 0; j < policies.length; j++) {
                            if (policies[j].id == fireWallRulers[i].firewall_policy_id) {
                                rules += policies[j].name + " ";
                                id_temp = policies[j].id;
                            }
                        }
                        if (rules == "")
                            rules = "-";
                        setFirewallRules(fireWallRulers[i], rules, id_temp);
                    }
                    rules_len = fireWallRulers.length;
                    var str_footer = '<tr class="active tfoot-dsp footerID"><td colspan="13">Displaying <span id="item_count">' + rules_len + '</span> items</td></tr>';
                    $(".rule_footer").append(str_footer);

                    //----------------策略的实现！！！！！！

                    for (var i = 0; i < policies.length; i++) {
                        var rule_text = "";
                        var policy_rule_ids = policies[i].firewall_rules;
                        for (var k = 0; k < policy_rule_ids.length; k++) {
                            var pr_id = policy_rule_ids[k];
                            for (var j = 0; j < fireWallRulers.length; j++) {
                                var fireWallRule = fireWallRulers[j];
                                if (pr_id == fireWallRule.id) {
                                    if (rule_text == "")
                                        rule_text += fireWallRule.name;
                                    else
                                        rule_text += "," + fireWallRule.name;
                                }
                            }
                        }
                        setPolicies(policies[i], rule_text);
                    }
                    policy_len = policies.length;
                    var policy_footer = '<tr class="active tfoot-dsp policy_footerID">' +
                        '<td colspan="8">Displaying <span id="item_count">' + policy_len + '</span> items</td></tr>';
                    $(".policy_footer").append(policy_footer);
                },
                error: function(data) {
                    console.log("规则中策略获取失败！");
                }
            });
        },
        error: function(data) {
            console.log("规则获取失败！");
        }
    });
    //-------------创建规则
    $(".creatFirewallRule").click(function() {
        var fireWallRule = {
            "firewall_rule": {
                "action": null,
                "destination_port": null,
                "enabled": false,
                "name": null,
                "description": null,
                "protocol": null,
                "shared": false,
                "source_ip_address": null,
                "destination_ip_address": null,
                "source_port": null
            }
        }
        fireWallRule_temp = fireWallRule['firewall_rule'];
        if ($(".rule_name").val() != null && $(".rule_name").val() != "")
            fireWallRule_temp.name = $(".rule_name").val();
        if ($(".rule_desc").val() != null && $(".rule_desc").val() != "")
            fireWallRule_temp.description = $(".rule_desc").val();
        if ($(".rule_protocol").val() != null && $(".rule_protocol").val() != "")
            fireWallRule_temp.protocol = $(".rule_protocol").val();
        if ($(".rule_control").val() != null && $(".rule_control").val() != "")
            fireWallRule_temp.action = $(".rule_control").val();
        if ($(".rule_sourceIP").val() != null && $(".rule_sourceIP").val() != "")
            fireWallRule_temp.source_ip_address = $(".rule_sourceIP").val();
        if ($(".rule_destinationIP").val() != null && $(".rule_destinationIP").val() != "")
            fireWallRule_temp.destination_ip_address = $(".rule_destinationIP").val();
        if ($(".rule_sourcePort").val() != null && $(".rule_sourcePort").val() != "")
            fireWallRule_temp.source_port = $(".rule_sourcePort").val();
        if ($(".rule_destinationPort").val() != null && $(".rule_destinationPort").val() != "")
            fireWallRule_temp.destination_port = $(".rule_destinationPort").val();
        if ($(".rule_share").val() != null && $(".rule_share").val() != "") {
            // alert("share"+$(".rule_share").prop('checked'));
            if ($(".rule_share").prop('checked') != false)
                fireWallRule_temp.shared = true;
            else
                fireWallRule_temp.shared = false;
        }
        if ($(".rule_active").val() != null && $(".rule_active").val() != "") {
            // alert("active:"+$(".rule_active").prop('checked'));
            if ($(".rule_active").prop('checked') != false)
                fireWallRule_temp.enabled = true;
            else
                fireWallRule_temp.enabled = false;
        }
        //console.log(JSON.stringify(fireWallRule));JSON.stringify(fireWallRule)
        $.ajax({
            type: "POST",
            data: JSON.stringify(fireWallRule),
            contentType: "application/json",
            url: config["host"] + "/firewall_rules/create?token=" + window.localStorage.token,
            success: function(data) {
                // console.log(data);
                var firewallrule = JSON.parse(data)['firewall_rule'];
                setFirewallRules(firewallrule, "-", -1);
                $(".footerID").remove();
                var str_footer = '<tr class="active tfoot-dsp footerID"><td colspan="13">Displaying <span id="item_count">' + (++rules_len) + '</span> items</td></tr>';
                $(".rule_footer").append(str_footer);
            },
            error: function(data) {

            }
        });

    });

    //--------------删除规则
    $("#rule_del").click(function() {
        var count = 0;
        var json_array = '{"firewall_rule_ids":[';
        $(".rule_id:checked").each(function() {
            if ($(this).attr("name") != null && $(this).attr("name") != "-")
                alert($(this).attr("id") + "不可删除！");
            else {
                count++;
                if (json_array != '{"firewall_rule_ids":[')
                    json_array += ',"' + $(this).attr("id") + '"';
                else
                    json_array += '"' + $(this).attr("id") + '"';
            }
        });

        json_array += "]}";
        if (count > 0) {
            $.ajax({
                type: "POST",
                data: json_array,
                contentType: "application/json",
                url: config["host"] + "/firewall_rules/delete?token=" + window.localStorage.token,
                success: function(data) {
                    var id_status = JSON.parse(data);
                    for (var x in id_status) {
                        if (id_status[x] == 204) {
                            alert(x + "删除成功！");
                            $("#" + x + "").parent().parent().remove();
                            $(".footerID").remove();
                            var str_footer = '<tr class="active tfoot-dsp footerID"><td colspan="13">Displaying <span id="item_count">' + (--rules_len) + '</span> items</td></tr>';
                            $(".rule_footer").append(str_footer);
                        } else
                            alert(x + "删除失败");
                    }
                    //window.location.reload();
                },
                error: function(data) {

                }
            });
        }
    });
    //---------------修改规则
    $(".update_submit").click(function() {
        var fireWallRule = {
            "firewall_rule": {
                "action": null,
                "destination_port": null,
                "enabled": false,
                "name": null,
                "description": null,
                "protocol": null,
                "shared": false,
                "source_ip_address": null,
                "destination_ip_address": null,
                "source_port": null
            }
        }
        fireWallRule_temp = fireWallRule['firewall_rule'];
        if ($("#fir_name").val() != null && $("#fir_name").val() != "")
            fireWallRule_temp.name = $("#fir_name").val();
        if ($("#fir_desc").val() != null && $("#fir_desc").val() != "")
            fireWallRule_temp.description = $("#fir_desc").val();
        if ($("#fir_protocol").val() != null && $("#fir_protocol").val() != "")
            fireWallRule_temp.protocol = $("#fir_protocol").val();
        if ($("#fir_control").val() != null && $("#fir_control").val() != "")
            fireWallRule_temp.action = $("#fir_control").val();
        if ($("#fir_srcIP").val() != null && $("#fir_srcIP").val() != "")
            fireWallRule_temp.source_ip_address = $("#fir_srcIP").val();
        if ($("#fir_desIP").val() != null && $("#fir_desIP").val() != "")
            fireWallRule_temp.destination_ip_address = $("#fir_desIP").val();
        if ($("#fir_srcPort").val() != null && $("#fir_srcPort").val() != "")
            fireWallRule_temp.source_port = $("#fir_srcPort").val();
        if ($("#fir_desPort").val() != null && $("#fir_desPort").val() != "")
            fireWallRule_temp.destination_port = $("#fir_desPort").val();
        if ($("#fir_shared").val() != null && $("#fir_shared").val() != "") {
            // alert("share"+$(".rule_share").prop('checked'));
            if ($("#fir_shared").prop('checked') != false)
                fireWallRule_temp.shared = true;
            else
                fireWallRule_temp.shared = false;
        }
        if ($("#fir_enabled").val() != null && $("#fir_enabled").val() != "") {
            // alert("active:"+$(".rule_active").prop('checked'));
            if ($("#fir_enabled").prop('checked') != false)
                fireWallRule_temp.enabled = true;
            else
                fireWallRule_temp.enabled = false;
        }
        /*        console.log("------------");
                console.log(JSON.stringify(fireWallRule));*/
        $.ajax({
            type: "POST",
            data: JSON.stringify(fireWallRule),
            contentType: "application/json",
            url: config["host"] + "/firewall_rules/update/" + updata_id + "?token=" + window.localStorage.token,
            success: function(data) {
                var firewallrule = JSON.parse(data)['firewall_rule'];
                /*                var policies = JSON.parse(localStorage.policyTemp)['firewall_policies'];
                                var rules_str = "";
                                for (var j = 0; j < policies.length; j++) {
                                    if (policies[j].id == firewallrule.firewall_policy_id) {
                                        rules_str += policies[j].name + " ";
                                    }
                                }*/
                //  console.log(firewallrule);
                $("#" + JSON.parse(data)['firewall_rule'].id + "").parent().parent().remove();
                setFirewallRules(firewallrule, "-", -1);
                $(".footerID").remove();
                var str_footer = '<tr class="active tfoot-dsp footerID"><td colspan="13">Displaying <span id="item_count">' + rules_len + '</span> items</td></tr>';
                $(".rule_footer").append(str_footer);
            },
            error: function(data) {

            }
        });


    });
});
var policy_flag = 0;
var policy_id;
$(".add_cancel").click(function() {
    $(".policy_name").val("");
    $(".policy_desc").val("");
    $(".policy_shared").val("");
    $(".policy_audit").val("");
});
$(".cancelFirewallRule").click(function() {
    $(".rule_name").val("");
    $(".rule_desc").val("");
    $(".rule_sourceIP").val("");
    $(".rule_destinationIP").val("");
    $(".rule_sourcePort").val("");
    $(".rule_destinationPort").val("");
    $(".rule_share").attr("checked", false);
    $(".rule_active").attr("checked", false);
});

//-------------增加策略
$(".add_policy").click(function() {
    var policy_temp = {
        "firewall_policy": {
            "name": "",
            "description": "",
            "audited": false,
            "shared": false
        }
    };
    var temp = policy_temp['firewall_policy'];

    temp.name = $(".policy_name").val();
    temp.description = $(".policy_desc").val();
    temp.shared = false;
    temp.audited = false;
    if (temp.name == "") {
        alert("名称必填！");
        return;
    }
    if ($(".policy_shared").prop("checked"))
        temp.shared = true;
    if ($(".policy_audit").prop("checked"))
        temp.audited = true;
    //console.log(policy_temp);
    if (policy_flag == 0) {
        //----添加策略
        $.ajax({
            type: "POST",
            data: JSON.stringify(policy_temp),
            contentType: "application/json",
            url: config["host"] + "/firewall_policies/create?token=" + window.localStorage.token,
            success: function(data) {
                $(".policy_name").val("");
                $(".policy_desc").val("");
                $(".policy_shared").val("");
                $(".policy_audit").val("");
                var firewallpolicy = JSON.parse(data)['firewall_policy'];
                $(".policy_footerID").remove();
                setPolicies(firewallpolicy, "");
                var policy_footer = '<tr class="active tfoot-dsp policy_footerID">' +
                    '<td colspan="8">Displaying <span id="item_count">' + (++policy_len) + '</span> items</td></tr>';
                $(".policy_footer").append(policy_footer);
            }
        });
    } else {
        policy_flag = 0;
        // console.log(JSON.stringify(policy_temp));
        //----修改策略
        $.ajax({
            type: "POST",
            data: JSON.stringify(policy_temp),
            contentType: "application/json",
            url: config["host"] + "/firewall_policies/update/" + policy_id + "?token=" + window.localStorage.token,
            success: function(data) {
                //   console.log(data);
                $(".policy_name").val("");
                $(".policy_desc").val("");
                $(".policy_shared").val("");
                $(".policy_audit").val("");
                var firewallpolicy = JSON.parse(data)['firewall_policy'];
                $(".policy_footerID").remove();
                $("#" + JSON.parse(data)['firewall_policy'].id + "").parent().parent().remove();
                setPolicies(firewallpolicy, "");
                var policy_footer = '<tr class="active tfoot-dsp policy_footerID">' +
                    '<td colspan="8">Displaying <span id="item_count">' + policy_len + '</span> items</td></tr>';
                $(".policy_footer").append(policy_footer);
            }
        });
    }
});
//-------------修改策略
$(document).on('click', ".updatePolicy_simple", function() {
    var name = $(this).parent().parent().siblings(":eq(1)").text();
    $(".policy_name").val(name);
    var desc = $(this).parent().parent().siblings(":eq(2)").text();
    $(".policy_desc").val(desc);
    var shared = $(this).parent().parent().siblings(":eq(4)").text();
    if (shared == "true")
        $(".policy_shared").attr("checked", true);
    else
        $(".policy_shared").attr("checked", false);

    var audit = $(this).parent().parent().siblings(":eq(5)").text();
    if (audit == "true")
        $(".policy_audit").attr("checked", true);
    else
        $(".policy_audit").attr("checked", false);
    policy_flag = 1;
    policy_id = $(this).parent().parent().siblings(":eq(0)").children().first().attr("id");
    // alert(policy_id);
});

//-------------删除策略
//-------------单删
$(document).on('click', ".delete_simplePolicy", function() {
    if (confirm("确定删除" + $(this).attr("name") + "? 该操作不可撤销")) {
        var id = $(this).attr("id");
        var json_array = '{"firewall_policies_ids":["' + id + '"]}';
        deletePolicyAjax(json_array);
    }

});
//------------批量删除
$(document).on('change', ".policy_id", function() {
    if ($(".policy_id:checked").length == 0)
        $(".delete_policy").attr("disabled", true);
    else
        $(".delete_policy").attr("disabled", false);
});

$(".delete_policy").click(function() {
    var json_array = '{"firewall_policies_ids":[';
    $(".policy_id:checked").each(function() {
        if (json_array != '{"firewall_policies_ids":[')
            json_array += ',"' + $(this).attr("id") + '"';
        else
            json_array += '"' + $(this).attr("id") + '"';
    });
    json_array += "]}";
    deletePolicyAjax(json_array);

});

function deletePolicyAjax(json_array) {
    $.ajax({
        type: "POST",
        data: json_array,
        contentType: "application/json",
        url: config["host"] + "/firewall_policies/delete?token=" + window.localStorage.token,
        success: function(data) {
            var id_status = JSON.parse(data);
            for (var x in id_status) {
                if (id_status[x] == 204) {
                    alert(x + "删除成功！");
                    $("#" + x + "").parent().parent().remove();
                    $(".policy_footerID").remove();
                    var str_footer = '<tr class="active tfoot-dsp policy_footerID"><td colspan="13">Displaying <span id="item_count">' + (--policy_len) + '</span> items</td></tr>';
                    $(".policy_footer").append(str_footer);
                } else
                    alert(x + "删除失败");
            }
        },
        error: function(data) {
            alert("删除失败");
        }
    });
}
//---------------修改规则
var updata_id;
$(document).on("click", ".updata_infos", function() {
    updata_id = $(this).parent().siblings().first().children(".rule_id").attr("id");
    if ($(this).parent().siblings(':eq(1)').first().text() != null && $(this).parent().siblings(':eq(1)').first().text() != "null")
        $("#fir_name").val($(this).parent().siblings(':eq(1)').first().text());
    if ($(this).parent().siblings(':eq(2)').html() != null && $(this).parent().siblings(':eq(2)').html() != "null")
        $("#fir_desc").val($(this).parent().siblings(':eq(2)').html());
    $("#fir_protocol option[value=" + $(this).parent().siblings(':eq(3)').html() + "]").attr("selected", true);
    $("#fir_control  option[value=" + $(this).parent().siblings(':eq(8)').html() + "]").attr("selected", true);
    if ($(this).parent().siblings(':eq(4)').html() != null && $(this).parent().siblings(':eq(4)').html() != "null")
        $("#fir_srcIP").val($(this).parent().siblings(':eq(4)').html());
    if ($(this).parent().siblings(':eq(6)').html() != null && $(this).parent().siblings(':eq(6)').html() != "null")
        $("#fir_desIP").val($(this).parent().siblings(':eq(6)').html());
    if ($(this).parent().siblings(':eq(5)').html() != null && $(this).parent().siblings(':eq(5)').html() != "null")
        $("#fir_srcPort").val($(this).parent().siblings(':eq(5)').html());
    if ($(this).parent().siblings(':eq(7)').html() != null && $(this).parent().siblings(':eq(7)').html() != "null")
        $("#fir_desPort").val($(this).parent().siblings(':eq(7)').html());
    $("#fir_shared").val($(this).parent().siblings(':eq(9)').html());
    $("#fir_enabled").val($(this).parent().siblings(':eq(10)').html());
});

//-----------列出规则
function setFirewallRules(data, rules, id_temp) {
    var str = '<tr><td><input class="rule_id" type="checkbox" id="' + data.id + '" name="' + rules + '"></td>' +
        '<td><a href="#/net/firewall-ruleDesc?' + data.id + '">' + data.name + '</a></td>' +
        '<td>' + data.description + '</td>' +
        '<td>' + data.protocol + '</td>' +
        '<td>' + data.source_ip_address + '</td>' +
        '<td>' + data.source_port + '</td>' +
        '<td>' + data.destination_ip_address + '</td>' +
        '<td>' + data.destination_port + '</td>' +
        '<td>' + data.action + '</td>' +
        '<td>' + data.shared + '</td>' +
        '<td>' + data.enabled + '</td>';
    if (id_temp == -1)
        str += '<td><a>' + rules + '</a></td>';
    else
        str += '<td><a href="#/net/firewall-strategy-desc?' + id_temp + '">' + rules + '</a></td>';
    str += '<td><button type="button"  class="btn btn-default btn-sm updata_infos" data-toggle="modal" data-target="#modal_set_rule">' +
        '编辑规则</button></td></tr>';
    $(".firewallRules").append(str);
}

//-----------插入规则
$(document).on("click", ".insert_policy", function() {
    var policy_id = $(this).attr('id');
    var temp = $(this).parents('td').siblings("[id=1]").text();
    var this_temp = this;
    $(".insert_select").empty();
    $(".front_select").empty();
    $(".back_select").empty();

    $.ajax({
        type: "GET",
        url: config["host"] + "/firewall_rules?token=" + window.localStorage.token,
        success: function(data) {
            localStorage.temp_rules = data;
            var rules = JSON.parse(data)['firewall_rules'];
            var rules_string = temp;
            var rules_array = rules_string.split(",");
            var rule_ids = new Array();
            var options = "";
            for (var i = 0; i < rules.length; i++) {
                var rule = rules[i];
                if (rule.firewall_policy_id == null || rule.firewall_policy_id == 'null') {
                    options += '<option value="' + rule.id + '">' + rule.name + '</option>';
                }
                for (var k = 0; k < rules_array.length; k++) {
                    if (rule.name == rules_array[k])
                        rule_ids[k] = rule.id;
                }
            }
            $(".insert_select").append(options);
            for (var j = 0; j < rules_array.length; j++) {
                var options = "<option value='" + rule_ids[j] + "''>" + rules_array[j] + "</option>";
                $(".front_select").append(options);
                $(".back_select").append(options);
            }
            $(".front_select").get(0).selectedIndex = -1;
            $(".back_select").get(0).selectedIndex = -1;

            //------------------提交事件！！！！！
            $(".addrule_insert").click(function() {
                var insert_info = {
                    "firewall_rule_id": "",
                    "insert_after": "",
                    "insert_before": ""
                };
                var insert_name = $(".insert_select option:selected").text();
                if (insert_name != "" && insert_name != "undefined") {
                    insert_info.firewall_rule_id = $(".insert_select").val();
                    if ($(".front_select").val() != 'undefined' && $(".front_select").val() != '-1')
                        insert_info.insert_before = $(".front_select").val();
                    if ($(".back_select").val() != 'undefined' && $(".back_select").val() != '-1')
                        insert_info.insert_after = $(".back_select").val();
                    /*                 console.log("-----------------");
                                     console.log(JSON.stringify(insert_info));*/
                    $.ajax({
                        type: "POST",
                        data: JSON.stringify(insert_info),
                        contentType: "application/json",
                        url: config["host"] + "/firewall_policies/insert_rule/" + policy_id + "?token=" + window.localStorage.token,
                        success: function(data) {
                            //------添加规则！！！！！！！！！！！
                            var rule_text = "";
                            var pre_tag = -1;
                            var last_tag = -1;
                            console.log(insert_info.insert_before);
                            console.log(insert_info.insert_after);
                            // for (var i = 0; i < rules_array.length; i++) {
                            for (var j = 0; j < rule_ids.length; j++) {
                                if (insert_info.insert_before != null && insert_info.insert_before != "") {
                                    if (insert_info.insert_before == rule_ids[j]) {
                                        pre_tag = j;
                                        break;
                                    }
                                } else if (insert_info.insert_after != null && insert_info.insert_after != "") {
                                    if (insert_info.insert_after == rule_ids[j]) {
                                        last_tag = j;
                                        break;
                                    }
                                }
                            }
                            //  }
                            var array_temp = rules_array.slice();
                            var length = array_temp.length;
                            for (var i = 0; i <= length; i++) {
                                if (pre_tag != -1) {
                                    if (pre_tag == i)
                                        rules_array[i] = insert_name;
                                    else if (pre_tag > i)
                                        rules_array[i] = array_temp[i];
                                    else
                                        rules_array[i] = array_temp[i - 1];

                                } else if (last_tag != -1) {
                                    if (i != array_temp.length) {
                                        if (last_tag == i) {
                                            rules_array[i] = array_temp[i];
                                            rules_array[i + 1] = insert_name;
                                        } else if (last_tag > i)
                                            rules_array[i] = array_temp[i];
                                        else
                                            rules_array[i + 1] = array_temp[i];
                                    }
                                }
                            }
                            if (pre_tag == -1 && last_tag == -1) {
                                rules_array[array_temp.length] = insert_name;
                            }
                            /*                            console.log("3-----------");
                                                        console.log(rules_array);*/
                            var str_temp = "";
                            for (var i = 0; i < rules_array.length; i++) {
                                if (str_temp == "")
                                    str_temp += rules_array[i];
                                else
                                    str_temp += "," + rules_array[i];
                            }
                            $(this_temp).parents('td').siblings("[id=1]").text(str_temp);
                        },
                        error: function(data) {

                        }
                    });
                }
            });
        },
        error: function(data) {}
    });
});
//-----------删除规则
$(document).on("click", ".delete_policy_rule", function() {
    var policy_id = $(this).attr('id');
    var temp = $(this).parents('td').siblings("[id=1]").text();
    var this_temp = this;
    var rules_string = temp;
    var rules_array = rules_string.split(",");
    $(".delete_select").empty();
    for (var j = 0; j < rules_array.length; j++) {
        var options = "<option >" + rules_array[j] + "</option>";
        $(".delete_select").append(options);
    }
    $(".deleteRule_insert").click(function() {
        var data = localStorage.temp_rules;
        var insert_name = $(".delete_select option:selected").text();
        var temp_rules = JSON.parse(data)['firewall_rules'];
        var id_temp = {
            "firewall_rule_id": null
        };
        for (var i = 0; i < temp_rules.length; i++) {
            var temp_rule = temp_rules[i];
            if (temp_rule.name == insert_name) {
                id_temp.firewall_rule_id = temp_rule.id;
            }
        }
        $.ajax({
            type: "POST",
            data: JSON.stringify(id_temp),
            contentType: "application/json",
            url: config["host"] + "/firewall_policies/remove_rule/" + policy_id + "?token=" + window.localStorage.token,
            success: function(data) {
                console.log(data);
                var str_temp = "";
                for (var i = 0; i < rules_array.length; i++) {
                    if (rules_array[i] != insert_name) {
                        if (str_temp == "")
                            str_temp += rules_array[i];
                        else
                            str_temp += "," + rules_array[i];
                    }
                }
                $(this_temp).parents('td').siblings("[id=1]").text(str_temp);
            }
        });
    });

});

//---------列出策略
function setPolicies(data, rule_text) {
    var str = '<tr><td><input type="checkbox" class="policy_id" id="' + data.id + '"></td>' +
        '<td><a href="#/net/firewall-strategy-desc?' + data.id + '">' + data.name + '</a></td>' +
        '<td>' + data.description + '</td>' +
        '<td id="1">' + rule_text + '</td>' +
        '<td>' + data.shared + '</td>' +
        '<td>' + data.audited + '</td>' +
        '<td>' +
        '<div class="btn-group"><button type="button" class="btn btn-default btn-sm updatePolicy_simple" data-toggle="modal" data-target="#modal_create_strategy">编辑策略</button><button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown"><span class="caret"></span>' +
        '<span class="sr-only">切换下拉菜单</span></button><ul class="dropdown-menu" role="menu">' +
        '<li class="insert_policy" name="' + rule_text + '" id="' + data.id + '"data-toggle="modal" data-target="#modal_insert_rule"><a href="javascript:void(0)" >插入规则</a></li>';
    if (rule_text != "" && rule_text != null)
        str += '<li class="delete_policy_rule" name="' + rule_text + '" id="' + data.id + '"data-toggle="modal" data-target="#modal_delete_rule"><a href="javascript:void(0)" ><font color="red">删除规则</font></a></li>';
    str += '<li class="delete_simplePolicy" id="' + data.id + '" name="' + data.name + '"><a href="javascript:void(0)" ><font color="red">删除策略</font></a></li>' +
        '</ul></div></td></tr>';
    $(".policies_list").append(str);
}
//-------创建前奏
$(".create_fireWallButton").click(function() {
    $(".fireWall_policys_selected").empty();
    $(".routers_checkBox").empty();
    $.ajax({
        type: "GET",
        url: config["host"] + "/firewalls?token=" + window.localStorage.token,
        success: function(data) {
            var router_router_ids = JSON.parse(data)['firewalls'];
            $.ajax({
                type: "GET",
                url: config["host"] + "/firewall_policies?token=" + window.localStorage.token,
                success: function(data) {
                    localStorage.policyTemp = data;
                    var str = "";
                    //-------------设置策略
                    var allPolicys = JSON.parse(data)['firewall_policies'];
                    for (var i = 0; i < allPolicys.length; i++) {
                        str += "<option value='" + allPolicys[i].id + "''>" + allPolicys[i].name + "</option>"
                    }
                    $(".fireWall_policys_selected").append(str);
                    //-------------设置路由
                    var allRounters = JSON.parse(localStorage.router_temp)['routers'];
                    str = "";
                    var flag = 0;
                    for (var i = 0; i < allRounters.length; i++) {
                        flag = 0;
                        for (var k = 0; k < router_router_ids.length; k++) {
                            router_ids = router_router_ids[k]['router_ids'];
                            console.log("----->" + k);
                            if (router_ids.length != 0) {
                                for (var j = 0; j < router_ids.length; j++) {
                                    if (flag == 0 && router_ids[j] != allRounters[i].id) {
                                        if (k == (router_router_ids.length - 1) && j == (router_ids.length - 1)) {
                                            str += '<label class="control-lable">' +
                                                '<input type="checkbox" class="fireWall_routers" value=' + allRounters[i].id + '>' + allRounters[i].name +
                                                '</input></label><br/>';
                                        }
                                    } else {
                                        flag = 1;
                                        break;
                                    }
                                }
                            } else {
                                if (flag == 1) {
                                    break;
                                } else if (k != (router_router_ids.length - 1)) {
                                    continue;
                                } else if (k == (router_router_ids.length - 1)) {
                                    str += '<label class="control-lable">' +
                                        '<input type="checkbox" class="fireWall_routers" value=' + allRounters[i].id + '>' + allRounters[i].name +
                                        '</input></label><br/>';
                                }
                            }
                        }
                    }
                    $(".routers_checkBox").append(str);
                }
            });
        }
    });
});
//-------创建防火墙
$(".addFireWall_OK").click(function() {
    var fire_create = {
        "firewall": {
            "admin_state_up": true,
            "firewall_policy_id": null,
            "description": "",
            "name": "",
            "router_ids": []
        }
    };
    var fireWall = fire_create['firewall'];
    if ($(".manager_status").val() == "true")
        fireWall.admin_state_up = true;
    else
        fireWall.admin_state_up = false;
    fireWall.firewall_policy_id = $(".fireWall_policys_selected").val();
    if ($(".fireWall_desc").val() != "" && $(".fireWall_desc").val() != null)
        fireWall.description = $(".fireWall_desc").val();
    if ($(".fireWall_name").val() != "" && $(".fireWall_name").text() != null)
        fireWall.name = $(".fireWall_name").val();
    //var rout_ids = "['";
    var i = 0;
    $(".fireWall_routers:checked").each(function() {
        fireWall.router_ids[i++] = $(this).val();
    });
    router_FreeNum -= fireWall.router_ids.length;
    console.log(fire_create);
    $.ajax({
        type: "POST",
        data: JSON.stringify(fire_create),
        contentType: "application/json",
        url: config["host"] + "/firewall/create" + "?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        },
        error: function(data) {
            alert("我在浪费时间，我在挥霍时光，我在模糊现在，我在恐惧未来。");
        }
    });

});

//-------删除防火墙
//------------单删
$(document).on("click", ".delete_fireWallSimple", function() {
    var routerStr = $(this).attr("name");
    var id = $(this).attr("id");
    if ($(this).attr("name") != "") {
        router_FreeNum += routerStr.split(",").length;
    }
    var json_array = '{"firewall_ids":["' + id + '"]}';
    deleteAjaxInfo(json_array);
});
//------------批量删除
$(document).on('change', ".fireWall_check", function() {
    if ($(".fireWall_check:checked").length == 0)
        $(".delete_fireWalls").attr("disabled", true);
    else
        $(".delete_fireWalls").attr("disabled", false);
});
$(".delete_fireWalls").click(function() {
    var json_array = '{"firewall_ids":[';
    $(".fireWall_check:checked").each(function() {
        if ($(this).attr("name") != "") {
            router_FreeNum += $(this).attr("name").split(",").length;
        }
        if (json_array != '{"firewall_ids":[')
            json_array += ',"' + $(this).attr("id") + '"';
        else
            json_array += '"' + $(this).attr("id") + '"';
    });
    json_array += "]}";
    deleteAjaxInfo(json_array);
});

function deleteAjaxInfo(json_array) {
    console.log(json_array);
    $.ajax({
        type: "POST",
        data: json_array,
        contentType: "application/json",
        url: config["host"] + "/firewall/delete?token=" + window.localStorage.token,
        success: function(data) {
            console.log(data);
            var id_status = JSON.parse(data);
            for (var x in id_status) {
                if (id_status[x] == 204) {
                    alert(x + "删除成功！");
                    $(".fireWall_tr").remove();
                    $("#" + x + "").parent().parent().remove();
                    var footer_str = "<tr class='active tfoot-dsp fireWall_tr'><td colspan='8'>Displaying <span id='item_count'>" + (--fireWall_len) + "</span> items</td></tr>";
                    $(".fireWall_footer").append(footer_str);
                } else
                    alert(x + "删除失败");
            }
        },
        error: function(data) {
            alert("error!");
        }
    });
}
//----------------编辑防火墙
function clear_info() {
    $(".fireWall_policys_selected").empty();
    $(".fireWall_name").empty();
    $(".fireWall_desc").empty();
}
$(".addFireWall_cancel").click(function() {
    clear_info();
});
var fireWall_updateId;
$(document).on('click', ".edit_fireWall", function() {
    clear_info();
    fireWall_updateId = $(this).attr("name");
    var name = $(this).parent().parent().siblings(":eq(1)").text();
    $(".update_fireWall_name").val(name);
    var desc = $(this).parent().parent().siblings(":eq(2)").text();
    $(".update_fireWall_desc").val(desc);
    var status = $(this).parent().parent().siblings(":eq(6)").text();
    if (status == "上")
        $(".update_manager_status option[value=true]").attr("selected", true);
    else
        $(".update_manager_status option[value=false]").attr("selected", true);
    var policy = $(this).parent().parent().siblings(":eq(3)").text();
    $.ajax({
        type: "GET",
        url: config["host"] + "/firewall_policies?token=" + window.localStorage.token,
        success: function(data) {
            var str = "";
            var allPolicys = JSON.parse(data)['firewall_policies'];
            for (var i = 0; i < allPolicys.length; i++) {
                if (allPolicys[i].name == policy)
                    policy = allPolicys[i].id;
                str += "<option value='" + allPolicys[i].id + "''>" + allPolicys[i].name + "</option>"
            }
            $(".update_fireWall_policys_selected").append(str);
            $(".update_fireWall_policys_selected option[value=" + policy + "]").attr("selected", true);
        }
    });
});

$(".updateFireWall_cancel").click(function() {
    $(".update_fireWall_policys_selected").empty();
    $(".update_fireWall_name").empty();
    $(".update_fireWall_desc").empty();
});
$(".update_FireWall_OK").click(function() {
    var fire_create = {
        "firewall": {
            "admin_state_up": true,
            "firewall_policy_id": null,
            "description": "",
            "name": ""
        }
    };
    var fireWall = fire_create['firewall'];
    if ($(".update_manager_status").val() == "true")
        fireWall.admin_state_up = true;
    else
        fireWall.admin_state_up = false;
    fireWall.firewall_policy_id = $(".update_fireWall_policys_selected").val();
    if ($(".update_fireWall_desc").val() != "" && $(".update_fireWall_desc").val() != null)
        fireWall.description = $(".update_fireWall_desc").val();
    if ($(".update_fireWall_name").val() != "" && $(".update_fireWall_name").text() != null)
        fireWall.name = $(".update_fireWall_name").val();
    console.log(fire_create);
    $.ajax({
        type: "POST",
        data: JSON.stringify(fire_create),
        contentType: "application/json",
        url: config["host"] + "/firewall/update/" + fireWall_updateId + "?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });

});
//---------更新关联路由----删除
$(document).on("click", ".delete_fireWallRouter", function() {
    $(".routers_updatecheckBox").empty();
    var curr_fireWallId = $(this).attr("id");
    var curr_fireWall;
    $.ajax({
        type: "GET",
        url: config["host"] + "/firewalls?token=" + window.localStorage.token,
        success: function(data) {
            var fireWalls = JSON.parse(data)['firewalls'];
            for (var m = 0; m < fireWalls.length; m++) {
                var fireWall = fireWalls[m];
                if (fireWall.id == curr_fireWallId) {
                    curr_fireWall = fireWall;
                    break;
                }
            }
            var router_ids = curr_fireWall['router_ids'];
            //-------------设置路由
            var allRounters = JSON.parse(localStorage.router_temp)['routers'];
            str = "";
            var flag = 0;
            for (var i = 0; i < allRounters.length; i++) {
                flag = 0;
                for (var j = 0; j < router_ids.length; j++) {
                    if (router_ids[j] == allRounters[i].id) {
                        str += '<label class="control-lable">' +
                            '<input type="checkbox" class="fireWall_routers" value=' + allRounters[i].id + ' checked>' + allRounters[i].name +
                            '</input></label><br/>';

                    }
                }
            }
            $(".routers_updatecheckBox").append(str);

            //----------更新路由提交
            $(".updateFireWallRouter_OK").click(function() {
                var fire_create = {
                    "firewall": {
                        "admin_state_up": true,
                        "firewall_policy_id": null,
                        "description": "",
                        "name": "",
                        "router_ids": []
                    }
                };
                curr_fireWall['router_ids'] = new Array();
                var temp = 0;
                $(".fireWall_routers:checked").each(function() {
                    for (var i = 0; i < router_ids.length; i++) {
                        if ($(this).val() == router_ids[i]) {
                            curr_fireWall['router_ids'][temp++] = router_ids[i];
                            break;
                        }
                    }
                });
                delete curr_fireWall.status;
                delete curr_fireWall.id;
                delete curr_fireWall.tenant_id
                fire_create['firewall'] = curr_fireWall;
                console.log(JSON.stringify(fire_create));
                $.ajax({
                    type: "POST",
                    data: JSON.stringify(fire_create),
                    contentType: "application/json",
                    url: config["host"] + "/firewall/update/" + curr_fireWallId + "?token=" + window.localStorage.token,
                    success: function(data) {
                        //console.log(data);
                        window.location.reload();
                    }
                });
            });
        }
    });
});
//---------更新关联路由----添加
$(document).on("click", ".add_fireWallRouter", function() {
    $(".routers_updatecheckBox").empty();
    var curr_fireWallId = $(this).attr("id");
    var curr_fireWall;
    $.ajax({
        type: "GET",
        url: config["host"] + "/firewalls?token=" + window.localStorage.token,
        success: function(data) {
            var router_router_ids = JSON.parse(data)['firewalls'];
            for (var m = 0; m < router_router_ids.length; m++) {
                var fireWall = router_router_ids[m];
                if (fireWall.id == curr_fireWallId) {
                    curr_fireWall = fireWall;
                    break;
                }
            }
            var str = "";
            //-------------设置路由
            var allRounters = JSON.parse(localStorage.router_temp)['routers'];
            str = "";
            var flag = 0;
            for (var i = 0; i < allRounters.length; i++) {
                flag = 0;
                for (var k = 0; k < router_router_ids.length; k++) {
                    router_ids = router_router_ids[k]['router_ids'];
                    if (router_ids.length != 0) {
                        for (var j = 0; j < router_ids.length; j++) {
                            if (flag == 0 && router_ids[j] != allRounters[i].id) {
                                if (k == (router_router_ids.length - 1) && j == (router_ids.length - 1)) {
                                    str += '<label class="control-lable">' +
                                        '<input type="checkbox" class="fireWall_routers" value=' + allRounters[i].id + '>' + allRounters[i].name +
                                        '</input></label><br/>';
                                }
                            } else {
                                flag = 1;
                                break;
                            }
                        }
                    } else {
                        if (flag == 1) {
                            break;
                        } else if (k != (router_router_ids.length - 1)) {
                            continue;
                        } else if (k == (router_router_ids.length - 1)) {
                            str += '<label class="control-lable">' +
                                '<input type="checkbox" class="fireWall_routers" value=' + allRounters[i].id + '>' + allRounters[i].name +
                                '</input></label><br/>';
                        }
                    }
                }
            }
            $(".routers_updatecheckBox").append(str);
            //----------更新路由提交
            $(".updateFireWallRouter_OK").click(function() {
                var fire_create = {
                    "firewall": {
                        "admin_state_up": true,
                        "firewall_policy_id": null,
                        "description": "",
                        "name": "",
                        "router_ids": []
                    }
                };
                /*                curr_fireWall['router_ids'] = new Array();*/
                var temp = curr_fireWall['router_ids'].length;
                //  console.log(curr_fireWall);
                $(".fireWall_routers:checked").each(function() {
                    curr_fireWall['router_ids'][temp++] = $(this).val();

                });
                // console.log(temp);
                delete curr_fireWall.status;
                delete curr_fireWall.id;
                delete curr_fireWall.tenant_id
                fire_create['firewall'] = curr_fireWall;
                //console.log(JSON.stringify(fire_create));
                $.ajax({
                    type: "POST",
                    data: JSON.stringify(fire_create),
                    contentType: "application/json",
                    url: config["host"] + "/firewall/update/" + curr_fireWallId + "?token=" + window.localStorage.token,
                    success: function(data) {
                        //console.log(data);
                        window.location.reload();
                    }
                });

            });
        }
    });
});

//---------列出防火墙
function setFireWallList(data, routerStr, policyStr, i) {
    var str = '<tr><td><input type="checkbox" class="fireWall_check" id="' + data.id + '" name="' + routerStr + '"></td><td>' +
        '<a href="#/net/firewall-desc?' + i + '">' + data.name + '</a></td>' +
        '<td>' + data.description + '</td>' +
        '<td><a href="#/net/firewall-strategy-desc?' + i + '">' + policyStr + '</a></td>' +
        '<td>' + routerStr + '</td>' +
        '<td>' + data.status + '</td>' +
        '<td>' + data.admin_state_up + '</td><td><div class="btn-group">' +
        '<button type="button" name="' + data.id + '" class="btn btn-default btn-sm edit_fireWall" data-toggle="modal" data-target="#modal_update_firewall">编辑防火墙</button><button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">' +
        '<span class="caret"></span>' +
        '<span class="sr-only">切换下拉菜单</span>' +
        '</button>' +
        '<ul class="dropdown-menu" role="menu">' +
        '<li class="delete_fireWallSimple" id="' + data.id + '" name="' + routerStr + '"><a href="javascript:void(0)" >删除防火墙</a></li>';
    if (router_FreeNum > 0)
        str += '<li class="add_fireWallRouter" id="' + data.id + '" data-toggle="modal" data-target="#modal_update_router"><a href="javascript:void(0)">添加路由</a></li>';
    if (routerStr != "")
        str += '<li class="delete_fireWallRouter" id="' + data.id + '" data-toggle="modal" data-target="#modal_update_router"><font color="red"><a href="javascript:void(0)">删除路由</a></font></li>';
    str += '</ul>' +
        '</div>' +
        '</td>' +
        '</tr>';
    $(".fireWall_info").append(str);
}
