var modifyPasswdApp = angular.module('modifyPasswdApp', []);

modifyPasswdApp.controller('modifyPasswdCtrl', ['$scope', function($scope) {
    $("head title").text("修改密码");
    $(".nav-sidebar a[href='#/info/modify-passwd']").css({
        "color": "#fff",
        "background-color": "#428bca"
    });
    var linkEle = $(".nav-sidebar li a");
    linkEle.click(function() {
        linkEle.css({
            "color": "#337ab7",
            "background-color": "transparent"
        });
    });
}])
