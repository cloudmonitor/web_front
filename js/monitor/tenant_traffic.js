/**
 * Created by lwj on 2016/12/18.
 */
var ajaxbg = $("#loading_monitor,#background_monitor");
ajaxbg.show();
setTimeout("ajaxbg.hide()", 2000);

$(function () {
    $('#option1').click();
    var curr_type = "minute";
    var tenant_id = JSON.parse(window.localStorage.token).tenant.id;
    var top_instance_data = get_top_instance(tenant_id, curr_type);
    set_top_instance(tenant_id, curr_type, top_instance_data);



    //天时分改变
    $('#option1').click(function() {
        changeStatus(this);
        ajaxbg.show();
        curr_type = "minute";
        tenant_id = JSON.parse(window.localStorage.token).tenant.id;
        top_instance_data = get_top_instance(tenant_id, curr_type);
        set_top_instance(tenant_id, curr_type, top_instance_data);
    });
    $('#option2').click(function() {
        changeStatus(this);
        ajaxbg.show();
        curr_type = "hour";
        tenant_id = JSON.parse(window.localStorage.token).tenant.id;
        top_instance_data = get_top_instance(tenant_id, curr_type);
        set_top_instance(tenant_id, curr_type, top_instance_data);
    });
    $('#option3').click(function() {
        changeStatus(this);
        ajaxbg.show();
        curr_type = "day";
        tenant_id = JSON.parse(window.localStorage.token).tenant.id;
        top_instance_data = get_top_instance(tenant_id, curr_type);
        set_top_instance(tenant_id, curr_type, top_instance_data);
    });
});

function changeStatus(that) {
    for (var i = 1; i < 4; i++)
        $("#option" + i).removeClass("active");
    $(that).addClass("active");
}

function get_top_instance(tenant_id, curr_type) {
    var meter_datas = ""
    $.ajax({
        type: "GET",
        url: config["host"] + "/v1.0/monitor/" + tenant_id + "/" + curr_type + "?token=" + window.localStorage.token,
        async: false,
        success: function (data) {
            meter_datas = data;
        },
        error: function (data) {
            createAndHideAlert("信息获取失败！");
        }
    });
    return JSON.parse(meter_datas);
}

function set_top_instance(tenant_id, curr_type, meter_datas) {
    var top_instance = echarts.init(document.getElementById("top_instance"));
    var option_top = {
        title : {
            text: '虚拟机流量--TOP 5',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'right',
            padding: [30, 10, 0, 0],
            data:
                (function () {
                    var res = [];
                    for(var i=0; i<meter_datas.length; i++){
                        res.push(meter_datas[i]["_id"]["instance_name"]);
                    }
                    return res;
                })()
        },
        series : [
            {
                name: '虚拟机流量',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:
                    (function () {
                        var res = [];
                        for(var i=0; i<meter_datas.length; i++){
                            res.push({
                                name: meter_datas[i]["_id"]["instance_name"],
                                value: meter_datas[i]["count"]
                            });
                        }
                        return res;
                    })()
                ,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    top_instance.setOption(option_top);

    setInterval(function (){
        var last_datas = get_top_instance(tenant_id, curr_type);
        var data0 = option_top.series[0].data;
        var legend0 = option_top.legend.data;
        data0.splice(0, data0.length);
        legend0.splice(0, legend0.length);
        for(var i=0; i<last_datas.length; i++){
            data0.push({
                name: last_datas[i]["_id"]["instance_name"],
                value: last_datas[i]["count"]
            });
            legend0.push(last_datas[i]["_id"]["instance_name"]);
        }
        top_instance.setOption(option_top);
    }, 5000);

}