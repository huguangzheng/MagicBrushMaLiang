/**
 * 魔法画笔开发监控脚本
 * 监控文件变化并自动运行测试
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class DevWatcher {
    constructor() {
        this.watchFiles = [
            'src/js/app.js',
            'src/css/styles.css',
            'index.html'
        ];
        this.testFiles = [
            'tests/test-framework.js',
            'tests/test-feature1-drawing-tools.js',
            'tests/test-feature2-color-selection.js',
            'tests/test-feature3-brush-size-line-edit.js',
            'tests/test-feature4-layer-management.js',
            'tests/test-feature5-undo-clear.js',
            'tests/test-feature6-auto-save-export.js',
            'tests/test-feature7-ai-color-optimization.js',
            'tests/test-runner.js'
        ];
        this.watchedFiles = new Map();
        this.isRunning = false;
        this.debounceTimer = null;
    }

    /**
     * 启动文件监控
     */
    start() {
        console.log('🚀 启动开发监控模式...\n');
        console.log('监控文件:');
        this.watchFiles.forEach(file => {
            console.log(`  - ${file}`);
        });
        console.log('\n按 Ctrl+C 停止监控\n');
        console.log('='.repeat(60) + '\n');

        this.watchAllFiles();
        this.isRunning = true;

        // 首次运行测试
        this.runTests();
    }

    /**
     * 监控所有文件
     */
    watchAllFiles() {
        this.watchFiles.forEach(file => {
            const filePath = path.resolve(file);
            
            if (fs.existsSync(filePath)) {
                // 记录初始修改时间
                const stats = fs.statSync(filePath);
                this.watchedFiles.set(filePath, {
                    mtime: stats.mtime,
                    size: stats.size
                });

                // 开始监控
                fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
                    this.handleFileChange(filePath, curr, prev);
                });

                console.log(`✅ 已监控: ${file}`);
            } else {
                console.log(`⚠️  文件不存在: ${file}`);
            }
        });

        console.log('');
    }

    /**
     * 处理文件变化
     */
    handleFileChange(filePath, curr, prev) {
        if (!this.isRunning) return;

        const watchedFile = this.watchedFiles.get(filePath);
        if (!watchedFile) return;

        // 检查文件是否真的改变了
        if (curr.mtime === watchedFile.mtime && curr.size === watchedFile.size) {
            return;
        }

        // 更新文件状态
        this.watchedFiles.set(filePath, {
            mtime: curr.mtime,
            size: curr.size
        });

        const fileName = path.basename(filePath);
        console.log(`\n📝 检测到文件变化: ${fileName}`);
        console.log(`   时间: ${curr.mtime.toLocaleString()}`);

        // 防抖处理,避免频繁触发
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.runTests();
        }, 1000); // 1秒后运行测试
    }

    /**
     * 运行测试
     */
    async runTests() {
        console.log('\n🧪 开始运行测试...\n');
        console.log('='.repeat(60));

        try {
            // 运行测试
            const result = await this.executeTests();

            // 显示结果
            this.displayResults(result);

        } catch (error) {
            console.error('\n❌ 测试运行失败:', error.message);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ 监控继续运行中...\n');
    }

    /**
     * 执行测试
     */
    executeTests() {
        return new Promise((resolve, reject) => {
            exec('node tests/test-runner.js all', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        stdout: stdout,
                        stderr: stderr
                    });
                }
            });
        });
    }

    /**
     * 显示测试结果
     */
    displayResults(result) {
        console.log(result.stdout);
        
        if (result.stderr) {
            console.error('错误输出:');
            console.error(result.stderr);
        }
    }

    /**
     * 停止监控
     */
    stop() {
        console.log('\n🛑 停止开发监控...\n');

        this.isRunning = false;

        // 停止监控所有文件
        this.watchedFiles.forEach((_, filePath) => {
            fs.unwatchFile(filePath);
        });

        this.watchedFiles.clear();

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        console.log('✅ 监控已停止\n');
    }
}

// 主函数
function main() {
    const watcher = new DevWatcher();

    // 处理退出信号
    process.on('SIGINT', () => {
        watcher.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        watcher.stop();
        process.exit(0);
    });

    // 启动监控
    watcher.start();
}

// 运行主函数
if (require.main === module) {
    main();
}

// 导出开发监控类
module.exports = DevWatcher;
