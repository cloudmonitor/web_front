$(function() {
    var id = window.location.href.split("?")[1];
    var rules_Info = JSON.parse(localStorage.firewall_rules)['firewall_rules'];
    $.ajax({
        type: "GET",
        url: config["host"] + "/firewall_policies?token=" + window.localStorage.token,
        success: function(data) {
            var allPolicys = JSON.parse(data)['firewall_policies'];
            for (var i = 0; i < rules_Info.length; i++) {
                var rule = rules_Info[i];
                if (rule.id == id) {
                    $("#rule_name").html(rule.name);
                    $("#rule_desc").html(rule.description);
                    $("#rule_id").html(rule.id);
                    $("#rule_proId").html(rule.tenant_id);
                    $("#rule_act").html(rule.action);
                    $("#rule_protocol").html(rule.protocol);
                    $("#rule_start_IP").html(rule.source_ip_address);
                    $("#rule_start_port").html(rule.source_port);
                    $("#rule_end_IP").html(rule.destination_ip_address);
                    $("#rule_end_port").html(rule.destination_port);

                    var policy_id = rule.firewall_policy_id;
                    var policy_str = "";
                    localStorage.policyInfo="[";
                    for (var m = 0; m < allPolicys.length; m++) {
                        var policy = allPolicys[m];
                        if (policy.id == policy_id) {
                            policy_str += '<a href="#/net/firewall-strategy-desc?'+policy_id+'" id="rule_policys">' + policy.name + '</a>';
                            if(localStorage.policyInfo=="[")
                            localStorage.policyInfo += JSON.stringify(allPolicys[m]);
                        else
                            localStorage.policyInfo += ","+JSON.stringify(allPolicys[m]);
                        }
                    }
					localStorage.policyInfo+="]";
                    $("#rule_policys").html(policy_str);
                    $("#rule_where").html(rule.position);
                    $("#rule_shared").text(rule.shared);
                    $("#rule_enable").html(rule.enabled);
                    break;
                }
            }



        },
        error: function(data) {
            createAndHideAlert("信息获取失败");
            console.log(data);
        }
    });




});
