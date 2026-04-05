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
        this.backgroundColor = '#ffffff'; // 背景颜色
        
        // 缩放相关属性
        this.zoomLevel = 1; // 缩放级别 (1 = 100%)
        this.minZoom = 0.1; // 最小缩放
        this.maxZoom = 5; // 最大缩放
        this.zoomStep = 0.1; // 缩放步长
        // 视口平移（画布坐标系，与 scale 配合实现以鼠标为中心的缩放）
        this.viewPanX = 0;
        this.viewPanY = 0;
        
        // 线条吸附相关属性
        this.snapThreshold = 15; // 吸附阈值(像素)
        this.hoveredLine = null; // 鼠标悬停的线条
        this.selectedLine = null; // 选中的线条
        
        // 选择工具相关属性
        this.selectedElement = null; // 当前选中的元素
        this.isDraggingElement = false; // 是否正在拖动元素
        this.dragOffsetX = 0; // 拖动偏移X
        this.dragOffsetY = 0; // 拖动偏移Y
        
        // 网格相关属性
        this.showGrid = true; // 是否显示网格
        this.gridSize = 10; // 网格大小(像素)
        this.minGridSize = 5; // 最小网格大小
        
        // 图层限制
        this.maxLayers = 16; // 最大图层数

        // 标尺相关属性
        this.showRuler = true;
        this.rulerSize = 20;
        this.rulerXCanvas = null;
        this.rulerYCanvas = null;
        this.rulerXCtx = null;
        this.rulerYCtx = null;

        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.initRulers();
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

        // 导出图片事件
        document.getElementById('exportPNGBtn').addEventListener('click', () => this.exportPNG());
        document.getElementById('exportJPGBtn').addEventListener('click', () => this.exportJPG());
        
        // 图层管理事件
        document.getElementById('addLayerBtn').addEventListener('click', () => this.addLayer());
        document.getElementById('deleteLayerBtn').addEventListener('click', () => this.deleteLayer());
        document.getElementById('moveLayerUpBtn').addEventListener('click', () => this.moveLayerUp());
        document.getElementById('moveLayerDownBtn').addEventListener('click', () => this.moveLayerDown());
        
        // 背景颜色选择事件
        document.querySelectorAll('.bg-color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.setLayerColor(color);

                // 更新按钮状态
                document.querySelectorAll('.bg-color-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // 缩放控制事件
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoomResetBtn').addEventListener('click', () => this.zoomReset());

        // 网格控制
        document.getElementById('toggleGridBtn').addEventListener('click', () => {
            this.toggleGrid();
            const btn = document.getElementById('toggleGridBtn');
            btn.textContent = this.showGrid ? '显示网格' : '隐藏网格';
            btn.classList.toggle('active', this.showGrid);
        });

        document.getElementById('gridSizeSelect').addEventListener('change', (e) => {
            this.setGridSize(e.target.value);
        });
        
        // 鼠标滚轮缩放（以指针下的画布点为锚点）
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const { mx, my } = this.clientDeltaFromEvent(e);
            const dir = e.deltaY < 0 ? 1 : -1;
            const next = this.zoomLevel + dir * this.zoomStep;
            this.zoomTowardCanvasPoint(mx, my, next);
            this.updateZoomDisplay();
            this.render();
        }, { passive: false });
        
        // 导入文件
        document.getElementById('importFile').addEventListener('change', this.handleImportFile.bind(this));
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.setupCanvas());
        
        // 键盘事件 - DEL键删除
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Del') {
                if (this.selectedElement) {
                    this.deleteSelectedElement();
                }
            }
        });
    }
    
    /** 鼠标相对画布左上角的偏移（与 canvas 位图一致，未做视口变换） */
    clientDeltaFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            mx: e.clientX - rect.left,
            my: e.clientY - rect.top
        };
    }

    canvasPointToWorld(mx, my) {
        return {
            x: (mx - this.viewPanX) / this.zoomLevel,
            y: (my - this.viewPanY) / this.zoomLevel
        };
    }

    eventToWorld(e) {
        const { mx, my } = this.clientDeltaFromEvent(e);
        return this.canvasPointToWorld(mx, my);
    }

    /** 将缩放级别设为 targetZoom，并保持 (mx,my) 下的世界坐标不变 */
    zoomTowardCanvasPoint(mx, my, targetZoom) {
        const z0 = this.zoomLevel;
        const z1 = Math.max(this.minZoom, Math.min(this.maxZoom, targetZoom));
        if (z1 === z0) return;
        const wx = (mx - this.viewPanX) / z0;
        const wy = (my - this.viewPanY) / z0;
        this.viewPanX = mx - wx * z1;
        this.viewPanY = my - wy * z1;
        this.zoomLevel = z1;
    }

    handleMouseDown(e) {
        const { x, y } = this.eventToWorld(e);
        
        // 选择工具处理
        if (this.currentTool === 'select') {
            const clickedElement = this.enhanceLineSelection(x, y);
            if (clickedElement) {
                this.selectedElement = clickedElement;
                this.isDraggingElement = true;
                this.dragOffsetX = x;
                this.dragOffsetY = y;
                this.render();
            } else {
                this.selectedElement = null;
                this.render();
            }
            return;
        }
        
        // 如果是橡皮擦,检查是否点击了闭合图形
        if (this.currentTool === 'eraser') {
            const clickedElement = this.findElementAtPosition(x, y);
            if (clickedElement && (clickedElement.type === 'circle' || clickedElement.type === 'rect')) {
                // 删除整个闭合图形
                this.removeElement(clickedElement);
                this.saveHistory();
                this.render();
                return;
            }
        }
        
        // 首先检查是否点击了现有线条进行编辑(仅当前图层)
        const clickedLine = this.enhanceLineSelection(x, y);
        if (clickedLine && this.currentTool !== 'eraser') {
            this.selectedLine = clickedLine;
            this.editingLine = clickedLine;
            this.editMode = true;
            this.render();
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
        const { x, y } = this.eventToWorld(e);
        
        // 选择工具拖动元素
        if (this.currentTool === 'select' && this.isDraggingElement && this.selectedElement) {
            const dx = x - this.dragOffsetX;
            const dy = y - this.dragOffsetY;
            this.moveElement(this.selectedElement, dx, dy);
            this.dragOffsetX = x;
            this.dragOffsetY = y;
            this.render();
            return;
        }
        
        // 检测鼠标悬停在线条上(吸附提示)
        if (!this.isDrawing) {
            const hoveredLine = this.detectLineHover(x, y);
            if (hoveredLine !== this.hoveredLine) {
                this.hoveredLine = hoveredLine;
                this.render();
            }
        }
        
        // 如果是编辑模式，使用编辑模式的处理函数
        if (this.currentTool === 'edit') {
            this.handleEditModeMouseMove(e);
            return;
        }
        
        if (!this.isDrawing) return;
        
        if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            this.currentPath.points.push({x, y});
            this.render(); // 重新渲染整个画布
        } else if (this.currentTool === 'line') {
            this.currentShape.endX = x;
            this.currentShape.endY = y;
            this.render();
        } else if (this.currentTool === 'rect') {
            this.currentShape.width = x - this.currentShape.startX;
            this.currentShape.height = y - this.currentShape.startY;
            this.render();
        } else if (this.currentTool === 'circle') {
            const dx = x - this.currentShape.centerX;
            const dy = y - this.currentShape.centerY;
            this.currentShape.radius = Math.sqrt(dx * dx + dy * dy);
            this.render();
        }
        
        this.lastX = x;
        this.lastY = y;
    }
    
    handleMouseUp(e) {
        // 选择工具释放
        if (this.currentTool === 'select') {
            if (this.isDraggingElement) {
                this.isDraggingElement = false;
                this.saveHistory();
            }
            return;
        }
        
        // 如果是编辑模式，使用编辑模式的处理函数
        if (this.currentTool === 'edit') {
            this.handleEditModeMouseUp();
            return;
        }
        
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // 将绘制内容添加到当前图层
        const currentLayer = this.layers[this.currentLayerIndex];
        
        if (this.currentTool === 'brush') {
            currentLayer.elements.push({...this.currentPath});
        } else if (this.currentTool === 'eraser') {
            // 橡皮擦不记录痕迹,直接删除路径上的元素
            this.applyEraser(this.currentPath);
        } else if (this.currentShape) {
            currentLayer.elements.push({...this.currentShape});
        }
        
        this.saveHistory();
        this.render();
        this.updateLayerPreview();
        
        this.currentPath = null;
        this.currentShape = null;
    }
    
    drawPath(path, isHovered = false, isSelected = false) {
        const ctx = this.ctx;
        
        // 如果是选中或悬停状态,先绘制高亮效果
        if (isSelected || isHovered) {
            ctx.beginPath();
            ctx.strokeStyle = '#4a9eff';
            ctx.lineWidth = path.size + 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 0.3;
            
            if (path.points.length > 0) {
                ctx.moveTo(path.points[0].x, path.points[0].y);
                for (let i = 1; i < path.points.length; i++) {
                    ctx.lineTo(path.points[i].x, path.points[i].y);
                }
            }
            
            ctx.stroke();
            ctx.closePath();
            ctx.globalAlpha = 1;
        }
        
        ctx.beginPath();
        ctx.strokeStyle = path.type === 'eraser' ? '#ffffff' : path.color;
        ctx.lineWidth = isSelected ? path.size + 2 : path.size;
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
    
    drawShape(shape, isHovered = false, isSelected = false, isDrawing = false) {
        const ctx = this.ctx;
        
        // 如果是选中或悬停状态,先绘制高亮效果
        if (isSelected || isHovered) {
            ctx.beginPath();
            ctx.strokeStyle = '#4a9eff';
            ctx.lineWidth = shape.size + 4;
            ctx.globalAlpha = 0.3;
            
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
            ctx.globalAlpha = 1;
        }
        
        ctx.beginPath();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = isSelected ? shape.size + 2 : shape.size;
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
        
        // 绘制时显示尺寸信息
        if (isDrawing) {
            ctx.fillStyle = '#4a9eff';
            ctx.font = '12px Arial';
            ctx.globalAlpha = 0.8;
            
            if (shape.type === 'line') {
                const length = Math.sqrt(
                    Math.pow(shape.endX - shape.startX, 2) + 
                    Math.pow(shape.endY - shape.startY, 2)
                );
                const midX = (shape.startX + shape.endX) / 2;
                const midY = (shape.startY + shape.endY) / 2;
                ctx.fillText(`长度: ${length.toFixed(1)}`, midX + 10, midY - 10);
            } else if (shape.type === 'rect') {
                const width = Math.abs(shape.width);
                const height = Math.abs(shape.height);
                ctx.fillText(`宽: ${width.toFixed(1)}, 高: ${height.toFixed(1)}`, 
                    shape.startX + 10, shape.startY - 10);
            } else if (shape.type === 'circle') {
                ctx.fillText(`半径: ${shape.radius.toFixed(1)}`, 
                    shape.centerX + shape.radius + 10, shape.centerY);
            }
            
            ctx.globalAlpha = 1;
        }
    }

    // 计算叠加背景颜色
    calculateCompositeBackgroundColor() {
        // 从上到下遍历图层
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            if (!layer.visible) continue;

            if (layer.color && layer.color !== 'transparent') {
                return layer.color;
            }
        }
        return '#ffffff';
    }

    // 绘制棋盘格背景
    drawCheckerboard() {
        const size = 10;
        const w = this.canvas.width;
        const h = this.canvas.height;

        for (let x = 0; x < w; x += size) {
            for (let y = 0; y < h; y += size) {
                this.ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#ffffff' : '#cccccc';
                this.ctx.fillRect(x, y, size, size);
            }
        }
    }

    render() {
        // 计算叠加背景颜色
        const compositeColor = this.calculateCompositeBackgroundColor();

        // 清空画布并填充背景颜色
        if (compositeColor === 'transparent') {
            // 透明背景 - 绘制棋盘格
            this.drawCheckerboard();
        } else {
            this.ctx.fillStyle = compositeColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 视口：平移 + 缩放（与 eventToWorld 互逆）
        this.ctx.save();
        this.ctx.translate(this.viewPanX, this.viewPanY);
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
        
        // 渲染所有图层
        this.layers.forEach(layer => {
            if (!layer.visible) return;
            
            layer.elements.forEach(element => {
                // 检查是否是悬停或选中的线条
                const isHovered = element === this.hoveredLine;
                const isSelected = element === this.selectedLine;
                
                if (element.type === 'brush' || element.type === 'eraser') {
                    this.drawPath(element, isHovered, isSelected);
                } else if (element.type === 'line' || element.type === 'rect' || element.type === 'circle') {
                    this.drawShape(element, isHovered, isSelected);
                }
            });
        });
        
        // 绘制当前正在绘制的形状
        if (this.isDrawing) {
            if (this.currentPath && (this.currentTool === 'brush' || this.currentTool === 'eraser')) {
                this.drawPath(this.currentPath);
            } else if (this.currentShape) {
                this.drawShape(this.currentShape, false, false, true); // isDrawing = true
                
                // 如果正在绘制圆形,显示圆心
                if (this.currentTool === 'circle' && this.currentShape.centerX !== undefined) {
                    this.drawCircleCenter(this.currentShape.centerX, this.currentShape.centerY);
                }
            }
        }

        // 选择工具拖动圆形时持续显示圆心
        if (this.currentTool === 'select' && this.isDraggingElement && this.selectedElement && this.selectedElement.type === 'circle') {
            this.drawCircleCenter(this.selectedElement.centerX, this.selectedElement.centerY);
        }

        if (this.editMode && this.editingLine && this.editingLine.points) {
            this.drawEditingControls();
        }

        this.drawGridWorld();

        this.ctx.restore();

        // 更新标尺
        this.updateRulers();
    }
    
    addLayer(name = null) {
        // 检查是否达到最大图层数
        if (this.layers.length >= this.maxLayers) {
            alert(`已达到最大图层数限制(${this.maxLayers}层)`);
            return false;
        }
        
        const layerName = name || `图层${this.layers.length + 1}`;
        const layer = {
            id: Date.now(),
            name: layerName,
            visible: true,
            locked: false,
            elements: [],
            color: '#ffffff' // 新建图层默认白色
        };
        
        this.layers.push(layer);
        this.currentLayerIndex = this.layers.length - 1;
        this.updateLayerList();
        this.saveHistory();
    }
    
    deleteLayer() {
        // 保护背景图层(第一个图层)
        if (this.currentLayerIndex === 0) {
            alert('背景图层不允许删除');
            return;
        }
        
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
        
        const { mx, my } = this.clientDeltaFromEvent(e);
        const { x, y } = this.canvasPointToWorld(mx, my);
        
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
    
    // 改进的线条选择功能 - 点击任意点选择元素(仅当前图层,支持所有元素类型)
    enhanceLineSelection(x, y) {
        // 查找点击位置附近的元素
        const threshold = this.snapThreshold;
        let selectedElement = null;
        let minDistance = threshold;
        
        // 只检查当前图层
        const layer = this.layers[this.currentLayerIndex];
        if (!layer || !layer.visible) return null;
        
        for (const element of layer.elements) {
            let distance = threshold;
            
            // 处理画笔/橡皮擦绘制的线条
            if ((element.type === 'brush' || element.type === 'eraser') && element.points.length > 1) {
                for (const point of element.points) {
                    const d = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                    if (d < minDistance) {
                        minDistance = d;
                        selectedElement = element;
                    }
                }
            }
            // 处理直线
            else if (element.type === 'line') {
                const d = this.pointToLineDistance(x, y, element.startX, element.startY, element.endX, element.endY);
                if (d < minDistance) {
                    minDistance = d;
                    selectedElement = element;
                }
            }
            // 处理矩形
            else if (element.type === 'rect') {
                const d = this.pointToRectDistance(x, y, element);
                if (d < minDistance) {
                    minDistance = d;
                    selectedElement = element;
                }
            }
            // 处理圆形
            else if (element.type === 'circle') {
                const d = Math.abs(Math.sqrt(Math.pow(x - element.centerX, 2) + Math.pow(y - element.centerY, 2)) - element.radius);
                if (d < minDistance) {
                    minDistance = d;
                    selectedElement = element;
                }
            }
        }
        
        return selectedElement;
    }
    
    // 计算点到线段的距离
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        return Math.sqrt(Math.pow(px - xx, 2) + Math.pow(py - yy, 2));
    }
    
    // 计算点到矩形的距离
    pointToRectDistance(px, py, rect) {
        const x = rect.startX;
        const y = rect.startY;
        const w = rect.width;
        const h = rect.height;
        
        // 找到矩形四条边
        const left = Math.min(x, x + w);
        const right = Math.max(x, x + w);
        const top = Math.min(y, y + h);
        const bottom = Math.max(y, y + h);
        
        // 如果点在矩形内部,返回0
        if (px >= left && px <= right && py >= top && py <= bottom) {
            return 0;
        }
        
        // 计算到四条边的最小距离
        const d1 = this.pointToLineDistance(px, py, left, top, right, top);
        const d2 = this.pointToLineDistance(px, py, right, top, right, bottom);
        const d3 = this.pointToLineDistance(px, py, right, bottom, left, bottom);
        const d4 = this.pointToLineDistance(px, py, left, bottom, left, top);
        
        return Math.min(d1, d2, d3, d4);
    }
    
    // 检测鼠标悬停在线条上
    detectLineHover(x, y) {
        return this.enhanceLineSelection(x, y);
    }
    
    showEditingControls() {
        this.render();
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
    
    // 缩放功能方法
    zoomIn() {
        if (this.zoomLevel >= this.maxZoom) return;
        const mx = this.canvas.width / 2;
        const my = this.canvas.height / 2;
        this.zoomTowardCanvasPoint(mx, my, this.zoomLevel + this.zoomStep);
        this.updateZoomDisplay();
        this.render();
    }
    
    zoomOut() {
        if (this.zoomLevel <= this.minZoom) return;
        const mx = this.canvas.width / 2;
        const my = this.canvas.height / 2;
        this.zoomTowardCanvasPoint(mx, my, this.zoomLevel - this.zoomStep);
        this.updateZoomDisplay();
        this.render();
    }
    
    zoomReset() {
        this.zoomLevel = 1;
        this.viewPanX = 0;
        this.viewPanY = 0;
        this.updateZoomDisplay();
        this.render();
    }
    
    updateZoomDisplay() {
        const zoomPercent = Math.round(this.zoomLevel * 100);
        document.getElementById('zoomLevel').textContent = `${zoomPercent}%`;
    }
    
    // 查找指定位置的元素(仅当前图层)
    findElementAtPosition(x, y) {
        const layer = this.layers[this.currentLayerIndex];
        if (!layer || !layer.visible) return null;
        
        const threshold = this.snapThreshold;
        
        for (let i = layer.elements.length - 1; i >= 0; i--) {
            const element = layer.elements[i];
            
            // 检查圆形
            if (element.type === 'circle') {
                const d = Math.sqrt(Math.pow(x - element.centerX, 2) + Math.pow(y - element.centerY, 2));
                if (Math.abs(d - element.radius) < threshold) {
                    return element;
                }
            }
            // 检查矩形
            else if (element.type === 'rect') {
                const d = this.pointToRectDistance(x, y, element);
                if (d < threshold) {
                    return element;
                }
            }
        }
        
        return null;
    }
    
    // 删除元素
    removeElement(element) {
        const layer = this.layers[this.currentLayerIndex];
        if (!layer) return;
        
        const index = layer.elements.indexOf(element);
        if (index > -1) {
            layer.elements.splice(index, 1);
        }
    }
    
    // 删除选中的元素
    deleteSelectedElement() {
        if (!this.selectedElement) return;
        
        this.removeElement(this.selectedElement);
        this.selectedElement = null;
        this.saveHistory();
        this.render();
    }
    
    // 移动元素
    moveElement(element, dx, dy) {
        if (element.type === 'brush' || element.type === 'eraser') {
            // 移动所有点
            element.points.forEach(point => {
                point.x += dx;
                point.y += dy;
            });
        } else if (element.type === 'line') {
            element.startX += dx;
            element.startY += dy;
            element.endX += dx;
            element.endY += dy;
        } else if (element.type === 'rect') {
            element.startX += dx;
            element.startY += dy;
        } else if (element.type === 'circle') {
            element.centerX += dx;
            element.centerY += dy;
        }
    }
    
    // 应用橡皮擦(删除路径上的元素)
    applyEraser(eraserPath) {
        if (!eraserPath || !eraserPath.points || eraserPath.points.length < 1) return;

        const layer = this.layers[this.currentLayerIndex];
        if (!layer) return;

        const eraserSize = eraserPath.size;
        const halfSize = eraserSize / 2;  // 使用半径进行检测
        const elementsToRemove = [];

        // 检查橡皮擦路径是否与元素相交
        layer.elements.forEach(element => {
            let shouldRemove = false;

            if (element.type === 'brush' || element.type === 'eraser') {
                // 检查线条点是否在橡皮擦路径上
                for (const eraserPoint of eraserPath.points) {
                    for (const elementPoint of element.points) {
                        const distance = Math.sqrt(
                            Math.pow(eraserPoint.x - elementPoint.x, 2) +
                            Math.pow(eraserPoint.y - elementPoint.y, 2)
                        );
                        // 修复：使用halfSize而非eraserSize
                        if (distance <= halfSize) {
                            shouldRemove = true;
                            break;
                        }
                    }
                    if (shouldRemove) break;
                }
            } else if (element.type === 'line') {
                // 检查直线是否与橡皮擦路径相交
                for (const eraserPoint of eraserPath.points) {
                    const d = this.pointToLineDistance(
                        eraserPoint.x, eraserPoint.y,
                        element.startX, element.startY,
                        element.endX, element.endY
                    );
                    if (d <= halfSize) {
                        shouldRemove = true;
                        break;
                    }
                }
            } else if (element.type === 'circle' || element.type === 'rect') {
                // 闭合图形：检查擦除路径是否与图形相交
                shouldRemove = this.isShapeIntersectEraser(element, eraserPath, halfSize);
            }

            if (shouldRemove) {
                elementsToRemove.push(element);
            }
        });

        // 删除相交的元素
        elementsToRemove.forEach(element => {
            const index = layer.elements.indexOf(element);
            if (index > -1) {
                layer.elements.splice(index, 1);
            }
        });
    }

    // 检查闭合图形是否与擦除路径相交
    isShapeIntersectEraser(shape, eraserPath, halfSize) {
        for (const eraserPoint of eraserPath.points) {
            if (shape.type === 'circle') {
                const distance = Math.sqrt(
                    Math.pow(eraserPoint.x - shape.centerX, 2) +
                    Math.pow(eraserPoint.y - shape.centerY, 2)
                );
                // 检查是否在圆的边界附近或内部
                if (Math.abs(distance - shape.radius) <= halfSize || distance <= shape.radius) {
                    return true;
                }
            } else if (shape.type === 'rect') {
                // 检查是否在矩形边界附近或内部
                const { startX, startY, width, height } = shape;
                const x1 = Math.min(startX, startX + width);
                const x2 = Math.max(startX, startX + width);
                const y1 = Math.min(startY, startY + height);
                const y2 = Math.max(startY, startY + height);

                // 检查点是否在矩形内部或边界附近
                if (eraserPoint.x >= x1 - halfSize && eraserPoint.x <= x2 + halfSize &&
                    eraserPoint.y >= y1 - halfSize && eraserPoint.y <= y2 + halfSize) {
                    return true;
                }
            }
        }
        return false;
    }

    // 切换网格显示
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.render();
    }
    
    // 设置网格大小
    setGridSize(size) {
        this.gridSize = Math.max(this.minGridSize, parseInt(size));
        this.render();
    }
    
    // 在世界坐标系绘制网格（与平移/缩放后的内容对齐）
    drawGridWorld() {
        if (!this.showGrid) return;
        
        const ctx = this.ctx;
        const z = this.zoomLevel;
        const px0 = this.viewPanX;
        const py0 = this.viewPanY;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const minWx = -px0 / z;
        const maxWx = (w - px0) / z;
        const minWy = -py0 / z;
        const maxWy = (h - py0) / z;
        const gs = Math.max(this.minGridSize, this.gridSize);
        
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = Math.max(0.5 / z, 0.25);
        ctx.globalAlpha = 0.5;
        
        const startX = Math.floor(minWx / gs) * gs;
        const startY = Math.floor(minWy / gs) * gs;
        
        for (let gx = startX; gx <= maxWx + 1e-6; gx += gs) {
            ctx.beginPath();
            ctx.moveTo(gx, minWy);
            ctx.lineTo(gx, maxWy);
            ctx.stroke();
        }
        for (let gy = startY; gy <= maxWy + 1e-6; gy += gs) {
            ctx.beginPath();
            ctx.moveTo(minWx, gy);
            ctx.lineTo(maxWx, gy);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
    
    // 设置图层颜色
    setLayerColor(color) {
        const layer = this.layers[this.currentLayerIndex];
        if (layer) {
            layer.color = color;
            this.render();
            this.saveHistory();
            this.updateLayerPreviews();
        }
    }

    // 初始化标尺
    initRulers() {
        this.rulerXCanvas = document.getElementById('rulerXCanvas');
        this.rulerYCanvas = document.getElementById('rulerYCanvas');

        if (this.rulerXCanvas) {
            this.rulerXCtx = this.rulerXCanvas.getContext('2d');
        }
        if (this.rulerYCanvas) {
            this.rulerYCtx = this.rulerYCanvas.getContext('2d');
        }

        this.updateRulerSize();
        this.renderRulers();
    }

    // 更新标尺尺寸
    updateRulerSize() {
        if (this.rulerXCanvas) {
            this.rulerXCanvas.width = this.canvas.width;
            this.rulerXCanvas.height = this.rulerSize;
        }
        if (this.rulerYCanvas) {
            this.rulerYCanvas.width = this.rulerSize;
            this.rulerYCanvas.height = this.canvas.height;
        }
    }

    // 渲染标尺
    renderRulers() {
        if (!this.showRuler) return;

        this.renderXRuler();
        this.renderYRuler();
    }

    // 渲染X轴标尺
    renderXRuler() {
        if (!this.rulerXCtx) return;

        const ctx = this.rulerXCtx;
        const w = this.rulerXCanvas.width;
        const h = this.rulerXCanvas.height;
        const z = this.zoomLevel;
        const px = this.viewPanX;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, w, h);

        // 计算刻度间隔
        let majorInterval = 50;
        let minorInterval = 10;
        if (z < 0.5) { majorInterval = 100; minorInterval = 20; }
        else if (z > 2) { majorInterval = 20; minorInterval = 5; }

        const startWorld = -px / z;
        const endWorld = (w - px) / z;

        ctx.strokeStyle = '#999';
        ctx.lineWidth = 0.5;
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#333';

        // 绘制刻度
        const startX = Math.floor(startWorld / minorInterval) * minorInterval;
        for (let x = startX; x <= endWorld; x += minorInterval) {
            const screenX = x * z + px;
            const isMajor = x % majorInterval === 0;

            ctx.beginPath();
            ctx.moveTo(screenX, isMajor ? 0 : h * 0.6);
            ctx.lineTo(screenX, h);
            ctx.stroke();

            if (isMajor && Math.abs(x) >= 0.001) {
                ctx.fillText(Math.round(x), screenX + 2, h - 3);
            }
        }
    }

    // 渲染Y轴标尺
    renderYRuler() {
        if (!this.rulerYCtx) return;

        const ctx = this.rulerYCtx;
        const w = this.rulerYCanvas.width;
        const h = this.rulerYCanvas.height;
        const z = this.zoomLevel;
        const py = this.viewPanY;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, w, h);

        // 计算刻度间隔
        let majorInterval = 50;
        let minorInterval = 10;
        if (z < 0.5) { majorInterval = 100; minorInterval = 20; }
        else if (z > 2) { majorInterval = 20; minorInterval = 5; }

        const startWorld = -py / z;
        const endWorld = (h - py) / z;

        ctx.strokeStyle = '#999';
        ctx.lineWidth = 0.5;
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#333';

        // 绘制刻度
        const startY = Math.floor(startWorld / minorInterval) * minorInterval;
        for (let y = startY; y <= endWorld; y += minorInterval) {
            const screenY = y * z + py;
            const isMajor = y % majorInterval === 0;

            ctx.beginPath();
            ctx.moveTo(isMajor ? 0 : w * 0.6, screenY);
            ctx.lineTo(w, screenY);
            ctx.stroke();

            if (isMajor && Math.abs(y) >= 0.001) {
                ctx.save();
                ctx.translate(w - 3, screenY + 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(Math.round(y), 0, 0);
                ctx.restore();
            }
        }
    }

    // 更新标尺
    updateRulers() {
        this.renderRulers();
    }

    // 切换标尺显示
    toggleRuler() {
        this.showRuler = !this.showRuler;
        document.getElementById('rulerX').style.display = this.showRuler ? 'block' : 'none';
        document.getElementById('rulerY').style.display = this.showRuler ? 'block' : 'none';
        this.render();
    }

    // 导出PNG
    exportPNG() {
        const dataUrl = this.generateExportDataURL('image/png');
        this.downloadImage(dataUrl, this.generateExportFileName('png'));
    }

    // 导出JPG
    exportJPG() {
        const dataUrl = this.generateExportDataURL('image/jpeg', 0.92);
        this.downloadImage(dataUrl, this.generateExportFileName('jpg'));
    }

    // 生成导出数据URL
    generateExportDataURL(mimeType, quality = 0.92) {
        // 创建临时canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // 对于JPG，先填充白色背景
        if (mimeType === 'image/jpeg') {
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        // 渲染所有可见图层
        this.layers.forEach(layer => {
            if (!layer.visible) return;

            // 渲染图层背景
            if (layer.color && layer.color !== 'transparent') {
                tempCtx.fillStyle = layer.color;
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            }

            // 渲染图层元素
            layer.elements.forEach(element => {
                this.renderElementToContext(tempCtx, element);
            });
        });

        return tempCanvas.toDataURL(mimeType, quality);
    }

    // 渲染元素到上下文
    renderElementToContext(ctx, element) {
        ctx.strokeStyle = element.color;
        ctx.lineWidth = element.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (element.type === 'brush' || element.type === 'eraser') {
            ctx.beginPath();
            if (element.points.length > 0) {
                ctx.moveTo(element.points[0].x, element.points[0].y);
                for (let i = 1; i < element.points.length; i++) {
                    ctx.lineTo(element.points[i].x, element.points[i].y);
                }
            }
            ctx.stroke();
        } else if (element.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(element.startX, element.startY);
            ctx.lineTo(element.endX, element.endY);
            ctx.stroke();
        } else if (element.type === 'rect') {
            ctx.strokeRect(element.startX, element.startY, element.width, element.height);
        } else if (element.type === 'circle') {
            ctx.beginPath();
            ctx.arc(element.centerX, element.centerY, element.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // 生成导出文件名
    generateExportFileName(extension) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `MagicBrush_${year}${month}${day}_${hours}${minutes}${seconds}.${extension}`;
    }

    // 下载图片
    downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // 绘制圆心标记
    drawCircleCenter(x, y) {
        this.ctx.save();
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
}

// 初始化应用
const app = new MagicBrushApp();
