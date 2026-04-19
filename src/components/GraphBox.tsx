import React, { useRef, useEffect, useState } from 'react'
import { useBoardStore } from '../store'
import type { GraphState } from '../store'

declare global {
  interface Window {
    Desmos: any
  }
}

export function GraphBox({ graph }: { graph: GraphState }) {
    const { updateGraph, removeGraph, camera } = useBoardStore()
    const containerRef = useRef<HTMLDivElement>(null)
    const calcRef = useRef<any>(null)
    
    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 })

    useEffect(() => {
        if (!containerRef.current || !window.Desmos) return

        calcRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
            keypad: true,
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
        })

        if (graph.state) {
            calcRef.current.setState(graph.state)
        }

        // Save state periodically or on change if possible, here we'll just save it on unmount or manual
        const interval = setInterval(() => {
            if (calcRef.current) {
                updateGraph(graph.id, { state: calcRef.current.getState() })
            }
        }, 5000)

        return () => {
            clearInterval(interval)
            if (calcRef.current) {
                calcRef.current.destroy()
            }
        }
    }, [graph.id])

    const handlePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation()
        setIsDragging(true)
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            startX: graph.x,
            startY: graph.y
        }
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return
        e.stopPropagation()
        const dx = (e.clientX - dragStart.current.x) / camera.z
        const dy = (e.clientY - dragStart.current.y) / camera.z
        updateGraph(graph.id, {
            x: dragStart.current.startX + dx,
            y: dragStart.current.startY + dy
        })
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return
        e.stopPropagation()
        setIsDragging(false)
        e.currentTarget.releasePointerCapture(e.pointerId)
    }

    return (
        <div
            className="absolute shadow-lg bg-white rounded-xl overflow-hidden border border-gray-300 pointer-events-auto"
            style={{
                left: graph.x,
                top: graph.y,
                width: graph.width,
                height: graph.height,
            }}
        >
            {/* Grab Handle */}
            <div 
                className="w-full h-8 bg-gray-100 border-b border-gray-200 cursor-grab active:cursor-grabbing flex items-center justify-between px-2"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <span className="text-xs font-bold text-gray-500">Desmos Graph</span>
                <button 
                    className="text-red-500 hover:bg-red-100 rounded px-2"
                    onClick={() => removeGraph(graph.id)}
                    onPointerDown={e => e.stopPropagation()}
                >×</button>
            </div>
            
            {/* Desmos Container */}
            <div 
                ref={containerRef} 
                style={{ width: '100%', height: 'calc(100% - 32px)' }}
                onPointerDown={(e) => e.stopPropagation()} // Let Desmos handle internal clicks
            />
        </div>
    )
}