$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/ports?token=" + window.localStorage.token,
        success: function(data) {
            console.error(data);
            var ports = JSON.parse(data)['ports'];
            for (var i = 0; i < ports.length; i++) {
                var port = ports[i];
                setVirNetInfo(port);
            }
            $('.image_num').text(" " + ports.length + " ");
        }
    });


});

function setVirNetInfo(data, i) {
    var str = '<tr><td><input type="checkbox"></td>' +
        '<td>' + data.name + '</td>' +
        '<td>' + data.fixed_ips[0].ip_address + '</td>' +
        '<td>' + (data.status == 'active' ? "运行中" : "状态") + '</td>' +
        '<td>' + (data.visibility == 'public' ? '公有' : '私有') + '</td>' +
        '<td>' + (data.disk_format.toUpperCase()) + '</td>' +
        '<td>' + ((data.size / (1024 * 1024)).toFixed(1)) + " MB" + '</td>' +
        '<td>' + (moment.utc(data.created_at).local()).format('YYYY-MM-DD HH:mm:ss') + '</td>' +
        '</tr>';
    $(".image_body").append(str);
}
