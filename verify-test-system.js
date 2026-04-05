/**
 * 魔法画笔测试系统验证脚本
 * 验证所有测试文件和功能的完整性
 */

const fs = require('fs');
const path = require('path');

class TestSystemVerifier {
    constructor() {
        this.requiredFiles = {
            framework: 'tests/test-framework.js',
            runner: 'tests/test-runner.js',
            webRunner: 'tests/test-web-runner.html',
            basicTest: 'tests/test.html',
            features: [
                'tests/test-feature1-drawing-tools.js',
                'tests/test-feature2-color-selection.js',
                'tests/test-feature3-brush-size-line-edit.js',
                'tests/test-feature4-layer-management.js',
                'tests/test-feature5-undo-clear.js',
                'tests/test-feature6-auto-save-export.js',
                'tests/test-feature7-ai-color-optimization.js'
            ],
            docs: [
                'tests/README.md',
                'tests/TEST_CHECKLIST.md'
            ],
            scripts: [
                'run-tests.bat',
                'dev-watch.bat',
                'dev-watch.js'
            ],
            rootDocs: [
                'TEST_SYSTEM_SUMMARY.md',
                'TEST_QUICK_REFERENCE.md'
            ]
        };

        this.verificationResults = {
            passed: 0,
            failed: 0,
            details: []
        };
    }

    /**
     * 验证文件存在
     */
    verifyFileExists(filePath, description) {
        const exists = fs.existsSync(filePath);
        const result = {
            file: filePath,
            description: description,
            status: exists ? 'passed' : 'failed',
            message: exists ? '✅ 文件存在' : '❌ 文件不存在'
        };

        this.verificationResults.details.push(result);
        
        if (exists) {
            this.verificationResults.passed++;
        } else {
            this.verificationResults.failed++;
        }

        return exists;
    }

    /**
     * 验证文件内容
     */
    verifyFileContent(filePath, requiredContent, description) {
        if (!fs.existsSync(filePath)) {
            this.verifyFileExists(filePath, description);
            return false;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const hasContent = requiredContent.some(item => content.includes(item));
        
        const result = {
            file: filePath,
            description: description,
            status: hasContent ? 'passed' : 'failed',
            message: hasContent ? '✅ 内容正确' : '❌ 内容缺失'
        };

        this.verificationResults.details.push(result);
        
        if (hasContent) {
            this.verificationResults.passed++;
        } else {
            this.verificationResults.failed++;
        }

        return hasContent;
    }

    /**
     * 验证测试框架
     */
    verifyFramework() {
        console.log('\n📋 验证测试框架...\n');
        
        this.verifyFileExists(this.requiredFiles.framework, '测试框架文件');
        this.verifyFileContent(
            this.requiredFiles.framework,
            ['class TestFramework', 'describe', 'it', 'assertEqual'],
            '测试框架核心功能'
        );
    }

    /**
     * 验证测试运行器
     */
    verifyRunner() {
        console.log('\n📋 验证测试运行器...\n');
        
        this.verifyFileExists(this.requiredFiles.runner, '测试运行器文件');
        this.verifyFileContent(
            this.requiredFiles.runner,
            ['class TestRunner', 'runAllTests', 'runSuite', 'runTest'],
            '测试运行器核心功能'
        );
    }

    /**
     * 验证Web运行器
     */
    verifyWebRunner() {
        console.log('\n📋 验证Web测试运行器...\n');
        
        this.verifyFileExists(this.requiredFiles.webRunner, 'Web测试运行器文件');
        this.verifyFileContent(
            this.requiredFiles.webRunner,
            ['<html>', 'WebTestRunner', 'runAllTests'],
            'Web测试运行器核心功能'
        );
    }

    /**
     * 验证基础测试页面
     */
    verifyBasicTest() {
        console.log('\n📋 验证基础测试页面...\n');
        
        this.verifyFileExists(this.requiredFiles.basicTest, '基础测试页面文件');
        this.verifyFileContent(
            this.requiredFiles.basicTest,
            ['<html>', 'test', 'function'],
            '基础测试页面功能'
        );
    }

    /**
     * 验证功能测试文件
     */
    verifyFeatureTests() {
        console.log('\n📋 验证功能测试文件...\n');
        
        this.requiredFiles.features.forEach((file, index) => {
            const featureNum = index + 1;
            this.verifyFileExists(file, `功能点${featureNum}测试文件`);
            this.verifyFileContent(
                file,
                [`class Feature${featureNum}Tests`, 'registerTests'],
                `功能点${featureNum}测试类`
            );
        });
    }

    /**
     * 验证文档文件
     */
    verifyDocs() {
        console.log('\n📋 验证文档文件...\n');
        
        this.requiredFiles.docs.forEach(file => {
            const fileName = path.basename(file);
            this.verifyFileExists(file, `${fileName}文档`);
        });

        this.requiredFiles.rootDocs.forEach(file => {
            const fileName = path.basename(file);
            this.verifyFileExists(file, `${fileName}文档`);
        });
    }

    /**
     * 验证脚本文件
     */
    verifyScripts() {
        console.log('\n📋 验证脚本文件...\n');
        
        this.requiredFiles.scripts.forEach(file => {
            const fileName = path.basename(file);
            this.verifyFileExists(file, `${fileName}脚本`);
        });
    }

    /**
     * 统计测试用例数量
     */
    countTestCases() {
        console.log('\n📋 统计测试用例数量...\n');
        
        let totalTests = 0;
        
        this.requiredFiles.features.forEach((file, index) => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf-8');
                const testCount = (content.match(/framework\.it\(/g) || []).length;
                totalTests += testCount;
                
                console.log(`  功能点${index + 1}: ${testCount} 个测试用例`);
                
                this.verificationResults.details.push({
                    file: file,
                    description: `功能点${index + 1}测试用例统计`,
                    status: 'passed',
                    message: `✅ ${testCount} 个测试用例`
                });
                
                this.verificationResults.passed++;
            }
        });
        
        console.log(`  总计: ${totalTests} 个测试用例`);
        
        this.verificationResults.details.push({
            file: '所有测试文件',
            description: '测试用例总数',
            status: 'passed',
            message: `✅ ${totalTests} 个测试用例`
        });
        
        this.verificationResults.passed++;
    }

    /**
     * 运行所有验证
     */
    runAllVerifications() {
        console.log('🔍 开始验证测试系统...\n');
        console.log('='.repeat(60));

        this.verifyFramework();
        this.verifyRunner();
        this.verifyWebRunner();
        this.verifyBasicTest();
        this.verifyFeatureTests();
        this.verifyDocs();
        this.verifyScripts();
        this.countTestCases();

        this.displaySummary();
    }

    /**
     * 显示验证摘要
     */
    displaySummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 验证摘要');
        console.log('='.repeat(60));
        console.log(`总检查项: ${this.verificationResults.passed + this.verificationResults.failed}`);
        console.log(`通过: ${this.verificationResults.passed} ✅`);
        console.log(`失败: ${this.verificationResults.failed} ❌`);
        
        if (this.verificationResults.failed === 0) {
            console.log('\n🎉 所有验证通过!测试系统完整且可用。');
        } else {
            console.log('\n⚠️  部分验证失败,请检查以下项目:');
            this.verificationResults.details
                .filter(detail => detail.status === 'failed')
                .forEach(detail => {
                    console.log(`  - ${detail.file}: ${detail.message}`);
                });
        }
        
        console.log('\n' + '='.repeat(60));
    }

    /**
     * 生成验证报告
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.verificationResults.passed + this.verificationResults.failed,
                passed: this.verificationResults.passed,
                failed: this.verificationResults.failed
            },
            details: this.verificationResults.details
        };

        const reportPath = './test-system-verification-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`\n📄 验证报告已保存到: ${reportPath}`);
    }
}

// 主函数
function main() {
    const verifier = new TestSystemVerifier();
    verifier.runAllVerifications();
    verifier.generateReport();
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = TestSystemVerifier;
