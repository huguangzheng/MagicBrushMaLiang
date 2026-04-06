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
const Feature9Tests = require('./test-feature9-background-and-select.js');
const Feature10Tests = require('./test-feature10-grid-and-layer.js');

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
            
            // 背景颜色
            backgroundColor: '#ffffff',
            
            // 选择工具相关属性
            selectedElement: null,

            // 右键批量移动相关属性
            isRightDragging: false,
            rightDragStartX: 0,
            rightDragStartY: 0,

            // 网格相关属性
            showGrid: true,
            gridSize: 10,
            minGridSize: 5,
            
            // 图层限制
            maxLayers: 16,

            // 模拟方法
            addLayer: function(name) {
                // 检查是否达到最大图层数
                if (this.layers.length >= this.maxLayers) {
                    return false;
                }
                
                const layerName = name || `图层${this.layers.length + 1}`;
                const layer = {
                    id: Date.now() + Math.random(), // 确保唯一ID
                    name: layerName,
                    visible: true,
                    locked: false,
                    elements: [],
                    color: 'transparent' // 新建图层默认透明
                };
                this.layers.push(layer);
                this.currentLayerIndex = this.layers.length - 1;
                return layer;
            },

            deleteLayer: function() {
                // 保护背景图层
                if (this.currentLayerIndex === 0) return;
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
            
            // 新增方法 - 改进的线条选择(检查所有图层)
            enhanceLineSelection: function(x, y) {
                const threshold = this.snapThreshold || 15;
                let selectedElement = null;
                let minDistance = threshold;
                
                // 检查所有图层(从上到下)
                for (let i = this.layers.length - 1; i >= 0; i--) {
                    const layer = this.layers[i];
                    if (!layer.visible) continue;
                    
                    for (const element of layer.elements) {
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
                            const d = this.pointToLineDistance ? 
                                this.pointToLineDistance(x, y, element.startX, element.startY, element.endX, element.endY) :
                                Math.sqrt(Math.pow((element.startX + element.endX)/2 - x, 2) + Math.pow((element.startY + element.endY)/2 - y, 2));
                            if (d < minDistance) {
                                minDistance = d;
                                selectedElement = element;
                            }
                        }
                        // 处理矩形
                        else if (element.type === 'rect') {
                            // 简化处理:检查矩形的四条边
                            const cx = element.startX + element.width / 2;
                            const cy = element.startY + element.height / 2;
                            const d = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2));
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
                }

                return selectedElement;
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
            },
            
            // 新增方法 - 设置背景颜色
            setBackgroundColor: function(color) {
                this.backgroundColor = color;
                this.saveHistory();
            },
            
            // 新增方法 - 移动元素
            moveElement: function(element, dx, dy) {
                if (element.type === 'brush' || element.type === 'eraser') {
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
            },
            
            // 新增方法 - 删除选中元素
            deleteSelectedElement: function() {
                if (!this.selectedElement) return;
                const layer = this.layers[this.currentLayerIndex];
                if (!layer) return;
                const index = layer.elements.indexOf(this.selectedElement);
                if (index > -1) {
                    layer.elements.splice(index, 1);
                }
                this.selectedElement = null;
                this.saveHistory();
            },
            
            // 新增方法 - 应用橡皮擦
            applyEraser: function(eraserPath) {
                if (!eraserPath || !eraserPath.points || eraserPath.points.length < 1) return;

                const layer = this.layers[this.currentLayerIndex];
                if (!layer) return;

                const eraserSize = eraserPath.size;
                const halfSize = eraserSize / 2;
                const elementsToRemove = [];

                layer.elements.forEach(element => {
                    let shouldRemove = false;

                    if (element.type === 'brush' || element.type === 'eraser') {
                        for (const eraserPoint of eraserPath.points) {
                            for (const elementPoint of element.points) {
                                const distance = Math.sqrt(
                                    Math.pow(eraserPoint.x - elementPoint.x, 2) +
                                    Math.pow(eraserPoint.y - elementPoint.y, 2)
                                );
                                if (distance <= halfSize) {
                                    shouldRemove = true;
                                    break;
                                }
                            }
                            if (shouldRemove) break;
                        }
                    } else if (element.type === 'line') {
                        // 使用isShapeIntersectEraser方法检测线条
                        shouldRemove = this.isShapeIntersectEraser(element, eraserPath, halfSize);
                    } else if (element.type === 'circle' || element.type === 'rect' || element.type === 'ellipse' || element.type === 'star') {
                        // 使用isShapeIntersectEraser方法检测闭合图形
                        shouldRemove = this.isShapeIntersectEraser(element, eraserPath, halfSize);
                    }

                    if (shouldRemove) {
                        elementsToRemove.push(element);
                    }
                });

                elementsToRemove.forEach(element => {
                    const index = layer.elements.indexOf(element);
                    if (index > -1) {
                        layer.elements.splice(index, 1);
                    }
                });

                // 检查批量选中的元素是否都被删除了
                if (this.selectedElements && this.selectedElements.length > 0) {
                    const remainingSelected = this.selectedElements.filter(element => {
                        return layer.elements.includes(element);
                    });

                    if (remainingSelected.length === 0) {
                        // 所有选中的元素都被删除了，取消批量选中
                        this.selectedElements = [];
                        if (this.selectedElement) {
                            this.selectedElement = null;
                        }
                    } else {
                        // 更新选中状态，保留未被删除的元素
                        this.selectedElements = remainingSelected;
                    }
                }

                // 检查单个选中的元素是否被删除
                if (this.selectedElement && !layer.elements.includes(this.selectedElement)) {
                    this.selectedElement = null;
                }
            },
            
            // 新增方法 - 切换网格显示
            toggleGrid: function() {
                this.showGrid = !this.showGrid;
            },
            
            // 新增方法 - 设置网格大小
            setGridSize: function(size) {
                this.gridSize = Math.max(this.minGridSize, parseInt(size));
            },
            
            // 新增方法 - 设置图层颜色
            setLayerColor: function(color) {
                const layer = this.layers[this.currentLayerIndex];
                if (layer) {
                    layer.color = color;
                }
            },

            // 新增方法 - 计算点到椭圆的距离
            pointToEllipseDistance: function(px, py, ellipse) {
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
            },

            // 新增方法 - 计算点到五角星的距离
            pointToStarDistance: function(px, py, star) {
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
            },

            // 新增方法 - 计算点到线段的距离
            pointToLineDistance: function(px, py, x1, y1, x2, y2) {
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
            },

            // 新增方法 - 设置光标样式
            setCursorStyle: function(cursorStyle) {
                if (this.canvas) {
                    const validStyles = ['grab', 'default', 'move', 'pointer'];
                    if (validStyles.includes(cursorStyle)) {
                        this.canvas.style = this.canvas.style || {};
                        this.canvas.style.cursor = cursorStyle;
                    }
                }
            },

            // 新增方法 - 计算线条元素的中点
            calculateLineMidpoint: function(line) {
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
            },

            // 新增方法 - 获取闭合图形的中心点
            getShapeCenter: function(shape) {
                if (shape.type === 'circle' || shape.type === 'ellipse' || shape.type === 'star' || shape.type === 'rect') {
                    return {
                        x: shape.centerX,
                        y: shape.centerY
                    };
                }
                return { x: 0, y: 0 };
            },

            // 新增方法 - 渲染选中元素的标记点
            renderSelectionMarker: function(ctx, element) {
                // 模拟方法
            },

            // 新增方法 - 鼠标屏幕坐标转世界坐标
            canvasPointToWorld: function(mx, my) {
                const z = this.zoomLevel || 1;
                const px0 = this.viewPanX || 0;
                const py0 = this.viewPanY || 0;
                return {
                    x: (mx - px0) / z,
                    y: (my - py0) / z
                };
            },

            // 新增方法 - 绘制鼠标十字线
            drawMouseCrosshair: function() {
                // 模拟方法
            },

            // 新增方法 - 处理右键菜单
            handleContextMenu: function(e) {
                e.preventDefault();
                // 模拟方法
            },

            // 新增方法 - 处理双击事件
            handleDoubleClick: function(e) {
                // 模拟canvas的getBoundingClientRect
                const rect = { left: 0, top: 0 };
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                // 模拟canvasPointToWorld方法
                const z = this.zoomLevel || 1;
                const px0 = this.viewPanX || 0;
                const py0 = this.viewPanY || 0;
                const x = (mx - px0) / z;
                const y = (my - py0) / z;

                // 只有选择工具模式才处理双击
                if (this.currentTool !== 'select') {
                    return;
                }

                // 检查双击位置是否有元素
                const clickedElement = this.enhanceLineSelection(x, y);
                
                if (!clickedElement) {
                    // 双击空白处，取消所有批量选中
                    if (this.selectedElements.length > 0) {
                        this.selectedElements = [];
                    }
                    // 同时也取消单个选中
                    if (this.selectedElement) {
                        this.selectedElement = null;
                    }
                }
            },

            // 新增方法 - 处理键盘事件
            handleKeyDown: function(e) {
                // CTRL+Z 撤销
                if (e.ctrlKey && e.key === 'z') {
                    e.preventDefault();
                    this.undo();
                    return;
                }

                // DEL 删除选中的元素
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    // 只有选择工具模式才处理删除
                    if (this.currentTool !== 'select') {
                        return;
                    }

                    // 删除批量选中的元素
                    if (this.selectedElements.length > 0) {
                        this.deleteSelectedElements();
                    }

                    // 删除单个选中的元素
                    if (this.selectedElement) {
                        this.removeElement(this.selectedElement);
                        this.selectedElement = null;
                    }
                }
            },

            // 新增方法 - 删除批量选中的元素
            deleteSelectedElements: function() {
                if (this.selectedElements.length === 0) {
                    return;
                }

                const currentLayer = this.layers[this.currentLayerIndex];
                
                // 从当前图层中删除所有选中的元素
                this.selectedElements.forEach(element => {
                    const index = currentLayer.elements.indexOf(element);
                    if (index > -1) {
                        currentLayer.elements.splice(index, 1);
                    }
                });

                // 清空选中状态
                this.selectedElements = [];
                this.selectedElement = null;
            },

            // 新增方法 - 删除单个元素
            removeElement: function(element) {
                const currentLayer = this.layers[this.currentLayerIndex];
                if (!currentLayer) return;

                const index = currentLayer.elements.indexOf(element);
                if (index > -1) {
                    currentLayer.elements.splice(index, 1);
                }
            },

            // 新增方法 - 计算点到矩形的距离
            pointToRectDistance: function(px, py, rect) {
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
            },

            // 新增方法 - 检查闭合图形是否与擦除路径相交
            isShapeIntersectEraser: function(shape, eraserPath, halfSize) {
                // 首先检查元素的中心点/中点是否与橡皮擦轨迹相交
                let centerPoint = null;
                if (shape.type === 'line' || shape.type === 'brush' || shape.type === 'eraser') {
                    // 线条的中点
                    if (shape.type === 'line') {
                        centerPoint = {
                            x: (shape.startX + shape.endX) / 2,
                            y: (shape.startY + shape.endY) / 2
                        };
                    } else if (shape.points && shape.points.length > 0) {
                        // 画笔/橡皮擦的平均点
                        let sumX = 0, sumY = 0;
                        shape.points.forEach(point => {
                            sumX += point.x;
                            sumY += point.y;
                        });
                        centerPoint = {
                            x: sumX / shape.points.length,
                            y: sumY / shape.points.length
                        };
                    }
                } else if (shape.type === 'circle' || shape.type === 'ellipse' || shape.type === 'star' || shape.type === 'rect') {
                    // 闭合图形的中心点
                    centerPoint = {
                        x: shape.centerX,
                        y: shape.centerY
                    };
                }

                // 检查中心点是否与橡皮擦轨迹相交
                if (centerPoint) {
                    for (const eraserPoint of eraserPath.points) {
                        const distance = Math.sqrt(
                            Math.pow(eraserPoint.x - centerPoint.x, 2) +
                            Math.pow(eraserPoint.y - centerPoint.y, 2)
                        );
                        if (distance <= halfSize) {
                            return true;
                        }
                    }
                }

                // 然后检查图形本身是否与橡皮擦轨迹相交
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
                    } else if (shape.type === 'line') {
                        // 检查直线是否与橡皮擦路径相交
                        const d = this.pointToLineDistance(
                            eraserPoint.x, eraserPoint.y,
                            shape.startX, shape.startY,
                            shape.endX, shape.endY
                        );
                        if (d <= halfSize) {
                            return true;
                        }
                    }
                }
                return false;
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

        const feature9Tests = new Feature9Tests(this.framework, this.app);
        feature9Tests.registerTests();

        const feature10Tests = new Feature10Tests(this.framework, this.app);
        feature10Tests.registerTests();

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
