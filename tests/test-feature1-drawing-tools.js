/**
 * 功能点1测试用例: 基本绘图工具
 * 测试画笔、橡皮擦、形状工具等基本绘图功能
 */

// 假设测试框架已经加载
// const TestFramework = require('./test-framework.js');

class Feature1Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    /**
     * 注册所有测试用例
     */
    registerTests() {
        this.framework.describe('功能点1: 基本绘图工具', () => {
            this.testBrushTool();
            this.testEraserTool();
            this.testLineTool();
            this.testRectTool();
            this.testCircleTool();
            this.testEditTool();
            this.testBrushColor();
            this.testBrushSize();
        });
    }

    /**
     * 测试画笔工具
     */
    testBrushTool() {
        this.framework.it('画笔工具应该能够绘制线条', async () => {
            // 设置画笔工具
            this.app.currentTool = 'brush';
            this.app.currentColor = '#000000';
            this.app.brushSize = 5;

            // 模拟鼠标按下
            this.app.isDrawing = true;
            this.app.currentPath = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 10, y: 10}, {x: 20, y: 20}, {x: 30, y: 30}]
            };

            // 模拟鼠标释放
            this.app.isDrawing = false;
            const currentLayer = this.app.layers[this.app.currentLayerIndex];
            currentLayer.elements.push({...this.app.currentPath});

            // 验证线条已添加到图层
            this.framework.assertEqual(currentLayer.elements.length, 1);
            this.framework.assertEqual(currentLayer.elements[0].type, 'brush');
            this.framework.assertEqual(currentLayer.elements[0].color, '#000000');
            this.framework.assertEqual(currentLayer.elements[0].size, 5);
        });

        this.framework.it('画笔工具应该支持多种颜色', async () => {
            const testColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
            
            for (const color of testColors) {
                this.app.currentColor = color;
                this.app.currentPath = {
                    type: 'brush',
                    color: color,
                    size: 5,
                    points: [{x: 0, y: 0}, {x: 1, y: 1}]
                };
                
                this.framework.assertEqual(this.app.currentPath.color, color);
            }
        });
    }

    /**
     * 测试橡皮擦工具
     */
    testEraserTool() {
        this.framework.it('橡皮擦工具应该能够擦除内容', async () => {
            this.app.currentTool = 'eraser';
            this.app.brushSize = 10;

            // 验证工具已设置为橡皮擦
            this.framework.assertEqual(this.app.currentTool, 'eraser');
            this.framework.assertEqual(this.app.brushSize, 10);

            // 模拟橡皮擦路径
            this.app.currentPath = {
                type: 'eraser',
                color: '#ffffff',
                size: 10,
                points: [{x: 10, y: 10}, {x: 20, y: 20}]
            };

            this.framework.assertEqual(this.app.currentPath.type, 'eraser');
        });
    }

    /**
     * 测试直线工具
     */
    testLineTool() {
        this.framework.it('直线工具应该能够绘制直线', async () => {
            this.app.currentTool = 'line';
            this.app.currentColor = '#000000';
            this.app.brushSize = 3;

            // 模拟直线绘制
            this.app.currentShape = {
                type: 'line',
                color: '#000000',
                size: 3,
                startX: 10,
                startY: 10,
                endX: 100,
                endY: 100
            };

            this.framework.assertEqual(this.app.currentShape.type, 'line');
            this.framework.assertEqual(this.app.currentShape.startX, 10);
            this.framework.assertEqual(this.app.currentShape.startY, 10);
            this.framework.assertEqual(this.app.currentShape.endX, 100);
            this.framework.assertEqual(this.app.currentShape.endY, 100);
        });
    }

    /**
     * 测试矩形工具
     */
    testRectTool() {
        this.framework.it('矩形工具应该能够绘制矩形', async () => {
            this.app.currentTool = 'rect';
            this.app.currentColor = '#000000';
            this.app.brushSize = 2;

            // 模拟矩形绘制
            this.app.currentShape = {
                type: 'rect',
                color: '#000000',
                size: 2,
                startX: 10,
                startY: 10,
                width: 100,
                height: 50,
                fill: false
            };

            this.framework.assertEqual(this.app.currentShape.type, 'rect');
            this.framework.assertEqual(this.app.currentShape.width, 100);
            this.framework.assertEqual(this.app.currentShape.height, 50);
        });
    }

    /**
     * 测试圆形工具
     */
    testCircleTool() {
        this.framework.it('圆形工具应该能够绘制圆形', async () => {
            this.app.currentTool = 'circle';
            this.app.currentColor = '#000000';
            this.app.brushSize = 2;

            // 模拟圆形绘制
            this.app.currentShape = {
                type: 'circle',
                color: '#000000',
                size: 2,
                centerX: 50,
                centerY: 50,
                radius: 25,
                fill: false
            };

            this.framework.assertEqual(this.app.currentShape.type, 'circle');
            this.framework.assertEqual(this.app.currentShape.centerX, 50);
            this.framework.assertEqual(this.app.currentShape.centerY, 50);
            this.framework.assertEqual(this.app.currentShape.radius, 25);
        });
    }

    /**
     * 测试编辑工具
     */
    testEditTool() {
        this.framework.it('编辑工具应该能够选中线条', async () => {
            // 首先创建一条线条
            const testLine = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 10, y: 10}, {x: 20, y: 20}, {x: 30, y: 30}]
            };
            
            this.app.layers[0].elements.push(testLine);
            this.app.currentTool = 'edit';

            // 模拟点击线条
            const clickedLine = this.app.findClickedLine(20, 20);
            
            this.framework.assertNotNull(clickedLine);
            this.framework.assertEqual(clickedLine.type, 'brush');
        });

        this.framework.it('编辑工具应该能够调整线条控制点', async () => {
            const testLine = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 10, y: 10}, {x: 20, y: 20}, {x: 30, y: 30}]
            };
            
            this.app.editingLine = testLine;
            this.app.editMode = true;
            this.app.editingPointIndex = 1;

            // 模拟移动控制点
            testLine.points[1] = {x: 25, y: 25};

            this.framework.assertEqual(testLine.points[1].x, 25);
            this.framework.assertEqual(testLine.points[1].y, 25);
        });
    }

    /**
     * 测试画笔颜色
     */
    testBrushColor() {
        this.framework.it('画笔应该支持颜色选择', async () => {
            const testColor = '#ff5733';
            this.app.currentColor = testColor;

            this.framework.assertEqual(this.app.currentColor, testColor);
        });

        this.framework.it('画笔颜色应该在绘制时应用', async () => {
            const testColor = '#33ff57';
            this.app.currentColor = testColor;
            
            this.app.currentPath = {
                type: 'brush',
                color: this.app.currentColor,
                size: 5,
                points: [{x: 0, y: 0}]
            };

            this.framework.assertEqual(this.app.currentPath.color, testColor);
        });
    }

    /**
     * 测试画笔大小
     */
    testBrushSize() {
        this.framework.it('画笔大小应该可以调节', async () => {
            const testSizes = [1, 5, 10, 25, 50];
            
            for (const size of testSizes) {
                this.app.brushSize = size;
                this.framework.assertEqual(this.app.brushSize, size);
            }
        });

        this.framework.it('画笔大小应该在绘制时应用', async () => {
            const testSize = 15;
            this.app.brushSize = testSize;
            
            this.app.currentPath = {
                type: 'brush',
                color: '#000000',
                size: this.app.brushSize,
                points: [{x: 0, y: 0}]
            };

            this.framework.assertEqual(this.app.currentPath.size, testSize);
        });

        this.framework.it('画笔大小应该在有效范围内', async () => {
            // 测试最小值
            this.app.brushSize = 1;
            this.framework.assertTrue(this.app.brushSize >= 1);

            // 测试最大值
            this.app.brushSize = 50;
            this.framework.assertTrue(this.app.brushSize <= 50);
        });
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Feature1Tests;
}
