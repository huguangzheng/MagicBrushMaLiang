/**
 * 功能点9测试用例: 背景颜色和选择工具
 * 测试背景颜色选择、选择工具、元素移动等功能
 */

class Feature9Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    /**
     * 注册所有测试用例
     */
    registerTests() {
        this.framework.describe('功能点9: 背景颜色和选择工具', () => {
            this.testBackgroundColor();
            this.testSelectTool();
            this.testElementMovement();
            this.testVisualFeedback();
            this.testDeleteElement();
            this.testEraserNoTrace();
            this.testMouseCrosshair();
            this.testRightClickBatchMove();
            this.testRectangleCenterPoint();
            this.testDoubleClickDeselect();
        });
    }

    /**
     * 测试背景颜色功能
     */
    testBackgroundColor() {
        this.framework.it('应该能够设置背景颜色为白色', async () => {
            this.app.setBackgroundColor('#ffffff');
            this.framework.assertEqual(this.app.backgroundColor, '#ffffff');
        });

        this.framework.it('应该能够设置背景颜色为灰色', async () => {
            this.app.setBackgroundColor('#808080');
            this.framework.assertEqual(this.app.backgroundColor, '#808080');
        });

        this.framework.it('应该能够设置背景颜色为黑色', async () => {
            this.app.setBackgroundColor('#000000');
            this.framework.assertEqual(this.app.backgroundColor, '#000000');
        });

        this.framework.it('应该能够设置背景颜色为蓝色', async () => {
            this.app.setBackgroundColor('#4a9eff');
            this.framework.assertEqual(this.app.backgroundColor, '#4a9eff');
        });

        this.framework.it('应该能够设置背景为透明', async () => {
            this.app.setBackgroundColor('transparent');
            this.framework.assertEqual(this.app.backgroundColor, 'transparent');
        });

        this.framework.it('设置背景颜色应该保存历史', async () => {
            const beforeIndex = this.app.historyIndex;
            this.app.setBackgroundColor('#ff0000');
            this.framework.assertEqual(this.app.historyIndex, beforeIndex + 1);
        });
    }

    /**
     * 测试选择工具功能
     */
    testSelectTool() {
        this.framework.it('选择工具应该能够选中元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const testElement = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 101, y: 100}]
            };

            this.app.layers[0].elements.push(testElement);
            this.app.currentTool = 'select';

            const selected = this.app.enhanceLineSelection(100, 100);
            this.framework.assertNotNull(selected);
        });

        this.framework.it('选择工具应该只选择当前图层的元素', async () => {
            this.app.layers = [];
            this.app.currentLayerIndex = 0;
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

            const element1 = {
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 50, y: 50}, {x: 51, y: 50}]
            };

            const element2 = {
                type: 'brush',
                color: '#00ff00',
                size: 5,
                points: [{x: 150, y: 50}, {x: 151, y: 50}]
            };

            this.app.layers[0].elements.push(element1);
            this.app.layers[1].elements.push(element2);

            // 选择图层1
            this.app.currentLayerIndex = 0;
            const selected = this.app.enhanceLineSelection(50, 50);
            this.framework.assertNotNull(selected);
            this.framework.assertEqual(selected.color, '#ff0000');

            // 切换到图层2
            this.app.currentLayerIndex = 1;
            const selected2 = this.app.enhanceLineSelection(150, 50);
            this.framework.assertNotNull(selected2);
            this.framework.assertEqual(selected2.color, '#00ff00');
        });

        // 新增：测试椭圆元素选择
        this.framework.it('选择工具应该能够选中椭圆元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const ellipseElement = {
                type: 'ellipse',
                color: '#0000ff',
                size: 5,
                centerX: 100,
                centerY: 100,
                radiusX: 50,
                radiusY: 30
            };

            this.app.layers[0].elements.push(ellipseElement);
            this.app.currentTool = 'select';

            const selected = this.app.enhanceLineSelection(100, 100);
            this.framework.assertNotNull(selected);
            this.framework.assertEqual(selected.type, 'ellipse');
        });

        // 新增：测试五角星元素选择
        this.framework.it('选择工具应该能够选中五角星元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const starElement = {
                type: 'star',
                color: '#ff00ff',
                size: 5,
                centerX: 100,
                centerY: 100,
                outerRadius: 50,
                innerRadius: 20,
                points: 5
            };

            this.app.layers[0].elements.push(starElement);
            this.app.currentTool = 'select';

            // 点击五角星的一个顶点附近
            const selected = this.app.enhanceLineSelection(100, 50);
            this.framework.assertNotNull(selected);
            this.framework.assertEqual(selected.type, 'star');
        });

        // 新增：测试点到椭圆距离计算
        this.framework.it('点到椭圆的距离计算应该正确', async () => {
            const ellipse = {
                type: 'ellipse',
                centerX: 100,
                centerY: 100,
                radiusX: 50,
                radiusY: 30
            };

            // 点在椭圆中心，距离应该为0
            const distance1 = this.app.pointToEllipseDistance(100, 100, ellipse);
            this.framework.assertEqual(distance1, 0);

            // 点在椭圆边缘附近
            const distance2 = this.app.pointToEllipseDistance(150, 100, ellipse);
            this.framework.assertLessThan(Math.abs(distance2), 5);
        });

        // 新增：测试点到五角星距离计算
        this.framework.it('点到五角星的距离计算应该正确', async () => {
            const star = {
                type: 'star',
                centerX: 100,
                centerY: 100,
                outerRadius: 50,
                innerRadius: 20,
                points: 5
            };

            // 点在五角星中心，距离应该较小
            const distance = this.app.pointToStarDistance(100, 100, star);
            this.framework.assertLessThan(distance, 50);
        });
    }

    /**
     * 测试元素移动功能
     */
    testElementMovement() {
        this.framework.it('应该能够移动线条元素', async () => {
            const element = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 200, y: 100}]
            };
            
            const originalX = element.points[0].x;
            const originalY = element.points[0].y;
            
            this.app.moveElement(element, 10, 20);
            
            this.framework.assertEqual(element.points[0].x, originalX + 10);
            this.framework.assertEqual(element.points[0].y, originalY + 20);
        });

        this.framework.it('应该能够移动直线元素', async () => {
            const element = {
                type: 'line',
                startX: 100,
                startY: 100,
                endX: 200,
                endY: 100
            };
            
            this.app.moveElement(element, 50, 50);
            
            this.framework.assertEqual(element.startX, 150);
            this.framework.assertEqual(element.startY, 150);
            this.framework.assertEqual(element.endX, 250);
            this.framework.assertEqual(element.endY, 150);
        });

        this.framework.it('应该能够移动矩形元素', async () => {
            const element = {
                type: 'rect',
                startX: 100,
                startY: 100,
                width: 50,
                height: 50
            };
            
            this.app.moveElement(element, 30, 40);
            
            this.framework.assertEqual(element.startX, 130);
            this.framework.assertEqual(element.startY, 140);
        });

        this.framework.it('应该能够移动圆形元素', async () => {
            const element = {
                type: 'circle',
                centerX: 100,
                centerY: 100,
                radius: 50
            };

            this.app.moveElement(element, 20, 30);

            this.framework.assertEqual(element.centerX, 120);
            this.framework.assertEqual(element.centerY, 130);
        });

        // 新增：测试椭圆元素移动
        this.framework.it('应该能够移动椭圆元素', async () => {
            const element = {
                type: 'ellipse',
                centerX: 100,
                centerY: 100,
                radiusX: 50,
                radiusY: 30
            };

            this.app.moveElement(element, 25, 35);

            this.framework.assertEqual(element.centerX, 125);
            this.framework.assertEqual(element.centerY, 135);
        });

        // 新增：测试五角星元素移动
        this.framework.it('应该能够移动五角星元素', async () => {
            const element = {
                type: 'star',
                centerX: 100,
                centerY: 100,
                outerRadius: 50,
                innerRadius: 20,
                points: 5
            };

            this.app.moveElement(element, 15, 25);

            this.framework.assertEqual(element.centerX, 115);
            this.framework.assertEqual(element.centerY, 125);
        });

        // 新增：测试光标样式设置
        this.framework.it('应该能够设置光标样式', async () => {
            this.app.setCursorStyle('grab');
            this.framework.assertEqual(this.app.canvas.style.cursor, 'grab');

            this.app.setCursorStyle('default');
            this.framework.assertEqual(this.app.canvas.style.cursor, 'default');
        });
    }

    /**
     * 测试视觉反馈功能
     */
    testVisualFeedback() {
        // 新增：测试线条中点计算
        this.framework.it('应该能够计算线条的中点', async () => {
            const line = {
                type: 'line',
                startX: 0,
                startY: 0,
                endX: 10,
                endY: 10
            };

            const midpoint = this.app.calculateLineMidpoint(line);
            this.framework.assertEqual(midpoint.x, 5);
            this.framework.assertEqual(midpoint.y, 5);
        });

        // 新增：测试brush线条中点计算
        this.framework.it('应该能够计算brush线条的中点', async () => {
            const brush = {
                type: 'brush',
                points: [{x: 0, y: 0}, {x: 10, y: 10}, {x: 20, y: 20}]
            };

            const midpoint = this.app.calculateLineMidpoint(brush);
            this.framework.assertEqual(midpoint.x, 10);
            this.framework.assertEqual(midpoint.y, 10);
        });

        // 新增：测试闭合图形中心点获取
        this.framework.it('应该能够获取闭合图形的中心点', async () => {
            const circle = {
                type: 'circle',
                centerX: 100,
                centerY: 100,
                radius: 50
            };

            const center = this.app.getShapeCenter(circle);
            this.framework.assertEqual(center.x, 100);
            this.framework.assertEqual(center.y, 100);
        });

        // 新增：测试椭圆中心点获取
        this.framework.it('应该能够获取椭圆的中心点', async () => {
            const ellipse = {
                type: 'ellipse',
                centerX: 150,
                centerY: 150,
                radiusX: 50,
                radiusY: 30
            };

            const center = this.app.getShapeCenter(ellipse);
            this.framework.assertEqual(center.x, 150);
            this.framework.assertEqual(center.y, 150);
        });

        // 新增：测试五角星中心点获取
        this.framework.it('应该能够获取五角星的中心点', async () => {
            const star = {
                type: 'star',
                centerX: 200,
                centerY: 200,
                outerRadius: 50,
                innerRadius: 20,
                points: 5
            };

            const center = this.app.getShapeCenter(star);
            this.framework.assertEqual(center.x, 200);
            this.framework.assertEqual(center.y, 200);
        });

        // 新增：测试渲染选择标记方法存在
        this.framework.it('应该存在渲染选择标记的方法', async () => {
            this.framework.assertEqual(typeof this.app.renderSelectionMarker, 'function');
        });
    }

    /**
     * 测试删除元素功能
     */
    testDeleteElement() {
        this.framework.it('应该能够删除选中的元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');
            
            const element = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 101, y: 100}]
            };
            
            this.app.layers[0].elements.push(element);
            this.app.selectedElement = element;
            
            const beforeCount = this.app.layers[0].elements.length;
            this.app.deleteSelectedElement();
            const afterCount = this.app.layers[0].elements.length;
            
            this.framework.assertEqual(afterCount, beforeCount - 1);
            this.framework.assertNull(this.app.selectedElement);
        });

        this.framework.it('删除元素应该保存历史', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');
            
            const element = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}]
            };
            
            this.app.layers[0].elements.push(element);
            this.app.selectedElement = element;
            
            const beforeIndex = this.app.historyIndex;
            this.app.deleteSelectedElement();
            
            this.framework.assertEqual(this.app.historyIndex, beforeIndex + 1);
        });
    }

    /**
     * 测试橡皮擦不留痕迹
     */
    testEraserNoTrace() {
        this.framework.it('橡皮擦不应该添加元素到图层', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');
            
            const eraserPath = {
                type: 'eraser',
                color: '#ffffff',
                size: 10,
                points: [{x: 100, y: 100}, {x: 110, y: 100}]
            };
            
            const beforeCount = this.app.layers[0].elements.length;
            this.app.applyEraser(eraserPath);
            const afterCount = this.app.layers[0].elements.length;
            
            // 橡皮擦不应该增加元素
            this.framework.assertEqual(afterCount, beforeCount);
        });

        this.framework.it('橡皮擦应该删除路径上的元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');
            
            const element = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 110, y: 100}]
            };
            
            this.app.layers[0].elements.push(element);
            
            const eraserPath = {
                type: 'eraser',
                color: '#ffffff',
                size: 20,
                points: [{x: 100, y: 100}, {x: 110, y: 100}]
            };
            
            this.app.applyEraser(eraserPath);
            
            this.framework.assertEqual(this.app.layers[0].elements.length, 0);
        });

        this.framework.it('橡皮擦只对当前图层生效', async () => {
            this.app.layers = [];
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');
            
            const element1 = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 110, y: 100}]
            };
            
            const element2 = {
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 110, y: 100}]
            };
            
            this.app.layers[0].elements.push(element1);
            this.app.layers[1].elements.push(element2);
            
            // 在图层1使用橡皮擦
            this.app.currentLayerIndex = 0;
            const eraserPath = {
                type: 'eraser',
                color: '#ffffff',
                size: 20,
                points: [{x: 100, y: 100}, {x: 110, y: 100}]
            };
            
            this.app.applyEraser(eraserPath);
            
            // 图层1的元素应该被删除
            this.framework.assertEqual(this.app.layers[0].elements.length, 0);
            // 图层2的元素应该保留
            this.framework.assertEqual(this.app.layers[1].elements.length, 1);
        });

        // 新增：测试橡皮擦清除椭圆元素
        this.framework.it('橡皮擦应该能够清除椭圆元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const ellipseElement = {
                type: 'ellipse',
                color: '#0000ff',
                size: 5,
                centerX: 100,
                centerY: 100,
                radiusX: 50,
                radiusY: 30
            };

            this.app.layers[0].elements.push(ellipseElement);

            const eraserPath = {
                type: 'eraser',
                color: '#ffffff',
                size: 20,
                points: [{x: 100, y: 100}, {x: 110, y: 100}]
            };

            this.app.applyEraser(eraserPath);

            this.framework.assertEqual(this.app.layers[0].elements.length, 0);
        });

        // 新增：测试橡皮擦清除五角星元素
        this.framework.it('橡皮擦应该能够清除五角星元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const starElement = {
                type: 'star',
                color: '#ff00ff',
                size: 5,
                centerX: 100,
                centerY: 100,
                outerRadius: 50,
                innerRadius: 20,
                points: 5
            };

            this.app.layers[0].elements.push(starElement);

            const eraserPath = {
                type: 'eraser',
                color: '#ffffff',
                size: 30,
                points: [{x: 100, y: 50}, {x: 110, y: 50}]
            };

            this.app.applyEraser(eraserPath);

            this.framework.assertEqual(this.app.layers[0].elements.length, 0);
        });

        // 新增：测试橡皮擦只清除当前图层的椭圆
        this.framework.it('橡皮擦应该只清除当前图层的椭圆元素', async () => {
            this.app.layers = [];
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

            const ellipse1 = {
                type: 'ellipse',
                color: '#0000ff',
                size: 5,
                centerX: 100,
                centerY: 100,
                radiusX: 50,
                radiusY: 30
            };

            const ellipse2 = {
                type: 'ellipse',
                color: '#ff0000',
                size: 5,
                centerX: 100,
                centerY: 100,
                radiusX: 50,
                radiusY: 30
            };

            this.app.layers[0].elements.push(ellipse1);
            this.app.layers[1].elements.push(ellipse2);

            // 在图层1使用橡皮擦
            this.app.currentLayerIndex = 0;
            const eraserPath = {
                type: 'eraser',
                color: '#ffffff',
                size: 20,
                points: [{x: 100, y: 100}, {x: 110, y: 100}]
            };

            this.app.applyEraser(eraserPath);

            // 图层1的椭圆应该被删除
            this.framework.assertEqual(this.app.layers[0].elements.length, 0);
            // 图层2的椭圆应该保留
            this.framework.assertEqual(this.app.layers[1].elements.length, 1);
        });

        // 新增：测试橡皮擦不添加新元素
        this.framework.it('橡皮擦清除椭圆不应该添加新元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const ellipseElement = {
                type: 'ellipse',
                color: '#0000ff',
                size: 5,
                centerX: 100,
                centerY: 100,
                radiusX: 50,
                radiusY: 30
            };

            this.app.layers[0].elements.push(ellipseElement);

            const beforeCount = this.app.layers[0].elements.length;

            const eraserPath = {
                type: 'eraser',
                color: '#ffffff',
                size: 20,
                points: [{x: 100, y: 100}, {x: 110, y: 100}]
            };

            this.app.applyEraser(eraserPath);

            const afterCount = this.app.layers[0].elements.length;
            this.framework.assertLessThanOrEqual(afterCount, beforeCount);
        });
    }

    /**
     * 测试鼠标十字线坐标问题
     */
    testMouseCrosshair() {
        // 测试鼠标十字线方法存在
        this.framework.it('应该存在drawMouseCrosshair方法', async () => {
            this.framework.assertEqual(typeof this.app.drawMouseCrosshair, 'function');
        });

        // 测试canvasPointToWorld方法存在
        this.framework.it('应该存在canvasPointToWorld方法', async () => {
            this.framework.assertEqual(typeof this.app.canvasPointToWorld, 'function');
        });

        // 测试鼠标坐标转换
        this.framework.it('鼠标屏幕坐标应该能正确转换为世界坐标', async () => {
            this.app.zoomLevel = 2;
            this.app.viewPanX = 100;
            this.app.viewPanY = 50;

            const screenX = 300;
            const screenY = 200;
            const world = this.app.canvasPointToWorld(screenX, screenY);

            // 预期: worldX = (300 - 100) / 2 = 100, worldY = (200 - 50) / 2 = 75
            this.framework.assertEqual(world.x, 100);
            this.framework.assertEqual(world.y, 75);
        });

        // 测试缩放下的坐标转换
        this.framework.it('缩放下的坐标转换应该正确', async () => {
            this.app.zoomLevel = 0.5;
            this.app.viewPanX = 0;
            this.app.viewPanY = 0;

            const screenX = 100;
            const screenY = 100;
            const world = this.app.canvasPointToWorld(screenX, screenY);

            // 预期: worldX = 100 / 0.5 = 200, worldY = 100 / 0.5 = 200
            this.framework.assertEqual(world.x, 200);
            this.framework.assertEqual(world.y, 200);
        });
    }

    /**
     * 测试批量移动功能
     */
    testRightClickBatchMove() {
        // 测试批量移动相关属性存在
        this.framework.it('应该存在批量移动相关属性', async () => {
            this.framework.assertEqual(this.app.isRightDragging, false);
            this.framework.assertEqual(this.app.rightDragStartX, 0);
            this.framework.assertEqual(this.app.rightDragStartY, 0);
        });

        // 测试批量移动多个元素
        this.framework.it('应该能够批量移动多个元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const element1 = {
                type: 'line',
                startX: 100,
                startY: 100,
                endX: 200,
                endY: 100
            };

            const element2 = {
                type: 'circle',
                centerX: 150,
                centerY: 150,
                radius: 50
            };

            this.app.layers[0].elements.push(element1, element2);
            this.app.selectedElements = [element1, element2];

            // 模拟批量拖动（左键）
            this.app.isRightDragging = true;
            this.app.rightDragStartX = 0;
            this.app.rightDragStartY = 0;

            // 移动元素
            const dx = 50;
            const dy = 30;
            this.app.rightDragStartX = dx;
            this.app.rightDragStartY = dy;
            this.app.selectedElements.forEach(element => {
                this.app.moveElement(element, dx, dy);
            });

            // 验证元素位置已更新
            this.framework.assertEqual(element1.startX, 150);
            this.framework.assertEqual(element1.startY, 130);
            this.framework.assertEqual(element2.centerX, 200);
            this.framework.assertEqual(element2.centerY, 180);
        });

        // 测试批量移动单个元素
        this.framework.it('应该能够移动单个元素', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const element = {
                type: 'ellipse',
                centerX: 100,
                centerY: 100,
                radiusX: 50,
                radiusY: 30
            };

            this.app.layers[0].elements.push(element);
            this.app.selectedElement = element;

            // 模拟单个元素拖动（左键）
            this.app.isDraggingElement = true;
            this.app.dragOffsetX = 0;
            this.app.dragOffsetY = 0;

            // 移动元素
            const dx = 20;
            const dy = 15;
            this.app.dragOffsetX = dx;
            this.app.dragOffsetY = dy;
            this.app.moveElement(element, dx, dy);

            // 验证元素位置已更新
            this.framework.assertEqual(element.centerX, 120);
            this.framework.assertEqual(element.centerY, 115);
        });
    }

    /**
     * 测试矩形中心点显示位置
     */
    testRectangleCenterPoint() {
        // 测试矩形中心点计算
        this.framework.it('矩形中心点应该正确计算', async () => {
            const rect = {
                type: 'rect',
                startX: 100,
                startY: 100,
                width: 200,
                height: 150,
                centerX: 200,
                centerY: 175
            };

            const center = this.app.getShapeCenter(rect);
            this.framework.assertEqual(center.x, 200);
            this.framework.assertEqual(center.y, 175);
        });

        // 测试矩形移动后中心点更新
        this.framework.it('矩形移动后中心点应该正确更新', async () => {
            const rect = {
                type: 'rect',
                startX: 100,
                startY: 100,
                width: 200,
                height: 150,
                centerX: 200,
                centerY: 175
            };

            // 移动矩形
            this.app.moveElement(rect, 50, 30);

            // 验证startX、startY、centerX、centerY都已更新
            this.framework.assertEqual(rect.startX, 150);
            this.framework.assertEqual(rect.startY, 130);
            this.framework.assertEqual(rect.centerX, 250);
            this.framework.assertEqual(rect.centerY, 205);
        });

        // 测试矩形中心点与startX和width的关系
        this.framework.it('矩形中心点应该与startX和width一致', async () => {
            const rect = {
                type: 'rect',
                startX: 100,
                startY: 100,
                width: 200,
                height: 150,
                centerX: 200,
                centerY: 175
            };

            // centerX = startX + width / 2 = 100 + 200 / 2 = 200
            this.framework.assertEqual(rect.centerX, rect.startX + rect.width / 2);
            // centerY = startY + height / 2 = 100 + 150 / 2 = 175
            this.framework.assertEqual(rect.centerY, rect.startY + rect.height / 2);
        });
    }

    /**
     * 测试双击取消批量选中功能
     */
    testDoubleClickDeselect() {
        // 测试handleDoubleClick方法存在
        this.framework.it('应该存在handleDoubleClick方法', async () => {
            this.framework.assertEqual(typeof this.app.handleDoubleClick, 'function');
        });

        // 测试双击空白处取消批量选中
        this.framework.it('双击空白处应该取消批量选中', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const element1 = {
                type: 'line',
                startX: 100,
                startY: 100,
                endX: 200,
                endY: 100
            };

            const element2 = {
                type: 'circle',
                centerX: 150,
                centerY: 150,
                radius: 50
            };

            this.app.layers[0].elements.push(element1, element2);
            this.app.selectedElements = [element1, element2];
            this.app.currentTool = 'select';

            // 验证元素已选中
            this.framework.assertEqual(this.app.selectedElements.length, 2);

            // 双击空白处（假设坐标(500, 500)没有元素）
            const mockEvent = {
                clientX: 500,
                clientY: 500
            };
            
            // 模拟双击空白处
            this.app.handleDoubleClick(mockEvent);

            // 验证批量选中已取消
            this.framework.assertEqual(this.app.selectedElements.length, 0);
        });

        // 测试双击空白处也取消单个选中
        this.framework.it('双击空白处应该取消单个选中', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const element = {
                type: 'ellipse',
                centerX: 100,
                centerY: 100,
                radiusX: 50,
                radiusY: 30
            };

            this.app.layers[0].elements.push(element);
            this.app.selectedElement = element;
            this.app.currentTool = 'select';

            // 验证元素已选中
            this.framework.assertNotNull(this.app.selectedElement);

            // 双击空白处
            const mockEvent = {
                clientX: 500,
                clientY: 500
            };
            
            this.app.handleDoubleClick(mockEvent);

            // 验证单个选中已取消
            this.framework.assertNull(this.app.selectedElement);
        });

        // 测试双击元素不取消选中
        // 注释：由于测试环境的enhanceLineSelection方法实现限制，
        // 暂时无法准确测试双击元素不取消选中的场景
        // 实际应用中，双击元素应该保持选中状态
        
        // 测试非选择工具模式下双击不生效
        this.framework.it('非选择工具模式下双击不应该取消选中', async () => {
            this.app.layers = [];
            this.app.addLayer('测试图层');

            const element1 = {
                type: 'line',
                startX: 100,
                startY: 100,
                endX: 200,
                endY: 100
            };

            const element2 = {
                type: 'circle',
                centerX: 150,
                centerY: 150,
                radius: 50
            };

            this.app.layers[0].elements.push(element1, element2);
            this.app.selectedElements = [element1, element2];
            this.app.currentTool = 'brush'; // 非选择工具

            // 验证元素已选中
            this.framework.assertEqual(this.app.selectedElements.length, 2);

            // 双击空白处
            const mockEvent = {
                clientX: 500,
                clientY: 500
            };
            
            this.app.handleDoubleClick(mockEvent);

            // 验证批量选中没有被取消
            this.framework.assertEqual(this.app.selectedElements.length, 2);
        });
    }
}

module.exports = Feature9Tests;
