'use client'

import Bar from "./Bar";
import React from "react";
import Cell from "./Cell";

type RowProps = {
    row: number;
    bars: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: boolean;
    setMouseDown: (value: boolean) => void;
    dragMode: number
    setDragMode: (value: number) => void
    playbackIndex: number
    onSelect: (row: number, col: number, state: number) => void
    getNextState: (state: number) => number
    getColors: (row: number) => string[]
    chords: Array<number>
    getValue: (row: number, col: number, state: number) => string
    cellStates: Array<number>
    icons?: Array<React.ReactNode>
    controlColStates?: Array<number>
    setControlColStates?: React.Dispatch<React.SetStateAction<Array<number>>>
};

export default function Row({row, bars, beatsPerBar, notesPerBeat, mouseDown, setMouseDown, dragMode, setDragMode, playbackIndex, onSelect, getNextState, getColors, getValue, chords, cellStates, icons, controlColStates, setControlColStates}: RowProps) {

    return (
        <span className="flex w-screen grow">
            <Cell 
                row={row}
                edge="n"
                mouseDown={mouseDown}
                setMouseDown={setMouseDown}
                dragMode={dragMode}
                setDragMode={setDragMode}
                playbackIndex={playbackIndex}
                col={-1}
                onSelect={()=>{if(setControlColStates && controlColStates) setControlColStates([...controlColStates].map((x,i)=>{return i==row?(x+1)%2:x}))}}
                getNextState={(s)=> s==0?1:0}
                getColors={()=>['bg-red-200']}
                defaultColor='bg-blue-200'
                chord={-1}
                getValue={()=>''}
                cellState={controlColStates ? controlColStates[row] : 0}
                icons={icons}
            />
            {Array.from({length: bars}, (_, i) => (
                    <Bar
                        key={i}
                        bar={i}
                        row={row}
                        cellStates={cellStates}
                        beatsPerBar={beatsPerBar}
                        notesPerBeat={notesPerBeat}
                        mouseDown={mouseDown}
                        setMouseDown={setMouseDown}
                        dragMode={dragMode}
                        setDragMode={setDragMode}
                        playbackIndex={playbackIndex}
                        onSelect={onSelect}
                        getNextState={getNextState}
                        getColors={getColors}
                        getValue={getValue}
                        chords={chords}
                        icons={icons}
                    />
                ))
            }
        </span>
    );
}

