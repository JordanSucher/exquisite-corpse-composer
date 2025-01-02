import Row from "./Row";
import * as Tone from "tone";
import React, { useCallback } from "react";

type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
}

type RhythmSequenceProps = {
    cellStates: Array<Array<CellState>>
    setCellStates: React.Dispatch<React.SetStateAction<Array<Array<CellState>>>>
    drumCellStates: Array<CellState>
    setDrumCellStates: React.Dispatch<React.SetStateAction<Array<CellState>>>
    bars: number
    beatsPerBar: number
    notesPerBeat: number
    mouseDown: React.RefObject<boolean>
    dragMode: React.RefObject<number>
    playbackIndex: number
    chords: Array<number>
    drumNames: Array<string>
    drumIcons: Array<React.ReactNode>
    drumRefs: React.RefObject<Record<string, Tone.Sampler>>
    getRhythm: (row: number) => string
    
}

export default function RhythmSequence({cellStates, setCellStates, drumCellStates, setDrumCellStates, bars, beatsPerBar, notesPerBeat, mouseDown, dragMode, playbackIndex, chords, drumNames, drumIcons, drumRefs, getRhythm}: RhythmSequenceProps) {

    const rows = 3

    const getColors = useCallback(
        (row: number) => {
        const colors = ['red-500', 'green-500', 'blue-500', 'yellow-500', 'orange-500', 'purple-500', 'pink-500']
        return [colors[row%7]]
    }, [])

    const getNextState = (state: CellState) => {
        const newState = state.state == 0 ? 1 : 0
        return {...state, state: newState}
    }

    const getValue = useCallback(
            (
                /* eslint-disable-next-line @typescript-eslint/no-unused-vars */ 
                row: number, col: number, _state: number) => {
                const drums = ['kick', 'snare', 'hihat']
                const val = drums[row]
                return val
        }, [])

    const onSelect = useCallback (
        (row: number, col: number, state: number) => {
            //trigger playback
            const triggerNote = () => {
                if (!drumRefs.current) return
                const drum = getRhythm(row)
                const drumIndex: number = drumCellStates[row].state
                const drumName: string = drumNames[drumIndex]
                const kit = drumRefs.current[drumName]
                kit.triggerAttackRelease(drum, '8n')
            }

            if (state == 1) {
                triggerNote()
            }

            // update cell state
            const newCellStates = [...cellStates]
            newCellStates[row][col].state = state
            setCellStates(newCellStates)

    }, [cellStates, setCellStates, drumCellStates, drumNames, drumRefs, getRhythm])


    return (
        <>
            {Array.from({length: rows}, (_, i) => (
                    <Row
                        key={i}
                        row={rows-i-1}
                        cellStates={cellStates[rows-i-1]}
                        bars={bars}
                        beatsPerBar={beatsPerBar}
                        notesPerBeat={notesPerBeat}
                        mouseDown={mouseDown}
                        dragMode={dragMode}
                        playbackIndex={playbackIndex}
                        onSelect={onSelect}
                        getNextState={getNextState}
                        getColors={getColors}
                        chords={chords}
                        getValue={getValue}
                        controlColStates={drumCellStates}
                        setControlColStates={setDrumCellStates}
                        instrumentNames={drumNames}
                        controlIcons={drumIcons}
                    />
                ))
            }
        </>
    )
}
