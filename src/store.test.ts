import { describe, it, expect, beforeEach } from 'vitest'
import { useBoardStore } from './store'

describe('Board Store', () => {
    beforeEach(() => {
        useBoardStore.setState({
            strokes: [],
            textBoxes: [],
            graphs: [],
            shapes: [],
            currentTool: 'select',
            camera: { x: 0, y: 0, z: 1 }
        })
    })

    it('adds and removes strokes', () => {
        const store = useBoardStore.getState()
        store.addStroke({ id: '1', points: [{x:0, y:0}], color: 'black', size: 1, opacity: 100, isSketchy: false })
        expect(useBoardStore.getState().strokes.length).toBe(1)
        
        useBoardStore.getState().removeStroke('1')
        expect(useBoardStore.getState().strokes.length).toBe(0)
    })

    it('adds and updates textboxes', () => {
        const store = useBoardStore.getState()
        store.addTextBox({ id: 't1', x: 0, y: 0, width: 100, height: 100, text: '2+2', font: 'sans', size: 16, opacity: 100 })
        expect(useBoardStore.getState().textBoxes[0].text).toBe('2+2')

        useBoardStore.getState().updateTextBox('t1', { text: '4' })
        expect(useBoardStore.getState().textBoxes[0].text).toBe('4')
    })

    it('clears board', () => {
        const store = useBoardStore.getState()
        store.addStroke({ id: '1', points: [], color: '', size: 1, opacity: 1, isSketchy: false })
        store.addTextBox({ id: '2', x:0, y:0, width:0, height:0, text:'', font:'', size:1, opacity:1 })
        
        expect(useBoardStore.getState().strokes.length).toBe(1)
        
        useBoardStore.getState().clearBoard()
        expect(useBoardStore.getState().strokes.length).toBe(0)
        expect(useBoardStore.getState().textBoxes.length).toBe(0)
    })
})
