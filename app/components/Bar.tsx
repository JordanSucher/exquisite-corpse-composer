'use client'

import React from "react";
import Beat from "./Beat";

type BarProps = {
    row: number;
    bar: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: boolean;
    setMouseDown: (value: boolean) => void
    dragMode: number;
    setDragMode: (value: number) => void
    playbackIndex: number
    onSelect: (row: number, col: number, state: number) => void
    getNextState: (state: number) => number
    getColors: (row: number) => string[]
    chords: Array<number>
    getValue: (row: number, col: number, state: number) => string
    cellStates: Array<number>
    icons?: Array<React.ReactNode>
};


export default function Bar({row, bar, beatsPerBar, notesPerBeat, mouseDown, setMouseDown, dragMode, setDragMode, playbackIndex, onSelect, getNextState, getColors, getValue, chords, cellStates, icons}: BarProps) {
    const startingCol = bar*beatsPerBar*notesPerBeat

    return (
        <>
            {Array.from({length: beatsPerBar}, (_, i) => (
                    <Beat 
                        key={i}
                        beat={i}
                        row={row}
                        bar={bar}
                        cellStates={cellStates}
                        notesPerBeat={notesPerBeat}
                        mouseDown={mouseDown}
                        setMouseDown={setMouseDown}
                        dragMode={dragMode}
                        setDragMode={setDragMode}
                        startingCol={startingCol}
                        playbackIndex={playbackIndex}
                        onSelect={onSelect}
                        getNextState={getNextState}
                        getColors={getColors}
                        chords={chords}
                        getValue={getValue}
                        icons={icons}
                    />
                ))
            }
        </>
    );
}
