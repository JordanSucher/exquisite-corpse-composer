'use client';

import TonalSequence from "./TonalSequence";
import ChordSelector from "./ChordSelector";
import RhythmSequence from "./RhythmSequence";
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
import { Bug, BugIcon, Candy, CarIcon, Dog, GemIcon, Milk, Moon, PinIcon } from "lucide-react";


type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
}

export default function Sequencer() {
    const synth = useRef<Tone.PolySynth | Tone.PluckSynth | null>(null);
    const instrumentRefs = useRef({});
    const drumRefs = useRef<{ [key: string]: Tone.Sampler }>({});
    const [bpm, setBpm] = useState(150)
    const [octaves] = useState(2);
    const [bars, setBars] = useState(4);
    const [beatsPerBar] = useState(4);
    const [notesPerBeat] = useState(3);
    const mouseDown = useRef(false)
    const dragMode = useRef(0)
    const [keyDown, setKeyDown] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [playbackIndex, setPlaybackIndex] = useState(0)
    const [cols, setCols] = useState(bars*beatsPerBar*notesPerBeat)
    const [notes, setNotes] = useState<Array<Array<Array<string|number>>>>(Array.from({length: cols}, () => []))
    const [drums, setDrums] = useState<Array<Array<Array<string|number>>>>(Array.from({length: cols}, () => []))
    const [notesComplex, setNotesComplex] = useState<Array<Array<Array<number>>>>(Array.from({length: octaves*7}, () => []))
    const [noteCellStates, setNoteCellStates] = useState<Array<Array<CellState>>>(Array.from({length: octaves*7}, () => Array.from({length: cols}, () => ({state: 0, hideLeftBorder: false, hideRightBorder: false}))))
    const [rhythmCellStates, setRhythmCellStates] = useState<Array<Array<CellState>>>(Array.from({length: 3}, () => Array.from({length: cols}, () => ({state: 0, hideLeftBorder: false, hideRightBorder: false}))))
    const [instrumentCellStates, setInstrumentCellStates] = useState<Array<CellState>>(Array.from({length: octaves*7}, ()=> ({state: 0, hideLeftBorder: false, hideRightBorder: false})))
    const [drumkitCellStates, setDrumkitCellStates] = useState<Array<CellState>>(Array.from({length: 3}, ()=> ({state: 0, hideLeftBorder: false, hideRightBorder: false})))
    const [chordCellStates, setChordCellStates] = useState<Array<CellState>>(Array.from({length: cols}, () => ({state: 0, hideLeftBorder: false, hideRightBorder: false})))
    const [chords, setChords] = useState<Array<number>>(Array.from({length: cols}, () => 1))
    const searchParams = useSearchParams()
    const instrumentNames = useMemo(() => ["piano", "harmonium", "guitar-acoustic", "cello", "xylophone"], [])
    const drumNames = useMemo(()=> ["4OP", "KPR", "Kit8", "Breakbeat"], [])

    const instrumentIcons = [
            <Dog key={0} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
            <Moon key={1} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
            <Milk key={3} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
            <Candy key={4} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
            <Bug key={5} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        ]

    const drumIcons = [
            <PinIcon key={0} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
            <GemIcon key={1} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
            <BugIcon key={3} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
            <CarIcon key={4} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
    ]

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
            id: existingId,
            instruments: instrumentCellStates,
            kits: drumkitCellStates,
            drums: rhythmCellStates
        }
        const id = await songStorage.save(song)
        if (id) {
            redirect(`/?id=${id}`)
        }
    }

    useEffect(() => {
        setCols(bars*beatsPerBar*notesPerBeat)
    }, [bars, beatsPerBar, notesPerBeat])

    useEffect (() => {
        const retrieveSong = async (songId: string) => {
            const song = await songStorage.load(songId);
            if (song) {
                // load song
                console.log("song", song)
                setNotesComplex(song.notes)
                setChords(song.chords) 
                setChordCellStates(song.chords.map((x: number) => ({state: x-1, hideLeftBorder: false, hideRightBorder: false})))
                setInstrumentCellStates(song.instruments)
                const newNoteCellStates = Array.from({length: octaves*7}, () => Array.from({length: cols}, () => ({state: 0, hideLeftBorder: false, hideRightBorder: false})))

                song.notes.forEach((row: number[][], rowIndex: number) => {
                    row.forEach((rowGroup) => {
                        rowGroup.forEach((colIndex: number) => {
                            newNoteCellStates[rowIndex][colIndex].state = 1
                        })
                    })
                })

                setNoteCellStates(newNoteCellStates)

                setDrumkitCellStates(song.kits)
                setRhythmCellStates(song.drums)

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

            //load the drums
            drumNames.forEach((drumkit) => {
                drumRefs.current[drumkit] = new Tone.Sampler ({
                    'C1': 'kick.mp3',
                    'D1': 'snare.mp3',
                    'E1': 'hihat.mp3',
                }, {
                    baseUrl: `/samples/${drumkit}/`,
                    onload: () => {
                        drumRefs.current[drumkit].connect(masterGain)
                    }
                })
            })


        }
        
        // Cleanup
        return () => {
            if (synth.current) {
                synth.current.dispose();
            }
        }
    }, [instrumentNames, instrumentRefs, drumNames, drumRefs]);

    const getNotes = useCallback(
        (row: number, col: number) => {
        const chord = chords[col]
        const rows = octaves*7
        const notes = MusicTheory.generateScale(chord, rows)
        return notes
    }, [octaves, chords]);

    const getRhythm = useCallback(
        (row: number) => {
            // const rhythmNames = ['kick', 'snare', 'hihat']
            const rhythmNames = ['C1', 'D1', 'E1']
            return rhythmNames[row]
        }, []
    )

    useEffect(() => {
        const notesByCol = Array.from({length: cols}, () => [] as number[][])

        notesComplex.forEach((row, rowIndex) => {
            row.forEach((rowGroup) => {
                // console.log("rowGroup", rowGroup)
                notesByCol[rowGroup[0]].push([rowIndex, rowGroup.length])
            })
        })

        const notesByColHydrated = notesByCol.map((columnNotes, columnIndex) => {
            const scaleNotes = getNotes(0, columnIndex)
            const result = columnNotes.map((noteDetails) => {
                const instrumentIndex = instrumentCellStates[noteDetails[0]].state
                const instrumentName = instrumentNames[instrumentIndex]
                return [instrumentName, scaleNotes[noteDetails[0]], noteDetails[1]]
            
            })
            return result
        })

        setNotes(notesByColHydrated)

    }, [notesComplex, cols, getNotes, instrumentCellStates, instrumentNames])

    useEffect(() => {
        const drumsByCol = Array.from({length: cols}, () => [] as [string, string, number][])

        rhythmCellStates.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell.state > 0) {
                    const drumIndex = drumkitCellStates[rowIndex].state
                    const drumName = drumNames[drumIndex]
                    const rhythmName = getRhythm(rowIndex)
                    
                    drumsByCol[colIndex].push([drumName, rhythmName, 1])
                }
            })
        })

        setDrums(drumsByCol)
    }, [rhythmCellStates, cols, getRhythm, drumkitCellStates, drumNames])
    
    return (
        <div className="flex h-screen w-screen flex-col outline-none grow justify-between" 
        onMouseUp={() => {
            mouseDown.current = false
            dragMode.current = 0
        }} 
        onMouseLeave={() => {
            mouseDown.current = false
            dragMode.current = 0
        }}
        onKeyDown={onKeyDown}
        onKeyUp={()=>setKeyDown(false)}
        tabIndex={0}
        >
            <div className="flex flex-col">
                <ChordSelector 
                    octaves={octaves}
                    bars={bars}
                    beatsPerBar={beatsPerBar}
                    notesPerBeat={notesPerBeat}
                    mouseDown={mouseDown}
                    playbackIndex={playbackIndex}
                    chords={chords}
                    setChords={setChords}
                    cellStates={chordCellStates}
                    setCellStates={setChordCellStates}
                />
            </div>
            <div className="flex flex-col grow overflow-auto">
                <TonalSequence 
                    octaves={octaves}
                    bars={bars}
                    beatsPerBar={beatsPerBar}
                    notesPerBeat={notesPerBeat}
                    mouseDown={mouseDown}
                    dragMode={dragMode}
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
                    instrumentIcons={instrumentIcons}
                />
                <RhythmSequence 
                    bars={bars}
                    beatsPerBar={beatsPerBar}
                    notesPerBeat={notesPerBeat}
                    mouseDown={mouseDown}
                    dragMode={dragMode}
                    playbackIndex={playbackIndex}
                    cellStates={rhythmCellStates}
                    setCellStates={setRhythmCellStates}
                    drumCellStates={drumkitCellStates}
                    setDrumCellStates={setDrumkitCellStates}
                    drumNames={drumNames}
                    drumIcons={drumIcons}
                    chords={chords}
                    getRhythm={getRhythm}
                    drumRefs={drumRefs}
                />
            </div>
            <Controller
                playing={playing}
                setPlaying={setPlaying}
                saveSong={saveSong}
                bpm={bpm}
                setBpm={setBpm}
                bars={bars}
                setBars={setBars}
            />
            <Audio
                bpm={bpm}
                notes={notes}
                drums={drums}
                isPlaying={playing}
                setIsPlaying={setPlaying}
                setPlaybackIndex={setPlaybackIndex}
                instrumentRefs={instrumentRefs}
                drumRefs={drumRefs}
                cols={cols}
            />
        </div>
    );
}
