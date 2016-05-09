// 计算 -- 密钥对
var keyPairApp = angular.module('keyPairApp', ['ngMessages']);
keyPairApp.controller('keyPairCtrl', keyPairCtrl);
// 密钥对控制器
function keyPairCtrl($scope, $http) {
    console.info("localStorage.user:", window.localStorage.user);
    $("#curr_userName").html(JSON.parse(window.localStorage.user).username);
    $(".curr_deviceName").html(localStorage.curr_tenant);
    $("#lagout").unbind('click').click(function() {
        //alert(123);
        $('#myModal').modal('toggle')
        window.localStorage.clear();
        location.href = "#/";
        location.reload();
    });
    // 初始化值
    $("head title").text("密钥");
    $(".nav-sidebar a[href='#/compute/key-pair']").css({
        "color": "#fff",
        "background-color": "#428bca"
    }).click(function() {
        $(".nav-sidebar a[href='#/compute/key-pair']").css({
            "color": "#fff",
            "background-color": "#428bca"
        })
    });
    var linkEle = $(".nav-sidebar li a[href!='#/compute/key-pair']");
    linkEle.click(function() {
        $(".nav-sidebar li a").css({
            "color": "#337ab7",
            "background-color": "transparent"
        });
    });

    // 实现模态框可拖动
    $('.modal.draggable>.modal-dialog').draggable({
        cursor: 'move',
        handle: '.modal-header'
    });
    $('.modal.draggable>.modal-dialog>.modal-content>.modal-header').css('cursor', 'move');

    // 默认禁用删除按钮
    $scope.delBtnDis = true;

    // 获取密钥对
    $scope.getKeyItems = function() {
        var url = config.host + "/keypairs?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            // 请求成功
            var data = response.data;
            console.info("返回的数据：", data);
            $scope.keyItems = data.keypairs;
            $scope.itemCount = data.keypairs.length;
        }, function(response) {
            // 请求失败
            $scope.itemCount = 0;
            createAndHideAlert({
                "message": "密钥信息请求失败",
                "className": "alert-danger"
            });
        });
    }();

    // 勾选全选按钮
    $scope.chooseAllBtn = function() {
        console.info("all = ", $scope.all);
        if ($scope.itemCount) {
            // 如果条目数大于0
            $scope.delBtnDis = ($scope.all) ? false : true;
        }
        $scope.one = ($scope.all) ? true : false;
        console.info("$scope.one = ", $scope.one);
    };

    // 勾选表格中的列表项目
    $scope.itemChecked = function(event) {
        var length = $("td input[type='checkbox']:checked").length;
        console.info("该项目的索引值: ", $(event.target));
        $scope.delBtnDis = !length;
        $scope.all = (length === $scope.itemCount);
    };

    // 删除密钥对
    $scope.delKeyBtn = function() {
        // 分别存放将被删除的密钥及密钥下标
        var deleteItems = [];
        var deleteIndex = [];
        var checkedItems = $("td input[type='checkbox']:checked");
        var keyItems = $scope.keyItems;
        for (var i = 0, len = checkedItems.length; i < len; i++) {
            deleteIndex.push($(checkedItems[i]).attr('index'));
            deleteItems.push(keyItems[deleteIndex[i]].keypair.name);
        }
        $scope.deleteItems = deleteItems;
        console.info("将被删除的key: ", deleteItems);
        // 删除key请求(POST)
        var url = config.host + "/keypairs/delete?token=" + window.localStorage.token;
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': "application/json",
            },
            data: JSON.stringify({ "keypair_names": deleteItems })
        };
        // 点击确认删除按钮
        $scope.confirmeDel = function() {
            console.info("req.data : ", deleteItems);
            $http(req).then(function(response) {
                // POST请求成功  {"name1": 202, "name2": 202}
                console.info("删除后返回的数据: ", response.data);
                var data = response.data;
                var SUCCESS = 202;
                var INCREASE = 0;
                for (var i = 0, len = checkedItems.length; i < len; i++) {
                    var name = deleteItems[i];
                    if (data[name] === SUCCESS) {
                        // 删除成功
                        createAndHideAlert({
                            "message": "<strong>密钥删除成功:</strong><br>" + deleteItems[i],
                            "className": "alert-success"
                        });
                        // 从列表中删除这个元素
                        var index = deleteIndex[i] - INCREASE;
                        INCREASE = INCREASE + 1;
                        keyItems.splice(index, 1);
                    } else {
                        // 设置状态为未选中
                        // checkedItems[i].checked = false;
                        createAndHideAlert({
                            "message": "<strong>密钥删除失败:</strong><br>" + deleteItems[i],
                            "className": "alert-danger"
                        });
                    }
                }
                // 隐藏模态框
                $("#deleteKey-modal").modal('hide');
                console.info("未删除的条目: ", keyItems);
                $scope.keyItems = keyItems;
                $scope.all = false;
                $scope.delBtnDis = true;
                $scope.itemCount = keyItems.length;
            }, function(response) {
                // POST请求失败
                createAndHideAlert({
                    "message": "请求删除失败",
                    "className": "alert-danger"
                });
            });
        };
    };

    // 创建密钥模态框
    var createKeyModal = function() {
        var activePill = null;
        // 初始化，不显示公钥导入框
        $scope.showPubKey = false;

        // 点击创建密钥按钮，初始化模态框
        $scope.initKeyModal = function() {
            $scope.submitted = false;

            // 清空输入框内容
            $scope.keyName = undefined;
            $scope.public_key = undefined;
        };

        // 自动下载本地文件
        function download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }


        $("a[data-toggle='tab']").on('show.bs.tab', function(e) {
            activePill = e.target;
            //  tell angular updated the var
            $scope.$apply(function() {
                $scope.showPubKey = !$scope.showPubKey;
            });
            console.info("显示导入密钥框:", $scope.showPubKey);
        });

        // 创建密钥 -- 提交请求
        $scope.createKey = function() {
            $scope.submitted = true;

            console.info("密钥名称:", $scope.form.keyName);

            // 显示公钥输入框
            var showPubKey = $scope.showPubKey;

            // 表单非法
            if ($scope.form.$invalid) return;

            public_key = (showPubKey) ? $scope.form.public_key.$modelValue : undefined;

            // 构造请求数据
            console.info("public_key = ", public_key);
            var url = config.host + "/keypairs/create?token=" + window.localStorage.token;
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': "application/json",
                },
                data: JSON.stringify({ "keypair": { "name": $scope.keyName, "public_key": public_key } })
            };
            console.info("请求格式:", req.data);

            // 请求服务器
            $http(req).then(
                function(response) {
                    // POST请求成功
                    var data = response.data;
                    console.info("请求成功返回的数据： ", data);
                    if (!data.keypair) {
                        createAndHideAlert({
                            "message": "密钥创建失败",
                            "className": "alert-warning"
                        });
                        return;
                    }

                    $scope.keyItems.push(data);
                    createAndHideAlert({
                        "message": "密钥创建成功:<br>" + data.keypair.name,
                        "className": "alert-success"
                    });

                    $scope.itemCount = $scope.keyItems.length;
                    $("#createKey-modal").modal('hide');

                    if (!showPubKey) {
                        // 创建方式一、下载密钥描述文件
                        // parameters1: 文件名   parameter2: 文件内容
                        var filename = data.keypair.name + ".pem";
                        var fileContent = data.keypair.private_key;
                        download(filename, fileContent);
                    }

                },
                function(response) {
                    // POST请求失败
                    createAndHideAlert({
                        "message": "请求创建失败",
                        "className": "alert-danger"
                    });
                });

        };

    }();
}
