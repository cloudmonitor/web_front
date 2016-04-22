$(function() {
    var num = window.location.href.split("?")[1];
    var policy_Info;
    if (num.length > 3) {
        var policies = JSON.parse(localStorage.policyTemp)['firewall_policies'];
        for (var i = 0; i < policies.length; i++) {
            if (policies[i].id == num) {
                policy_Info = policies[i];
                break;
            }
        }
    } else {
        policy_Info = JSON.parse(localStorage.policyInfo)[num];
    }
    console.log("==========================>");
    console.log(policy_Info);
    $("#policy_name").html(policy_Info.name);
    if (policy_Info.description == "")
        policy_Info.description = "无";
    $("#policy_desc").html(policy_Info.description);
    $("#policy_id").html(policy_Info.id);
    $("#policy_proId").html(policy_Info.tenant_id);

    var rules = policy_Info.firewall_rules;
    var str = "";
    $.ajax({
        type: "GET",
        url: config["host"] + "/firewall_rules?token=" + window.localStorage.token,
        success: function(data) {
            //console.log(data);
            localStorage.firewall_rules = data;
            var rules_Info = JSON.parse(data)['firewall_rules'];
            for (var i = 0; i < rules.length; i++) {
                for (var j = 0; j < rules_Info.length; j++) {
                    var rule = rules_Info[j];
                    var rule_id = rules[i];
                    if (rule_id == rule.id) {
                        str += '<li><span>' + (i + 1) + '</span>：<a href="#/net/firewall-ruleDesc?' + rule.id + '">' + rule.name + '</a></li>';
                    }
                }
            }
            if (str != "")
                $("#policy_rules").append(str);
            else
                $("#policy_rules").append("-");
        },
        error: function(data) {
            createAndHideAlert("信息获取失败");
            console.log(data);
        }
    });


    $("#policy_share").text(policy_Info.shared);
    $("#policy_audit").text(policy_Info.audited);

});
