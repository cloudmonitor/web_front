$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/tuopu?token=" + window.localStorage.token,
        success: function(data) {
          //console.log(">>>"+data);
            expTopoListChange(data);

        },
        error: function(data) {
            createAndHideAlert("获取信息错误！");
        }
    });

});



