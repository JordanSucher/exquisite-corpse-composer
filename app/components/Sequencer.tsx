'use client';

import TonalSequence from "./TonalSequence";
import ChordSelector from "./ChordSelector";
import Audio from "./Audio";
import Controller from "./Controller";
import { useState, useRef, useEffect, useCallback } from "react";
import * as Tone from 'tone'
import { songStorage } from "../utils/songStorage";
import { useSearchParams } from "next/navigation";
import { MusicTheory } from "../utils/musicTheory";
import { redirect } from "next/navigation";
import { SampleLibrary } from '../utils/Tonejs-instruments'
import { useMemo } from "react";

export default function Sequencer() {
    const synth = useRef<Tone.PolySynth | Tone.PluckSynth | null>(null);
    const instrumentRefs = useRef({});
    const [bpm, setBpm] = useState(100)
    const [octaves] = useState(2);
    const [bars] = useState(4);
    const [beatsPerBar] = useState(4);
    const [notesPerBeat] = useState(2);
    const [mouseDown, setMouseDown] = useState(false)
    const [keyDown, setKeyDown] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [playbackIndex, setPlaybackIndex] = useState(0)
    const cols = bars*beatsPerBar*notesPerBeat
    const [notes, setNotes] = useState<Array<Array<Array<string|number>>>>(Array.from({length: cols}, () => []))
    const [notesComplex, setNotesComplex] = useState<Array<Array<Array<number>>>>(Array.from({length: octaves*7}, () => []))
    const [noteCellStates, setNoteCellStates] = useState<Array<Array<number>>>(Array.from({length: octaves*7}, () => Array.from({length: cols}, () => 0)))
    const [instrumentCellStates, setInstrumentCellStates] = useState<Array<number>>(Array.from({length: octaves*7}, ()=>0))
    const [chordCellStates, setChordCellStates] = useState<Array<number>>(Array.from({length: cols}, () => 0))
    const [chords, setChords] = useState<Array<number>>(Array.from({length: cols}, () => 1))
    const searchParams = useSearchParams()
    const instrumentNames = useMemo(() => ["piano", "harmonium", "guitar-acoustic", "cello"], [])

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if ((e.key === ' ' || e.key === 'Space') && keyDown == false) {
            setPlaying(!playing)
            setKeyDown(true)
        }
    }

    const saveSong = async () => {
        const existingId = searchParams.get('id')
        const song = {
            notes: notesComplex,
            chords,
            bpm: bpm,
            id: existingId
        }
        const id = await songStorage.save(song)
        if (id) {
            redirect(`/?id=${id}`)
        }
    }

    useEffect (() => {
        const retrieveSong = async (songId: string) => {
            const song = await songStorage.load(songId);
            if (song) {
                // load song
                console.log("song", song)
                setNotesComplex(song.notes)
                setChords(song.chords) 
                setChordCellStates(song.chords.map((x: number) => x-1))
                const newNoteCellStates = Array.from({length: octaves*7}, () => Array.from({length: cols}, () => 0))

                song.notes.forEach((row: number[][], rowIndex: number) => {
                    row.forEach((rowGroup) => {
                        rowGroup.forEach((colIndex: number) => {
                            newNoteCellStates[rowIndex][colIndex] = 1
                        })
                    })
                })

                setNoteCellStates(newNoteCellStates)

                setBpm(song.bpm)
            }
        }
        const songId = searchParams.get('id')
        if (songId) {
            retrieveSong(songId)
        }
    }, [searchParams, cols, octaves])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const masterGain = new Tone.Gain(0.5).toDestination(); 
            const loadedInstruments = SampleLibrary.load({
                instruments: instrumentNames,
                onload: () => {
                    Object.values(loadedInstruments).forEach((instrument) => {
                        const sampler = instrument as Tone.Sampler
                        sampler.set({
                            attack: .1,
                            release: 1.5,
                        });
                        sampler.connect(masterGain);
                    })
                    instrumentRefs.current = loadedInstruments
                    synth.current = loadedInstruments["cello"]
                }
            })
        }
        
        // Cleanup
        return () => {
            if (synth.current) {
                synth.current.dispose();
            }
        }
    }, [instrumentNames]);

    const getNotes = useCallback(
        (row: number, col: number) => {
        const chord = chords[col]
        const rows = octaves*7
        const notes = MusicTheory.generateScale(chord, rows)
        return notes
    }, [octaves, chords]);

    useEffect(() => {
        const notesByCol = Array.from({length: cols}, () => [] as number[])

        notesComplex.forEach((row, rowIndex) => {
            row.forEach((rowGroup) => {
                rowGroup.forEach((colIndex) => {
                    notesByCol[colIndex].push(rowIndex)
                })
            })
        })

        const notesByColHydrated = notesByCol.map((columnNotes, columnIndex) => {
            const scaleNotes = getNotes(0, columnIndex)
            const result = columnNotes.map((rowIndex) => {
                const instrumentIndex = instrumentCellStates[rowIndex]
                const instrumentName = instrumentNames[instrumentIndex]
                return [instrumentName, scaleNotes[rowIndex]]
            
            })
            return result
        })

        setNotes(notesByColHydrated)

    }, [notesComplex, cols, getNotes, instrumentCellStates, instrumentNames])

    
    return (
            <div className="flex h-screen w-screen flex-col outline-none grow" 
            onMouseUp={() => setMouseDown(false)} 
            onMouseLeave={() => setMouseDown(false)}
            onKeyDown={onKeyDown}
            onKeyUp={()=>setKeyDown(false)}
            tabIndex={0}
            >
                <ChordSelector 
                    octaves={octaves}
                    bars={bars}
                    beatsPerBar={beatsPerBar}
                    notesPerBeat={notesPerBeat}
                    mouseDown={mouseDown}
                    setMouseDown={setMouseDown}
                    playbackIndex={playbackIndex}
                    chords={chords}
                    setChords={setChords}
                    cellStates={chordCellStates}
                    setCellStates={setChordCellStates}
                />
                <TonalSequence 
                    octaves={octaves}
                    bars={bars}
                    beatsPerBar={beatsPerBar}
                    notesPerBeat={notesPerBeat}
                    mouseDown={mouseDown}
                    setMouseDown={setMouseDown}
                    setNotesComplex={setNotesComplex}
                    playbackIndex={playbackIndex}
                    instrumentNames={instrumentNames}
                    instrumentRefs={instrumentRefs}
                    chords={chords}
                    getNotes={getNotes}
                    cellStates={noteCellStates}
                    setCellStates={setNoteCellStates}
                    instrumentCellStates={instrumentCellStates}
                    setInstrumentCellStates={setInstrumentCellStates}
                />
                <Controller
                    playing={playing}
                    setPlaying={setPlaying}
                    saveSong={saveSong}
                    bpm={bpm}
                    setBpm={setBpm}
                />
                <Audio
                    bpm={bpm}
                    notes={notes}
                    isPlaying={playing}
                    setIsPlaying={setPlaying}
                    setPlaybackIndex={setPlaybackIndex}
                    instrumentRefs={instrumentRefs}
                />
            </div>
    );
}
