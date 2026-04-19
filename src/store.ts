import { create } from 'zustand'

export type Point = { x: number, y: number, pressure?: number }

export type Stroke = {
    id: string
    points: Point[]
    color: string
    size: number
    opacity: number
    isSketchy: boolean
}

export type Shape = {
    id: string
    type: 'rectangle' | 'circle' | 'line'
    x: number
    y: number
    w: number
    h: number
    color: string
    size: number
    opacity: number
    isSketchy: boolean
}

export type TextBoxState = {
    id: string
    x: number
    y: number
    width: number
    height: number
    text: string
    font: string
    size: number
    opacity: number
}

export type GraphState = {
    id: string
    x: number
    y: number
    width: number
    height: number
    state?: any
}

export type Tool = 'select' | 'draw' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'line'
export type EraserMode = 'entity' | 'radius'

interface BoardState {
    camera: { x: number, y: number, z: number }
    setCamera: (cam: { x: number, y: number, z: number }) => void

    strokes: Stroke[]
    shapes: Shape[]
    textBoxes: TextBoxState[]
    graphs: GraphState[]

    currentTool: Tool
    setTool: (tool: Tool) => void

    eraserMode: EraserMode
    setEraserMode: (mode: EraserMode) => void

    strokeSize: number
    setStrokeSize: (size: number) => void

    strokeOpacity: number
    setStrokeOpacity: (op: number) => void

    isSketchy: boolean
    setIsSketchy: (sketchy: boolean) => void

    currentFont: string
    setCurrentFont: (font: string) => void

    isGrid: boolean
    setIsGrid: (grid: boolean) => void

    isDarkMode: boolean
    setIsDarkMode: (dark: boolean) => void

    addStroke: (stroke: Stroke) => void
    updateLastStroke: (points: Point[]) => void
    removeStroke: (id: string) => void
    updateStrokes: (strokes: Stroke[]) => void

    addShape: (shape: Shape) => void
    updateLastShape: (w: number, h: number) => void
    removeShape: (id: string) => void

    addTextBox: (tb: TextBoxState) => void
    updateTextBox: (id: string, partial: Partial<TextBoxState>) => void
    removeTextBox: (id: string) => void

    addGraph: (graph: GraphState) => void
    updateGraph: (id: string, partial: Partial<GraphState>) => void
    removeGraph: (id: string) => void

    clearBoard: () => void
    loadState: (state: any) => void
}

export const useBoardStore = create<BoardState>((set) => ({
    camera: { x: 0, y: 0, z: 1 },
    setCamera: (camera) => set({ camera }),

    strokes: [],
    shapes: [],
    textBoxes: [],
    graphs: [],

    currentTool: 'select',
    setTool: (currentTool) => set({ currentTool }),

    eraserMode: 'radius',
    setEraserMode: (eraserMode) => set({ eraserMode }),

    strokeSize: 5,
    setStrokeSize: (strokeSize) => set({ strokeSize }),

    strokeOpacity: 100,
    setStrokeOpacity: (strokeOpacity) => set({ strokeOpacity }),

    isSketchy: true,
    setIsSketchy: (isSketchy) => set({ isSketchy }),

    currentFont: "'Nunito', sans-serif",
    setCurrentFont: (currentFont) => set({ currentFont }),

    isGrid: true,
    setIsGrid: (isGrid) => set({ isGrid }),

    isDarkMode: false,
    setIsDarkMode: (isDarkMode) => set({ isDarkMode }),

    addStroke: (stroke) => set((s) => ({ strokes: [...s.strokes, stroke] })),
    updateLastStroke: (points) => set((s) => {
        if (s.strokes.length === 0) return s
        const newStrokes = [...s.strokes]
        newStrokes[newStrokes.length - 1].points = points
        return { strokes: newStrokes }
    }),
    removeStroke: (id) => set((s) => ({ strokes: s.strokes.filter(st => st.id !== id) })),
    updateStrokes: (strokes) => set({ strokes }),

    addShape: (shape) => set((s) => ({ shapes: [...s.shapes, shape] })),
    updateLastShape: (w, h) => set((s) => {
        if (s.shapes.length === 0) return s
        const newShapes = [...s.shapes]
        newShapes[newShapes.length - 1] = { ...newShapes[newShapes.length - 1], w, h }
        return { shapes: newShapes }
    }),
    removeShape: (id) => set((s) => ({ shapes: s.shapes.filter(sh => sh.id !== id) })),

    addTextBox: (tb) => set((s) => ({ textBoxes: [...s.textBoxes, tb] })),
    updateTextBox: (id, partial) => set((s) => ({
        textBoxes: s.textBoxes.map(tb => tb.id === id ? { ...tb, ...partial } : tb)
    })),
    removeTextBox: (id) => set((s) => ({ textBoxes: s.textBoxes.filter(tb => tb.id !== id) })),

    addGraph: (graph) => set((s) => ({ graphs: [...s.graphs, graph] })),
    updateGraph: (id, partial) => set((s) => ({
        graphs: s.graphs.map(g => g.id === id ? { ...g, ...partial } : g)
    })),
    removeGraph: (id) => set((s) => ({ graphs: s.graphs.filter(g => g.id !== id) })),

    clearBoard: () => set({ strokes: [], shapes: [], textBoxes: [], graphs: [] }),
    
    loadState: (state) => set({
        strokes: state.strokes || [],
        shapes: state.shapes || [],
        textBoxes: state.textBoxes || [],
        graphs: state.graphs || []
    })
}))
