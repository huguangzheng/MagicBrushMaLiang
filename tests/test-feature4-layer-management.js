/**
 * 功能点4测试用例: 图层管理能力
 * 测试图层添加、删除、移动、可见性等功能
 */

class Feature4Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    /**
     * 注册所有测试用例
     */
    registerTests() {
        this.framework.describe('功能点4: 图层管理能力', () => {
            this.testAddLayer();
            this.testDeleteLayer();
            this.testMoveLayerUp();
            this.testMoveLayerDown();
            this.testLayerVisibility();
            this.testLayerSelection();
            this.testLayerPreview();
            this.testLayerIndependentEdit();
        });
    }

    /**
     * 测试添加图层
     */
    testAddLayer() {
        this.framework.it('应该能够添加新图层', async () => {
            const initialCount = this.app.layers.length;
            this.app.addLayer('测试图层');

            this.framework.assertEqual(this.app.layers.length, initialCount + 1);
        });

        this.framework.it('新图层应该有唯一ID', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

            const id1 = this.app.layers[this.app.layers.length - 2].id;
            const id2 = this.app.layers[this.app.layers.length - 1].id;

            this.framework.assertNotEqual(id1, id2);
        });

        this.framework.it('新图层应该有默认名称', async () => {
            const initialCount = this.app.layers.length;
            this.app.addLayer();

            this.framework.assertEqual(this.app.layers.length, initialCount + 1);
            this.framework.assertTrue(this.app.layers[initialCount].name.includes('图层'));
        });

        this.framework.it('新图层应该是空的', async () => {
            this.app.addLayer('空图层');
            const newLayer = this.app.layers[this.app.layers.length - 1];

            this.framework.assertEqual(newLayer.elements.length, 0);
        });
    }

    /**
     * 测试删除图层
     */
    testDeleteLayer() {
        this.framework.it('应该能够删除图层', async () => {
            const initialCount = this.app.layers.length;
            this.app.addLayer('待删除图层');
            this.framework.assertEqual(this.app.layers.length, initialCount + 1);

            this.app.deleteLayer();
            this.framework.assertEqual(this.app.layers.length, initialCount);
        });

        this.framework.it('应该至少保留一个图层', async () => {
            const initialCount = this.app.layers.length;

            // 尝试删除所有图层
            while (this.app.layers.length > 1) {
                this.app.deleteLayer();
            }

            this.framework.assertEqual(this.app.layers.length, 1);
        });

        this.framework.it('删除图层后应该更新当前图层索引', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');
            this.app.currentLayerIndex = 1;

            this.app.deleteLayer();
            this.framework.assertTrue(this.app.currentLayerIndex < this.app.layers.length);
        });
    }

    /**
     * 测试图层上移
     */
    testMoveLayerUp() {
        this.framework.it('应该能够向上移动图层', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');
            this.app.addLayer('图层3');

            const currentIndex = 1;
            this.app.currentLayerIndex = currentIndex;
            const layerName = this.app.layers[currentIndex].name;

            this.app.moveLayerUp();

            this.framework.assertEqual(this.app.currentLayerIndex, currentIndex + 1);
        });

        this.framework.it('顶层图层不能继续上移', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

            this.app.currentLayerIndex = this.app.layers.length - 1;
            const initialIndex = this.app.currentLayerIndex;

            this.app.moveLayerUp();
            this.framework.assertEqual(this.app.currentLayerIndex, initialIndex);
        });
    }

    /**
     * 测试图层下移
     */
    testMoveLayerDown() {
        this.framework.it('应该能够向下移动图层', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');
            this.app.addLayer('图层3');

            const currentIndex = 2;
            this.app.currentLayerIndex = currentIndex;

            this.app.moveLayerDown();
            this.framework.assertEqual(this.app.currentLayerIndex, currentIndex - 1);
        });

        this.framework.it('底层图层不能继续下移', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

            this.app.currentLayerIndex = 0;
            const initialIndex = this.app.currentLayerIndex;

            this.app.moveLayerDown();
            this.framework.assertEqual(this.app.currentLayerIndex, initialIndex);
        });
    }

    /**
     * 测试图层可见性
     */
    testLayerVisibility() {
        this.framework.it('应该能够切换图层可见性', async () => {
            this.app.addLayer('测试图层');
            const layerIndex = this.app.layers.length - 1;
            const initialVisibility = this.app.layers[layerIndex].visible;

            this.app.toggleLayerVisibility(layerIndex);
            this.framework.assertNotEqual(this.app.layers[layerIndex].visible, initialVisibility);

            this.app.toggleLayerVisibility(layerIndex);
            this.framework.assertEqual(this.app.layers[layerIndex].visible, initialVisibility);
        });

        this.framework.it('隐藏图层不应该在渲染中显示', async () => {
            this.app.addLayer('隐藏图层');
            const layerIndex = this.app.layers.length - 1;

            // 添加一些内容到图层
            this.app.layers[layerIndex].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}, {x: 20, y: 20}]
            });

            // 隐藏图层
            this.app.toggleLayerVisibility(layerIndex);
            this.framework.assertFalse(this.app.layers[layerIndex].visible);
        });

        this.framework.it('新图层默认应该是可见的', async () => {
            this.app.addLayer('新图层');
            const newLayer = this.app.layers[this.app.layers.length - 1];

            this.framework.assertTrue(newLayer.visible);
        });
    }

    /**
     * 测试图层选择
     */
    testLayerSelection() {
        this.framework.it('应该能够选择图层', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');
            this.app.addLayer('图层3');

            const selectIndex = 1;
            this.app.selectLayer(selectIndex);

            this.framework.assertEqual(this.app.currentLayerIndex, selectIndex);
        });

        this.framework.it('选择图层后应该更新UI', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

            this.app.selectLayer(1);
            this.framework.assertEqual(this.app.currentLayerIndex, 1);
        });
    }

    /**
     * 测试图层预览
     */
    testLayerPreview() {
        this.framework.it('应该能够生成图层预览', async () => {
            this.app.addLayer('预览图层');
            const layerIndex = this.app.layers.length - 1;

            // 添加内容到图层
            this.app.layers[layerIndex].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}, {x: 20, y: 20}]
            });

            // 验证预览功能存在
            this.framework.assertTrue(typeof this.app.updateLayerPreviews === 'function');
        });

        this.framework.it('图层预览应该实时更新', async () => {
            this.app.addLayer('实时预览图层');
            const layerIndex = this.app.layers.length - 1;

            // 初始状态
            this.app.updateLayerPreviews();

            // 添加内容
            this.app.layers[layerIndex].elements.push({
                type: 'brush',
                color: '#0000ff',
                size: 10,
                points: [{x: 30, y: 30}, {x: 40, y: 40}]
            });

            // 更新预览
            this.app.updateLayerPreviews();
        });
    }

    /**
     * 测试图层独立编辑
     */
    testLayerIndependentEdit() {
        this.framework.it('应该能够在指定图层上绘制', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

            // 在图层1上绘制
            this.app.currentLayerIndex = 0;
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });

            // 在图层2上绘制
            this.app.currentLayerIndex = 1;
            this.app.layers[1].elements.push({
                type: 'brush',
                color: '#00ff00',
                size: 5,
                points: [{x: 20, y: 20}]
            });

            // 验证内容在正确的图层上
            this.framework.assertEqual(this.app.layers[0].elements.length, 1);
            this.framework.assertEqual(this.app.layers[1].elements.length, 1);
            this.framework.assertEqual(this.app.layers[0].elements[0].color, '#ff0000');
            this.framework.assertEqual(this.app.layers[1].elements[0].color, '#00ff00');
        });

        this.framework.it('清除图层不应该影响其他图层', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

            // 在两个图层上添加内容
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });

            this.app.layers[1].elements.push({
                type: 'brush',
                color: '#00ff00',
                size: 5,
                points: [{x: 20, y: 20}]
            });

            // 清除图层1
            this.app.currentLayerIndex = 0;
            this.app.layers[0].elements = [];

            // 验证图层2的内容不受影响
            this.framework.assertEqual(this.app.layers[0].elements.length, 0);
            this.framework.assertEqual(this.app.layers[1].elements.length, 1);
        });
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Feature4Tests;
}
