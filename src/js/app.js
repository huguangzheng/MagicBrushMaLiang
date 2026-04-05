// 魔法画笔应用
class MagicBrushApp {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.layers = [];
        this.currentLayerIndex = 0;
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.history = [];
        this.historyIndex = -1;
        this.autoSaveInterval = null;
        this.selectedPoints = []; // 用于线条编辑
        this.editingLine = null; // 当前编辑的线条
        this.editMode = false; // 是否处于编辑模式
        this.editingPointIndex = -1; // 当前编辑的点的索引
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.addLayer('背景层');
        this.addLayer('图层1');
        this.startAutoSave();
        this.updateBrushPreview();
        this.render();
    }
    
    setupCanvas() {
        const container = document.querySelector('.canvas-container');
        const width = container.clientWidth - 40;
        const height = container.clientHeight - 40;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // 设置白色背景
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, width, height);
    }
    
    setupEventListeners() {
        // 工具选择
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });
        
        // 颜色选择
        document.getElementById('colorPicker').addEventListener('input', (e) => {
            this.currentColor = e.target.value;
        });
        
        // 快捷颜色选择
        document.querySelectorAll('.quick-color').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.currentColor = color;
                document.getElementById('colorPicker').value = color;
                this.updateBrushPreview();
            });
        });
        
        // 画笔大小
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brushSizeValue').textContent = this.brushSize;
            this.updateBrushPreview();
        });
        
        // 画布绘图事件
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        // 按钮事件
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('clearCanvasBtn').addEventListener('click', () => this.clearCanvas());
        document.getElementById('clearLayerBtn').addEventListener('click', () => this.clearCurrentLayer());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportProject());
        document.getElementById('importBtn').addEventListener('click', () => this.importProject());
        document.getElementById('aiColorBtn').addEventListener('click', () => this.aiOptimizeColors());
        
        // 图层管理事件
        document.getElementById('addLayerBtn').addEventListener('click', () => this.addLayer());
        document.getElementById('deleteLayerBtn').addEventListener('click', () => this.deleteLayer());
        document.getElementById('renameLayerBtn').addEventListener('click', () => this.renameLayer());
        document.getElementById('moveLayerUpBtn').addEventListener('click', () => this.moveLayerUp());
        document.getElementById('moveLayerDownBtn').addEventListener('click', () => this.moveLayerDown());
        
        // 导入文件
        document.getElementById('importFile').addEventListener('change', this.handleImportFile.bind(this));
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 首先检查是否点击了现有线条进行编辑
        const clickedLine = this.enhanceLineSelection(x, y);
        if (clickedLine) {
            this.editingLine = clickedLine;
            this.editMode = true;
            this.showEditingControls();
            return;
        }
        
        // 如果没有点击线条，则进行正常绘制
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        
        if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            this.currentPath = {
                type: this.currentTool,
                color: this.currentColor,
                size: this.brushSize,
                points: [{x, y}]
            };
        } else if (this.currentTool === 'line') {
            this.currentShape = {
                type: 'line',
                color: this.currentColor,
                size: this.brushSize,
                startX: x,
                startY: y,
                endX: x,
                endY: y
            };
        } else if (this.currentTool === 'rect') {
            this.currentShape = {
                type: 'rect',
                color: this.currentColor,
                size: this.brushSize,
                startX: x,
                startY: y,
                width: 0,
                height: 0,
                fill: false
            };
        } else if (this.currentTool === 'circle') {
            this.currentShape = {
                type: 'circle',
                color: this.currentColor,
                size: this.brushSize,
                centerX: x,
                centerY: y,
                radius: 0,
                fill: false
            };
        }
    }
    
    handleMouseMove(e) {
        // 如果是编辑模式，使用编辑模式的处理函数
        if (this.currentTool === 'edit') {
            this.handleEditModeMouseMove(e);
            return;
        }
        
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            this.currentPath.points.push({x, y});
            this.drawPath(this.currentPath);
        } else if (this.currentTool === 'line') {
            this.currentShape.endX = x;
            this.currentShape.endY = y;
            this.render();
            this.drawShape(this.currentShape);
        } else if (this.currentTool === 'rect') {
            this.currentShape.width = x - this.currentShape.startX;
            this.currentShape.height = y - this.currentShape.startY;
            this.render();
            this.drawShape(this.currentShape);
        } else if (this.currentTool === 'circle') {
            const dx = x - this.currentShape.centerX;
            const dy = y - this.currentShape.centerY;
            this.currentShape.radius = Math.sqrt(dx * dx + dy * dy);
            this.render();
            this.drawShape(this.currentShape);
        }
        
        this.lastX = x;
        this.lastY = y;
    }
    
    handleMouseUp(e) {
        // 如果是编辑模式，使用编辑模式的处理函数
        if (this.currentTool === 'edit') {
            this.handleEditModeMouseUp();
            return;
        }
        
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // 将绘制内容添加到当前图层
        const currentLayer = this.layers[this.currentLayerIndex];
        
        if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            currentLayer.elements.push({...this.currentPath});
        } else if (this.currentShape) {
            currentLayer.elements.push({...this.currentShape});
        }
        
        this.saveHistory();
        this.render();
        this.updateLayerPreview();
        
        this.currentPath = null;
        this.currentShape = null;
    }
    
    drawPath(path) {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.strokeStyle = path.type === 'eraser' ? '#ffffff' : path.color;
        ctx.lineWidth = path.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }
        }
        
        ctx.stroke();
        ctx.closePath();
    }
    
    drawShape(shape) {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (shape.type === 'line') {
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
        } else if (shape.type === 'rect') {
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
        } else if (shape.type === 'circle') {
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        }
        
        ctx.stroke();
        ctx.closePath();
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染所有图层
        this.layers.forEach(layer => {
            if (!layer.visible) return;
            
            layer.elements.forEach(element => {
                if (element.type === 'brush' || element.type === 'eraser') {
                    this.drawPath(element);
                } else if (element.type === 'line' || element.type === 'rect' || element.type === 'circle') {
                    this.drawShape(element);
                }
            });
        });
    }
    
    addLayer(name = null) {
        const layerName = name || `图层${this.layers.length + 1}`;
        const layer = {
            id: Date.now(),
            name: layerName,
            visible: true,
            locked: false,
            elements: []
        };
        
        this.layers.push(layer);
        this.currentLayerIndex = this.layers.length - 1;
        this.updateLayerList();
        this.saveHistory();
    }
    
    deleteLayer() {
        if (this.layers.length <= 1) {
            alert('至少需要保留一个图层');
            return;
        }
        
        this.layers.splice(this.currentLayerIndex, 1);
        this.currentLayerIndex = Math.min(this.currentLayerIndex, this.layers.length - 1);
        this.updateLayerList();
        this.render();
        this.saveHistory();
    }
    
    moveLayerUp() {
        if (this.currentLayerIndex >= this.layers.length - 1) return;
        
        const temp = this.layers[this.currentLayerIndex];
        this.layers[this.currentLayerIndex] = this.layers[this.currentLayerIndex + 1];
        this.layers[this.currentLayerIndex + 1] = temp;
        this.currentLayerIndex++;
        
        this.updateLayerList();
        this.render();
        this.saveHistory();
    }
    
    moveLayerDown() {
        if (this.currentLayerIndex <= 0) return;
        
        const temp = this.layers[this.currentLayerIndex];
        this.layers[this.currentLayerIndex] = this.layers[this.currentLayerIndex - 1];
        this.layers[this.currentLayerIndex - 1] = temp;
        this.currentLayerIndex--;
        
        this.updateLayerList();
        this.render();
        this.saveHistory();
    }
    
    selectLayer(index) {
        this.currentLayerIndex = index;
        this.updateLayerList();
    }
    
    toggleLayerVisibility(index) {
        this.layers[index].visible = !this.layers[index].visible;
        this.updateLayerList();
        this.render();
    }
    
    updateLayerList() {
        const layerList = document.getElementById('layerList');
        layerList.innerHTML = '';
        
        // 反向显示图层，让上面的图层在列表中显示在上方
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            const layerItem = document.createElement('div');
            layerItem.className = `layer-item ${i === this.currentLayerIndex ? 'active' : ''}`;
            
            layerItem.innerHTML = `
                <div class="layer-preview">
                    <canvas id="layerPreview${layer.id}" width="40" height="40"></canvas>
                </div>
                <div class="layer-info">
                    <div class="layer-name" data-layer-index="${i}" title="点击选择，双击重命名">${layer.name}</div>
                </div>
                <div class="layer-actions">
                    <button onclick="app.toggleLayerVisibility(${i})">${layer.visible ? '👁️' : '👁️‍🗨️'}</button>
                </div>
            `;
            
            layerItem.addEventListener('click', (e) => {
                if (!e.target.closest('.layer-actions')) {
                    this.selectLayer(i);
                }
            });
            
            // 添加双击重命名功能
            const layerName = layerItem.querySelector('.layer-name');
            layerName.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.editLayerName(i);
            });
            
            layerList.appendChild(layerItem);
        }
        
        this.updateLayerPreviews();
    }
    
    updateLayerPreviews() {
        this.layers.forEach(layer => {
            const previewCanvas = document.getElementById(`layerPreview${layer.id}`);
            if (!previewCanvas) return;
            
            const previewCtx = previewCanvas.getContext('2d');
            previewCtx.fillStyle = '#ffffff';
            previewCtx.fillRect(0, 0, 40, 40);
            
            // 绘制图层内容的缩略图
            const scaleX = 40 / this.canvas.width;
            const scaleY = 40 / this.canvas.height;
            
            layer.elements.forEach(element => {
                if (element.type === 'brush' || element.type === 'eraser') {
                    previewCtx.beginPath();
                    previewCtx.strokeStyle = element.type === 'eraser' ? '#ffffff' : element.color;
                    previewCtx.lineWidth = Math.max(1, element.size * Math.min(scaleX, scaleY));
                    previewCtx.lineCap = 'round';
                    previewCtx.lineJoin = 'round';
                    
                    if (element.points.length > 0) {
                        previewCtx.moveTo(element.points[0].x * scaleX, element.points[0].y * scaleY);
                        for (let i = 1; i < element.points.length; i++) {
                            previewCtx.lineTo(element.points[i].x * scaleX, element.points[i].y * scaleY);
                        }
                    }
                    
                    previewCtx.stroke();
                    previewCtx.closePath();
                }
            });
        });
    }
    
    updateLayerPreview() {
        this.updateLayerPreviews();
    }
    
    saveHistory() {
        // 删除当前位置之后的历史记录
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // 添加新的历史记录
        this.history.push(JSON.stringify(this.layers));
        this.historyIndex++;
        
        // 限制历史记录数量
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex <= 0) return;
        
        this.historyIndex--;
        this.layers = JSON.parse(this.history[this.historyIndex]);
        this.currentLayerIndex = Math.min(this.currentLayerIndex, this.layers.length - 1);
        
        this.updateLayerList();
        this.render();
    }
    
    clearCanvas() {
        if (!confirm('确定要清除整个画布吗?')) return;
        
        this.layers.forEach(layer => {
            layer.elements = [];
        });
        
        this.render();
        this.updateLayerPreview();
        this.saveHistory();
    }
    
    clearCurrentLayer() {
        if (!confirm('确定要清除当前图层吗?')) return;
        
        this.layers[this.currentLayerIndex].elements = [];
        this.render();
        this.updateLayerPreview();
        this.saveHistory();
    }
    
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 60000); // 1分钟自动保存
    }
    
    autoSave() {
        const projectData = {
            layers: this.layers,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            timestamp: Date.now()
        };
        
        localStorage.setItem('magicBrushAutoSave', JSON.stringify(projectData));
        this.showAutoSaveIndicator();
    }
    
    showAutoSaveIndicator() {
        const indicator = document.querySelector('.auto-save-indicator');
        if (!indicator) {
            const newIndicator = document.createElement('div');
            newIndicator.className = 'auto-save-indicator';
            newIndicator.textContent = '已自动保存';
            document.body.appendChild(newIndicator);
            
            setTimeout(() => {
                newIndicator.classList.add('show');
                setTimeout(() => {
                    newIndicator.classList.remove('show');
                    setTimeout(() => {
                        newIndicator.remove();
                    }, 300);
                }, 1500);
            }, 100);
        }
    }
    
    exportProject() {
        const projectData = {
            layers: this.layers,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `magicbrush_project_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    importProject() {
        document.getElementById('importFile').click();
    }
    
    handleImportFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectData = JSON.parse(event.target.result);
                
                this.layers = projectData.layers;
                this.canvas.width = projectData.canvasWidth;
                this.canvas.height = projectData.canvasHeight;
                this.currentLayerIndex = 0;
                
                this.updateLayerList();
                this.render();
                this.saveHistory();
                
                alert('项目导入成功!');
            } catch (error) {
                alert('导入失败: ' + error.message);
            }
        };
        
        reader.readAsText(file);
        e.target.value = ''; // 重置文件输入
    }
    
    async aiOptimizeColors() {
        const currentLayer = this.layers[this.currentLayerIndex];
        
        if (currentLayer.elements.length === 0) {
            alert('当前图层没有内容，无法进行AI优化');
            return;
        }
        
        this.showLoading('AI正在优化配色...');
        
        try {
            // 收集当前图层中的颜色信息
            const colorInfo = this.collectColorInfo(currentLayer);
            
            // 调用AI优化配色
            const optimizedColors = await this.callAIColorOptimization(colorInfo);
            
            // 应用优化后的颜色
            this.applyOptimizedColors(currentLayer, optimizedColors);
            
            this.render();
            this.updateLayerPreview();
            this.saveHistory();
            
            this.hideLoading();
            alert('AI配色优化完成!');
        } catch (error) {
            this.hideLoading();
            alert('AI优化失败: ' + error.message);
        }
    }
    
    collectColorInfo(layer) {
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
    }
    
    async callAIColorOptimization(colorInfo) {
        // 这里是AI优化配色的接口调用
        // 实际使用时需要替换为真实的AI API调用
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟AI优化结果
                const colorMap = {};
                
                // 生成优化后的颜色映射
                colorInfo.colors.forEach(color => {
                    // 这里可以调用真实的AI API来获取优化后的颜色
                    // 目前使用简单的色相偏移作为示例
                    const optimizedColor = this.shiftHue(color, 30);
                    colorMap[color] = optimizedColor;
                });
                
                resolve(colorMap);
            }, 2000);
        });
    }
    
    shiftHue(hexColor, degrees) {
        // 将十六进制颜色转换为HSL
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
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }
        
        // 偏移色相
        h = (h + degrees / 360) % 1;
        if (h < 0) h += 1;
        
        // 将HSL转换回十六进制
        const rgb = this.hslToRgb(h, s, l);
        return `#${rgb.map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')}`;
    }
    
    hslToRgb(h, s, l) {
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
    }
    
    applyOptimizedColors(layer, colorMap) {
        layer.elements.forEach(element => {
            if (element.color && colorMap[element.color]) {
                element.color = colorMap[element.color];
            }
        });
    }
    
    showLoading(text) {
        let loading = document.querySelector('.loading');
        if (!loading) {
            loading = document.createElement('div');
            loading.className = 'loading';
            loading.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">${text}</div>
            `;
            document.body.appendChild(loading);
        }
        
        loading.querySelector('.loading-text').textContent = text;
        loading.classList.add('show');
    }
    
    hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.classList.remove('show');
        }
    }
    
    // 编辑模式功能
    handleEditModeClick(x, y) {
        // 如果已经选择了线条，检查是否点击了控制点
        if (this.editingLine) {
            // 检查是否点击了控制点
            for (let i = 0; i < this.editingLine.points.length; i++) {
                const point = this.editingLine.points[i];
                const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                
                if (distance < 10) {
                    this.editingPointIndex = i;
                    this.isDrawing = true;
                    return;
                }
            }
        }
        
        // 查找点击的线条
        const clickedLine = this.findClickedLine(x, y);
        
        if (clickedLine) {
            this.editingLine = clickedLine;
            this.editMode = true;
            this.editingPointIndex = -1;
            this.render();
            this.drawEditingControls();
        } else {
            // 取消编辑
            this.editingLine = null;
            this.editMode = false;
            this.editingPointIndex = -1;
            this.render();
        }
    }
    
    findClickedLine(x, y) {
        const threshold = 10; // 点击容差
        
        // 从当前图层开始查找
        for (let i = this.currentLayerIndex; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (!layer.visible) continue;
            
            for (const element of layer.elements) {
                if ((element.type === 'brush' || element.type === 'eraser') && element.points.length > 1) {
                    // 检查是否点击了线条上的任意点
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
    }
    
    drawEditingControls() {
        if (!this.editingLine || !this.editingLine.points) return;
        
        const ctx = this.ctx;
        
        // 绘制控制点
        this.editingLine.points.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#4a9eff';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        });
        
        // 显示提示信息
        ctx.fillStyle = '#4a9eff';
        ctx.font = '14px Arial';
        ctx.fillText('点击并拖动控制点来调整线条弧度', 10, 30);
    }
    
    // 增强的鼠标移动事件，支持编辑模式
    handleEditModeMouseMove(e) {
        if (!this.editMode || !this.editingLine) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否悬停在控制点上
        let hoveredPointIndex = -1;
        
        if (this.editingLine.points) {
            for (let i = 0; i < this.editingLine.points.length; i++) {
                const point = this.editingLine.points[i];
                const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                
                if (distance < 10) {
                    hoveredPointIndex = i;
                    break;
                }
            }
        }
        
        // 更新鼠标样式
        this.canvas.style.cursor = hoveredPointIndex >= 0 ? 'move' : 'default';
        
        // 如果正在拖动控制点
        if (this.isDrawing && this.editingPointIndex >= 0) {
            this.editingLine.points[this.editingPointIndex] = {x, y};
            this.render();
            this.drawEditingControls();
            this.saveHistory();
        }
    }
    
    // 增强的鼠标释放事件，支持编辑模式
    handleEditModeMouseUp() {
        if (this.editMode) {
            this.isDrawing = false;
            this.editingPointIndex = -1;
        }
    }
    
    // 更新画笔预览
    updateBrushPreview() {
        const previewCanvas = document.getElementById('brushPreviewCanvas');
        const previewCtx = previewCanvas.getContext('2d');
        
        // 清空预览画布
        previewCtx.fillStyle = '#ffffff';
        previewCtx.fillRect(0, 0, 50, 50);
        
        // 绘制画笔预览
        previewCtx.beginPath();
        previewCtx.fillStyle = this.currentColor;
        previewCtx.arc(25, 25, this.brushSize / 2, 0, Math.PI * 2);
        previewCtx.fill();
        previewCtx.closePath();
    }
    
    // 重命名图层
    renameLayer() {
        const layer = this.layers[this.currentLayerIndex];
        if (!layer) return;
        
        const newName = prompt('请输入新的图层名称:', layer.name);
        if (newName && newName.trim() !== '') {
            layer.name = newName.trim();
            this.updateLayerList();
            this.saveHistory();
        }
    }
    
    // 改进的线条选择功能 - 点击任意点选择线条
    enhanceLineSelection(x, y) {
        // 查找点击位置附近的线条
        const threshold = 10;
        let selectedLine = null;
        let minDistance = threshold;
        
        for (let i = this.currentLayerIndex; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (!layer.visible) continue;
            
            for (const element of layer.elements) {
                if ((element.type === 'brush' || element.type === 'eraser') && element.points.length > 1) {
                    // 检查是否点击了线条上的任意点
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
    }
    
    // 显示编辑控制点
    showEditingControls() {
        if (!this.editingLine || !this.editingLine.points) return;
        
        this.render();
        
        const ctx = this.ctx;
        
        // 绘制控制点
        this.editingLine.points.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#4a9eff';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        });
        
        // 显示提示信息
        ctx.fillStyle = '#4a9eff';
        ctx.font = '14px Arial';
        ctx.fillText('拖动控制点调整线条，点击空白处取消', 10, 30);
    }
    
    // 编辑图层名称
    editLayerName(index) {
        const layer = this.layers[index];
        if (!layer) return;
        
        const layerNameElements = document.querySelectorAll('.layer-name');
        let layerNameElement = null;
        
        layerNameElements.forEach(el => {
            if (parseInt(el.dataset.layerIndex) === index) {
                layerNameElement = el;
            }
        });
        
        if (!layerNameElement) return;
        
        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.value = layer.name;
        input.style.width = '100%';
        
        layerNameElement.innerHTML = '';
        layerNameElement.appendChild(input);
        layerNameElement.classList.add('editing');
        
        input.focus();
        input.select();
        
        // 处理输入完成
        const finishEdit = () => {
            const newName = input.value.trim();
            if (newName !== '') {
                layer.name = newName;
                this.saveHistory();
            }
            layerNameElement.innerHTML = layer.name;
            layerNameElement.classList.remove('editing');
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Escape') {
                layerNameElement.innerHTML = layer.name;
                layerNameElement.classList.remove('editing');
            }
        });
    }
}

// 初始化应用
const app = new MagicBrushApp();
