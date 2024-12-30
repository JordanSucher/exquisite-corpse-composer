'use client'

import Bar from "./Bar";
import React from "react";
import Cell from "./Cell";

type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
}

type RowProps = {
    row: number;
    bars: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: React.RefObject<boolean>;
    dragMode: React.RefObject<number>;
    playbackIndex: number
    onSelect: (row: number, col: number, state: number) => void
    getNextState: (state: CellState) => CellState
    getColors: (row: number) => string[]
    chords: Array<number>
    getValue: (row: number, col: number, state: number) => string
    cellStates: Array<CellState>
    icons?: Array<React.ReactNode>
    controlColStates?: Array<CellState>
    setControlColStates?: React.Dispatch<React.SetStateAction<Array<CellState>>>
    instrumentNames?: Array<string>
    controlIcons?: Array<React.ReactNode>
};

export default function Row({row, bars, beatsPerBar, notesPerBeat, mouseDown, dragMode, playbackIndex, onSelect, getNextState, getColors, getValue, chords, cellStates, icons, controlColStates, setControlColStates, instrumentNames, controlIcons}: RowProps) {

    return (
        <span className="flex w-screen grow">
            <Cell 
                row={row}
                edge="n"
                mouseDown={mouseDown}
                dragMode={dragMode}
                playbackIndex={playbackIndex}
                col={-1}
                onSelect={()=>{if(setControlColStates && controlColStates) setControlColStates([...controlColStates].map((x,i)=>{
                    if (i==row && instrumentNames) {
                        return ({state: (x.state+1)%instrumentNames.length, hideLeftBorder: false, hideRightBorder: false})
                    } else {
                        return ({state: x.state, hideLeftBorder: false, hideRightBorder: false})
                    }
                }))}}
                getNextState={instrumentNames? (s)=> ({state: ((s.state+1)%instrumentNames.length), hideLeftBorder: false, hideRightBorder: false}) : (s)=>({state: s.state, hideLeftBorder: false, hideRightBorder: false})}
                getColors={()=>(['gray-900', 'gray-800', 'gray-700', 'gray-600', 'gray-500'])}
                defaultColor={'bg-black'}
                chord={-1}
                getValue={()=>''}
                cellState={controlColStates? controlColStates[row]: {state: 0, hideLeftBorder: false, hideRightBorder: false}}
                icons={controlIcons}
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
                        dragMode={dragMode}
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

