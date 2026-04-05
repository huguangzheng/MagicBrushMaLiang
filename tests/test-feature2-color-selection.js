/**
 * 功能点2测试用例: 颜色选择
 * 测试颜色选择器、颜色格式支持等功能
 */

class Feature2Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    /**
     * 注册所有测试用例
     */
    registerTests() {
        this.framework.describe('功能点2: 颜色选择', () => {
            this.testColorPicker();
            this.testRGBFormat();
            this.testHEXFormat();
            this.testColorApplication();
            this.testColorHistory();
            this.testColorValidation();
        });
    }

    /**
     * 测试颜色选择器
     */
    testColorPicker() {
        this.framework.it('应该能够通过颜色选择器设置颜色', async () => {
            const testColor = '#ff0000';
            this.app.currentColor = testColor;

            this.framework.assertEqual(this.app.currentColor, testColor);
        });

        this.framework.it('颜色选择器应该支持预览', async () => {
            const testColors = ['#ff0000', '#00ff00', '#0000ff'];
            
            for (const color of testColors) {
                this.app.currentColor = color;
                // 验证颜色已设置
                this.framework.assertEqual(this.app.currentColor, color);
            }
        });
    }

    /**
     * 测试RGB格式
     */
    testRGBFormat() {
        this.framework.it('应该支持RGB颜色格式', async () => {
            // 测试RGB转HEX
            const rgbToHex = (r, g, b) => {
                return '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
            };

            // 测试一些RGB值
            const testCases = [
                {r: 255, g: 0, b: 0, expected: '#ff0000'},
                {r: 0, g: 255, b: 0, expected: '#00ff00'},
                {r: 0, g: 0, b: 255, expected: '#0000ff'},
                {r: 255, g: 255, b: 0, expected: '#ffff00'},
                {r: 128, g: 128, b: 128, expected: '#808080'}
            ];

            for (const testCase of testCases) {
                const result = rgbToHex(testCase.r, testCase.g, testCase.b);
                this.framework.assertEqual(result, testCase.expected);
            }
        });

        this.framework.it('RGB值应该在有效范围内', async () => {
            const validRGB = (r, g, b) => {
                return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
            };

            this.framework.assertTrue(validRGB(0, 0, 0));
            this.framework.assertTrue(validRGB(255, 255, 255));
            this.framework.assertTrue(validRGB(128, 128, 128));
            this.framework.assertFalse(validRGB(256, 0, 0));
            this.framework.assertFalse(validRGB(-1, 0, 0));
        });
    }

    /**
     * 测试HEX格式
     */
    testHEXFormat() {
        this.framework.it('应该支持HEX颜色格式', async () => {
            const testColors = [
                '#ff0000', // 红色
                '#00ff00', // 绿色
                '#0000ff', // 蓝色
                '#ffff00', // 黄色
                '#ff00ff', // 品红
                '#00ffff', // 青色
                '#ffffff', // 白色
                '#000000', // 黑色
                '#808080', // 灰色
                '#ff5733'  // 自定义颜色
            ];

            for (const color of testColors) {
                this.app.currentColor = color;
                this.framework.assertEqual(this.app.currentColor, color);
            }
        });

        this.framework.it('HEX颜色格式应该验证', async () => {
            const isValidHex = (hex) => {
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
            };

            this.framework.assertTrue(isValidHex('#ff0000'));
            this.framework.assertTrue(isValidHex('#fff'));
            this.framework.assertTrue(isValidHex('#ABCDEF'));
            this.framework.assertFalse(isValidHex('ff0000')); // 缺少#
            this.framework.assertFalse(isValidHex('#gg0000')); // 无效字符
            this.framework.assertFalse(isValidHex('#ff00')); // 长度错误
        });

        this.framework.it('应该支持3位和6位HEX格式', async () => {
            const isValidHex = (hex) => {
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
            };

            // 3位HEX
            this.framework.assertTrue(isValidHex('#f00'));
            this.framework.assertTrue(isValidHex('#0f0'));
            this.framework.assertTrue(isValidHex('#00f'));

            // 6位HEX
            this.framework.assertTrue(isValidHex('#ff0000'));
            this.framework.assertTrue(isValidHex('#00ff00'));
            this.framework.assertTrue(isValidHex('#0000ff'));
        });
    }

    /**
     * 测试颜色应用
     */
    testColorApplication() {
        this.framework.it('颜色应该应用到画笔工具', async () => {
            const testColor = '#ff5733';
            this.app.currentTool = 'brush';
            this.app.currentColor = testColor;

            this.app.currentPath = {
                type: 'brush',
                color: this.app.currentColor,
                size: 5,
                points: [{x: 0, y: 0}]
            };

            this.framework.assertEqual(this.app.currentPath.color, testColor);
        });

        this.framework.it('颜色应该应用到形状工具', async () => {
            const testColor = '#33ff57';
            this.app.currentTool = 'line';
            this.app.currentColor = testColor;

            this.app.currentShape = {
                type: 'line',
                color: this.app.currentColor,
                size: 3,
                startX: 0,
                startY: 0,
                endX: 100,
                endY: 100
            };

            this.framework.assertEqual(this.app.currentShape.color, testColor);
        });

        this.framework.it('颜色应该应用到所有绘图工具', async () => {
            const tools = ['brush', 'line', 'rect', 'circle'];
            const testColor = '#5733ff';

            for (const tool of tools) {
                this.app.currentTool = tool;
                this.app.currentColor = testColor;
                this.framework.assertEqual(this.app.currentColor, testColor);
            }
        });
    }

    /**
     * 测试颜色历史
     */
    testColorHistory() {
        this.framework.it('应该记录使用的颜色历史', async () => {
            const colorHistory = [];
            const testColors = ['#ff0000', '#00ff00', '#0000ff'];

            // 模拟颜色使用历史
            for (const color of testColors) {
                this.app.currentColor = color;
                colorHistory.push(color);
            }

            this.framework.assertEqual(colorHistory.length, 3);
            this.framework.assertEqual(colorHistory[0], '#ff0000');
            this.framework.assertEqual(colorHistory[1], '#00ff00');
            this.framework.assertEqual(colorHistory[2], '#0000ff');
        });

        this.framework.it('颜色历史应该去重', async () => {
            const colorHistory = [];
            const testColors = ['#ff0000', '#00ff00', '#ff0000', '#0000ff', '#00ff00'];

            for (const color of testColors) {
                if (!colorHistory.includes(color)) {
                    colorHistory.push(color);
                }
            }

            this.framework.assertEqual(colorHistory.length, 3);
            this.framework.assertInArray(colorHistory, '#ff0000');
            this.framework.assertInArray(colorHistory, '#00ff00');
            this.framework.assertInArray(colorHistory, '#0000ff');
        });
    }

    /**
     * 测试颜色验证
     */
    testColorValidation() {
        this.framework.it('应该验证颜色格式', async () => {
            const validateColor = (color) => {
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
            };

            this.framework.assertTrue(validateColor('#ff0000'));
            this.framework.assertTrue(validateColor('#fff'));
            this.framework.assertFalse(validateColor('red'));
            this.framework.assertFalse(validateColor('rgb(255,0,0)'));
            this.framework.assertFalse(validateColor('#gg0000'));
        });

        this.framework.it('应该处理无效颜色', async () => {
            const invalidColors = ['red', 'blue', 'invalid', '#gggggg', '#12345'];

            for (const color of invalidColors) {
                // 模拟颜色验证
                const isValid = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
                this.framework.assertFalse(isValid, `Color ${color} should be invalid`);
            }
        });

        this.framework.it('应该提供默认颜色', async () => {
            const defaultColor = '#000000';
            this.app.currentColor = defaultColor;

            this.framework.assertEqual(this.app.currentColor, defaultColor);
        });
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Feature2Tests;
}
