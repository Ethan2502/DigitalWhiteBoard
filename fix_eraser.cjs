const fs = require('fs');
let code = fs.readFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/components/Board.tsx', 'utf8');

code = code.replace(/const newStrokes: typeof strokes = \[\][\s\S]*?updateStrokes\(newStrokes\)/m, 
`            const newStrokes: typeof strokes = []
            let changed = false
            s.strokes.forEach(st => {
                let chunk: typeof currentPoints = []
                let wasSplit = false
                const chunks: (typeof currentPoints)[] = []
                
                st.points.forEach(p => {
                    if (Math.hypot(p.x - wx, p.y - wy) > radius + st.size) {
                        chunk.push(p)
                    } else {
                        wasSplit = true
                        if (chunk.length > 0) {
                            chunks.push(chunk)
                            chunk = []
                        }
                    }
                })
                if (chunk.length > 0) chunks.push(chunk)
                
                if (wasSplit) {
                    changed = true
                    chunks.forEach(c => {
                        newStrokes.push({ ...st, id: Math.random().toString(36), points: c })
                    })
                } else {
                    newStrokes.push(st)
                }
            })
            if (changed) s.updateStrokes(newStrokes)`);

fs.writeFileSync('/Users/ethan/Documents/DigitalWhiteBoard/src/components/Board.tsx', code);
