angular
    .module('CrosslightApp', ['ui.tree','shortcut.event','popwindow.directive', 'crosslight.nodejs', 'filetree',
        'circuitDrawingTool.directive',
        'object.filetree', 'editors.directive',
        'object.editor', 'object.product','header.directive','quick.controller','editor.controller'])

    .config( [
        '$compileProvider',
        function( $compileProvider )
        {
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        }
    ])

    .run(function ($rootScope, product) {
        $rootScope.product = $.extend({}, product.createProductObject(), {
            productName: 'Minispice',
            title : 'Welcome to MiniSpice',
            appPathName: 'MiniSpicePath',
        })
    })

    .controller('MainController', ['$rootScope', '$scope', '$sce', 'file', function ($rootScope, $scope, $sce, file) {
        var product  = $rootScope.product,
            currentPath = product.getCurrentPath(),
            t = currentPath.split('\\'),
            foldername = t[t.length - 1],
            getFont = function () {
                var path = require('path'),
                    userSettingPath = path.dirname(process.execPath) + "\\crosslight.usersetting";
                if (file.existsfile(userSettingPath)) {
                    var uersetting = angular.fromJson(file.readallsync(userSettingPath)),
                        editorFontSize = product.getSettingValue(uersetting, "editorFontSize"),
                        wizardFontSize = product.getSettingValue(uersetting, "wizardFontSize");
                    if (editorFontSize !== "")
                        product.editorFontSize = editorFontSize;
                    if (wizardFontSize !== "")
                        product.wizardFontSize = wizardFontSize;
                }
            };
        $rootScope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };
        product.init();
        getFont();
    }]);

