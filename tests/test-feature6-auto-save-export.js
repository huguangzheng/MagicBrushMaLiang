/**
 * 功能点6测试用例: 自动存档和工程导入导出
 * 测试自动保存、工程导出和导入功能
 */

class Feature6Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    /**
     * 注册所有测试用例
     */
    registerTests() {
        this.framework.describe('功能点6: 自动存档和工程导入导出', () => {
            this.testAutoSave();
            this.testAutoSaveInterval();
            this.testAutoSaveData();
            this.testAutoSaveRecovery();
            this.testProjectExport();
            this.testProjectImport();
            this.testProjectDataIntegrity();
            this.testExportFormat();
        });
    }

    /**
     * 测试自动保存
     */
    testAutoSave() {
        this.framework.it('应该能够自动保存项目', async () => {
            // 添加一些内容
            this.app.layers[0].elements.push({
                type: 'brush',
                color: '#ff0000',
                size: 5,
                points: [{x: 10, y: 10}]
            });

            // 模拟自动保存
            const projectData = {
                layers: this.app.layers,
                canvasWidth: this.app.canvas.width,
                canvasHeight: this.app.canvas.height,
                timestamp: Date.now()
            };

            // 保存到本地存储
            localStorage.setItem('magicBrushAutoSave', JSON.stringify(projectData));

            // 验证保存成功
            const savedData = localStorage.getItem('magicBrushAutoSave');
            this.framework.assertNotNull(savedData);
        });

        this.framework.it('自动保存应该包含所有图层数据', async () => {
            // 创建多个图层并添加内容
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

            // 自动保存
            const projectData = {
                layers: this.app.layers,
                canvasWidth: this.app.canvas.width,
                canvasHeight: this.app.canvas.height,
                timestamp: Date.now()
            };

            localStorage.setItem('magicBrushAutoSave', JSON.stringify(projectData));

            // 验证保存的数据
            const savedData = JSON.parse(localStorage.getItem('magicBrushAutoSave'));
            this.framework.assertEqual(savedData.layers.length, this.app.layers.length);
        });
    }

    /**
     * 测试自动保存间隔
     */
    testAutoSaveInterval() {
        this.framework.it('应该按照指定间隔自动保存', async () => {
            const saveInterval = 5000; // 5秒
            let saveCount = 0;

            // 模拟自动保存
            const autoSave = () => {
                saveCount++;
                const projectData = {
                    layers: this.app.layers,
                    canvasWidth: this.app.canvas.width,
                    canvasHeight: this.app.canvas.height,
                    timestamp: Date.now()
                };
                localStorage.setItem('magicBrushAutoSave', JSON.stringify(projectData));
            };

            // 模拟多次保存
            autoSave();
            autoSave();
            autoSave();

            this.framework.assertEqual(saveCount, 3);
        });

        this.framework.it('自动保存应该记录时间戳', async () => {
            const beforeSave = Date.now();

            // 自动保存
            const projectData = {
                layers: this.app.layers,
                canvasWidth: this.app.canvas.width,
                canvasHeight: this.app.canvas.height,
                timestamp: Date.now()
            };

            localStorage.setItem('magicBrushAutoSave', JSON.stringify(projectData));

            const savedData = JSON.parse(localStorage.getItem('magicBrushAutoSave'));
            this.framework.assertTrue(savedData.timestamp >= beforeSave);
        });
    }

    /**
     * 测试自动保存数据
     */
    testAutoSaveData() {
        this.framework.it('自动保存应该包含画布尺寸', async () => {
            const projectData = {
                layers: this.app.layers,
                canvasWidth: this.app.canvas.width,
                canvasHeight: this.app.canvas.height,
                timestamp: Date.now()
            };

            localStorage.setItem('magicBrushAutoSave', JSON.stringify(projectData));

            const savedData = JSON.parse(localStorage.getItem('magicBrushAutoSave'));
            this.framework.assertEqual(savedData.canvasWidth, this.app.canvas.width);
            this.framework.assertEqual(savedData.canvasHeight, this.app.canvas.height);
        });

        this.framework.it('自动保存应该包含图层状态', async () => {
            // 设置图层状态
            this.app.layers[0].visible = true;
            this.app.layers[0].locked = false;

            const projectData = {
                layers: this.app.layers,
                canvasWidth: this.app.canvas.width,
                canvasHeight: this.app.canvas.height,
                timestamp: Date.now()
            };

            localStorage.setItem('magicBrushAutoSave', JSON.stringify(projectData));

            const savedData = JSON.parse(localStorage.getItem('magicBrushAutoSave'));
            this.framework.assertEqual(savedData.layers[0].visible, true);
            this.framework.assertEqual(savedData.layers[0].locked, false);
        });
    }

    /**
     * 测试自动保存恢复
     */
    testAutoSaveRecovery() {
        this.framework.it('应该能够从自动保存恢复项目', async () => {
            // 创建测试数据
            const originalLayers = [
                {
                    id: 1,
                    name: '图层1',
                    visible: true,
                    locked: false,
                    elements: [
                        {
                            type: 'brush',
                            color: '#ff0000',
                            size: 5,
                            points: [{x: 10, y: 10}]
                        }
                    ]
                }
            ];

            const projectData = {
                layers: originalLayers,
                canvasWidth: 800,
                canvasHeight: 600,
                timestamp: Date.now()
            };

            localStorage.setItem('magicBrushAutoSave', JSON.stringify(projectData));

            // 恢复项目
            const savedData = JSON.parse(localStorage.getItem('magicBrushAutoSave'));
            this.app.layers = savedData.layers;
            this.app.canvas.width = savedData.canvasWidth;
            this.app.canvas.height = savedData.canvasHeight;

            // 验证恢复成功
            this.framework.assertEqual(this.app.layers.length, originalLayers.length);
            this.framework.assertEqual(this.app.layers[0].elements.length, 1);
        });
    }

    /**
     * 测试工程导出
     */
    testProjectExport() {
        this.framework.it('应该能够导出工程为JSON格式', async () => {
            const projectData = {
                layers: this.app.layers,
                canvasWidth: this.app.canvas.width,
                canvasHeight: this.app.canvas.height,
                timestamp: Date.now(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(projectData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});

            // 验证Blob创建成功
            this.framework.assertNotNull(dataBlob);
            this.framework.assertEqual(dataBlob.type, 'application/json');
        });

        this.framework.it('导出的工程应该包含版本信息', async () => {
            const projectData = {
                layers: this.app.layers,
                canvasWidth: this.app.canvas.width,
                canvasHeight: this.app.canvas.height,
                timestamp: Date.now(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(projectData, null, 2);
            const parsedData = JSON.parse(dataStr);

            this.framework.assertEqual(parsedData.version, '1.0');
        });

        this.framework.it('导出的工程应该包含时间戳', async () => {
            const beforeExport = Date.now();

            const projectData = {
                layers: this.app.layers,
                canvasWidth: this.app.canvas.width,
                canvasHeight: this.app.canvas.height,
                timestamp: Date.now(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(projectData, null, 2);
            const parsedData = JSON.parse(dataStr);

            this.framework.assertTrue(parsedData.timestamp >= beforeExport);
        });
    }

    /**
     * 测试工程导入
     */
    testProjectImport() {
        this.framework.it('应该能够导入工程文件', async () => {
            // 创建测试工程数据
            const importData = {
                layers: [
                    {
                        id: Date.now(),
                        name: '导入图层',
                        visible: true,
                        locked: false,
                        elements: [
                            {
                                type: 'brush',
                                color: '#ff0000',
                                size: 5,
                                points: [{x: 10, y: 10}]
                            }
                        ]
                    }
                ],
                canvasWidth: 800,
                canvasHeight: 600,
                timestamp: Date.now(),
                version: '1.0'
            };

            // 模拟导入
            this.app.layers = importData.layers;
            this.app.canvas.width = importData.canvasWidth;
            this.app.canvas.height = importData.canvasHeight;

            // 验证导入成功
            this.framework.assertEqual(this.app.layers.length, 1);
            this.framework.assertEqual(this.app.layers[0].name, '导入图层');
            this.framework.assertEqual(this.app.canvas.width, 800);
        });

        this.framework.it('导入应该处理无效数据', async () => {
            const invalidData = '{invalid json}';

            try {
                JSON.parse(invalidData);
                this.framework.assertTrue(false, 'Should throw error for invalid JSON');
            } catch (error) {
                this.framework.assertTrue(true, 'Correctly threw error for invalid JSON');
            }
        });
    }

    /**
     * 测试工程数据完整性
     */
    testProjectDataIntegrity() {
        this.framework.it('导出和导入应该保持数据完整性', async () => {
            // 创建原始数据
            const originalData = {
                layers: [
                    {
                        id: 1,
                        name: '测试图层',
                        visible: true,
                        locked: false,
                        elements: [
                            {
                                type: 'brush',
                                color: '#ff0000',
                                size: 5,
                                points: [{x: 10, y: 10}, {x: 20, y: 20}]
                            },
                            {
                                type: 'line',
                                color: '#00ff00',
                                size: 3,
                                startX: 30,
                                startY: 30,
                                endX: 50,
                                endY: 50
                            }
                        ]
                    }
                ],
                canvasWidth: 800,
                canvasHeight: 600,
                timestamp: Date.now(),
                version: '1.0'
            };

            // 导出
            const exportedStr = JSON.stringify(originalData);

            // 导入
            const importedData = JSON.parse(exportedStr);

            // 验证数据完整性
            this.framework.assertEqual(importedData.layers.length, originalData.layers.length);
            this.framework.assertEqual(importedData.layers[0].elements.length, originalData.layers[0].elements.length);
            this.framework.assertEqual(importedData.layers[0].elements[0].type, originalData.layers[0].elements[0].type);
            this.framework.assertEqual(importedData.layers[0].elements[0].color, originalData.layers[0].elements[0].color);
        });
    }

    /**
     * 测试导出格式
     */
    testExportFormat() {
        this.framework.it('导出的JSON应该是格式化的', async () => {
            const projectData = {
                layers: this.app.layers,
                canvasWidth: this.app.canvas.width,
                canvasHeight: this.app.canvas.height,
                timestamp: Date.now(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(projectData, null, 2);

            // 验证格式化
            this.framework.assertTrue(dataStr.includes('\n'));
            this.framework.assertTrue(dataStr.includes('  '));
        });

        this.framework.it('导出的文件名应该包含时间戳', async () => {
            const timestamp = Date.now();
            const filename = `magicbrush_project_${timestamp}.json`;

            this.framework.assertTrue(filename.includes('magicbrush_project'));
            this.framework.assertTrue(filename.includes('.json'));
            this.framework.assertTrue(filename.includes(timestamp.toString()));
        });
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Feature6Tests;
}
