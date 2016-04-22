$(function() {
    var rules_len = 0;
    var id = window.location.href.split("?")[1];
    // if (localStorage.securitys_temp == undefined||localStorage.securitys_temp == "undefined") {
    $.ajax({
        type: "GET",
        url: config["host"] + "/security_groups?token=" + window.localStorage.token,
        success: function(data) {
            window.localStorage.securitys_temp = data;
            console.error("securitys_groups", JSON.parse(window.localStorage.securitys_temp)['security_groups']);
            setInfo(rules_len, id);
        }
    });
    /*    }
        else
        {
            alert(typeof(localStorage.securitys_temp));
            console.error(localStorage.securitys_temp);
            setInfo(rules_len,id);
        }*/

    //------------单个删除操作·！！！！！！
    $(document).on("click", ".delete_rule", function() {
        var id = $(this).parent().siblings().first().children(".rule_id").attr("id");

        var json_array = '{"sg_rules_ids":["' + id + '"]}';
        console.log(json_array);
        $.ajax({
            type: "POST",
            data: json_array,
            contentType: "application/json",
            url: config["host"] + "/sg_rules/delete?token=" + window.localStorage.token,
            success: function(data) {
                var id_status = JSON.parse(data);
                for (var x in id_status) {
                    if (id_status[x] == 204) {
                        createAndHideAlert(x + "删除成功！");
                        $("#" + x + "").parent().parent().remove();
                        $(".footerID").remove();
                        var str_footer = '<tr class="active tfoot-dsp footerID"><td colspan="13">Displaying <span id="item_count">' + (--rules_len) + '</span> items</td></tr>';
                        $(".rule_footer").append(str_footer);
                    } else
                        createAndHideAlert(x + "删除失败");
                }
            },
            error: function(data) {

            }
        });

    });

    //----------------全选的控制
    $(document).on("change", ".all_check", function() {
        var isChecked = $(this).prop("checked");
        $(".rule_id").prop("checked", isChecked);
        if (isChecked) {
            $(".delete_rule_multi").attr("disabled", false);
        } else {
            $(".delete_rule_multi").attr("disabled", true);
        }
    });
    //——————————————批量删除！！！！
    $(document).on("change", ".rule_id", function() {
        if ($(".rule_id:checked").length == $(".rule_id").length) {
            $(".delete_rule_multi").attr("disabled", false);
            $(".all_check").prop("checked", true);
        } else if ($(".rule_id:checked").length > 0) {
            $(".delete_rule_multi").attr("disabled", false);
            $(".all_check").prop("checked", false);
        } else {
            $(".delete_rule_multi").attr("disabled", true);
            $(".all_check").prop("checked", false);
        }
    });

    $(".delete_rule_multi").click(function() {
        var json_array = '{"sg_rules_ids":[';
        $(".rule_id:checked").each(function() {
            if (json_array != '{"sg_rules_ids":[')
                json_array += ',"' + $(this).attr("id") + '"';
            else
                json_array += '"' + $(this).attr("id") + '"';
        });
        json_array += "]}";
        console.log(json_array);
        $.ajax({
            type: "POST",
            data: json_array,
            contentType: "application/json",
            url: config["host"] + "/sg_rules/delete?token=" + window.localStorage.token,
            success: function(data) {
                var id_status = JSON.parse(data);
                for (var x in id_status) {
                    if (id_status[x] == 204) {
                        createAndHideAlert(x + "删除成功！");
                        $("#" + x + "").parent().parent().remove();
                        $(".footerID").remove();
                        var str_footer = '<tr class="active tfoot-dsp footerID"><td colspan="13">Displaying <span id="item_count">' + (--rules_len) + '</span> items</td></tr>';
                        $(".rule_footer").append(str_footer);
                    } else
                        createAndHideAlert(x + "删除失败");
                }
            },
            error: function(data) {
                createAndHideAlert(x + "删除失败");
            }
        });
    });

    $(".port_selected").change(function() {
        $(".port_div").val("");
        $(".port_min_div").val("");
        $(".port_max_div").val("");
        if ($(".port_selected").val() == "port") {
            $(".port_div").show();
            $(".port_min_div").hide();
            $(".port_max_div").hide();

        } else {
            $(".port_div").hide();
            $(".port_min_div").show();
            $(".port_max_div").show();
        }
    });

    //-------------------添加规则
    $(".create_rule").click(function() {
        var rule_new = {
            "security_group_rule": {
                "direction": "ingress",
                "port_range_min": "234",
                "remote_ip_prefix": "0.0.0.0/0",
                "ethertype": "IPv4",
                "port_range_max": "234",
                "protocol": "tcp",
                "security_group_id": null
            }
        };
        var ruleVlue = rule_new['security_group_rule'];
        ruleVlue.security_group_id = id;
        ruleVlue.protocol = $(".select_rule").val();
        ruleVlue.direction = $(".director").val();
        var port_temp = $(".port_selected").val();
        // createAndHideAlert($(".port_text").val());
        if (($(".port_text").val() != null && $(".port_text").val() != "") || ($(".portmin_text").val() != null && $(".portmin_text").val() != "")) {
            if (port_temp == "port") {
                ruleVlue.port_range_min = $(".port_text").val();
                ruleVlue.port_range_max = $(".port_text").val();
            } else {
                ruleVlue.port_range_min = $(".portmin_text").val();
                ruleVlue.port_range_max = $(".portmax_text").val();
            }
        } else {
            createAndHideAlert("请填写端口....^-^");
        }

        if ($(".CIDR_val").val() != null && $(".CIDR_val").val() != "")
            ruleVlue.remote_ip_prefix = $(".CIDR_val").val();
        console.log(rule_new);
        $.ajax({
            type: "POST",
            data: JSON.stringify(rule_new),
            contentType: "application/json",
            url: config["host"] + "/sg_rules/create?token=" + window.localStorage.token,
            success: function(data) {
                console.log(data);
                var firewallrule = JSON.parse(data)['security_group_rule'];
                setRule(firewallrule);
                $(".footerID").remove();
                var str_footer = '<tr class="active tfoot-dsp footerID"><td colspan="13">Displaying <span id="item_count">' + (++rules_len) + '</span> items</td></tr>';
                $(".rule_footer").append(str_footer);
            },
            error: function(data) {

            }
        });
    });


});

function setInfo(rules_len, id) {
    var securitys_groups = JSON.parse(window.localStorage.securitys_temp)['security_groups'];
    var securitys_rules;
    //---------相应安全组的规则

    console.error("id", id);
    for (var i = 0; i < securitys_groups.length; i++) {
        var securitys_group = securitys_groups[i];
        if (id == securitys_group.id) {
            $(".securitys_group_Id").html(securitys_group.name + " (" + id + ")");
            securitys_rules = securitys_group.security_group_rules;
            break;
        }
    }
    //--------规则的操作
    for (var i = 0; i < securitys_rules.length; i++) {
        setRule(securitys_rules[i]);
    }
    rules_len = securitys_rules.length;
    var str_footer = '<tr class="active tfoot-dsp footerID"><td colspan="13">Displaying <span id="item_count">' + rules_len + '</span> items</td></tr>';
    $(".rule_footer").append(str_footer);
}

function setSecurityRulesList(data) {
    var str = "<tbody><tr><td><input class='rule_id' type='checkbox' id='" + data.id + "'>" +
        "</td><td>" + data.direction +
        "</td><td>" + data.ethertype +
        "</td><td>" + data.protocol +
        "</td><td>" + data.port_range_min +
        "</td><td>" + data.remote_ip_prefix +
        "</td><td>" + data.remote_group_id +
        "</td><td><a href='javascript:void(0)' class='btn btn-primary delete_rule' style='background:white'><font style = 'color:black'> <i class = 'fa fa-plus' > </i>" + "删除规则" +
        "</font></a></td></tr>";
    $(".fireWallRule_info").append(str);
}

function setRule(rule) {
    if (rule.direction == "egress")
        rule.direction = "出口";
    else
        rule.direction = "入口";

    if (rule.protocol == null)
        rule.protocol = "任何";

    if (rule.port_range_min != null && rule.port_range_min != rule.port_range_max)
        rule.port_range_min = rule.port_range_min + ":" + rule.port_range_max;
    else if (rule.port_range_min == null)
        rule.port_range_min = "任何";

    if (rule.remote_ip_prefix == null) {
        if (rule.ethertype == "IPv4")
            rule.remote_ip_prefix = "0.0.0.0/0";
        else
            rule.remote_ip_prefix = "::/0";
    }
    if (rule.remote_group_id == null)
        rule.remote_group_id = "-";

    setSecurityRulesList(rule);
}
