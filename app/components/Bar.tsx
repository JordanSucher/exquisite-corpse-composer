'use client'

import React from "react";
import Beat from "./Beat";

type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
}
type BarProps = {
    row: number;
    bar: number;
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
    togglePlaybackIndexOpacity?: boolean
    zIndex?: number
    startingColIndex: number
    readOnlyBars: Array<number>
    playbackUIRef: React.RefObject<HTMLDivElement> | React.RefObject<null>};


export default function Bar({row, bar, beatsPerBar, notesPerBeat, mouseDown, dragMode, playbackIndex, onSelect, getNextState, getColors, getValue, chords, cellStates, icons, togglePlaybackIndexOpacity, zIndex, startingColIndex, readOnlyBars, playbackUIRef}: BarProps) {
    const startingCol = bar*beatsPerBar*notesPerBeat
    // const endingCol = startingCol + beatsPerBar*notesPerBeat
    // const containsPlaybackIndex = playbackIndex >= startingCol && playbackIndex < endingCol

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
                        dragMode={dragMode}
                        startingCol={startingCol}
                        playbackIndex={playbackIndex}
                        onSelect={onSelect}
                        getNextState={getNextState}
                        getColors={getColors}
                        chords={chords}
                        getValue={getValue}
                        icons={icons}
                        togglePlaybackIndexOpacity={togglePlaybackIndexOpacity}
                        zIndex={zIndex}
                        startingColIndex={startingColIndex}
                        readOnly={readOnlyBars.includes(bar)}
                        playbackUIRef={playbackUIRef}
                    />
                ))
            }
        </>
    );
}
