'use strict';

angular
        .module('shortcut.event', [])
        .controller('contentController', ['$rootScope', '$scope', 'file', function ($rootScope, $scope, file) {

                var product = $rootScope.product;
                document.onkeydown = function (event) {
                    var e = event ? event : (window.event ? window.event : null),
                            currKey = 0;
                            //product = simucenter.currentProduct();
                    var currentEditor = product.editors.getCurrentEditorObject(product);
                    if (currentEditor.editorID !== "")
                        var editor = ace.edit(currentEditor.editorID);
                    currKey = e.keyCode || e.which || e.charCode;
                    if (currKey === 83 && e.ctrlKey) {         //Ctrl+S
                        product.editors.saveCurrentFile(product);
                    }
                    product.refreshUndoRedo(product);
                    $("#fixNoRefresh").click();
                };
                
                document.onkeyup = function () {//when edit in editor, save current content
                    var product = $rootScope.product;
                    product.editors.saveCurrentContent(product);
                };

            }]);