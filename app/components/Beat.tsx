'use client'

import Cell from "./Cell";

type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
}
type BeatProps = {
    notesPerBeat: number;
    bar: number
    row: number
    mouseDown: React.RefObject<boolean>
    dragMode: React.RefObject<number>
    startingCol: number
    beat: number
    playbackIndex: number
    onSelect: (row: number, col: number, state: number) => void
    getNextState: (state: CellState) => CellState
    getColors: (row: number) => string[]
    chords: Array<number>
    getValue: (row: number, col: number, state: number) => string
    cellStates: Array<CellState>
    icons?: Array<React.ReactNode>
}

export default function Beat({notesPerBeat, bar, row, mouseDown, dragMode, startingCol, beat, playbackIndex, onSelect, getNextState, getColors, getValue, chords, cellStates, icons}: BeatProps) {
    return (
        <>
            {Array.from({length: notesPerBeat}, (_, i) => (
                    <Cell 
                        key={i}
                        edge={i == 0 ? 'l' : i == notesPerBeat-1 ? 'r' : ''}
                        row={row}
                        mouseDown={mouseDown}
                        dragMode={dragMode}
                        col={startingCol + beat*notesPerBeat + i}
                        chord={chords && chords[startingCol + beat*notesPerBeat + i]}
                        playbackIndex={playbackIndex}
                        onSelect={onSelect}
                        getNextState={getNextState}
                        getColors={getColors}
                        getValue={getValue}
                        cellState={cellStates[startingCol + beat*notesPerBeat + i]}
                        icons={icons ? icons : undefined}
                        defaultColor={bar%2 == 0 ? 'slate-200' : 'white'}
                    />
                ))
            }
        </>

    );
}
