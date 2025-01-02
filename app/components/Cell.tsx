'use client'

import React, { useState, useEffect} from "react";
// import { StarIcon } from "lucide-react";

type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
}
type CellProps = {
    row: number
    edge: string
    mouseDown: React.RefObject<boolean>
    dragMode: React.RefObject<number>
    col: number
    playbackIndex: number
    onSelect: (row: number, col: number, state: number) => void
    getNextState: (state: CellState) => CellState
    getColors: (row: number) => string[]
    chord: number
    getValue: (row: number, col: number, state: number) => string
    cellState: CellState
    icons?: Array<React.ReactNode>
    defaultColor?: string
}

export default function Cell({defaultColor, row, edge, mouseDown, dragMode, col, playbackIndex, onSelect, getNextState, getColors, getValue, chord, cellState, icons}: CellProps) {
    const [fillColors, setFillColors] = useState([defaultColor, defaultColor])
    const borderColors = [edge == 'l' ? 'border-l-blue-600' : '', edge == 'r' ? 'border-r-blue-600' : '']
    const [value, setValue] = useState('')

    useEffect(() => {
        if (getColors) setFillColors([defaultColor, ...getColors(row)])
    }, [getColors, row, defaultColor, cellState])

    const onMouseDown = () => {
        mouseDown.current = true
        const nextState = getNextState(cellState)
        onSelect(row, col, nextState.state)
        dragMode.current = nextState.state
    }

    const onMouseOver = () => {
        if (mouseDown.current) {
            onSelect(row, col, dragMode.current)
        }
    }

    useEffect(() => {
        if(getValue) setValue(getValue(row, col, cellState.state))
    }, [getValue, cellState, row, col, chord])
    
    return (
        <div 
            className={`
                ${icons ? '' : `bg-${fillColors[cellState.state]}`}
                grow
                basis-0
                text-black
                min-w-[25px] 
                min-h-[25px] 
                border-[1.2px] 
                border-blue-300
                ${playbackIndex == col ? 'opacity-85' : ''}
                ${borderColors[0]}
                ${borderColors[1]}
                ${cellState.hideLeftBorder && cellState.state > 0 ? `border-l-${fillColors[cellState.state]}` : ''}
                ${cellState.hideRightBorder && cellState.state > 0 ? `border-r-${fillColors[cellState.state]}` : ''}
                border-dotted
                select-none
                flex items-center justify-center`}
            onMouseDown={onMouseDown}
            onDragStart={(e) => e.preventDefault()}
            onMouseUp={() => {
                mouseDown.current = false
                dragMode.current = 0
            }}
            onMouseOver={onMouseOver}   
        >
            {icons ? 
            icons[cellState.state]
            :  
            <span 
                className={`p-0 m-0 absolute ${value}`}>
            </span>}
        </div>
    );
}
