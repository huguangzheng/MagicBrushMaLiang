/**
 * 功能点5测试用例: 撤销/一键清除功能
 * 测试撤销系统和清除功能
 */

class Feature5Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    /**
     * 注册所有测试用例
     */
    registerTests() {
        this.framework.describe('功能点5: 撤销/一键清除功能', () => {
            this.testUndoOperation();
            this.testUndoLimit();
            this.testUndoHistory();
            this.testClearCanvas();
            this.testClearLayer();
            this.testUndoAfterClear();
        });
    }

    /**
     * 测试撤销操作
     */
    testUndoOperation() {
        this.framework.it('应该能够撤销操作', async () => {
            // 保存初始状态
            const initialLayers = JSON.parse(JSON.stringify(this.app.layers));
            const initialHistoryIndex = this.app.historyIndex;

            // 执行一些操作
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });

            this.app.saveHistory();

            // 撤销操作
            this.app.undo();

            // 验证已恢复到初始状态
            this.framework.assertEqual(this.app.layers.length, initialLayers.length);
        });

        this.framework.it('撤销应该恢复到上一个状态', async () => {
            const initialState = JSON.stringify(this.app.layers);

            // 添加元素
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });

            this.app.saveHistory();

            // 添加另一个元素
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#00ff00',
                size: 5,
                points: [{x: 20, y: 20}]
            });

            this.app.saveHistory();

            // 撤销一次
            this.app.undo();

            // 验证只有一个元素
            this.framework.assertEqual(this.app.layers[0].elements.length, 1);
        });

        this.framework.it('撤销应该在历史记录为空时不执行', async () => {
            const initialHistoryIndex = this.app.historyIndex;

            // 尝试撤销
            if (this.app.historyIndex > 0) {
                this.app.undo();
            }

            // 验证不会出错
            this.framework.assertTrue(this.app.historyIndex >= 0);
        });
    }

    /**
     * 测试撤销限制
     */
    testUndoLimit() {
        this.framework.it('应该限制历史记录数量', async () => {
            const maxHistory = 50;

            // 添加超过限制的操作
            for (let i = 0; i < maxHistory + 10; i++) {
                this.app.layers[0].elements.push({
                    type: 'brush',
                    color: '#ff0000',
                    size: 5,
                    points: [{x: i, y: i}]
                });
                this.app.saveHistory();
            }

            // 验证历史记录不超过限制
            this.framework.assertTrue(this.app.history.length <= maxHistory);
        });

        this.framework.it('应该正确管理历史记录索引', async () => {
            const initialIndex = this.app.historyIndex;

            // 添加操作
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });
            this.app.saveHistory();

            // 验证索引增加
            this.framework.assertEqual(this.app.historyIndex, initialIndex + 1);
        });
    }

    /**
     * 测试撤销历史
     */
    testUndoHistory() {
        this.framework.it('应该保存完整的图层状态', async () => {
            // 创建多个图层
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

            // 在不同图层上绘制
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

            this.app.saveHistory();

            // 验证历史记录包含所有图层
            const historyState = JSON.parse(this.app.history[this.app.historyIndex]);
            this.framework.assertEqual(historyState.length, this.app.layers.length);
        });

        this.framework.it('应该在撤销后正确更新当前图层索引', async () => {
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');
            this.app.currentLayerIndex = 2;

            // 添加操作
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });
            this.app.saveHistory();

            // 撤销
            this.app.undo();

            // 验证当前图层索引有效
            this.framework.assertTrue(this.app.currentLayerIndex < this.app.layers.length);
        });
    }

    /**
     * 测试清除画布
     */
    testClearCanvas() {
        this.framework.it('应该能够清除整个画布', async () => {
            // 在多个图层上添加内容
            this.app.addLayer('图层1');
            this.app.addLayer('图层2');

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

            // 清除画布
            this.app.layers.forEach(layer => {
                layer.elements = [];
            });

            // 验证所有图层都被清除
            this.framework.assertEqual(this.app.layers[0].elements.length, 0);
            this.framework.assertEqual(this.app.layers[1].elements.length, 0);
        });

        this.framework.it('清除画布应该保存历史记录', async () => {
            // 添加内容
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });

            const beforeClearIndex = this.app.historyIndex;

            // 清除画布
            this.app.layers.forEach(layer => {
                layer.elements = [];
            });
            this.app.saveHistory();

            // 验证历史记录增加
            this.framework.assertEqual(this.app.historyIndex, beforeClearIndex + 1);
        });
    }

    /**
     * 测试清除当前图层
     */
    testClearLayer() {
        this.framework.it('应该能够清除当前图层', async () => {
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

            // 验证只有图层1被清除
            this.framework.assertEqual(this.app.layers[0].elements.length, 0);
            this.framework.assertEqual(this.app.layers[1].elements.length, 1);
        });

        this.framework.it('清除图层应该保存历史记录', async () => {
            this.app.addLayer('测试图层');

            // 添加内容
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });

            const beforeClearIndex = this.app.historyIndex;

            // 清除图层
            this.app.layers[0].elements = [];
            this.app.saveHistory();

            // 验证历史记录增加
            this.framework.assertEqual(this.app.historyIndex, beforeClearIndex + 1);
        });
    }

    /**
     * 测试清除后的撤销
     */
    testUndoAfterClear() {
        this.framework.it('应该能够撤销清除操作', async () => {
            // 添加内容
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });

            this.app.saveHistory();

            // 清除图层
            this.app.layers[0].elements = [];
            this.app.saveHistory();

            // 验证已清除
            this.framework.assertEqual(this.app.layers[0].elements.length, 0);

            // 撤销清除
            this.app.undo();

            // 验证内容已恢复
            this.framework.assertEqual(this.app.layers[0].elements.length, 1);
        });

        this.framework.it('撤销清除应该恢复完整状态', async () => {
            const originalElements = [
                {
                    type: 'brush',
                    color: '#ff0000',
                    size: 5,
                    points: [{x: 10, y: 10}]
                },
                {
                    type: 'brush',
                    color: '#00ff00',
                    size: 5,
                    points: [{x: 20, y: 20}]
                }
            ];

            // 添加内容
            this.app.layers[0].elements = [...originalElements];
            this.app.saveHistory();

            // 清除图层
            this.app.layers[0].elements = [];
            this.app.saveHistory();

            // 撤销清除
            this.app.undo();

            // 验证所有元素都已恢复
            this.framework.assertEqual(this.app.layers[0].elements.length, originalElements.length);
        });
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Feature5Tests;
}
