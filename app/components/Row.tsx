'use client'

import Bar from "./Bar";
import React, { useCallback, useEffect, useState } from "react";
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
    togglePlaybackIndexOpacity?: boolean
    zIndex?: number
    startingColIndex: number
    soloMode: boolean
    readOnlyBars: Array<number>
    playbackUIRef: React.RefObject<HTMLDivElement> | React.RefObject<null>};

export default function Row({row, bars, beatsPerBar, notesPerBeat, mouseDown, dragMode, playbackIndex, onSelect, getNextState, getColors, getValue, chords, cellStates, icons, controlColStates, setControlColStates, instrumentNames, controlIcons, togglePlaybackIndexOpacity, zIndex, startingColIndex, soloMode, readOnlyBars, playbackUIRef}: RowProps) {

    const getColors2 = useCallback(() => ['gray-900', 'gray-800', 'gray-700', 'gray-600', 'gray-500'], [])
    const getValue2 = useCallback(()=> "", [])
    const [totalMeasures, setTotalMeasures] = useState(chords.length / (beatsPerBar*notesPerBeat))
    const getNextState2 = useCallback((s: CellState)=> {
        if (instrumentNames) {
            return ({state: ((s.state+1)%instrumentNames.length), hideLeftBorder: false, hideRightBorder: false})
        }
        else {
            return ({state: s.state, hideLeftBorder: false, hideRightBorder: false})
        }
    }, [instrumentNames])
    
    useEffect(() => {
        const newTotalMeasures = chords.length /(beatsPerBar*notesPerBeat)
        setTotalMeasures(newTotalMeasures)
        // console.log("chords length", chords.length)
        // console.log("beats per bar", beatsPerBar)
        // console.log("notes per beat", notesPerBeat)
        // console.log("total measures", newTotalMeasures)
    }, [chords, bars, beatsPerBar, notesPerBeat])

    return (
        <span className="flex relative grow max-h-[-webkit-fill-available] w-full">
            <div className={`flex sticky left-0 bg-black basis-0 ${row == -1 ? `z-50` : 'z-10'}`}>
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
                    getNextState={getNextState2}
                    getColors={getColors2}
                    defaultColor={'bg-black'}
                    chord={-1}
                    getValue={getValue2}
                    cellState={controlColStates? controlColStates[row]: {state: 0, hideLeftBorder: false, hideRightBorder: false}}
                    icons={controlIcons}
                    zIndex={row == -1 ? 99 : 10}
                    startingColIndex={startingColIndex}
                    playbackUIRef={playbackUIRef}
                />
            </div>

            {Array.from({length: bars}, (_, i) => (
                    <Bar
                        key={i}
                        bar={soloMode ? i : totalMeasures-bars+i}
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
                        togglePlaybackIndexOpacity={togglePlaybackIndexOpacity}
                        zIndex={zIndex}
                        startingColIndex={startingColIndex}
                        readOnlyBars={readOnlyBars.map(bar=>totalMeasures-bars+bar)}
                        playbackUIRef={playbackUIRef}
                    />
                ))}

        </span>
    );
}

