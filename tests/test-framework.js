/**
 * 魔法画笔测试框架
 * 提供统一的测试用例管理和执行功能
 */

class TestFramework {
    constructor() {
        this.testCases = [];
        this.results = [];
        this.currentSuite = null;
    }

    /**
     * 创建测试套件
     */
    describe(name, callback) {
        const suite = {
            name: name,
            testCases: []
        };
        
        const previousSuite = this.currentSuite;
        this.currentSuite = suite;
        
        callback();
        
        this.currentSuite = previousSuite;
        
        if (suite.testCases.length > 0) {
            this.testCases.push(suite);
        }
    }

    /**
     * 创建测试用例
     */
    it(name, callback) {
        const testCase = {
            name: name,
            callback: callback,
            suite: this.currentSuite
        };
        
        if (this.currentSuite) {
            this.currentSuite.testCases.push(testCase);
        } else {
            // 如果没有套件,创建默认套件
            if (!this.currentSuite) {
                this.currentSuite = {
                    name: 'Default Suite',
                    testCases: []
                };
            }
            this.currentSuite.testCases.push(testCase);
        }
    }

    /**
     * 断言相等
     */
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new AssertionError(`Expected ${expected} but got ${actual}. ${message}`);
        }
    }

    /**
     * 断言不相等
     */
    assertNotEqual(actual, expected, message = '') {
        if (actual === expected) {
            throw new AssertionError(`Expected ${actual} to not equal ${expected}. ${message}`);
        }
    }

    /**
     * 断言为真
     */
    assertTrue(value, message = '') {
        if (!value) {
            throw new AssertionError(`Expected ${value} to be true. ${message}`);
        }
    }

    /**
     * 断言为假
     */
    assertFalse(value, message = '') {
        if (value) {
            throw new AssertionError(`Expected ${value} to be false. ${message}`);
        }
    }

    /**
     * 断言为null
     */
    assertNull(value, message = '') {
        if (value !== null) {
            throw new AssertionError(`Expected ${value} to be null. ${message}`);
        }
    }

    /**
     * 断言不为null
     */
    assertNotNull(value, message = '') {
        if (value === null) {
            throw new AssertionError(`Expected ${value} to not be null. ${message}`);
        }
    }

    /**
     * 断言包含
     */
    assertContains(haystack, needle, message = '') {
        if (!haystack.includes(needle)) {
            throw new AssertionError(`Expected "${haystack}" to contain "${needle}". ${message}`);
        }
    }

    /**
     * 断言数组包含
     */
    assertInArray(array, item, message = '') {
        if (!array.includes(item)) {
            throw new AssertionError(`Expected array to contain ${item}. ${message}`);
        }
    }

    /**
     * 断言抛出异常
     */
    assertThrows(callback, message = '') {
        let threw = false;
        try {
            callback();
        } catch (e) {
            threw = true;
        }
        if (!threw) {
            throw new AssertionError(`Expected function to throw an exception. ${message}`);
        }
    }

    /**
     * 断言小于
     */
    assertLessThan(actual, expected, message = '') {
        if (actual >= expected) {
            throw new AssertionError(`Expected ${actual} to be less than ${expected}. ${message}`);
        }
    }

    /**
     * 断言小于等于
     */
    assertLessThanOrEqual(actual, expected, message = '') {
        if (actual > expected) {
            throw new AssertionError(`Expected ${actual} to be less than or equal to ${expected}. ${message}`);
        }
    }

    /**
     * 断言大于
     */
    assertGreaterThan(actual, expected, message = '') {
        if (actual <= expected) {
            throw new AssertionError(`Expected ${actual} to be greater than ${expected}. ${message}`);
        }
    }

    /**
     * 断言大于等于
     */
    assertGreaterThanOrEqual(actual, expected, message = '') {
        if (actual < expected) {
            throw new AssertionError(`Expected ${actual} to be greater than or equal to ${expected}. ${message}`);
        }
    }

    /**
     * 运行所有测试
     */
    async runAll() {
        this.results = [];
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;

        console.log('🧪 开始运行测试套件...\n');

        for (const suite of this.testCases) {
            console.log(`\n📦 套件: ${suite.name}`);
            
            for (const testCase of suite.testCases) {
                totalTests++;
                
                try {
                    await testCase.callback();
                    passedTests++;
                    this.results.push({
                        suite: suite.name,
                        test: testCase.name,
                        status: 'passed',
                        error: null
                    });
                    console.log(`  ✅ ${testCase.name}`);
                } catch (error) {
                    failedTests++;
                    this.results.push({
                        suite: suite.name,
                        test: testCase.name,
                        status: 'failed',
                        error: error.message
                    });
                    console.log(`  ❌ ${testCase.name}`);
                    console.log(`     错误: ${error.message}`);
                }
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`);
        if (failedTests > 0) {
            console.log(`❌ 失败: ${failedTests}`);
        } else {
            console.log(`✅ 所有测试通过!`);
        }
        console.log('='.repeat(50));

        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            results: this.results
        };
    }

    /**
     * 运行指定套件的测试
     */
    async runSuite(suiteName) {
        const suite = this.testCases.find(s => s.name === suiteName);
        if (!suite) {
            throw new Error(`Suite "${suiteName}" not found`);
        }

        this.results = [];
        let passedTests = 0;
        let failedTests = 0;

        console.log(`🧪 运行测试套件: ${suiteName}\n`);

        for (const testCase of suite.testCases) {
            try {
                await testCase.callback();
                passedTests++;
                this.results.push({
                    suite: suite.name,
                    test: testCase.name,
                    status: 'passed',
                    error: null
                });
                console.log(`  ✅ ${testCase.name}`);
            } catch (error) {
                failedTests++;
                this.results.push({
                    suite: suite.name,
                    test: testCase.name,
                    status: 'failed',
                    error: error.message
                });
                console.log(`  ❌ ${testCase.name}`);
                console.log(`     错误: ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`📊 套件结果: ${passedTests}/${suite.testCases.length} 通过`);
        if (failedTests > 0) {
            console.log(`❌ 失败: ${failedTests}`);
        } else {
            console.log(`✅ 所有测试通过!`);
        }
        console.log('='.repeat(50));

        return {
            total: suite.testCases.length,
            passed: passedTests,
            failed: failedTests,
            results: this.results
        };
    }

    /**
     * 运行单个测试用例
     */
    async runTest(suiteName, testName) {
        const suite = this.testCases.find(s => s.name === suiteName);
        if (!suite) {
            throw new Error(`Suite "${suiteName}" not found`);
        }

        const testCase = suite.testCases.find(t => t.name === testName);
        if (!testCase) {
            throw new Error(`Test "${testName}" not found in suite "${suiteName}"`);
        }

        console.log(`🧪 运行测试: ${suiteName} > ${testName}`);

        try {
            await testCase.callback();
            console.log(`  ✅ 通过`);
            return {
                status: 'passed',
                error: null
            };
        } catch (error) {
            console.log(`  ❌ 失败`);
            console.log(`     错误: ${error.message}`);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    /**
     * 生成测试报告
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalTests: this.results.length,
            passedTests: this.results.filter(r => r.status === 'passed').length,
            failedTests: this.results.filter(r => r.status === 'failed').length,
            results: this.results
        };

        return JSON.stringify(report, null, 2);
    }

    /**
     * 获取所有测试套件名称
     */
    getSuiteNames() {
        return this.testCases.map(suite => suite.name);
    }

    /**
     * 获取指定套件的所有测试用例名称
     */
    getTestNames(suiteName) {
        const suite = this.testCases.find(s => s.name === suiteName);
        return suite ? suite.testCases.map(t => t.name) : [];
    }
}

/**
 * 断言错误类
 */
class AssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AssertionError';
    }
}

// 导出测试框架
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestFramework;
}
