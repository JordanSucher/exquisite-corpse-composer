'use client'

import Cell from "./Cell";

type BeatProps = {
    notesPerBeat: number;
    bar: number
    row: number
    mouseDown: boolean
    setMouseDown: (value: boolean) => void
    dragMode: number
    setDragMode: (value: number) => void
    startingCol: number
    beat: number
    playbackIndex: number
    onSelect: (row: number, col: number, state: number) => void
    getNextState: (state: number) => number
    getColors: (row: number) => string[]
    chords: Array<number>
    getValue: (row: number, col: number, state: number) => string
    cellStates: Array<number>
    icons?: Array<React.ReactNode>
}

export default function Beat({notesPerBeat, bar, row, mouseDown, setMouseDown, dragMode, setDragMode, startingCol, beat, playbackIndex, onSelect, getNextState, getColors, getValue, chords, cellStates, icons}: BeatProps) {
    return (
        <>
            {Array.from({length: notesPerBeat}, (_, i) => (
                    <Cell 
                        key={i}
                        edge={i == 0 ? 'l' : i == notesPerBeat-1 ? 'r' : ''}
                        row={row}
                        mouseDown={mouseDown}
                        setMouseDown={setMouseDown}
                        dragMode={dragMode}
                        setDragMode={setDragMode}
                        col={startingCol + beat*notesPerBeat + i}
                        chord={chords && chords[startingCol + beat*notesPerBeat + i]}
                        playbackIndex={playbackIndex}
                        onSelect={onSelect}
                        getNextState={getNextState}
                        getColors={getColors}
                        getValue={getValue}
                        cellState={cellStates[startingCol + beat*notesPerBeat + i]}
                        icons={icons ? icons : undefined}
                        defaultColor={bar%2 == 0 ? 'bg-slate-200' : 'bg-white'}
                    />
                ))
            }
        </>

    );
}
