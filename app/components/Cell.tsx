'use client'

import React, { useState, useEffect, useMemo, useCallback} from "react";
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
    togglePlaybackIndexOpacity?: boolean
    zIndex?: number
    startingColIndex: number
    readOnly?: boolean
    playbackUIRef: React.RefObject<HTMLDivElement> | React.RefObject<null>}

export default function Cell({defaultColor, row, edge, mouseDown, dragMode, col, playbackIndex, onSelect, getNextState, getColors, getValue, chord, cellState, icons, togglePlaybackIndexOpacity, zIndex, readOnly = false, playbackUIRef}: CellProps) {
    // const [fillColors, setFillColors] = useState([defaultColor, defaultColor])
    const fillColors = useMemo(()=> getColors ? [defaultColor, ...getColors(row)] : [defaultColor, defaultColor], [defaultColor, getColors, row])

    const borderColors = [edge == 'l' ? 'border-l-blue-600' : '', edge == 'r' ? 'border-r-blue-600' : '']
    const [value, setValue] = useState('')

    // useEffect(() => {
    //     if (getColors && cellState) setFillColors([defaultColor, ...getColors(row)])
    // }, [getColors, row, defaultColor, cellState])

    const onMouseDown = () => {
        if (readOnly) return
        mouseDown.current = true
        const nextState = getNextState(cellState)
        onSelect(row, col, nextState.state)
        dragMode.current = nextState.state
    }

    const onMouseOver = useCallback(() => {
        if (readOnly) return
        if (mouseDown.current) {
            onSelect(row, col, dragMode.current)
        }
    }, [mouseDown, onSelect, row, col, dragMode, readOnly])

    useEffect(() => {
        if (getValue && cellState) setValue(getValue(row, col, cellState.state))
    }, [getValue, cellState, row, col, chord])


    return (
        <div
            ref = {col == playbackIndex && row == -1 ? playbackUIRef : null}
            className={`
                grow
                text-black
                min-w-[35px] 
                min-h-[35px] 
                border-[1.2px] 
                border-blue-300
                ${playbackIndex == col && togglePlaybackIndexOpacity ? 'opacity-70' : ''}
                ${cellState && cellState.state > 0 ? `bg-${fillColors[cellState.state]}` 
                    : playbackIndex == col && cellState.state == 0 ? 'bg-rose-100' : `bg-${defaultColor}`}
                ${borderColors[0]}
                ${borderColors[1]}
                ${cellState && cellState.hideLeftBorder && cellState.state > 0 ? `border-l-${fillColors[cellState.state]}` : ''}
                ${cellState && cellState.hideRightBorder && cellState.state > 0 ? `border-r-${fillColors[cellState.state]}` : ''}
                border-dotted
                select-none
                ${row==-1 && col ==-1 ? `border-none` : ''}
                ${readOnly ? 'cursor-default' : 'cursor-pointer'}
                ${readOnly ? 'opacity-90' : ''}
                
                flex items-center justify-center
                z-${zIndex}`}
            onMouseDown={onMouseDown}
            onDragStart={(e) => e.preventDefault()}
            onMouseUp={() => {
                mouseDown.current = false
                dragMode.current = 0
            }}
            onMouseOver={onMouseOver}  
        >
            {icons && cellState ? 
            icons[cellState.state]
            :  
            <span 
                className={`p-0 m-0 absolute ${value}`}>
                {/* {col} */}
                {readOnly ? '🔒' : ''}
            </span>}
        </div>
    );
}

