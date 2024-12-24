'use client'

import { useState, useEffect } from "react";
import * as Tone from 'tone'

type CellProps = {
    bar: number
    row: number
    edge: string
    mouseDown: boolean
    setMouseDown: (value: boolean) => void
    dragMode: boolean
    setDragMode: (value: boolean) => void
    col: number
    setNotes: React.Dispatch<React.SetStateAction<Array<Array<string>>>>
    playbackIndex: number
    synth: React.RefObject<Tone.Synth | null>
}

export default function Cell({bar, row, edge, mouseDown, setMouseDown, dragMode, setDragMode, col, setNotes, playbackIndex, synth}: CellProps) {
    const defaultColor = bar%2 == 0 ? 'bg-slate-200' : 'bg-white'
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500']
    const fillColor = colors[row%7]
    const borderColors = [edge == 'l' ? 'border-l-blue-700' : '', edge == 'r' ? 'border-r-blue-700' : '']
    const [selected, setSelected] = useState(false)

    const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6', 'E6', 'F6', 'G6', 'A6', 'B6', 'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7', 'C8']
    const note = notes[row]

    const onMouseDown = () => {
        setDragMode(!selected)
        setSelected(!selected)
        setMouseDown(true)
    }

    const onMouseOver = () => {
        if (mouseDown) {
            setSelected(dragMode)
        }
    }

    
    useEffect(() => {
        const triggerNote = () => {
            synth.current.triggerAttackRelease(note, '8n')
        }
        if (selected) {
            setNotes((prevNotes) => {
                const newNotes = [...prevNotes]
                if(!newNotes[col].includes(note)) {
                    newNotes[col].push(note)
                }
                return newNotes
            })

            triggerNote()
        } else {
            setNotes((prevNotes) => {
                const newNotes = [...prevNotes]
                newNotes[col] = newNotes[col].filter((n) => n != note)
                return newNotes
            })
        }

    }, [selected, note, col, setNotes, synth])

    return (
        <div 
            className={
                `${selected ? fillColor : defaultColor} 
                border-[0.5px] 
                min-w-[30px] 
                grow min-h-[30px] 
                border-blue-300 
                ${playbackIndex == col ? 'opacity-85' : ''}
                ${borderColors[0]}
                ${borderColors[1]}`}
            onMouseDown={onMouseDown}
            onDragStart={(e) => e.preventDefault()}
            onMouseUp={() => setMouseDown(false)}
            onMouseOver={onMouseOver}   
        >
        </div>
    );
}
