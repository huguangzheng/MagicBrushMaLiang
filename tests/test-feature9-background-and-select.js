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
            this.testDeleteElement();
            this.testEraserNoTrace();
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
    }
}

module.exports = Feature9Tests;
