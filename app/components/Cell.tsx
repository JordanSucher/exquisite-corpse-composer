'use client'

import React, { useState, useEffect} from "react";
import { StarIcon } from "lucide-react";

type CellProps = {
    row: number
    edge: string
    mouseDown: boolean
    setMouseDown: (value: boolean) => void
    dragMode: number
    setDragMode: (value: number) => void
    col: number
    playbackIndex: number
    onSelect: (row: number, col: number, state: number) => void
    getNextState: (state: number) => number
    getColors: (row: number) => string[]
    chord: number
    getValue: (row: number, col: number, state: number) => string
    cellState: number
    icons?: Array<React.ReactNode>
    defaultColor?: string
}

export default function Cell({defaultColor, row, edge, mouseDown, setMouseDown, dragMode, setDragMode, col, playbackIndex, onSelect, getNextState, getColors, getValue, chord, cellState, icons}: CellProps) {
    const [fillColors, setFillColors] = useState([defaultColor, defaultColor])
    const borderColors = [edge == 'l' ? 'border-l-blue-800' : '', edge == 'r' ? 'border-r-blue-800' : '']
    const [value, setValue] = useState('')

    useEffect(() => {
        if (getColors) setFillColors([defaultColor, ...getColors(row)])
    }, [getColors, row, defaultColor, cellState])



    const onMouseDown = () => {
        setDragMode(getNextState(cellState))
        onSelect(row, col, getNextState(cellState))
        setMouseDown(true)
    }

    const onMouseOver = () => {
        if (mouseDown) {
            onSelect(row, col, dragMode)
        }
    }

    useEffect(() => {
        if(getValue) setValue(getValue(row, col, cellState))
    }, [getValue, cellState, row, col, chord])
    

    return (
        <div 
            className={`
                ${icons ? '' : fillColors[cellState]} 
                grow
                text-black
                min-w-[30px] 
                min-h-[30px] 
                border-[0.5px] 
                border-blue-300
                border-dotted 
                ${playbackIndex == col ? 'opacity-85' : ''}
                ${borderColors[0]}
                ${borderColors[1]}
                select-none
                flex items-center justify-center`}
            onMouseDown={onMouseDown}
            onDragStart={(e) => e.preventDefault()}
            onMouseUp={() => setMouseDown(false)}
            onMouseOver={onMouseOver}   
        >
            {icons && col!== -1 ? 
            icons[cellState]
            :  
            icons && col==-1 ?
            <StarIcon size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-black " />
            :
            <span 
                className="p-0 m-0 absolute">
                {/* {value} */}
            </span>}
        </div>
    );
}
