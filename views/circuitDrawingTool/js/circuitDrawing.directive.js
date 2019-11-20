angular.module('circuitDrawingTool.directive', [])
    .controller('circuitDrawingToolController', ['$scope', '$timeout', '$rootScope', function($scope, $timeout, $rootScope) {
        var product = $rootScope.product;
        $scope.selectedComponentToModify = {};
        let selectedElementId = "";
        // Canvas where sape are dropped
        $scope.initiatePaper = function () {
            graph = new joint.dia.Graph;
            paper = new joint.dia.Paper({
                el: $('#paper'),
                model: graph,
                width: 2000,
                height: 1400,
                gridSize: 10,
                drawGrid: {name: 'doubleMesh', args:[{color: 'black', thickness: 0.2}, { color: 'black', scaleFactor: 10, thickness: .5 }]},
                linkConnectionPoint: joint.util.shapePerimeterConnectionPoint, //adds connection to an optimum point (ideally we should add terminals in the future)
                interactive: {
                    linkMove: false,
                    vertexMove: false,
                    vertexAdd: false,
                    vertexRemove: false,
                    // useLinkTools: false,
                },
                linkPinning: true, //To prevent the dangling links
                multiLinks : false,
                perpendicularLinks: true,
            });
            // The default router is 'normal'; this can be changed with the defaultRouter paper option
            paper.options.defaultRouter = {
                name: 'normal',
                args: {
                    padding: 10
                }
            };

// Canvas from which you take shapes
            var stencilGraph = new joint.dia.Graph,
                stencilPaper = new joint.dia.Paper({
                    el: $('#stencil'),
                    height: 60,
                    width: 700,
                    model: stencilGraph,
                    interactive: false,
                    position: {
                        x: 0,
                        y: 0
                    }
                });

            var xPosition = 0;
                for (var i= 8; i< product.quickMenus.length; i++ ){
                        var shape = new joint.shapes.standard.Image();
                        shape.position(xPosition, 10);
                        shape.resize(80, 25);
                        var href = "images/MiniSpice_quick/"+"/"+product.quickMenus[i].name+".png";
                        shape.attr({
                            image: {
                                xlinkHref: href,
                                width : 16,
                                height : 16,
                                magnet:true
                            },
                            label: {
                                text: product.quickMenus[i].name,
                                fontSize: 14,
                            }
                        });
                        stencilGraph.addCells([shape]);
                        xPosition = xPosition + 80;

                    }

            stencilPaper.on('cell:pointerdown', function (cellView, e, x, y) {
                $('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.5; pointer-event:none;"></div>');
                var flyGraph = new joint.dia.Graph,
                    flyPaper = new joint.dia.Paper({
                        el: $('#flyPaper'),
                        model: flyGraph,
                        interactive: false
                    }),
                    flyShape = cellView.model.clone(),
                    pos = cellView.model.position(),
                    offset = {
                        x: x - pos.x,
                        y: y - pos.y
                    };

                flyShape.position(0, 0);
                flyGraph.addCell(flyShape);
                $("#flyPaper").offset({
                    left: e.pageX - offset.x,
                    top: e.pageY - offset.y
                });
                $('body').on('mousemove.fly', function (e) {
                    $("#flyPaper").offset({
                        left: e.pageX - offset.x,
                        top: e.pageY - offset.y
                    });
                });
                $('body').on('mouseup.fly', function (e) {
                    var x = e.pageX,
                        y = e.pageY,
                        target = paper.$el.offset();

                    // Dropped over paper ?
                    if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
                        var s = flyShape.clone();
                        s.position(x - target.left - offset.x, y - target.top - offset.y);
                        s = addElementProperties(s);
                        s = addNumberToElements(s, graph);
                        graph.addCell(s);
                        product.addedCircuitComponents.push(s);
                        product.enableSaveButton();
                    }
                    $('body').off('mousemove.fly').off('mouseup.fly');
                    flyShape.remove();
                    $('#flyPaper').remove();
                });
            });

            paper.on('element:pointerdblclick', function(elementView) {
                var currentElement = elementView.model;

                var elements = graph.getElements();

                elements.forEach(function (element) {
                    graph.getNeighbors(element,[]).forEach(function (el) {
                        console.log(el);
                    })
                });
            });

            paper.on('element:contextmenu', function(elementView) {
                let currentElement = elementView.model;
                $scope.selectedComponentToModify = angular.copy(currentElement.componentData);
                $scope.$apply();
                selectedElementId = elementView.model.id;
                $("#editCircuitComponentData").modal('toggle');
            });
        };

        $scope.editCircuitComponent = () => {
            _.each(graph.getElements(), function(el) {
                if(el.id === selectedElementId){
                    el.componentData = angular.copy($scope.selectedComponentToModify);
                };
            });
            $("#editCircuitComponentData").modal('toggle');
            selectedElementId = "";
        };

        let addNumberToElements = function (element, graph) {
            let elementCounter = 1;
            _.each(graph.getElements(), function(el) {
                if(el.attributes.attrs.label.text.includes(element.attributes.attrs.label.text)){
                    elementCounter++;
                }
            });

            element.attributes.attrs.label.text = element.attributes.attrs.label.text + elementCounter.toString();
            //update name of component with number
            element.componentData.name = element.attributes.attrs.label.text;
            element.resize(200, 50);
            element.attributes.attrs.label.fontSize = 24;
            return element;
        };

        let addElementProperties = (element) => {
            element.type = angular.copy(element.attributes.attrs.label.text);
            switch (element.type){
                case "capacitor":
                    element.componentData = angular.copy(product.circuitComponents[0]);
                    break;
                case "inductor":
                    element.componentData = angular.copy(product.circuitComponents[1]);
                    break;
                case "ground":
                    element.componentData = angular.copy(product.circuitComponents[2]);
                    break;
                case "diode":
                    element.componentData = angular.copy(product.circuitComponents[3]);
                    break;
                case "resistor":
                    element.componentData = angular.copy(product.circuitComponents[4]);
                    break;
            }
            return element;
        };

    }])

    .directive('circuitDrawing', function() {
        return {
            restrict: "E",
            templateUrl: "./views/circuitDrawingTool/page/circuitDrawing.html"
        };
    });
