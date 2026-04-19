import React from 'react'
import { useBoardStore } from '../store'
import { Download, Upload, Moon, Sun, Grid, Trash2 } from 'lucide-react'
import html2canvas from 'html2canvas'

export function BottomBar() {
    const { 
        isDarkMode, setIsDarkMode, camera, addGraph, loadState, clearBoard
    } = useBoardStore()

    const handleSave = () => {
        const state = useBoardStore.getState()
        const snapshot = {
            strokes: state.strokes,
            textBoxes: state.textBoxes,
            graphs: state.graphs,
            shapes: state.shapes
        }
        const blob = new Blob([JSON.stringify(snapshot)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'whiteboard.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleLoad = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        input.onchange = (e: any) => {
            const file = e.target.files[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = (ev) => {
                try {
                    const state = JSON.parse(ev.target?.result as string)
                    loadState(state)
                } catch (err) {}
            }
            reader.readAsText(file)
        }
        input.click()
    }

    const handleAddGraph = () => {
        const id = Math.random().toString(36).substring(7)
        addGraph({
            id,
            x: camera.x + 100, // center it loosely
            y: camera.y + 100,
            width: 600,
            height: 400
        })
    }

    const handleClear = async () => {
        const container = document.querySelector('.board-container') as HTMLElement
        if (!container) return

        const canvas = await html2canvas(container, { backgroundColor: null })
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        
        const { width, height } = canvas
        const imgData = ctx.getImageData(0, 0, width, height)
        const data = imgData.data

        const particleCanvas = document.createElement('canvas')
        particleCanvas.width = width
        particleCanvas.height = height
        particleCanvas.style.position = 'absolute'
        particleCanvas.style.top = '0'
        particleCanvas.style.left = '0'
        particleCanvas.style.pointerEvents = 'none'
        particleCanvas.style.zIndex = '999999'
        document.body.appendChild(particleCanvas)

        const pCtx = particleCanvas.getContext('2d')!
        const particles: any[] = []
        
        const step = 3 // 3x3 particles
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const i = (y * width + x) * 4
                if (data[i+3] > 0) {
                    particles.push({
                        x, y,
                        color: `rgba(${data[i]}, ${data[i+1]}, ${data[i+2]}, ${data[i+3]/255})`,
                        vx: Math.random() * 6 + 3, // blow right stronger
                        vy: Math.random() * 4 - 2, // blow up/down
                        life: 1,
                        delay: (y / height) * 40 // delay based on y position (top down)
                    })
                }
            }
        }

        clearBoard()

        let frame = 0
        const animate = () => {
            pCtx.clearRect(0, 0, width, height)
            let active = false
            particles.forEach(p => {
                if (frame > p.delay) {
                    p.x += p.vx
                    p.y += p.vy
                    p.life -= 0.02 // faster fade
                }
                if (p.life > 0) {
                    active = true
                    pCtx.globalAlpha = frame > p.delay ? p.life : 1
                    pCtx.fillStyle = p.color
                    pCtx.fillRect(p.x, p.y, step, step)
                }
            })
            frame++
            if (active) {
                requestAnimationFrame(animate)
            } else {
                document.body.removeChild(particleCanvas)
            }
        }
        animate()
    }

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 pointer-events-auto z-[9999]">
            <ActionButton icon={<Grid size={18} />} label="Add Graph" onClick={handleAddGraph} color="blue" />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ActionButton icon={<Download size={16} />} label="Save" onClick={handleSave} />
            <ActionButton icon={<Upload size={16} />} label="Load" onClick={handleLoad} />
            <ActionButton 
                icon={isDarkMode ? <Sun size={16} /> : <Moon size={16} />} 
                label={isDarkMode ? "Light" : "Dark"} 
                onClick={() => setIsDarkMode(!isDarkMode)} 
            />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ActionButton icon={<Trash2 size={16} />} label="Clear" onClick={handleClear} color="red" />
        </div>
    )
}

function ActionButton({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color?: string }) {
    let colorClass = 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
    if (color === 'red') colorClass = 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50'
    if (color === 'blue') colorClass = 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50'
    
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colorClass}`}
        >
            {icon}
            {label}
        </button>
    )
}
