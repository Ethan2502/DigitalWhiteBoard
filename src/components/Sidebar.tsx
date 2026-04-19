import React, { useState, useRef } from 'react'
import { useBoardStore } from '../store'
import { Move, Minus, Plus, Settings2, Eraser, Pen, MousePointer2, Type, Square, Circle, Minus as LineIcon } from 'lucide-react'

export function Sidebar() {
    const { 
        currentTool, setTool, strokeSize, setStrokeSize, strokeOpacity, setStrokeOpacity, 
        isSketchy, setIsSketchy, currentFont, setCurrentFont,
        isGrid, setIsGrid, eraserMode, setEraserMode
    } = useBoardStore()
    
    const [pos, setPos] = useState({ x: 20, y: 20 })
    const [isDragging, setIsDragging] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null)

    const handlePointerDown = (e: React.PointerEvent) => {
        dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: pos.x, initialY: pos.y }
        setIsDragging(true)
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !dragRef.current) return
        const dx = e.clientX - dragRef.current.startX
        const dy = e.clientY - dragRef.current.startY
        setPos({ x: dragRef.current.initialX + dx, y: dragRef.current.initialY + dy })
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false)
        e.currentTarget.releasePointerCapture(e.pointerId)
    }

    return (
        <div 
            className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col text-gray-800 dark:text-gray-100 transition-colors pointer-events-auto"
            style={{ 
                left: pos.x, top: pos.y, zIndex: 9999,
                width: '280px',
                height: collapsed ? '40px' : 'auto',
                overflow: 'hidden'
            }}
        >
            <div 
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 p-2 cursor-grab active:cursor-grabbing border-b border-gray-200 dark:border-gray-700 h-[40px]"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div className="flex items-center gap-2">
                    <Move size={16} className="text-gray-500" />
                    <span className="font-bold text-sm">Tools</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setPos({ x: 20, y: 20 })} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><Settings2 size={14} /></button>
                    <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onPointerDown={e => e.stopPropagation()}>
                        {collapsed ? <Plus size={14} /> : <Minus size={14} />}
                    </button>
                </div>
            </div>

            {!collapsed && (
                <div className="flex flex-col max-h-[80vh] overflow-y-auto">
                    <div className="p-4 flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-2">
                            <ToolButton icon={<MousePointer2 size={18} />} label="Select" active={currentTool === 'select'} onClick={() => setTool('select')} />
                            <ToolButton icon={<Type size={18} />} label="Text" active={currentTool === 'text'} onClick={() => setTool('text')} />
                            <ToolButton icon={<Eraser size={18} />} label="Eraser" active={currentTool === 'eraser'} onClick={() => setTool('eraser')} />
                            
                            <ToolButton icon={<Pen size={18} />} label="Draw" active={currentTool === 'draw'} onClick={() => setTool('draw')} />
                            <ToolButton icon={<Square size={18} />} label="Rect" active={currentTool === 'rectangle'} onClick={() => setTool('rectangle')} />
                            <ToolButton icon={<Circle size={18} />} label="Circle" active={currentTool === 'circle'} onClick={() => setTool('circle')} />
                            <ToolButton icon={<LineIcon size={18} />} label="Line" active={currentTool === 'line'} onClick={() => setTool('line')} />
                        </div>

                        {currentTool === 'eraser' && (
                            <div className="flex gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                <label className="text-sm flex items-center gap-2"><input type="radio" checked={eraserMode === 'radius'} onChange={() => setEraserMode('radius')} /> Radius</label>
                                <label className="text-sm flex items-center gap-2"><input type="radio" checked={eraserMode === 'entity'} onChange={() => setEraserMode('entity')} /> Entity</label>
                            </div>
                        )}

                        <div className="h-px bg-gray-200 dark:bg-gray-700" />

                        <div className="flex flex-col gap-3">
                            <label className="flex items-center justify-between text-sm font-semibold">
                                Grid
                                <input type="checkbox" checked={isGrid} onChange={(e) => setIsGrid(e.target.checked)} className="w-4 h-4"/>
                            </label>

                            <label className="flex items-center justify-between text-sm font-semibold">
                                Line Style
                                <select className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" value={isSketchy ? 'sketchy' : 'solid'} onChange={(e) => setIsSketchy(e.target.value === 'sketchy')}>
                                    <option value="sketchy">Sketchy</option>
                                    <option value="solid">Solid</option>
                                </select>
                            </label>

                            <label className="flex items-center justify-between text-sm font-semibold">
                                Text Font
                                <select className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" value={currentFont} onChange={(e) => setCurrentFont(e.target.value)}>
                                    <option value="'Nunito', sans-serif">Nunito</option>
                                    <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                                    <option value="sans-serif">System Sans</option>
                                </select>
                            </label>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">Size</span>
                                    <input type="number" min="1" max="100" value={strokeSize} onChange={e => setStrokeSize(parseInt(e.target.value)||1)} className="w-16 border rounded px-1 text-sm text-right dark:bg-gray-700 dark:border-gray-600"/>
                                </div>
                                <input type="range" min="1" max="100" value={strokeSize} onChange={e => setStrokeSize(parseInt(e.target.value))} className="w-full accent-blue-500"/>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">Opacity (%)</span>
                                    <input type="number" min="0" max="100" value={strokeOpacity} onChange={e => setStrokeOpacity(parseInt(e.target.value)||0)} className="w-16 border rounded px-1 text-sm text-right dark:bg-gray-700 dark:border-gray-600"/>
                                </div>
                                <input type="range" min="0" max="100" value={strokeOpacity} onChange={e => setStrokeOpacity(parseInt(e.target.value))} className="w-full accent-blue-500"/>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                active 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 ring-2 ring-blue-500' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}
