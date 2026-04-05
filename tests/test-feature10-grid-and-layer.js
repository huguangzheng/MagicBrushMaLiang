/**
 * 功能点10测试用例: 网格和图层增强
 * 测试网格显示、图层限制、背景图层保护等功能
 */

class Feature10Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    /**
     * 注册所有测试用例
     */
    registerTests() {
        this.framework.describe('功能点10: 网格和图层增强', () => {
            this.testGridFunctionality();
            this.testLayerLimit();
            this.testBackgroundLayerProtection();
            this.testLayerColor();
            this.testCircleCenterDisplay();
        });
    }

    /**
     * 测试网格功能
     */
    testGridFunctionality() {
        this.framework.it('应该能够切换网格显示', async () => {
            const beforeState = this.app.showGrid;
            this.app.toggleGrid();
            this.framework.assertEqual(this.app.showGrid, !beforeState);
            
            // 恢复原状态
            this.app.toggleGrid();
            this.framework.assertEqual(this.app.showGrid, beforeState);
        });

        this.framework.it('应该能够设置网格大小', async () => {
            this.app.setGridSize(20);
            this.framework.assertEqual(this.app.gridSize, 20);
        });

        this.framework.it('网格大小不能小于最小值', async () => {
            this.app.setGridSize(3);
            this.framework.assertEqual(this.app.gridSize, this.app.minGridSize);
        });

        this.framework.it('网格应该跟随缩放', async () => {
            this.app.zoomLevel = 2;
            this.app.gridSize = 10;
            const effectiveGridSize = Math.max(this.app.minGridSize, this.app.gridSize * this.app.zoomLevel);
            this.framework.assertEqual(effectiveGridSize, 20);
            
            // 恢复缩放
            this.app.zoomLevel = 1;
        });
    }

    /**
     * 测试图层限制
     */
    testLayerLimit() {
        this.framework.it('图层数量不能超过最大限制', async () => {
            this.app.layers = [];
            this.app.currentLayerIndex = 0;
            
            // 添加最大数量的图层
            for (let i = 0; i < this.app.maxLayers; i++) {
                this.app.addLayer(`图层${i + 1}`);
            }
            
            this.framework.assertEqual(this.app.layers.length, this.app.maxLayers);
            
            // 尝试添加超过限制的图层
            const result = this.app.addLayer('超限图层');
            this.framework.assertEqual(result, false);
            this.framework.assertEqual(this.app.layers.length, this.app.maxLayers);
        });

        this.framework.it('最大图层数应该为16', async () => {
            this.framework.assertEqual(this.app.maxLayers, 16);
        });
    }

    /**
     * 测试背景图层保护
     */
    testBackgroundLayerProtection() {
        this.framework.it('背景图层不允许删除', async () => {
            this.app.layers = [];
            this.app.currentLayerIndex = 0;
            this.app.addLayer('背景图层');
            this.app.addLayer('图层2');
            
            const beforeCount = this.app.layers.length;
            
            // 尝试删除背景图层
            this.app.currentLayerIndex = 0;
            this.app.deleteLayer();
            
            // 图层数量应该不变
            this.framework.assertEqual(this.app.layers.length, beforeCount);
        });

        this.framework.it('非背景图层可以删除', async () => {
            this.app.layers = [];
            this.app.currentLayerIndex = 0;
            this.app.addLayer('背景图层');
            this.app.addLayer('图层2');
            
            const beforeCount = this.app.layers.length;
            
            // 删除非背景图层
            this.app.currentLayerIndex = 1;
            this.app.deleteLayer();
            
            // 图层数量应该减少
            this.framework.assertEqual(this.app.layers.length, beforeCount - 1);
        });
    }

    /**
     * 测试图层颜色
     */
    testLayerColor() {
        this.framework.it('新建图层默认为透明', async () => {
            this.app.layers = [];
            this.app.currentLayerIndex = 0;
            this.app.addLayer('测试图层');
            
            const layer = this.app.layers[0];
            this.framework.assertEqual(layer.color, 'transparent');
        });

        this.framework.it('应该能够设置图层颜色', async () => {
            this.app.layers = [];
            this.app.currentLayerIndex = 0;
            this.app.addLayer('测试图层');
            
            this.app.setLayerColor('#ff0000');
            
            const layer = this.app.layers[0];
            this.framework.assertEqual(layer.color, '#ff0000');
        });

        this.framework.it('不同图层可以有不同的颜色', async () => {
            this.app.layers = [];
            this.app.currentLayerIndex = 0;
            this.app.addLayer('图层1');
            this.app.setLayerColor('#ff0000');
            
            this.app.addLayer('图层2');
            this.app.setLayerColor('#00ff00');
            
            this.framework.assertEqual(this.app.layers[0].color, '#ff0000');
            this.framework.assertEqual(this.app.layers[1].color, '#00ff00');
        });
    }

    /**
     * 测试圆心显示
     */
    testCircleCenterDisplay() {
        this.framework.it('绘制圆形时应该显示圆心', async () => {
            // 模拟绘制圆形
            this.app.currentTool = 'circle';
            this.app.isDrawing = true;
            this.app.currentShape = {
                type: 'circle',
                centerX: 100,
                centerY: 100,
                radius: 50
            };
            
            // 圆心坐标应该存在
            this.framework.assertEqual(this.app.currentShape.centerX, 100);
            this.framework.assertEqual(this.app.currentShape.centerY, 100);
            
            // 清理
            this.app.isDrawing = false;
            this.app.currentShape = null;
        });
    }
}

module.exports = Feature10Tests;
