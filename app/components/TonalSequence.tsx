'use client'

import Row from "./Row";
import React, { useCallback } from "react";
import * as Tone from 'tone'

type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
}

type TonalSequenceProps = {
    octaves: number;
    bars: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: React.RefObject<boolean>;
    dragMode: React.RefObject<number>;
    playbackIndex: number
    instrumentNames: Array<string>
    instrumentRefs: React.RefObject<Record<string, Tone.Sampler>>
    getNotes: (row: number, col: number) => Array<string>
    chords: Array<number>
    cellStates: Array<Array<CellState>>
    setCellStates: React.Dispatch<React.SetStateAction<Array<Array<CellState>>>>
    instrumentCellStates: Array<CellState>
    setInstrumentCellStates: React.Dispatch<React.SetStateAction<Array<CellState>>>
    setNotesComplex: React.Dispatch<React.SetStateAction<Array<Array<Array<number>>>>>
    instrumentIcons: Array<React.ReactNode>
};

export default function TonalSequence({octaves, bars, beatsPerBar, notesPerBeat, mouseDown, dragMode, playbackIndex, getNotes, chords, cellStates, setCellStates, instrumentCellStates, setInstrumentCellStates, setNotesComplex, instrumentNames, instrumentRefs, instrumentIcons}: TonalSequenceProps) {
    const rows = octaves*7
    
    const getColors = useCallback(
        (row: number) => {
        const colors = ['red-500', 'green-500', 'blue-500', 'yellow-500', 'orange-500', 'purple-500', 'pink-500']
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
    
    const getNextState = (state: CellState) => {
        const newState = state.state == 0 ? 1 : 0
        return {...state, state: newState}
    }
    
    const onSelect = useCallback (
        (row: number, col: number, state: number) => {
            const notes = getNotes(row, col)
            const note = notes[row]        
            
            const triggerNote = () => {
                if (!instrumentRefs.current) return
                const instrumentIndex: number = instrumentCellStates[row].state
                const instrumentName: string = instrumentNames[instrumentIndex]
                const instrument = instrumentRefs.current[instrumentName]
                instrument.triggerAttackRelease(note, '8n')
            }
        
            if (state == 1) {
                setNotesComplex((prevNotes) => {
                    const newNotes = [...prevNotes]

                    if(!newNotes[row].map((rowGroup)=>rowGroup.includes(col)).includes(true)) {

                        //play note
                        triggerNote()
                        let adjacentCol = false

                        if(dragMode.current > 0) {
                            //if row is selected on adjacent column
                            const adjacentCols = [col-1, col+1].filter((adjCol) => adjCol >= 0 && adjCol < bars*beatsPerBar*notesPerBeat)

                            adjacentCols.forEach((adjCol) => {
                                newNotes[row] = newNotes[row].map((rowGroup) => {
                                    if(rowGroup.includes(adjCol)) {
                                        // console.log("adjacent group", rowGroup)
                                        const newGroup = [...rowGroup, col].sort((a, b) => a - b)
                                        adjacentCol = true
                                        setCellStates((prevStates) => {
                                            const newStates = [...prevStates]
                                            newGroup.forEach((col) => {
                                                newStates[row][col] = {state: 1, hideLeftBorder: true, hideRightBorder: true}
                                            })
                                            return newStates
                                        })
                                        return newGroup
                                    }
                                    else {
                                        return rowGroup
                                    }
                                })
                            })
                        }

                        if(!adjacentCol) {
                            newNotes[row].push([col])
                        
                            setCellStates((prevStates) => {
                                const newStates = [...prevStates]
                                newStates[row][col].state = 1
                                return newStates
                            })
                        }
                       
                    }
                    // console.log("newNotes", newNotes)
                    return newNotes
                })

            } else {
                setNotesComplex((prevNotes) => {
                    const newNotes = [...prevNotes]
                    const rowGroup = newNotes[row].find((group) => group.includes(col))
                    newNotes[row] = newNotes[row].filter((group) => group != rowGroup)

                    if (rowGroup && rowGroup.length == 1) {
                        
                    }
                    else if (rowGroup && rowGroup[0] == col) {
                        rowGroup.shift()
                        newNotes[row].push(rowGroup)
                    }
                    else if (rowGroup && rowGroup[rowGroup.length-1] == col) {
                        rowGroup.pop()
                        newNotes[row].push(rowGroup)
                    }
                    else if (rowGroup) {
                        const index = rowGroup.indexOf(col)
                        const newGroup1 = rowGroup.slice(0, index)
                        const newGroup2 = rowGroup.slice(index+1)
                        newNotes[row].push(newGroup1)
                        newNotes[row].push(newGroup2)
                    }

                    return newNotes
                })

                setCellStates((prevStates) => {
                    const newStates = [...prevStates]
                    newStates[row][col] = {state: 0, hideLeftBorder: false, hideRightBorder: false}
                    return newStates
                })
            }
        }, [instrumentNames, instrumentCellStates, instrumentRefs, getNotes, setCellStates, setNotesComplex, bars, beatsPerBar, notesPerBeat, dragMode]
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
                        dragMode={dragMode}
                        playbackIndex={playbackIndex}
                        onSelect={onSelect}
                        getNextState={getNextState}
                        getColors={getColors}
                        chords={chords}
                        getValue={getValue}
                        controlColStates={instrumentCellStates}
                        setControlColStates={setInstrumentCellStates}
                        instrumentNames={instrumentNames}
                        controlIcons={instrumentIcons}
                    />
                ))
            }
        </>
    );
}
