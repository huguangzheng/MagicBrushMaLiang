/**
 * 魔法画笔测试运行器
 * 用于运行所有测试用例或特定测试
 */

// 加载测试框架
const TestFramework = require('./test-framework.js');

// 加载所有功能测试
const Feature1Tests = require('./test-feature1-drawing-tools.js');
const Feature2Tests = require('./test-feature2-color-selection.js');
const Feature3Tests = require('./test-feature3-brush-size-line-edit.js');
const Feature4Tests = require('./test-feature4-layer-management.js');
const Feature5Tests = require('./test-feature5-undo-clear.js');
const Feature6Tests = require('./test-feature6-auto-save-export.js');
const Feature7Tests = require('./test-feature7-ai-color-optimization.js');
const Feature8Tests = require('./test-feature8-zoom-and-snap.js');

class TestRunner {
    constructor() {
        this.framework = new TestFramework();
        this.app = null;
        this.testSuites = [];
    }

    /**
     * 初始化测试环境
     */
    async initialize() {
        console.log('🔧 初始化测试环境...\n');

        // 模拟localStorage
        if (typeof localStorage === 'undefined') {
            global.localStorage = {
                store: {},
                getItem: function(key) { return this.store[key] || null; },
                setItem: function(key, value) { this.store[key] = value; },
                removeItem: function(key) { delete this.store[key]; },
                clear: function() { this.store = {}; }
            };
        }

        // 创建应用实例用于测试
        // 注意: 这里需要模拟Canvas环境
        this.app = this.createMockApp();

        // 注册所有测试套件
        this.registerAllTests();

        console.log('✅ 测试环境初始化完成\n');
    }

    /**
     * 创建模拟应用实例
     */
    createMockApp() {
        return {
            // 基本属性
            canvas: {
                width: 800,
                height: 600,
                getContext: () => ({
                    fillStyle: '#ffffff',
                    fillRect: () => {},
                    beginPath: () => {},
                    moveTo: () => {},
                    lineTo: () => {},
                    stroke: () => {},
                    closePath: () => {},
                    arc: () => {},
                    strokeRect: () => {}
                })
            },
            ctx: null,
            layers: [
                {
                    id: 1,
                    name: '背景层',
                    visible: true,
                    locked: false,
                    elements: []
                }
            ],
            currentLayerIndex: 0,
            currentTool: 'brush',
            currentColor: '#000000',
            brushSize: 5,
            isDrawing: false,
            lastX: 0,
            lastY: 0,
            history: [],
            historyIndex: -1,
            autoSaveInterval: null,
            selectedPoints: [],
            editingLine: null,
            editMode: false,
            editingPointIndex: -1,
            
            // 缩放相关属性
            zoomLevel: 1,
            minZoom: 0.1,
            maxZoom: 5,
            zoomStep: 0.1,
            
            // 线条吸附相关属性
            snapThreshold: 15,
            hoveredLine: null,
            selectedLine: null,

            // 模拟方法
            addLayer: function(name) {
                const layerName = name || `图层${this.layers.length + 1}`;
                const layer = {
                    id: Date.now() + Math.random(), // 确保唯一ID
                    name: layerName,
                    visible: true,
                    locked: false,
                    elements: []
                };
                this.layers.push(layer);
                this.currentLayerIndex = this.layers.length - 1;
                return layer;
            },

            deleteLayer: function() {
                if (this.layers.length <= 1) return;
                this.layers.splice(this.currentLayerIndex, 1);
                this.currentLayerIndex = Math.min(this.currentLayerIndex, this.layers.length - 1);
            },

            moveLayerUp: function() {
                if (this.currentLayerIndex >= this.layers.length - 1) return;
                const temp = this.layers[this.currentLayerIndex];
                this.layers[this.currentLayerIndex] = this.layers[this.currentLayerIndex + 1];
                this.layers[this.currentLayerIndex + 1] = temp;
                this.currentLayerIndex++;
            },

            moveLayerDown: function() {
                if (this.currentLayerIndex <= 0) return;
                const temp = this.layers[this.currentLayerIndex];
                this.layers[this.currentLayerIndex] = this.layers[this.currentLayerIndex - 1];
                this.layers[this.currentLayerIndex - 1] = temp;
                this.currentLayerIndex--;
            },

            selectLayer: function(index) {
                this.currentLayerIndex = index;
            },

            toggleLayerVisibility: function(index) {
                this.layers[index].visible = !this.layers[index].visible;
            },

            findClickedLine: function(x, y) {
                const threshold = 10;
                for (let i = this.currentLayerIndex; i < this.layers.length; i++) {
                    const layer = this.layers[i];
                    if (!layer.visible) continue;
                    for (const element of layer.elements) {
                        if ((element.type === 'brush' || element.type === 'eraser') && element.points.length > 1) {
                            for (const point of element.points) {
                                const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                                if (distance < threshold) {
                                    return element;
                                }
                            }
                        }
                    }
                }
                return null;
            },

            saveHistory: function() {
                this.history = this.history.slice(0, this.historyIndex + 1);
                this.history.push(JSON.stringify(this.layers));
                this.historyIndex++;
                if (this.history.length > 50) {
                    this.history.shift();
                    this.historyIndex--;
                }
            },

            undo: function() {
                if (this.historyIndex <= 0) return;
                this.historyIndex--;
                this.layers = JSON.parse(this.history[this.historyIndex]);
                this.currentLayerIndex = Math.min(this.currentLayerIndex, this.layers.length - 1);
            },

            collectColorInfo: function(layer) {
                const colors = new Set();
                layer.elements.forEach(element => {
                    if (element.color) {
                        colors.add(element.color);
                    }
                });
                return {
                    colors: Array.from(colors),
                    elementCount: layer.elements.length,
                    layerName: layer.name
                };
            },

            shiftHue: function(hexColor, degrees) {
                let r = parseInt(hexColor.slice(1, 3), 16) / 255;
                let g = parseInt(hexColor.slice(3, 5), 16) / 255;
                let b = parseInt(hexColor.slice(5, 7), 16) / 255;

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                let h, s, l = (max + min) / 2;

                if (max === min) {
                    h = s = 0;
                } else {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                        case g: h = ((b - r) / d + 2) / 6; break;
                        case b: h = ((r - g) / d + 4) / 6; break;
                    }
                }

                h = (h + degrees / 360) % 1;
                if (h < 0) h += 1;

                const rgb = this.hslToRgb(h, s, l);
                return `#${rgb.map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')}`;
            },

            hslToRgb: function(h, s, l) {
                let r, g, b;
                if (s === 0) {
                    r = g = b = l;
                } else {
                    const hue2rgb = (p, q, t) => {
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        if (t < 1/6) return p + (q - p) * 6 * t;
                        if (t < 1/2) return q;
                        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                        return p;
                    };
                    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    const p = 2 * l - q;
                    r = hue2rgb(p, q, h + 1/3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1/3);
                }
                return [r, g, b];
            },

            applyOptimizedColors: function(layer, colorMap) {
                layer.elements.forEach(element => {
                    if (element.color && colorMap[element.color]) {
                        element.color = colorMap[element.color];
                    }
                });
            },

            updateLayerPreviews: function() {
                // 模拟方法
            },
            
            // 新增方法 - 改进的线条选择
            enhanceLineSelection: function(x, y) {
                const threshold = 10;
                let selectedLine = null;
                let minDistance = threshold;
                
                for (let i = this.currentLayerIndex; i < this.layers.length; i++) {
                    const layer = this.layers[i];
                    if (!layer.visible) continue;
                    
                    for (const element of layer.elements) {
                        if ((element.type === 'brush' || element.type === 'eraser') && element.points.length > 1) {
                            for (const point of element.points) {
                                const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                                if (distance < minDistance) {
                                    minDistance = distance;
                                    selectedLine = element;
                                }
                            }
                        }
                    }
                }
                
                return selectedLine;
            },
            
            // 新增方法 - 更新画笔预览
            updateBrushPreview: function() {
                // 模拟方法
            },
            
            // 新增方法 - 重命名图层
            renameLayer: function() {
                const layer = this.layers[this.currentLayerIndex];
                if (!layer) return;
                // 模拟重命名
                layer.name = '重命名图层';
            },
            
            // 新增方法 - 编辑图层名称
            editLayerName: function(index) {
                // 模拟方法
            },
            
            // 新增方法 - 显示编辑控制点
            showEditingControls: function() {
                // 模拟方法
            },
            
            // 新增方法 - 缩放功能
            zoomIn: function() {
                if (this.zoomLevel < this.maxZoom) {
                    this.zoomLevel = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
                }
            },
            
            zoomOut: function() {
                if (this.zoomLevel > this.minZoom) {
                    this.zoomLevel = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
                }
            },
            
            zoomReset: function() {
                this.zoomLevel = 1;
            },
            
            updateZoomDisplay: function() {
                // 模拟方法
            },
            
            // 新增方法 - 检测线条悬停
            detectLineHover: function(x, y) {
                return this.enhanceLineSelection(x, y);
            }
        };
    }

    /**
     * 注册所有测试
     */
    registerAllTests() {
        console.log('📝 注册测试套件...\n');

        // 功能点1: 基本绘图工具
        const feature1Tests = new Feature1Tests(this.framework, this.app);
        feature1Tests.registerTests();

        // 功能点2: 颜色选择
        const feature2Tests = new Feature2Tests(this.framework, this.app);
        feature2Tests.registerTests();

        // 功能点3: 画笔粗细调节和线条弧度编辑
        const feature3Tests = new Feature3Tests(this.framework, this.app);
        feature3Tests.registerTests();

        // 功能点4: 图层管理
        const feature4Tests = new Feature4Tests(this.framework, this.app);
        feature4Tests.registerTests();

        // 功能点5: 撤销/清除功能
        const feature5Tests = new Feature5Tests(this.framework, this.app);
        feature5Tests.registerTests();

        // 功能点6: 自动存档和工程导入导出
        const feature6Tests = new Feature6Tests(this.framework, this.app);
        feature6Tests.registerTests();

        // 功能点7: AI配色优化
        const feature7Tests = new Feature7Tests(this.framework, this.app);
        feature7Tests.registerTests();

        const feature8Tests = new Feature8Tests(this.framework, this.app);
        feature8Tests.registerTests();

        this.testSuites = this.framework.getSuiteNames();

        console.log(`✅ 已注册 ${this.testSuites.length} 个测试套件\n`);
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🚀 开始运行所有测试...\n');
        console.log('='.repeat(60) + '\n');

        const results = await this.framework.runAll();

        // 生成测试报告
        this.generateReport(results);

        return results;
    }

    /**
     * 运行特定套件
     */
    async runSuite(suiteName) {
        console.log(`🚀 开始运行测试套件: ${suiteName}...\n`);
        console.log('='.repeat(60) + '\n');

        const results = await this.framework.runSuite(suiteName);

        // 生成测试报告
        this.generateReport(results);

        return results;
    }

    /**
     * 运行特定测试
     */
    async runTest(suiteName, testName) {
        console.log(`🚀 开始运行测试: ${suiteName} > ${testName}...\n`);
        console.log('='.repeat(60) + '\n');

        const result = await this.framework.runTest(suiteName, testName);

        // 生成测试报告
        this.generateSingleTestReport(suiteName, testName, result);

        return result;
    }

    /**
     * 生成测试报告
     */
    generateReport(results) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: results.total,
                passed: results.passed,
                failed: results.failed,
                successRate: ((results.passed / results.total) * 100).toFixed(2) + '%'
            },
            details: results.results
        };

        // 保存报告到文件
        const fs = require('fs');
        const reportPath = './test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\n' + '='.repeat(60));
        console.log('📊 测试报告');
        console.log('='.repeat(60));
        console.log(`时间: ${report.timestamp}`);
        console.log(`总数: ${report.summary.total}`);
        console.log(`通过: ${report.summary.passed}`);
        console.log(`失败: ${report.summary.failed}`);
        console.log(`成功率: ${report.summary.successRate}`);
        console.log(`报告已保存到: ${reportPath}`);
        console.log('='.repeat(60) + '\n');

        return report;
    }

    /**
     * 生成单个测试报告
     */
    generateSingleTestReport(suiteName, testName, result) {
        const report = {
            timestamp: new Date().toISOString(),
            suite: suiteName,
            test: testName,
            status: result.status,
            error: result.error
        };

        console.log('\n' + '='.repeat(60));
        console.log('📊 测试报告');
        console.log('='.repeat(60));
        console.log(`时间: ${report.timestamp}`);
        console.log(`套件: ${report.suite}`);
        console.log(`测试: ${report.test}`);
        console.log(`状态: ${report.status}`);
        if (report.error) {
            console.log(`错误: ${report.error}`);
        }
        console.log('='.repeat(60) + '\n');

        return report;
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log('\n📖 魔法画笔测试运行器 - 帮助信息\n');
        console.log('用法:');
        console.log('  node test-runner.js [命令] [参数]\n');
        console.log('命令:');
        console.log('  all              运行所有测试');
        console.log('  suite <name>     运行指定测试套件');
        console.log('  test <suite> <test>  运行指定测试');
        console.log('  list             列出所有测试套件');
        console.log('  help             显示帮助信息\n');
        console.log('示例:');
        console.log('  node test-runner.js all');
        console.log('  node test-runner.js suite "功能点1: 基本绘图工具"');
        console.log('  node test-runner.js list\n');
    }

    /**
     * 列出所有测试套件
     */
    listSuites() {
        console.log('\n📋 可用的测试套件:\n');
        this.testSuites.forEach((suite, index) => {
            const testNames = this.framework.getTestNames(suite);
            console.log(`${index + 1}. ${suite}`);
            console.log(`   测试数量: ${testNames.length}`);
            console.log('');
        });
    }
}

// 主函数
async function main() {
    const runner = new TestRunner();
    await runner.initialize();

    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'all':
            await runner.runAllTests();
            break;

        case 'suite':
            const suiteName = args[1];
            if (!suiteName) {
                console.error('❌ 错误: 请指定测试套件名称');
                runner.showHelp();
                process.exit(1);
            }
            await runner.runSuite(suiteName);
            break;

        case 'test':
            const testSuiteName = args[1];
            const testName = args[2];
            if (!testSuiteName || !testName) {
                console.error('❌ 错误: 请指定测试套件和测试名称');
                runner.showHelp();
                process.exit(1);
            }
            await runner.runTest(testSuiteName, testName);
            break;

        case 'list':
            runner.listSuites();
            break;

        case 'help':
        default:
            runner.showHelp();
            break;
    }
}

// 运行主函数
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 测试运行失败:', error);
        process.exit(1);
    });
}

// 导出测试运行器
module.exports = TestRunner;
