'use strict';

angular
        .module('object.product', [])
        .factory('product', ['$rootScope', 'filetree', 'editor', 'file', 'childprocess', '$sce', function ($rootScope, filetrees, editor, file, childprocess, $sce) {
                var scene, renderer, camera, controls, morefile, macfile;
                var fs = require('fs');
                var factory = {},
                        productObject = function () {
                            this.activateWire = false;
                            this.circuitComponents = [];
                            this.addedCircuitComponents = [];
                            this.circuitProperties = [];
                            this.productList = [
                                {"name": "Drawing Tool", "id": 0, "class": "apsys"},
                                ];
                            this.title = '';
                            this.appPath = '';
                            this.projectPath = '';
                            this.newPath = '';
                            this.navigations = [];
                            this.quickMenus = [];
                            this.recentFiles = [];
                            this.openFiles = [];
                            this.runFileList = [];
                            this.setFont = setFont;
                            this.switchProduct = switchProduct;
                            this.editorFontSize = "14px";
                            this.wizardFontSize = "100%";
                            this.filetree = filetrees.createFiletreeObject();
                            this.editors = editor.createEditorContainerObject();
                            this.isInit = false;
                            this.showRecentFile = false;
                            this.showStartPage = true;
                            this.init = init;
                            this.getUserSetting = getUserSetting;
                            this.setUserSetting = setUserSetting;
                            this.enableSaveButton = enableSaveButton;
                            this.getSettingValue = getSettingValue;
                            this.getQuickBar = getQuickBar;
                            this.getCircuitComponents = getCircuitComponents;
                            this.getRecentFile = getRecentFile;
                            this.getCurrentPath = getCurrentPath;
                            this.saveCreatedStructure = saveCreatedStructure;
                            this.getExtensionName = getExtensionName;
                            this.writeRecentFile = writeRecentFile;
                            this.deleteRecentFile = deleteRecentFile;
                            this.createProject = createProject;
                            this.refreshUndoRedo = refreshUndoRedo;
                        },

                        setFont = function () {
                            $(".ace_editor *").css("fontSize", this.editorFontSize);
                            $(".ace_editor span").css("fontSize", this.editorFontSize);
                        },

                        switchProduct = function (pindex) {
                            switch (pindex) {
                                case 0: //drawingTool
                                    if ($("#drawingTool").parent()[0].style.display === 'none') {
                                        $("#regionContent").layout("expand", "west");//show wizard pannel
                                    }else{
                                        $("#regionContent").layout("collapse", "west");
                                    }
                                    break;
                            }
                        },

                        enableSaveButton = function () {
                            if(this.addedCircuitComponents.length > 0 && this.newPath.length > 0 && this.quickMenus[3].disabled === "disabled"){
                                this.quickMenus[3].disabled = "";
                            }
                        },

                        init = function () {
                            this.appPath = getUserSetting(this);
                            this.quickMenus = getQuickBar();
                            this.circuitComponents = getCircuitComponents();
                            this.recentFiles = getRecentFile(this.productName);
                            this.filetree.inputfiles = new this.filetree.minispiceInputFileTreeInit;
                            this.editors.startPageInit(this.openFiles);
                            this.isInit = true;
                         },

                        saveCreatedStructure = function (projectPath, projectName, data, fileExtension) {
                            var filePath = projectPath + "\\" + projectName + "." + fileExtension;
                            file.writeallsync(filePath, JSON.stringify(data, null, 2));
                            this.quickMenus[3].disabled = "disabled";
                        },

                        checkAppPath = function (product) {
                            //refactored this from SimuCenter
                            var pt = getCurrentPath(),
                                    t = pt.split('\\'),
                                    foldername = t[t.length - 1],
                                    indexnum = pt.lastIndexOf('\\'),
                                    rpath = "";
                            var haspath = false;
                            if (file.existsfile(userSettingPath()) && !haspath) {
                                var uersetting = angular.fromJson(file.readallsync(userSettingPath()));
                                 if (product.productName === 'Apsys') {
                                    rpath = getSettingValue(uersetting, "MiniSpicePath");
                                }
                            }
                            return rpath;
                        },

                        getUserSetting = function (product) {
                            return checkAppPath(product);
                        },

                        setUserSetting = function (pathName, productPath) {
                            var uersetting = [];
                            if (file.existsfile(userSettingPath())) {
                                uersetting = angular.fromJson(file.readallsync(userSettingPath()));
                                if (getSettingValue(uersetting, pathName) !== "") {
                                    for (var app in uersetting) {
                                        for (var value in uersetting[app]) {
                                            if (pathName === value) {
                                                uersetting[app][value] = productPath;
                                                break;
                                            }
                                        }
                                    }
                                } else {
                                    pushSettingData(uersetting, pathName, productPath);
                                }
                            } else {
                                pushSettingData(uersetting, pathName, productPath);
                            }
                            file.writeallsync(userSettingPath(), angular.toJson(uersetting));
                        },

                        getQuickBar = function () {
                                return angular.fromJson(file.readallsync("json\\quick\\quick.json"));
                        },

                        getCircuitComponents = function () {
                            return angular.fromJson(file.readallsync("json\\keyword\\circuitComponents.json"));
                        },

                        getRecentFile = function (productName) {
                            var recentFiles = [], rPath = recentFilePath();
                            if (file.existsfile(rPath)) {
                                var recentfile = angular.fromJson(file.readallsync(rPath));
                                angular.forEach(recentfile, function (rf) {
                                    if (productName === rf.productName)
                                        recentFiles = rf.recentFiles;
                                });
                            }
                            return recentFiles;
                        },

                        writeRecentFile = function (productName, fileName, filePath) {
                            var recentfile = "", rPath = recentFilePath();
                            if (file.existsfile(rPath)) {
                                recentfile = angular.fromJson(file.readallsync(rPath));
                                var hasProduct = false, isFileExist = false;
                                angular.forEach(recentfile, function (rf) {
                                    if (productName === rf.productName) {
                                        hasProduct = true;
                                        angular.forEach(rf.recentFiles, function (rfile) {
                                            if (rfile.fileName === fileName && rfile.filePath === filePath)
                                                isFileExist = true;
                                        });
                                        if (!isFileExist) {
                                            if (rf.recentFiles.length >= 10)
                                                rf.recentFiles.length -= 1;
                                            rf.recentFiles.unshift({"fileName": fileName, "filePath": filePath});
                                        }
                                    }
                                });
                                if (!hasProduct && !isFileExist)
                                    recentfile.push({"productName": productName, "recentFiles": [{"fileName": fileName, "filePath": filePath}]});
                            } else {
                                recentfile = [{"productName": productName, "recentFiles": [{"fileName": fileName, "filePath": filePath}]}];
                            }
                            file.writeallsync(rPath, angular.toJson(recentfile));
                        },

                        deleteRecentFile = function (productName, fileName, filePath) {
                            var rPath = recentFilePath(),
                                    recentFile = angular.fromJson(file.readallsync(rPath));
                            angular.forEach(recentFile, function (rfs, pindex) {
                                if (productName === rfs.productName) {
                                    angular.forEach(rfs.recentFiles, function (rf, index) {
                                        if (rf.fileName === fileName && rf.filePath === filePath)
                                            recentFile[pindex].recentFiles.splice(index, 1);
                                    });
                                }
                            });
                            file.writeallsync(rPath, angular.toJson(recentFile));
                        },

                        createProject = function (projectName, projectPath, fileTypes) {
                            if (file.existsfile(projectPath)) {
                                if (confirm("The project path already exists, are sure use it?")) {
                                    angular.forEach(fileTypes, function (fileType) {
                                        var filePath = projectPath + "\\" + projectName + "." + fileType;
                                        if (file.existsfile(filePath)) {
                                            if (confirm("The project file already exists, whether or not to replace it?")) {
                                                file.delfile(filePath);
                                                file.writeallsync(filePath, "");
                                            }
                                        } else {
                                            file.writeallsync(filePath, "");
                                        }
                                    });
                                }
                            } else {
                                file.mkdirsync(projectPath);
                                angular.forEach(fileTypes, function (fileType) {
                                    file.writeallsync(projectPath + "\\" + projectName + "." + fileType, "");
                                });
                            }
                        },

                        refreshUndoRedo = function (product) {
                            var currentEditor = product.editors.getCurrentEditorObject(product);
                            if (currentEditor)
                                showFileFunction(product, currentEditor.fileName, currentEditor.filePath, currentEditor.editorID);
                        },

                        getSettingValue = function (settingJSON, pathName) {
                            var appPath = "";
                            for (var app in settingJSON) {
                                for (var value in settingJSON[app]) {
                                    if (pathName === value) {
                                        appPath = settingJSON[app][value];
                                        break;
                                    }
                                }
                            }
                            if (appPath === undefined)
                                appPath = "";
                            return appPath;
                        },

                        pushSettingData = function (uersetting, pathName, productPath) {
                            if (pathName === "MiniSpicePath")
                                uersetting.push({MiniSpicePath: productPath});
                        },
                        getExtensionName = function (fileName) {
                            var fn = fileName.split(".");
                            return fn[fn.length - 1];
                        },
                        getCurrentPath = function () {
                            var path = require('path');
                            return path.dirname(process.execPath);
                        },
                        recentFilePath = function () {
                            return getCurrentPath() + "\\recentfile.json";
                        },
                        userSettingPath = function () {
                            return getCurrentPath() + "\\crosslight.usersetting";
                        };

                factory.createProductObject = function () {
                    return new productObject();
                };
                return factory;
            }]);