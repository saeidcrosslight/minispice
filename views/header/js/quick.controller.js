var oldProjectPath = "c:\\", oldFilePath = "";


angular.module('quick.controller', [])
        .controller('quickBarController', ['$rootScope', '$scope', 'file', function ($rootScope, $scope, file) {
                $scope.addFileTypes = ['asc','json'];
                var product = $rootScope.product,
                        networkObject = $rootScope.networkObject,
                        getFilePath = function (filepath) {
                            var num = filepath.lastIndexOf("\\");
                            return filepath.substring(0, num);
                        },
                        getFileName = function (filepath) {
                            var num = filepath.lastIndexOf("\\");
                            return filepath.substring(num + 1);
                        },
                        resetNewProject = function () {
                            $("#newProjectName").val("");
                            $("#newProjectPath").val("c:\\");
                            oldProjectPath = "c:\\";
                            $("#chooseProjectPath").val("");
                            //document.querySelector('#chooseProjectPath').value = "";
                        },

                        resetCreatedStructures = function () {
                            _.each(graph.getElements(), function(el) {
                                graph.getCell(el.id).remove();
                            });
                        },

                        addWire = function () {
                            if(!product.activateWire) {
                                paper.on({
                                    'blank:pointerdown': function (evt, x, y) {
                                        var link = new joint.dia.Link();
                                        link.set('source', {x: x, y: y});
                                        link.set('target', {x: x, y: y});
                                        link.addTo(this.model);
                                        evt.data = {link: link, x: x, y: y};
                                    },
                                    'blank:pointermove': function (evt, x, y) {
                                        evt.data.link.set('target', {x: x, y: y});
                                    },
                                    'blank:pointerup': function (evt) {
                                        var target = evt.data.link.get('target');
                                        if (evt.data.x === target.x && evt.data.y === target.y) {
                                            // remove zero-length links
                                            evt.data.link.remove();
                                        }
                                    }
                                });
                                product.quickMenus[7].disabled = "activatedBtn";
                                product.activateWire = true;
                            }else {
                                paper.off('blank:pointerdown');
                                paper.off('blank:pointermove');
                                paper.off('blank:pointerup');
                                product.quickMenus[7].disabled = "";
                                product.activateWire = false;
                            }
                        },
                        switchToDrawingTool = function () {
                            if ($("#drawingTool").parent()[0].style.display === 'none') {
                                $("#regionContent").layout("expand", "west");//show wizard pannel
                            }
                        },

                newProjectFunction = function () {
                    if (product.addedCircuitComponents.length>0 && product.newPath.length > 0) {
                        if (confirm("Do to want to exit?") == true) {
                            resetCreatedStructures();
                        } else {
                            return false;
                        }
                    }

                    resetNewProject();
                    $("#newProjectWindow").modal('toggle');
                    var pj = document.querySelector('#chooseProjectPath');
                    pj.addEventListener("change", function () {
                        if ($("#newProjectName").val() !== "")
                            $('#newProjectPath').val(this.value + "\\" + $("#newProjectName").val());
                        else
                            $('#newProjectPath').val(this.value);
                        oldProjectPath = this.value;
                    }, false);
                };

                /**
                 * Updating when change project name in New Project Window
                 */
                updateProjectPath = function () {
                    $("#newProjectPath").val(oldProjectPath + "\\" + $("#newProjectName").val());
                };
                updateFilePath = function () {
                    $("#newFilePath").val(oldFilePath + "\\");
                };
                $scope.newProject = function () {
                    var newName = $("#newProjectName").val(),
                            newPath = $("#newProjectPath").val().replace(/\\/g, '\\\\');
                    product.newPath = newPath;
                    product.newProjectName = newName;
                            // product = simucenter.currentProduct();
                    if (newName === "" || newPath === "") {
                        alert("Project name and path cannot be empty!");
                    } else {
                        var addFileTypes = [];
                        addFileTypes.length = 0;
                        var checkedObjects = $("input[name='newPrjectFileType_" + product.productName + "']:checked");
                        if (checkedObjects.length > 0){
                            angular.forEach(checkedObjects, function (obj) {
                                addFileTypes.push($(obj).val());
                            });
                        }
                        if (addFileTypes.length === 0) {
                            alert("Please choose file type!");
                            return;
                        }
                        product.createProject(newName, newPath, addFileTypes);
                        product.filetree.resetAllFileTree(product.filetree);
                        product.filetree.createAllFileTree(product.filetree, newPath);
                        var fileName = newName + "." + addFileTypes[0];
                        var editorObject = product.editors.getEditorObject(product.productName, newName, newPath);//filepath(last parameter)
                        product.editors.closeAllFile(editorObject.editorContainerID, product.openFiles);
                        product.editors.createEdtior(product, fileName, newPath + "\\\\" + fileName, editorObject.editorID, editorObject.editorContainerID, editorObject.editorArrayObject);
                        //var projectPath = getFilePath(filePath);
                        product.title = "Welcome to SimuCenter - Simu" + product.productName + " - " + newPath.replace(/\\/g, '/');
                        $("#newProjectWindow").modal('toggle');
                    }
                    product.enableSaveButton();
                };

                $scope.quickEvent = function (index, isDisabled) {
                    if (isDisabled === 'disabled')
                        return;
                    switch (index) {
                        case 0: //New
                            newProjectFunction();
                            break;
                        case 1: //Open
                            $("#fileDialog").click();
                            break;
                        case 2: //Close
                            console.log("close project");
                            break;
                        case 3: //save created structure
                            product.saveCreatedStructure(product.newPath, product.newProjectName, product.addedCircuitComponents, "asc");
                            break;
                        case 4: //User Setting
                            console.log("setting");
                            break;
                        case 5:
                            comsole.log("undo");
                            break;
                        case 6:
                            console.log("redo");
                            break;
                        case 7:
                            addWire();
                            break;
                    }
                };

            }]);