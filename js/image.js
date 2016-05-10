$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/images?token=" + window.localStorage.token,
        success: function(data) {
            var images = JSON.parse(data)['images'];
            for (var i = 0; i < images.length; i++) {
                var image = images[i];
                setImageInfo(image, i);
            }
            $('.image_num').text(" " + images.length + " ");
        }
    });


});

function setImageInfo(data, i) {
    var str = '<tr><td>' + (++i) + '</td>' +
        '<td>' + data.name + '</td>' +
        /*  '<td>' + "镜像" + '</td>' +*/
        '<td>' + (data.status == 'active' ? "运行中" : "状态") + '</td>' +
        /*        '<td>' + (data.visibility == 'public' ? '公有' : '私有') + '</td>' +
                '<td>' + (data.protected == false ? '否' : '是') + '</td>' +*/
        '<td>' + (data.disk_format.toUpperCase()) + '</td>' +
        '<td>' + ((data.size / (1024 * 1024)).toFixed(1)) + " MB" + '</td>' +
        '<td>' + (moment.utc(data.created_at).local()).format('YYYY-MM-DD HH:mm:ss') + '</td>' +
        '</tr>';
    $(".image_body").append(str);
}
