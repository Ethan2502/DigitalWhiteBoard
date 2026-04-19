import React, { useRef, useEffect, useState } from 'react'
import { useBoardStore } from '../store'
import type { TextBoxState } from '../store'
import { evaluate } from 'mathjs'
import 'mathlive'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        mathVirtualKeyboardPolicy?: string;
        inlineShortcuts?: any;
      };
    }
  }
}

export function TextBox({ tb }: { tb: TextBoxState }) {
    const { updateTextBox, camera } = useBoardStore()
    const mfRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 })

    useEffect(() => {
        const mf = mfRef.current
        if (!mf) return

        mf.value = tb.text

        // COMPLETELY DISABLE VIRTUAL KEYBOARD
        mf.mathVirtualKeyboardPolicy = "manual"
        const hideKb = () => window.mathVirtualKeyboard?.hide()
        mf.addEventListener('focus', hideKb)

        const stopPropagation = (e: Event) => e.stopPropagation()
        mf.addEventListener('keydown', stopPropagation)
        mf.addEventListener('keyup', stopPropagation)
        mf.addEventListener('keypress', stopPropagation)

        // Unified Shortcuts (Fractions/Exponents native, auto format Units)
        const units = ['atm', 'mol', 'g', 'L', 'mL', 'kg', 'J', 'kJ', 'K', 'Pa', 'kPa']
        const inlineShortcuts = { ...mf.inlineShortcuts }
        units.forEach(unit => {
            inlineShortcuts[unit] = `\\class{chem-unit}{\\text{${unit}}}`
        })
        mf.inlineShortcuts = inlineShortcuts

        const handleInput = () => {
            const val = mf.value
            updateTextBox(tb.id, { text: val })
            
            if (val.endsWith('=')) {
                tryEvaluate(val)
            }
        }

        const tryEvaluate = (latex: string) => {
            try {
                const expr = mf.getValue('ascii-math').replace(/=$/, '').trim()
                const cleanExpr = expr.replace(/text\((.*?)\)/g, '$1')
                const result = evaluate(cleanExpr)
                const resultStr = String(result)
                let latexResult = resultStr
                units.forEach(u => {
                    const regex = new RegExp(`\\b${u}\\b`, 'g')
                    latexResult = latexResult.replace(regex, `\\class{chem-unit}{\\text{${u}}}`)
                })
                mf.value = latex + ' ' + latexResult
                updateTextBox(tb.id, { text: mf.value })
            } catch (e) {
                console.error("Evaluation failed", e)
            }
        }

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const chemUnit = target.closest('.chem-unit');
            if (chemUnit) {
                chemUnit.classList.toggle('cancelled');
            }
        }

        mf.addEventListener('input', handleInput)
        mf.addEventListener('click', handleClick)

        return () => {
            mf.removeEventListener('input', handleInput)
            mf.removeEventListener('keydown', stopPropagation)
            mf.removeEventListener('keyup', stopPropagation)
            mf.removeEventListener('keypress', stopPropagation)
            mf.removeEventListener('focus', hideKb)
            mf.removeEventListener('click', handleClick)
        }
    }, [tb.id])

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.target !== containerRef.current) return // Only drag from the padding/border
        e.stopPropagation()
        setIsDragging(true)
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            startX: tb.x,
            startY: tb.y
        }
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return
        e.stopPropagation()
        const dx = (e.clientX - dragStart.current.x) / camera.z
        const dy = (e.clientY - dragStart.current.y) / camera.z
        updateTextBox(tb.id, {
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
            ref={containerRef}
            className="absolute shadow-sm hover:shadow-md transition-shadow group"
            style={{
                left: tb.x,
                top: tb.y,
                minWidth: '100px',
                minHeight: '40px',
                padding: '10px',
                backgroundColor: `rgba(var(--bg-rgb, 255, 255, 255), ${tb.opacity / 100})`,
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontFamily: tb.font,
                fontSize: `${Math.max(16, tb.size)}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                pointerEvents: 'all'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div className="absolute -top-3 -right-3 hidden group-hover:block cursor-pointer bg-red-500 text-white rounded-full w-6 h-6 text-center leading-5" onClick={() => useBoardStore.getState().removeTextBox(tb.id)}>×</div>
            <math-field 
                ref={mfRef} smart-mode="true" 
                style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    pointerEvents: 'auto',
                    cursor: 'text',
                    textAlign: 'center',
                    color: 'inherit',
                    '--core-font-family': tb.font
                } as any}
            />
        </div>
    )
}
