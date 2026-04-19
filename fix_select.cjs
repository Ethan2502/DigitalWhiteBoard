const fs = require('fs');
let code = fs.readFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/components/Board.tsx', 'utf8');

// 1. Add TextBoxes and Graphs to getHitEntity
const hitRepl = `        const radius = 10
        for (let i = s.textBoxes.length - 1; i >= 0; i--) {
            const tb = s.textBoxes[i]
            if (wx >= tb.x - radius && wx <= tb.x + tb.width + radius && wy >= tb.y - radius && wy <= tb.y + tb.height + radius) return tb.id
        }
        for (let i = s.graphs.length - 1; i >= 0; i--) {
            const g = s.graphs[i]
            if (wx >= g.x - radius && wx <= g.x + g.width + radius && wy >= g.y - radius && wy <= g.y + g.height + radius) return g.id
        }
        for (let i = s.shapes.length - 1; i >= 0; i--) {`;
code = code.replace(/const radius = 10\s*for \(let i = s\.shapes\.length - 1; i >= 0; i--\) \{/, hitRepl);

// 2. Add TextBoxes and Graphs to initialSelectState
const stateRepl = `setInitialSelectState({
                    strokes: JSON.parse(JSON.stringify(s.strokes.filter(st => selectedIds.includes(st.id) || st.id === hitId))),
                    shapes: JSON.parse(JSON.stringify(s.shapes.filter(sh => selectedIds.includes(sh.id) || sh.id === hitId))),
                    textBoxes: JSON.parse(JSON.stringify(s.textBoxes.filter(tb => selectedIds.includes(tb.id) || tb.id === hitId))),
                    graphs: JSON.parse(JSON.stringify(s.graphs.filter(g => selectedIds.includes(g.id) || g.id === hitId)))
                })`;
code = code.replace(/setInitialSelectState\(\{[\s\S]*?\}\)/, stateRepl);

// 3. Add TextBoxes and Graphs to new dragging loop
const dragRepl = `const newStrokes = s.strokes.map(st => {
                    if (selectedIds.includes(st.id)) {
                        const init = initialSelectState.strokes.find((i:any) => i.id === st.id)
                        if (init) {
                            return { ...st, points: init.points.map((p:any) => ({ x: p.x + dx, y: p.y + dy, pressure: p.pressure })) }
                        }
                    }
                    return st
                })
                const newTextBoxes = s.textBoxes.map(tb => {
                    if (selectedIds.includes(tb.id)) {
                        const init = initialSelectState.textBoxes.find((i:any) => i.id === tb.id)
                        if (init) return { ...tb, x: init.x + dx, y: init.y + dy }
                    }
                    return tb
                })
                const newGraphs = s.graphs.map(g => {
                    if (selectedIds.includes(g.id)) {
                        const init = initialSelectState.graphs.find((i:any) => i.id === g.id)
                        if (init) return { ...g, x: init.x + dx, y: init.y + dy }
                    }
                    return g
                })
                useBoardStore.setState({ shapes: newShapes, strokes: newStrokes, textBoxes: newTextBoxes, graphs: newGraphs })`;
code = code.replace(/const newStrokes = s\.strokes\.map\([\s\S]*?return st\n                \}\)\n                useBoardStore\.setState\(\{ shapes: newShapes, strokes: newStrokes \}\)/, dragRepl);

// 4. Add TextBoxes and Graphs to Selection Box inclusion
const selBoxRepl = `s.textBoxes.forEach(tb => {
                const cx = tb.x + tb.width/2, cy = tb.y + tb.height/2
                if (cx >= bx1 && cx <= bx2 && cy >= by1 && cy <= by2) selected.push(tb.id)
            })
            s.graphs.forEach(g => {
                const cx = g.x + g.width/2, cy = g.y + g.height/2
                if (cx >= bx1 && cx <= bx2 && cy >= by1 && cy <= by2) selected.push(g.id)
            })
            setSelectedIds(selected)`;
code = code.replace(/setSelectedIds\(selected\)/, selBoxRepl);

fs.writeFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/components/Board.tsx', code);
