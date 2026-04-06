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
        this.minZoom = 0.5; // 最小缩放 50%
        this.maxZoom = 3; // 最大缩放 300%
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

        // 虚框选择相关属性
        this.isSelecting = false; // 是否正在选择
        this.selectionStartX = 0; // 选择框起始X
        this.selectionStartY = 0; // 选择框起始Y
        this.selectionEndX = 0; // 选择框结束X
        this.selectionEndY = 0; // 选择框结束Y
        this.selectedElements = []; // 选中的多个元素

        // 右键批量移动相关属性
        this.isRightDragging = false; // 是否正在右键拖动
        this.rightDragStartX = 0; // 右键拖动起始X
        this.rightDragStartY = 0; // 右键拖动起始Y

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
        this.mouseX = 0; // 鼠标在画布上的X坐标
        this.mouseY = 0; // 鼠标在画布上的Y坐标

        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.initRulers();
        this.addLayer('背景图层');
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

        // 设置初始鼠标位置为画布中心
        this.mouseX = width / 2;
        this.mouseY = height / 2;

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
        this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));

        
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

        // 选择工具处理 - 开始虚框选择
        if (this.currentTool === 'select') {
            // 检查是否点击了现有元素
            const clickedElement = this.enhanceLineSelection(x, y);
            if (clickedElement) {
                this.selectedElement = clickedElement;
                this.isDraggingElement = true;
                this.dragOffsetX = x;
                this.dragOffsetY = y;
                this.setCursorStyle('grab'); // 设置光标为小手
                this.render();
                return;
            }

            this.isSelecting = true;
            this.selectionStartX = x;
            this.selectionStartY = y;
            this.selectionEndX = x;
            this.selectionEndY = y;
            this.selectedElements = [];
            this.render();
            return;
        }
        
        // 如果是橡皮擦,检查是否点击了闭合图形
        if (this.currentTool === 'eraser') {
            const clickedElement = this.findElementAtPosition(x, y);
            if (clickedElement && (clickedElement.type === 'circle' || clickedElement.type === 'rect' ||
                clickedElement.type === 'ellipse' || clickedElement.type === 'star')) {
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
                centerX: x,
                centerY: y,
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
        } else if (this.currentTool === 'ellipse') {
            this.currentShape = {
                type: 'ellipse',
                color: this.currentColor,
                size: this.brushSize,
                centerX: x,
                centerY: y,
                radiusX: 0,
                radiusY: 0,
                fill: false
            };
        } else if (this.currentTool === 'star') {
            this.currentShape = {
                type: 'star',
                color: this.currentColor,
                size: this.brushSize,
                centerX: x,
                centerY: y,
                outerRadius: 0,
                innerRadius: 0,
                points: 5,
                fill: false
            };
        }
    }
    
    handleMouseMove(e) {
        const { x, y } = this.eventToWorld(e);

        // 更新鼠标位置（用于标尺滑块和正交虚线）
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        // 立即更新标尺和正交虚线
        this.updateRulers();

        // 选择工具 - 更新虚框选择
        if (this.currentTool === 'select' && this.isSelecting) {
            this.selectionEndX = x;
            this.selectionEndY = y;
            this.render();
            return;
        }

        // 选择工具拖动元素
        if (this.currentTool === 'select' && this.isDraggingElement && this.selectedElement) {
            this.canvas.style.cursor = 'grabbing'; // 改变鼠标为抓取形状
            const dx = x - this.dragOffsetX;
            const dy = y - this.dragOffsetY;
            this.moveElement(this.selectedElement, dx, dy);
            this.dragOffsetX = x;
            this.dragOffsetY = y;
            this.render();
            return;
        }

        // 右键批量移动选中的元素
        if (this.currentTool === 'select' && this.isRightDragging) {
            const dx = x - this.rightDragStartX;
            const dy = y - this.rightDragStartY;

            // 移动所有选中的元素
            if (this.selectedElements.length > 0) {
                this.selectedElements.forEach(element => {
                    this.moveElement(element, dx, dy);
                });
            } else if (this.selectedElement) {
                this.moveElement(this.selectedElement, dx, dy);
            }

            // 更新起始位置
            this.rightDragStartX = x;
            this.rightDragStartY = y;
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
            this.currentShape.centerX = this.currentShape.startX + this.currentShape.width / 2;
            this.currentShape.centerY = this.currentShape.startY + this.currentShape.height / 2;
            this.render();
        } else if (this.currentTool === 'circle') {
            const dx = x - this.currentShape.centerX;
            const dy = y - this.currentShape.centerY;
            this.currentShape.radius = Math.sqrt(dx * dx + dy * dy);
            this.render();
        } else if (this.currentTool === 'ellipse') {
            const dx = x - this.currentShape.centerX;
            const dy = y - this.currentShape.centerY;
            this.currentShape.radiusX = Math.abs(dx);
            this.currentShape.radiusY = Math.abs(dy);
            this.render();
        } else if (this.currentTool === 'star') {
            const dx = x - this.currentShape.centerX;
            const dy = y - this.currentShape.centerY;
            this.currentShape.outerRadius = Math.sqrt(dx * dx + dy * dy);
            this.currentShape.innerRadius = this.currentShape.outerRadius * 0.4;
            this.render();
        }

        this.lastX = x;
        this.lastY = y;
    }
    
    handleContextMenu(e) {
        e.preventDefault(); // 阻止默认的右键菜单

        // 只有选择工具模式和有选中元素时才启用右键批量移动
        if (this.currentTool !== 'select') {
            return;
        }

        if (this.selectedElements.length > 0 || this.selectedElement) {
            // 开始右键拖动
            this.isRightDragging = true;
            const { x, y } = this.eventToWorld(e);
            this.rightDragStartX = x;
            this.rightDragStartY = y;
            this.setCursorStyle('grab'); // 显示抓取光标
        }
    }

    handleMouseUp(e) {
        // 选择工具释放 - 完成虚框选择
        if (this.currentTool === 'select') {
            if (this.isSelecting) {
                this.isSelecting = false;
                this.selectElementsInBox();
                this.render();
            }
            if (this.isDraggingElement) {
                this.isDraggingElement = false;
                this.setCursorStyle('default'); // 恢复默认鼠标
                this.saveHistory();
            }
            if (this.isRightDragging) {
                this.isRightDragging = false;
                this.setCursorStyle('default'); // 恢复默认鼠标
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
            } else if (shape.type === 'ellipse') {
                ctx.ellipse(shape.centerX, shape.centerY, shape.radiusX, shape.radiusY, 0, 0, Math.PI * 2);
            } else if (shape.type === 'star') {
                this.drawStarPath(ctx, shape);
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
        } else if (shape.type === 'ellipse') {
            ctx.ellipse(shape.centerX, shape.centerY, shape.radiusX, shape.radiusY, 0, 0, Math.PI * 2);
        } else if (shape.type === 'star') {
            this.drawStarPath(ctx, shape);
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

    // 绘制五角星路径
    drawStarPath(ctx, star) {
        const { centerX, centerY, outerRadius, innerRadius, points } = star;
        const step = Math.PI / points;

        ctx.moveTo(
            centerX + outerRadius * Math.cos(-Math.PI / 2),
            centerY + outerRadius * Math.sin(-Math.PI / 2)
        );

        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step - Math.PI / 2;
            ctx.lineTo(
                centerX + radius * Math.cos(angle),
                centerY + radius * Math.sin(angle)
            );
        }

        ctx.closePath();
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
                } else if (element.type === 'line' || element.type === 'rect' || element.type === 'circle' || element.type === 'ellipse' || element.type === 'star') {
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

                // 如果正在绘制闭合图形,显示中心点
                if ((this.currentTool === 'circle' || this.currentTool === 'ellipse' || this.currentTool === 'star') && this.currentShape.centerX !== undefined) {
                    this.drawCircleCenter(this.currentShape.centerX, this.currentShape.centerY);
                }
            }
        }

        // 选择工具拖动闭合图形时持续显示中心点
        if (this.currentTool === 'select' && this.isDraggingElement && this.selectedElement) {
            const type = this.selectedElement.type;
            if (type === 'circle' || type === 'ellipse' || type === 'star' || type === 'rect') {
                this.drawCircleCenter(this.selectedElement.centerX, this.selectedElement.centerY);
            }
        }

        // 显示选中元素的中心点
        if (this.selectedElements.length > 0) {
            this.selectedElements.forEach(element => {
                this.renderSelectionMarker(this.ctx, element);
            });
        }

        // 显示当前选中单个元素的标记点
        if (this.selectedElement) {
            this.renderSelectionMarker(this.ctx, this.selectedElement);
        }

        // 绘制选择框
        if (this.isSelecting) {
            this.drawSelectionBox();
        }

        if (this.editMode && this.editingLine && this.editingLine.points) {
            this.drawEditingControls();
        }

        this.drawGridWorld();

        // 绘制画布中心原点标记
        this.drawCanvasOrigin();

        // 绘制鼠标位置的正交虚线
        this.drawMouseCrosshair();

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
            color: this.layers.length === 0 ? '#ffffff' : 'transparent' // 背景图层白色，其他图层透明
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
        // 背景图层(第一个图层)不允许上移
        if (this.currentLayerIndex === 0) {
            alert('背景图层不允许上移');
            return;
        }
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
        // 不能将其他图层移到背景图层位置
        if (this.currentLayerIndex <= 1) return;
        
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

            // 显示图层颜色
            const colorDisplay = layer.color === 'transparent' ? '透明' : layer.color;
            const colorStyle = layer.color === 'transparent'
                ? 'background: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%); background-size: 10px 10px; background-position: 0 0, 5px 5px;'
                : `background-color: ${layer.color};`;

            layerItem.innerHTML = `
                <div class="layer-preview">
                    <canvas id="layerPreview${layer.id}" width="40" height="40"></canvas>
                </div>
                <div class="layer-info">
                    <div class="layer-name" data-layer-index="${i}" title="点击选择${i === 0 ? '' : '，双击重命名'}">${layer.name}</div>
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

            // 添加双击重命名功能（背景图层除外）
            if (i !== 0) {
                const layerName = layerItem.querySelector('.layer-name');
                layerName.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    this.editLayerName(i);
                });
            }

            layerList.appendChild(layerItem);
        }

        this.updateLayerPreviews();
    }
    
    updateLayerPreviews() {
        this.layers.forEach(layer => {
            const previewCanvas = document.getElementById(`layerPreview${layer.id}`);
            if (!previewCanvas) return;

            const previewCtx = previewCanvas.getContext('2d');

            // 绘制图层颜色背景
            if (layer.color === 'transparent') {
                // 透明背景 - 绘制棋盘格
                const gridSize = 5;
                for (let x = 0; x < 40; x += gridSize) {
                    for (let y = 0; y < 40; y += gridSize) {
                        previewCtx.fillStyle = ((x / gridSize + y / gridSize) % 2 === 0) ? '#ffffff' : '#cccccc';
                        previewCtx.fillRect(x, y, gridSize, gridSize);
                    }
                }
            } else {
                previewCtx.fillStyle = layer.color;
                previewCtx.fillRect(0, 0, 40, 40);
            }

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
        const points = this.editingLine.points;

        // 只显示3个控制点：首、中、尾
        const controlPoints = [
            points[0], // 首点
            points[Math.floor(points.length / 2)], // 中间点
            points[points.length - 1] // 尾点
        ];

        // 绘制控制点
        controlPoints.forEach((point, index) => {
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

        // 只检查3个控制点：首、中、尾
        const points = this.editingLine.points;
        const controlPointIndices = [
            0, // 首点
            Math.floor(points.length / 2), // 中间点
            points.length - 1 // 尾点
        ];

        // 检查是否悬停在控制点上
        let hoveredPointIndex = -1;

        for (const index of controlPointIndices) {
            const point = points[index];
            const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));

            if (distance < 10) {
                hoveredPointIndex = index;
                break;
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
    
    // 计算点到椭圆的距离
    pointToEllipseDistance(px, py, ellipse) {
        const { centerX, centerY, radiusX, radiusY } = ellipse;

        // 将点转换到椭圆的局部坐标系
        const dx = px - centerX;
        const dy = py - centerY;

        // 标准化坐标
        const normalizedX = dx / radiusX;
        const normalizedY = dy / radiusY;

        // 计算点到椭圆中心的距离（在标准化坐标系中）
        const distanceFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

        // 如果点在椭圆内部，返回0
        if (distanceFromCenter <= 1) {
            return 0;
        }

        // 使用牛顿迭代法找到椭圆上最近的点
        let t = Math.atan2(dy * radiusX, dx * radiusY);
        let iterations = 0;
        const maxIterations = 10;

        while (iterations < maxIterations) {
            const cosT = Math.cos(t);
            const sinT = Math.sin(t);

            // 椭圆上的点
            const ellipseX = centerX + radiusX * cosT;
            const ellipseY = centerY + radiusY * sinT;

            // 椭圆在t处的切向量
            const tangentX = -radiusX * sinT;
            const tangentY = radiusY * cosT;

            // 从椭圆上的点到目标点的向量
            const toPointX = px - ellipseX;
            const toPointY = py - ellipseY;

            // 计算距离函数的导数
            const derivative = tangentX * toPointX + tangentY * toPointY;

            // 如果导数接近0，说明找到了最近点
            if (Math.abs(derivative) < 0.001) {
                break;
            }

            // 更新t
            const step = derivative / (radiusX * radiusX * sinT * sinT + radiusY * radiusY * cosT * cosT);
            t -= step;
            iterations++;
        }

        // 计算最近点的坐标
        const closestX = centerX + radiusX * Math.cos(t);
        const closestY = centerY + radiusY * Math.sin(t);

        // 返回距离
        return Math.sqrt(Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2));
    }

    // 计算点到五角星的距离
    pointToStarDistance(px, py, star) {
        const { centerX, centerY, outerRadius, innerRadius, points } = star;
        const step = Math.PI / points;

        // 计算五角星的所有顶点
        const vertices = [];
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step - Math.PI / 2;
            vertices.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }

        // 计算点到每条边的最小距离
        let minDistance = Infinity;
        for (let i = 0; i < vertices.length; i++) {
            const nextIndex = (i + 1) % vertices.length;
            const v1 = vertices[i];
            const v2 = vertices[nextIndex];
            const distance = this.pointToLineDistance(px, py, v1.x, v1.y, v2.x, v2.y);
            if (distance < minDistance) {
                minDistance = distance;
            }
        }

        return minDistance;
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
            // 处理椭圆
            else if (element.type === 'ellipse') {
                const d = this.pointToEllipseDistance(x, y, element);
                if (d < minDistance) {
                    minDistance = d;
                    selectedElement = element;
                }
            }
            // 处理五角星
            else if (element.type === 'star') {
                const d = this.pointToStarDistance(x, y, element);
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
            // 检查椭圆
            else if (element.type === 'ellipse') {
                const d = this.pointToEllipseDistance(x, y, element);
                if (d < threshold) {
                    return element;
                }
            }
            // 检查五角星
            else if (element.type === 'star') {
                const d = this.pointToStarDistance(x, y, element);
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
            element.centerX += dx;
            element.centerY += dy;
        } else if (element.type === 'circle') {
            element.centerX += dx;
            element.centerY += dy;
        } else if (element.type === 'ellipse') {
            element.centerX += dx;
            element.centerY += dy;
        } else if (element.type === 'star') {
            element.centerX += dx;
            element.centerY += dy;
        }
    }

    // 设置光标样式
    setCursorStyle(cursorStyle) {
        if (this.canvas) {
            const validStyles = ['grab', 'default', 'move', 'pointer'];
            if (validStyles.includes(cursorStyle)) {
                this.canvas.style.cursor = cursorStyle;
            }
        }
    }

    // 计算线条元素的中点
    calculateLineMidpoint(line) {
        if (line.type === 'line') {
            return {
                x: (line.startX + line.endX) / 2,
                y: (line.startY + line.endY) / 2
            };
        } else if (line.type === 'brush' || line.type === 'eraser') {
            if (line.points && line.points.length > 0) {
                let sumX = 0;
                let sumY = 0;
                line.points.forEach(point => {
                    sumX += point.x;
                    sumY += point.y;
                });
                return {
                    x: sumX / line.points.length,
                    y: sumY / line.points.length
                };
            }
        }
        return { x: 0, y: 0 };
    }

    // 获取闭合图形的中心点
    getShapeCenter(shape) {
        if (shape.type === 'circle' || shape.type === 'ellipse' || shape.type === 'star' || shape.type === 'rect') {
            return {
                x: shape.centerX,
                y: shape.centerY
            };
        }
        return { x: 0, y: 0 };
    }

    // 渲染选中元素的标记点
    renderSelectionMarker(ctx, element) {
        if (!element) return;

        let markerX, markerY;

        // 判断元素类型并计算标记点位置
        if (element.type === 'line' || element.type === 'brush' || element.type === 'eraser') {
            const midpoint = this.calculateLineMidpoint(element);
            markerX = midpoint.x;
            markerY = midpoint.y;
        } else if (element.type === 'circle' || element.type === 'ellipse' || element.type === 'star' || element.type === 'rect') {
            const center = this.getShapeCenter(element);
            markerX = center.x;
            markerY = center.y;
        } else {
            return;
        }

        // 绘制红色圆形标记
        ctx.save();
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(markerX, markerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // 绘制白色边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
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
            } else if (element.type === 'circle' || element.type === 'rect' || element.type === 'ellipse' || element.type === 'star') {
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
            } else if (shape.type === 'ellipse') {
                // 检查椭圆是否与橡皮擦相交
                const distance = this.pointToEllipseDistance(eraserPoint.x, eraserPoint.y, shape);
                if (distance <= halfSize) {
                    return true;
                }
            } else if (shape.type === 'star') {
                // 检查五角星是否与橡皮擦相交
                const distance = this.pointToStarDistance(eraserPoint.x, eraserPoint.y, shape);
                if (distance <= halfSize) {
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

    // 绘制选择框
    drawSelectionBox() {
        const ctx = this.ctx;
        ctx.save();

        const x = Math.min(this.selectionStartX, this.selectionEndX);
        const y = Math.min(this.selectionStartY, this.selectionEndY);
        const width = Math.abs(this.selectionEndX - this.selectionStartX);
        const height = Math.abs(this.selectionEndY - this.selectionStartY);

        // 绘制虚线边框
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);

        // 绘制半透明填充
        ctx.fillStyle = 'rgba(74, 158, 255, 0.1)';
        ctx.fillRect(x, y, width, height);

        ctx.restore();
    }

    // 选择框内的元素
    selectElementsInBox() {
        const layer = this.layers[this.currentLayerIndex];
        if (!layer) return;

        const minX = Math.min(this.selectionStartX, this.selectionEndX);
        const maxX = Math.max(this.selectionStartX, this.selectionEndX);
        const minY = Math.min(this.selectionStartY, this.selectionEndY);
        const maxY = Math.max(this.selectionStartY, this.selectionEndY);

        this.selectedElements = [];

        layer.elements.forEach(element => {
            if (this.isElementInBox(element, minX, maxX, minY, maxY)) {
                this.selectedElements.push(element);
            }
        });
    }

    // 检查元素是否在选择框内
    isElementInBox(element, minX, maxX, minY, maxY) {
        if (element.type === 'brush' || element.type === 'eraser') {
            // 检查线条的点是否在选择框内
            for (const point of element.points) {
                if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
                    return true;
                }
            }
        } else if (element.type === 'line') {
            // 检查直线的端点是否在选择框内
            if ((element.startX >= minX && element.startX <= maxX && element.startY >= minY && element.startY <= maxY) ||
                (element.endX >= minX && element.endX <= maxX && element.endY >= minY && element.endY <= maxY)) {
                return true;
            }
        } else if (element.type === 'rect') {
            // 检查矩形是否与选择框相交
            const rx = Math.min(element.startX, element.startX + element.width);
            const rx2 = Math.max(element.startX, element.startX + element.width);
            const ry = Math.min(element.startY, element.startY + element.height);
            const ry2 = Math.max(element.startY, element.startY + element.height);
            if (rx <= maxX && rx2 >= minX && ry <= maxY && ry2 >= minY) {
                return true;
            }
        } else if (element.type === 'circle') {
            // 检查圆形是否与选择框相交
            if (element.centerX + element.radius >= minX && element.centerX - element.radius <= maxX &&
                element.centerY + element.radius >= minY && element.centerY - element.radius <= maxY) {
                return true;
            }
        } else if (element.type === 'ellipse') {
            // 检查椭圆是否与选择框相交
            if (element.centerX + element.radiusX >= minX && element.centerX - element.radiusX <= maxX &&
                element.centerY + element.radiusY >= minY && element.centerY - element.radiusY <= maxY) {
                return true;
            }
        } else if (element.type === 'star') {
            // 检查五角星是否与选择框相交
            if (element.centerX + element.outerRadius >= minX && element.centerX - element.outerRadius <= maxX &&
                element.centerY + element.outerRadius >= minY && element.centerY - element.outerRadius <= maxY) {
                return true;
            }
        }
        return false;
    }

    // 绘制画布中心原点标记
    drawCanvasOrigin() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        ctx.save();

        // 绘制原点十字标记
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;

        // 水平线
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX + 10, centerY);
        ctx.stroke();

        // 垂直线
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX, centerY + 10);
        ctx.stroke();

        // 绘制原点圆圈
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.stroke();

        // 显示坐标标签
        ctx.fillStyle = '#ff0000';
        ctx.font = '12px sans-serif';
        ctx.fillText('O(0,0)', centerX + 15, centerY - 5);

        ctx.restore();
    }

    // 绘制鼠标位置的正交虚线
    drawMouseCrosshair() {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // 将鼠标屏幕坐标转换为世界坐标
        const worldMouse = this.canvasPointToWorld(this.mouseX, this.mouseY);

        // 在世界坐标系中绘制十字线，然后转换回屏幕坐标
        // 计算十字线在世界坐标系的四个边界点（覆盖整个可视区域）
        const z = this.zoomLevel;
        const px0 = this.viewPanX;
        const py0 = this.viewPanY;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 计算可视区域的世界坐标边界
        const minWx = -px0 / z;
        const maxWx = (w - px0) / z;
        const minWy = -py0 / z;
        const maxWy = (h - py0) / z;

        // 绘制垂直线（在世界坐标系中从上到下）
        ctx.beginPath();
        ctx.moveTo(worldMouse.x, minWy);
        ctx.lineTo(worldMouse.x, maxWy);
        ctx.stroke();

        // 绘制水平线（在世界坐标系中从左到右）
        ctx.beginPath();
        ctx.moveTo(minWx, worldMouse.y);
        ctx.lineTo(maxWx, worldMouse.y);
        ctx.stroke();

        // 计算相对于世界坐标系原点（画布中心）的坐标
        const canvasCenterX = this.canvas.width / 2;
        const canvasCenterY = this.canvas.height / 2;
        const worldCenterX = (canvasCenterX - px0) / z;
        const worldCenterY = (canvasCenterY - py0) / z;

        const relativeX = Math.round(worldMouse.x - worldCenterX);
        const relativeY = Math.round(worldMouse.y - worldCenterY);

        // 显示坐标信息
        ctx.setLineDash([]); // 取消虚线
        ctx.fillStyle = 'rgba(74, 158, 255, 0.9)';
        ctx.font = '12px sans-serif';

        const coordText = `X: ${relativeX}, Y: ${relativeY}`;
        const textWidth = ctx.measureText(coordText).width;

        // 将世界坐标转换为屏幕坐标用于显示文本
        const screenMouseX = worldMouse.x * z + px0;
        const screenMouseY = worldMouse.y * z + py0;

        // 绘制坐标背景
        const padding = 4;
        const bgX = screenMouseX + 10;
        const bgY = screenMouseY - 25;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(bgX, bgY, textWidth + padding * 2, 20);

        // 绘制坐标文本
        ctx.fillStyle = '#4a9eff';
        ctx.fillText(coordText, bgX + padding, bgY + 14);

        ctx.restore();
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

        // 计算画布中心作为原点
        const canvasCenterX = this.canvas.width / 2;
        const originOffset = canvasCenterX * z + px;

        // 计算刻度间隔
        let majorInterval = 50;
        let minorInterval = 10;
        if (z < 0.5) { majorInterval = 100; minorInterval = 20; }
        else if (z > 2) { majorInterval = 20; minorInterval = 5; }

        const startWorld = -px / z - canvasCenterX;
        const endWorld = (w - px) / z - canvasCenterX;

        ctx.strokeStyle = '#999';
        ctx.lineWidth = 0.5;
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#333';

        // 绘制刻度
        const startX = Math.floor(startWorld / minorInterval) * minorInterval;
        for (let x = startX; x <= endWorld; x += minorInterval) {
            const screenX = (x + canvasCenterX) * z + px;
            const isMajor = x % majorInterval === 0;

            ctx.beginPath();
            ctx.moveTo(screenX, isMajor ? 0 : h * 0.6);
            ctx.lineTo(screenX, h);
            ctx.stroke();

            if (isMajor && Math.abs(x) >= 0.001) {
                ctx.fillText(Math.round(x), screenX + 2, h - 3);
            }
        }

        // 绘制原点标记
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(originOffset - 1, 0, 2, h);

        // 绘制鼠标位置滑块
        if (this.mouseX !== 0) {
            ctx.fillStyle = '#4a9eff';
            ctx.beginPath();
            ctx.moveTo(this.mouseX, 0);
            ctx.lineTo(this.mouseX - 4, 8);
            ctx.lineTo(this.mouseX + 4, 8);
            ctx.closePath();
            ctx.fill();
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

        // 计算画布中心作为原点
        const canvasCenterY = this.canvas.height / 2;
        const originOffset = canvasCenterY * z + py;

        // 计算刻度间隔
        let majorInterval = 50;
        let minorInterval = 10;
        if (z < 0.5) { majorInterval = 100; minorInterval = 20; }
        else if (z > 2) { majorInterval = 20; minorInterval = 5; }

        const startWorld = -py / z - canvasCenterY;
        const endWorld = (h - py) / z - canvasCenterY;

        ctx.strokeStyle = '#999';
        ctx.lineWidth = 0.5;
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#333';

        // 绘制刻度
        const startY = Math.floor(startWorld / minorInterval) * minorInterval;
        for (let y = startY; y <= endWorld; y += minorInterval) {
            const screenY = (y + canvasCenterY) * z + py;
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

        // 绘制原点标记
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, originOffset - 1, w, 2);

        // 绘制鼠标位置滑块
        if (this.mouseY !== 0) {
            ctx.fillStyle = '#4a9eff';
            ctx.beginPath();
            ctx.moveTo(0, this.mouseY);
            ctx.lineTo(8, this.mouseY - 4);
            ctx.lineTo(8, this.mouseY + 4);
            ctx.closePath();
            ctx.fill();
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
        } else if (element.type === 'ellipse') {
            ctx.beginPath();
            ctx.ellipse(element.centerX, element.centerY, element.radiusX, element.radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
        } else if (element.type === 'star') {
            ctx.beginPath();
            const { centerX, centerY, outerRadius, innerRadius, points } = element;
            const step = Math.PI / points;
            ctx.moveTo(
                centerX + outerRadius * Math.cos(-Math.PI / 2),
                centerY + outerRadius * Math.sin(-Math.PI / 2)
            );
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = i * step - Math.PI / 2;
                ctx.lineTo(
                    centerX + radius * Math.cos(angle),
                    centerY + radius * Math.sin(angle)
                );
            }
            ctx.closePath();
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
