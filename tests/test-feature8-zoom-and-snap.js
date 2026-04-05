/**
 * 功能点8测试用例: 画布缩放和线条吸附选择
 * 测试画布放大缩小、线条自动吸附、所有图层线条选择等功能
 */

class Feature8Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    /**
     * 注册所有测试用例
     */
    registerTests() {
        this.framework.describe('功能点8: 画布缩放和线条吸附选择', () => {
            this.testZoomIn();
            this.testZoomOut();
            this.testZoomReset();
            this.testZoomLimits();
            this.testLineSnapSelection();
            this.testAllLayersSelection();
            this.testLineHighlight();
        });
    }

    /**
     * 测试放大功能
     */
    testZoomIn() {
        this.framework.it('应该能够放大画布', async () => {
            const initialZoom = this.app.zoomLevel;
            this.app.zoomIn();
            
            this.framework.assertTrue(this.app.zoomLevel > initialZoom);
            this.framework.assertEqual(this.app.zoomLevel, initialZoom + this.app.zoomStep);
        });

        this.framework.it('放大不应该超过最大缩放级别', async () => {
            this.app.zoomLevel = this.app.maxZoom - 0.05;
            this.app.zoomIn();
            
            this.framework.assertEqual(this.app.zoomLevel, this.app.maxZoom);
        });
    }

    /**
     * 测试缩小功能
     */
    testZoomOut() {
        this.framework.it('应该能够缩小画布', async () => {
            this.app.zoomLevel = 1.5;
            const initialZoom = this.app.zoomLevel;
            this.app.zoomOut();
            
            this.framework.assertTrue(this.app.zoomLevel < initialZoom);
            this.framework.assertEqual(this.app.zoomLevel, initialZoom - this.app.zoomStep);
        });

        this.framework.it('缩小不应该低于最小缩放级别', async () => {
            this.app.zoomLevel = this.app.minZoom + 0.05;
            this.app.zoomOut();
            
            this.framework.assertEqual(this.app.zoomLevel, this.app.minZoom);
        });
    }

    /**
     * 测试重置缩放
     */
    testZoomReset() {
        this.framework.it('应该能够重置缩放到100%', async () => {
            this.app.zoomLevel = 2.5;
            this.app.zoomReset();
            
            this.framework.assertEqual(this.app.zoomLevel, 1);
        });
    }

    /**
     * 测试缩放限制
     */
    testZoomLimits() {
        this.framework.it('缩放级别应该在有效范围内', async () => {
            this.framework.assertTrue(this.app.zoomLevel >= this.app.minZoom);
            this.framework.assertTrue(this.app.zoomLevel <= this.app.maxZoom);
        });

        this.framework.it('最小缩放应该是0.1', async () => {
            this.framework.assertEqual(this.app.minZoom, 0.1);
        });

        this.framework.it('最大缩放应该是5', async () => {
            this.framework.assertEqual(this.app.maxZoom, 5);
        });
    }

    /**
     * 测试线条吸附选择
     */
    testLineSnapSelection() {
        this.framework.it('鼠标靠近线条时应该能够检测到', async () => {
            // 重置图层状态
            this.app.layers = [];
            this.app.addLayer('测试图层');
            
            // 创建一条线
            const testLine = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 101, y: 100}, {x: 102, y: 100}]
            };
            
            this.app.layers[0].elements.push(testLine);
            
            // 在线条附近检测
            const detectedLine = this.app.detectLineHover(101, 100);
            
            this.framework.assertNotNull(detectedLine);
            this.framework.assertEqual(detectedLine.type, 'brush');
        });

        this.framework.it('吸附阈值应该正确设置', async () => {
            this.framework.assertEqual(this.app.snapThreshold, 15);
        });

        this.framework.it('超出吸附阈值不应该检测到线条', async () => {
            const testLine = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 101, y: 100}]
            };
            
            this.app.layers[0].elements = [];
            this.app.layers[0].elements.push(testLine);
            
            // 在远离线条的位置检测
            const detectedLine = this.app.detectLineHover(100, 200);
            
            this.framework.assertNull(detectedLine);
        });
    }

    /**
     * 测试所有图层线条选择
     */
    testAllLayersSelection() {
        this.framework.it('应该能够选择所有图层的线条', async () => {
            // 完全重置状态
            this.app.layers = [];
            this.app.currentLayerIndex = 0;
            this.app.hoveredLine = null;
            this.app.selectedLine = null;
            
            // 创建多个图层
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');
            
            // 确保图层创建成功
            this.framework.assertEqual(this.app.layers.length, 2);
            
            // 在不同图层添加线条(使用更多点)
            const line1 = {
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 50, y: 50}, {x: 51, y: 50}, {x: 52, y: 50}]
            };
            
            const line2 = {
                type: 'brush',
                color: '#00ff00',
                size: 5,
                points: [{x: 150, y: 50}, {x: 151, y: 50}, {x: 152, y: 50}]
            };
            
            this.app.layers[0].elements.push(line1);
            this.app.layers[1].elements.push(line2);
            
            // 确保元素添加成功
            this.framework.assertEqual(this.app.layers[0].elements.length, 1);
            this.framework.assertEqual(this.app.layers[1].elements.length, 1);
            
            // 检测第一个图层的线条
            const detected1 = this.app.enhanceLineSelection(51, 50);
            this.framework.assertNotNull(detected1, '应该检测到第一个图层的线条');
            
            // 检测第二个图层的线条
            const detected2 = this.app.enhanceLineSelection(151, 50);
            this.framework.assertNotNull(detected2, '应该检测到第二个图层的线条');
        });

        this.framework.it('上层图层的线条应该优先被选择', async () => {
            this.app.layers = [];
            this.app.addLayer('底层');
            this.app.addLayer('顶层');
            
            // 在相同位置添加线条
            const bottomLine = {
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 101, y: 100}]
            };
            
            const topLine = {
                type: 'brush',
                color: '#00ff00',
                size: 5,
                points: [{x: 100, y: 100}, {x: 101, y: 100}]
            };
            
            this.app.layers[0].elements.push(bottomLine);
            this.app.layers[1].elements.push(topLine);
            
            // 检测应该返回顶层的线条
            const detected = this.app.enhanceLineSelection(100, 100);
            this.framework.assertNotNull(detected);
            this.framework.assertEqual(detected.color, '#00ff00');
        });
    }

    /**
     * 测试线条高亮
     */
    testLineHighlight() {
        this.framework.it('悬停的线条应该被标记', async () => {
            this.app.layers[0].elements = [];
            
            const testLine = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 101, y: 100}]
            };
            
            this.app.layers[0].elements.push(testLine);
            
            // 检测悬停
            this.app.hoveredLine = this.app.detectLineHover(100, 100);
            
            this.framework.assertNotNull(this.app.hoveredLine);
        });

        this.framework.it('选中的线条应该被标记', async () => {
            this.app.layers[0].elements = [];
            
            const testLine = {
                type: 'brush',
                color: '#000000',
                size: 5,
                points: [{x: 100, y: 100}, {x: 101, y: 100}]
            };
            
            this.app.layers[0].elements.push(testLine);
            
            // 选中线条
            this.app.selectedLine = this.app.enhanceLineSelection(100, 100);
            
            this.framework.assertNotNull(this.app.selectedLine);
        });
    }
}

module.exports = Feature8Tests;
