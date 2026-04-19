import React, { useRef, useState, useEffect } from 'react'
import { useBoardStore } from '../store'
import { getStroke } from 'perfect-freehand'
import { TextBox } from './TextBox'
import { GraphBox } from './GraphBox'

export function Board() {
    const { 
        camera, setCamera, currentTool, strokeSize, strokeOpacity, isSketchy,
        addStroke, updateLastStroke, strokes,
        textBoxes, graphs, currentFont, addTextBox,
        shapes, addShape, updateLastShape
    } = useBoardStore()

    const [isDrawing, setIsDrawing] = useState(false)
    const [isPanning, setIsPanning] = useState(false)
    const [currentPoints, setCurrentPoints] = useState<{x: number, y: number}[]>([])
    const [shapeStart, setShapeStart] = useState<{x: number, y: number} | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            if (e.ctrlKey || e.metaKey) {
                const zoomFactor = Math.pow(0.99, e.deltaY)
                let newZ = camera.z * zoomFactor
                newZ = Math.max(0.1, Math.min(newZ, 10))
                
                const rect = el.getBoundingClientRect()
                const mouseX = e.clientX - rect.left
                const mouseY = e.clientY - rect.top

                const newX = mouseX - (mouseX - camera.x) * (newZ / camera.z)
                const newY = mouseY - (mouseY - camera.y) * (newZ / camera.z)

                setCamera({ x: newX, y: newY, z: newZ })
            } else {
                setCamera({ x: camera.x - e.deltaX, y: camera.y - e.deltaY, z: camera.z })
            }
        }

        el.addEventListener('wheel', handleWheel, { passive: false })
        return () => el.removeEventListener('wheel', handleWheel)
    }, [camera, setCamera])

    const screenToWorld = (sx: number, sy: number) => ({
        x: (sx - camera.x) / camera.z,
        y: (sy - camera.y) / camera.z
    })

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            setIsPanning(true)
            e.currentTarget.setPointerCapture(e.pointerId)
            return
        }

        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const sx = e.clientX - rect.left
        const sy = e.clientY - rect.top
        const world = screenToWorld(sx, sy)

        const color = useBoardStore.getState().isDarkMode ? '#ffffff' : '#000000'

        if (currentTool === 'draw') {
            setIsDrawing(true)
            e.currentTarget.setPointerCapture(e.pointerId)
            setCurrentPoints([world])
            addStroke({
                id: Math.random().toString(36).substring(7),
                points: [world], color, size: strokeSize, opacity: strokeOpacity, isSketchy
            })
        } else if (['rectangle', 'circle', 'line'].includes(currentTool)) {
            setIsDrawing(true)
            e.currentTarget.setPointerCapture(e.pointerId)
            setShapeStart(world)
            addShape({
                id: Math.random().toString(36).substring(7),
                type: currentTool as any,
                x: world.x, y: world.y, w: 0, h: 0,
                color, size: strokeSize, opacity: strokeOpacity, isSketchy
            })
        } else if (currentTool === 'eraser') {
            setIsDrawing(true)
            e.currentTarget.setPointerCapture(e.pointerId)
            eraseAt(world.x, world.y)
        } else if (currentTool === 'text') {
            addTextBox({
                id: Math.random().toString(36).substring(7),
                x: world.x, y: world.y, width: 300, height: 100,
                text: '', font: currentFont, size: strokeSize, opacity: strokeOpacity
            })
        }
    }

    const eraseAt = (wx: number, wy: number) => {
        const radius = useBoardStore.getState().strokeSize * 2
        const s = useBoardStore.getState()
        if (s.eraserMode === 'entity') {
            s.strokes.forEach(st => {
                if (st.points.some(p => Math.hypot(p.x - wx, p.y - wy) < radius + st.size)) s.removeStroke(st.id)
            })
            s.shapes.forEach(sh => {
                if (wx >= sh.x && wx <= sh.x + sh.w && wy >= sh.y && wy <= sh.y + sh.h) s.removeShape(sh.id)
            })
            s.textBoxes.forEach(tb => {
                if (wx >= tb.x && wx <= tb.x + tb.width && wy >= tb.y && wy <= tb.y + tb.height) s.removeTextBox(tb.id)
            })
            s.graphs.forEach(g => {
                if (wx >= g.x && wx <= g.x + g.width && wy >= g.y && wy <= g.y + g.height) s.removeGraph(g.id)
            })
        } else {
            const newStrokes: typeof strokes = []
            s.strokes.forEach(st => {
                let chunk: typeof currentPoints = []
                st.points.forEach(p => {
                    if (Math.hypot(p.x - wx, p.y - wy) > radius + st.size) {
                        chunk.push(p)
                    } else if (chunk.length > 0) {
                        newStrokes.push({ ...st, id: Math.random().toString(36), points: chunk })
                        chunk = []
                    }
                })
                if (chunk.length > 0) newStrokes.push({ ...st, id: Math.random().toString(36), points: chunk })
            })
            s.updateStrokes(newStrokes)
        }
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isPanning) {
            setCamera({ x: camera.x + e.movementX, y: camera.y + e.movementY, z: camera.z })
            return
        }

        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const sx = e.clientX - rect.left
        const sy = e.clientY - rect.top
        const world = screenToWorld(sx, sy)

        if (isDrawing && currentTool === 'draw') {
            const newPoints = [...currentPoints, world]
            setCurrentPoints(newPoints)
            updateLastStroke(newPoints)
        } else if (isDrawing && ['rectangle', 'circle', 'line'].includes(currentTool) && shapeStart) {
            updateLastShape(world.x - shapeStart.x, world.y - shapeStart.y)
        } else if (isDrawing && currentTool === 'eraser') {
            eraseAt(world.x, world.y)
        }
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDrawing(false)
        setIsPanning(false)
        setShapeStart(null)
        e.currentTarget.releasePointerCapture(e.pointerId)
    }

    return (
        <div 
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none' }}
        >
            <div 
                className="absolute inset-0 origin-top-left"
                style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})` }}
            >
                <svg className="absolute inset-0" style={{ width: '100vw', height: '100vh', overflow: 'visible' }}>
                    {strokes.map(stroke => <StrokePath key={stroke.id} stroke={stroke} />)}
                    {shapes.map(shape => <ShapeSvg key={shape.id} shape={shape} />)}
                </svg>

                {textBoxes.map(tb => <TextBox key={tb.id} tb={tb} />)}
                {graphs.map(g => <GraphBox key={g.id} graph={g} />)}
            </div>
        </div>
    )
}

function StrokePath({ stroke }: { stroke: any }) {
    const strokeData = getStroke(stroke.points, {
        size: stroke.size, thinning: stroke.isSketchy ? 0.5 : 0, smoothing: stroke.isSketchy ? 0.5 : 0.9, streamline: 0.5,
    })
    const pathData = getSvgPathFromStroke(strokeData)
    if (!pathData) return null
    return <path d={pathData} fill={stroke.color} opacity={stroke.opacity / 100} />
}

function ShapeSvg({ shape }: { shape: any }) {
    const common = {
        stroke: shape.color,
        strokeWidth: shape.size,
        fill: 'transparent',
        opacity: shape.opacity / 100,
        strokeLinecap: 'round' as any,
        strokeLinejoin: 'round' as any,
    }

    if (shape.type === 'rectangle') {
        const x = shape.w < 0 ? shape.x + shape.w : shape.x
        const y = shape.h < 0 ? shape.y + shape.h : shape.y
        const w = Math.abs(shape.w)
        const h = Math.abs(shape.h)
        return <rect x={x} y={y} width={w} height={h} {...common} />
    } else if (shape.type === 'circle') {
        const r = Math.hypot(shape.w, shape.h) / 2
        const cx = shape.x + shape.w / 2
        const cy = shape.y + shape.h / 2
        return <circle cx={cx} cy={cy} r={r} {...common} />
    } else if (shape.type === 'line') {
        return <line x1={shape.x} y1={shape.y} x2={shape.x + shape.w} y2={shape.y + shape.h} {...common} />
    }
    return null
}

function getSvgPathFromStroke(stroke: number[][]) {
    if (!stroke.length) return ''
    const d = stroke.reduce((acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length]
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
        return acc
    }, ['M', ...stroke[0], 'Q'])
    d.push('Z')
    return d.join(' ')
}
