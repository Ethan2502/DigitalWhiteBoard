import { useEffect } from 'react'
import { Board } from './components/Board'
import { Sidebar } from './components/Sidebar'
import { BottomBar } from './components/BottomBar'
import { useBoardStore } from './store'
import './index.css'

function GridOverlay() {
    const { isDarkMode, isGrid, camera } = useBoardStore()
    if (!isGrid) return null

    // Visual grid stays 20px, translates correctly with camera
    const size = 20
    const ox = camera.x % size
    const oy = camera.y % size

    return (
        <div 
            className="absolute inset-0 pointer-events-none opacity-10 z-0"
            style={{
                backgroundImage: `
                    linear-gradient(${isDarkMode ? '#ffffff' : '#000000'} 1px, transparent 1px),
                    linear-gradient(90deg, ${isDarkMode ? '#ffffff' : '#000000'} 1px, transparent 1px)
                `,
                backgroundSize: `${size}px ${size}px`,
                backgroundPosition: `${ox}px ${oy}px`
            }}
        />
    )
}

function App() {
    const { isDarkMode } = useBoardStore()

    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }, [isDarkMode])

    return (
        <div className={`w-screen h-screen overflow-hidden transition-colors ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <GridOverlay />
            
            <div className="absolute inset-0 board-container pointer-events-auto z-10">
                <Board />
            </div>
            
            <div className="relative z-50">
                <Sidebar />
                <BottomBar />
            </div>
        </div>
    )
}

export default App
