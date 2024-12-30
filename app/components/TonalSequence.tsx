'use client'

import Row from "./Row";
import React, { useState, useCallback } from "react";
import * as Tone from 'tone'

type TonalSequenceProps = {
    octaves: number;
    bars: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: boolean;
    setMouseDown: (value: boolean) => void;
    playbackIndex: number
    instrumentNames: Array<string>
    instrumentRefs: React.RefObject<Record<string, Tone.Sampler>>
    getNotes: (row: number, col: number) => Array<string>
    chords: Array<number>
    cellStates: Array<Array<number>>
    setCellStates: React.Dispatch<React.SetStateAction<Array<Array<number>>>>
    instrumentCellStates: Array<number>
    setInstrumentCellStates: React.Dispatch<React.SetStateAction<Array<number>>>
    setNotesComplex: React.Dispatch<React.SetStateAction<Array<Array<Array<number>>>>>
};

export default function TonalSequence({octaves, bars, beatsPerBar, notesPerBeat, mouseDown, setMouseDown, playbackIndex, getNotes, chords, cellStates, setCellStates, instrumentCellStates, setInstrumentCellStates, setNotesComplex, instrumentNames, instrumentRefs}: TonalSequenceProps) {
    const rows = octaves*7
    const [dragMode, setDragMode] = useState(0)
    
    const getColors = useCallback(
        (row: number) => {
        const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500']
        return [colors[row%7]]
    }, [])

    const getValue = useCallback(
        (
            /* eslint-disable-next-line @typescript-eslint/no-unused-vars */ 
            row: number, col: number, _state: number) => {
            const notes = getNotes(row, col)
            const note = notes[row]
            return note
    }, [getNotes])
    
    const getNextState = (state: number) => {
        return state == 0 ? 1 : 0
    }
    
    const onSelect = useCallback (
        (row: number, col: number, state: number) => {
            const notes = getNotes(row, col)
            const note = notes[row]        
            
            const triggerNote = () => {
                if (!instrumentRefs.current) return
                const instrumentIndex: number = instrumentCellStates[row]
                const instrumentName: string = instrumentNames[instrumentIndex]
                const instrument = instrumentRefs.current[instrumentName]
                instrument.triggerAttackRelease(note, '8n')
            }
        
            if (state == 1) {
                setNotesComplex((prevNotes) => {
                    console.log("setting notesComplex")
                    const newNotes = [...prevNotes]
                    if(!newNotes[row].map((rowGroup)=>rowGroup.includes(col)).includes(true)) {
                        newNotes[row].push([col])
                        triggerNote()
                        setCellStates((prevStates) => {
                            const newStates = [...prevStates]
                            newStates[row][col] = 1
                            return newStates
                        })
                    }
                    return newNotes
                })

            } else {
                setNotesComplex((prevNotes) => {
                    const newNotes = [...prevNotes]
                    newNotes[row] = newNotes[row].filter((group) => !group.includes(col))
                    return newNotes
                })

                setCellStates((prevStates) => {
                    const newStates = [...prevStates]
                    newStates[row][col] = 0
                    return newStates
                })
            }
        }, [instrumentNames, instrumentCellStates, instrumentRefs, getNotes, setCellStates, setNotesComplex]
    ) 
    
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
                        setMouseDown={setMouseDown} 
                        dragMode={dragMode}
                        setDragMode={setDragMode}
                        playbackIndex={playbackIndex}
                        onSelect={onSelect}
                        getNextState={getNextState}
                        getColors={getColors}
                        chords={chords}
                        getValue={getValue}
                        controlColStates={instrumentCellStates}
                        setControlColStates={setInstrumentCellStates}
                    />
                ))
            }
        </>
    );
}
