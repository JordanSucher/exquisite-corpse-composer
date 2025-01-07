'use client'

import Row from "./Row";
import React, { useCallback, useMemo } from "react";
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
    notesComplex: Array<Array<Array<number>>>
    instrumentIcons: Array<React.ReactNode>
    startingColIndex: number
    soloMode: boolean
    readOnlyBars: Array<number>
    playbackUIRef: React.RefObject<HTMLDivElement> | React.RefObject<null>};

export default function TonalSequence({octaves, bars, beatsPerBar, notesPerBeat, mouseDown, dragMode, playbackIndex, getNotes, chords, cellStates, setCellStates, instrumentCellStates, setInstrumentCellStates, setNotesComplex, notesComplex, instrumentNames, instrumentRefs, instrumentIcons, startingColIndex, soloMode, readOnlyBars, playbackUIRef}: TonalSequenceProps) {
    const rows = useMemo(() => octaves*7, [octaves])
    const cols = useMemo(() => bars*beatsPerBar*notesPerBeat, [bars, beatsPerBar, notesPerBeat])
    
    const getColors = useCallback(
        (row: number) => {
        const colors = ['red-400', 'green-400', 'blue-400', 'yellow-400', 'orange-400', 'purple-400', 'pink-400']
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
    
    const onSelect = useCallback ((row: number, col: number, state: number) => {
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
                //calculate all state changes first
                const newNotesComplex = [...notesComplex]
                const newCellStates = [...cellStates] 

                if(!newNotesComplex[row].map((rowGroup)=>rowGroup.includes(col)).includes(true)) {
                    triggerNote()
                    let adjacentCol = false

                    if(dragMode.current > 0) {
                        const adjacentCols = [col-1, col+1].filter((adjCol) => adjCol >= 0 && adjCol < cols)

                        adjacentCols.forEach((adjCol) => {
                            newNotesComplex[row] = newNotesComplex[row].map((rowGroup) => {
                                if(rowGroup.includes(adjCol)) {
                                    // console.log("adjacent group", rowGroup)
                                    const newGroup = [...rowGroup, col].sort((a, b) => a - b)
                                    adjacentCol = true

                                    newGroup.forEach((col) => {
                                        newCellStates[row][col] = {
                                            state: 1, 
                                            hideLeftBorder: true, 
                                            hideRightBorder: true}
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
                        newNotesComplex[row].push([col])
                        newCellStates[row][col].state = 1
                    }

                    setNotesComplex(newNotesComplex)
                    setCellStates(newCellStates)
                }
            } else {
                const newNotesComplex = [...notesComplex]
                const newCellStates = [...cellStates] 

                const rowGroup = newNotesComplex[row].find((group) => group.includes(col))

                newNotesComplex[row] = newNotesComplex[row].filter((group) => group != rowGroup)

                if (rowGroup && rowGroup.length > 1) {
                    if (rowGroup[0] == col) {
                        rowGroup.shift()
                        newNotesComplex[row].push(rowGroup)
                    }
                    else if (rowGroup[rowGroup.length-1] == col) {
                        rowGroup.pop()
                        newNotesComplex[row].push(rowGroup)
                    }
                    else {
                        const index = rowGroup.indexOf(col)
                        const newGroup1 = rowGroup.slice(0, index)
                        const newGroup2 = rowGroup.slice(index+1)
                        newNotesComplex[row].push(newGroup1)
                        newNotesComplex[row].push(newGroup2)
                    }
                }

                newCellStates[row][col] = {state: 0, hideLeftBorder: false, hideRightBorder: false}

                setNotesComplex(newNotesComplex)
                setCellStates(newCellStates)

            }
        }, [instrumentNames, instrumentCellStates, instrumentRefs, getNotes, setCellStates, setNotesComplex, dragMode, cellStates, notesComplex, cols])
    
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
                        togglePlaybackIndexOpacity={true}
                        zIndex={0}
                        startingColIndex={startingColIndex}
                        soloMode = {soloMode}
                        readOnlyBars={readOnlyBars}
                        playbackUIRef={playbackUIRef}
                    />
                ))
            }
        </>
    );
}
