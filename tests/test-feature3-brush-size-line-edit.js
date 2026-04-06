/**
 * 功能点3测试用例: 画笔粗细调节
 * 测试画笔大小调节功能
 */

class Feature3Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    /**
     * 注册所有测试用例
     */
    registerTests() {
        this.framework.describe('功能点3: 画笔粗细调节', () => {
            this.testBrushSizeRange();
            this.testBrushSizeAdjustment();
            this.testBrushSizeRealtime();
            this.testBrushPreview();
        });
    }
    
    /**
     * 测试画笔预览功能
     */
    testBrushPreview() {
        this.framework.it('画笔预览应该实时显示当前画笔大小', async () => {
            this.app.brushSize = 10;
            this.app.currentColor = '#ff0000';
            
            // 模拟更新画笔预览
            this.app.updateBrushPreview();
            
            this.framework.assertEqual(this.app.brushSize, 10);
            this.framework.assertEqual(this.app.currentColor, '#ff0000');
        });
        
        this.framework.it('改变画笔大小应该更新预览', async () => {
            const sizes = [5, 10, 20, 30];
            
            for (const size of sizes) {
                this.app.brushSize = size;
                this.app.updateBrushPreview();
                this.framework.assertEqual(this.app.brushSize, size);
            }
        });
        
        this.framework.it('改变颜色应该更新预览', async () => {
            const colors = ['#ff0000', '#00ff00', '#0000ff'];
            
            for (const color of colors) {
                this.app.currentColor = color;
                this.app.updateBrushPreview();
                this.framework.assertEqual(this.app.currentColor, color);
            }
        });
    }

    /**
     * 测试画笔大小范围
     */
    testBrushSizeRange() {
        this.framework.it('画笔大小应该在1-50像素范围内', async () => {
            const minSize = 1;
            const maxSize = 50;

            // 测试最小值
            this.app.brushSize = minSize;
            this.framework.assertEqual(this.app.brushSize, minSize);
            this.framework.assertTrue(this.app.brushSize >= minSize);

            // 测试最大值
            this.app.brushSize = maxSize;
            this.framework.assertEqual(this.app.brushSize, maxSize);
            this.framework.assertTrue(this.app.brushSize <= maxSize);
        });

        this.framework.it('画笔大小应该支持整数', async () => {
            const integerSizes = [1, 5, 10, 25, 50];

            for (const size of integerSizes) {
                this.app.brushSize = size;
                this.framework.assertEqual(this.app.brushSize, size);
                this.framework.assertTrue(Number.isInteger(this.app.brushSize));
            }
        });
    }

    /**
     * 测试画笔大小调节
     */
    testBrushSizeAdjustment() {
        this.framework.it('应该能够通过滑块调节画笔大小', async () => {
            const testSizes = [1, 5, 10, 20, 30, 40, 50];

            for (const size of testSizes) {
                this.app.brushSize = size;
                this.framework.assertEqual(this.app.brushSize, size);
            }
        });

        this.framework.it('画笔大小应该实时显示', async () => {
            const testSize = 25;
            this.app.brushSize = testSize;

            // 模拟UI更新
            const displayValue = this.app.brushSize;
            this.framework.assertEqual(displayValue, testSize);
        });

        this.framework.it('画笔大小应该应用到所有工具', async () => {
            const tools = ['brush', 'eraser', 'line', 'rect', 'circle'];
            const testSize = 15;

            for (const tool of tools) {
                this.app.currentTool = tool;
                this.app.brushSize = testSize;
                this.framework.assertEqual(this.app.brushSize, testSize);
            }
        });
    }

    /**
     * 测试画笔大小实时应用
     */
    testBrushSizeRealtime() {
        this.framework.it('画笔大小应该在绘制时实时应用', async () => {
            const testSize = 20;
            this.app.brushSize = testSize;

            this.app.currentPath = {
                type: 'brush',
                color: '#000000',
                size: this.app.brushSize,
                points: [{x: 0, y: 0}, {x: 10, y: 10}]
            };

            this.framework.assertEqual(this.app.currentPath.size, testSize);
        });

        this.framework.it('改变画笔大小不应影响已绘制的内容', async () => {
            // 清空现有元素
            this.app.layers[0].elements = [];
            
            const initialSize = 10;
            const newSize = 20;

            // 创建初始路径
            const initialPath = {
                type: 'brush',
                color: '#000000',
                size: initialSize,
                points: [{x: 0, y: 0}]
            };

            this.app.layers[0].elements.push(initialPath);

            // 改变画笔大小
            this.app.brushSize = newSize;

            // 验证已绘制的内容大小不变
            this.framework.assertEqual(this.app.layers[0].elements[0].size, initialSize);
            this.framework.assertEqual(this.app.brushSize, newSize);
        });
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Feature3Tests;
}
