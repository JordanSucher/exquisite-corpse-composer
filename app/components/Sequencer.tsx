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
import { emailSender } from "../utils/emailSending";


type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
}

type Player = {
    email: string;
    password: string;
}


type SongData = {
    notes: number[][][];
    chords: number[];
    bpm: number;
    id: string | null;
    instruments: CellState[];
    kits: CellState[];
    drums: CellState[][];
    numPlayers: number
    players: Player[]
    beatsPerBar: number
    notesPerBeat: number
    waitingOn: string | null
}

type SequencerProps = {
    currPlayer?: Player
    setShowTheSequencer?: (show: boolean) => void
    preloadedSong?: SongData
    soloMode?: boolean
    startingColIndex?: number
    initBars?: number
    changeBars?: boolean
    changeBeatsPerBar?: boolean
    changeNotesPerBeat?: boolean
    readOnlyBars?: Array<number>
}

export default function Sequencer({currPlayer, setShowTheSequencer, changeBars = false, changeBeatsPerBar = false, changeNotesPerBeat = false, preloadedSong, soloMode = false, startingColIndex = 0, initBars, readOnlyBars = []} : SequencerProps) {
    const synth = useRef<Tone.PolySynth | Tone.PluckSynth | null>(null);
    const instrumentRefs = useRef({});
    const drumRefs = useRef<{ [key: string]: Tone.Sampler }>({});
    const [songIsLoading, setSongIsLoading] = useState(true)
    const [samplersLoading, setSamplersLoading] = useState(true)
    const [bpm, setBpm] = useState(250)
    const [octaves] = useState(2);
    const [bars, setBars] = useState(initBars || 5);
    const [beatsPerBar, setBeatsPerBar] = useState(4);
    const [notesPerBeat, setNotesPerBeat] = useState(3);
    const mouseDown = useRef(false)
    const dragMode = useRef(0)
    const [keyDown, setKeyDown] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [song, setSong] = useState(preloadedSong || {} as SongData)
    const [playbackIndex, setPlaybackIndex] = useState(0)
    const playbackUIRef = useRef<HTMLDivElement>(null)
    const lastScrollTime = useRef(0);
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
            <Dog key={0} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
            <Moon key={1} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
            <Milk key={3} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
            <Candy key={4} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
            <Bug key={5} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
        ]

    const drumIcons = [
            <PinIcon key={0} size={"100%"} stroke="black" fill="pink" className="pointer-events-none bg-amber-300 p-1" />,
            <GemIcon key={1} size={"100%"} stroke="black" fill="pink" className="pointer-events-none bg-amber-300 p-1" />,
            <BugIcon key={3} size={"100%"} stroke="black" fill="pink" className="pointer-events-none bg-amber-300 p-1" />,
            <CarIcon key={4} size={"100%"} stroke="black" fill="pink" className="pointer-events-none bg-amber-300 p-1" />,
    ]

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if ((e.key === ' ' || e.key === 'Space') && keyDown == false) {
            e.preventDefault()
            e.stopPropagation()
            setPlaying(!playing)
            setKeyDown(true)
        }
    }

    const saveSong = async () => {
        const existingId = searchParams.get('id')
        let nextPlayer = null
        if (currPlayer && song.players && (song.players.findIndex(player=>player.email == currPlayer.email)+1) < song.players.length) {
            nextPlayer = song.players[song.players.indexOf(currPlayer)+2] as Player
        }
        else if (currPlayer && song.players && (song.players.findIndex(player=>player.email == currPlayer.email)+1) == song.players.length) {
            if (song.players.length == song.numPlayers) {
                nextPlayer = song.players[0] as Player
            } else {
                nextPlayer = null
            }
        }

        const newSong = {
            notes: notesComplex,
            chords,
            bpm: bpm,
            id: existingId,
            instruments: instrumentCellStates,
            kits: drumkitCellStates,
            drums: rhythmCellStates,
            numPlayers: song.numPlayers || 1,
            players: song.players || [],
            beatsPerBar: beatsPerBar,
            notesPerBeat: notesPerBeat,
            waitingOn: nextPlayer ? nextPlayer.email : null
        }

        if (!soloMode && (chords.length/(beatsPerBar*notesPerBeat) < 30)) {
            //add 5 add'l measures to the end of the song
            const addlCols = 5*newSong.beatsPerBar*newSong.notesPerBeat
            newSong.chords = newSong.chords.concat(Array.from({length: addlCols}, () => 1))
            newSong.drums = newSong.drums.map(row => row.concat(Array.from({length: addlCols}, () => ({
                "state": 0,
                "hideLeftBorder": false,
                "hideRightBorder": false
              }))))
        }

        const songData = await songStorage.save(newSong)

        if (songData && (chords.length/(beatsPerBar*notesPerBeat) < 30) && nextPlayer != null) {
            //send email
            await emailSender.sendEmail({
                recipient: nextPlayer.email,
                songUrl: `https://exquisite-corpse-composer.vercel.app/?id=${songData.id}`
            })
        }

        const id = songData.id
        if (searchParams.get('id') == null) {
            redirect(`/?id=${id}`)
        }
        else if (id && setShowTheSequencer && !soloMode) {
            setPlaying(false)
            setShowTheSequencer(false)
        }
    }

    useEffect(() => {
        const newCols = bars*beatsPerBar*notesPerBeat
        setCols(newCols)

        setNoteCellStates(prevStates => {
            if (prevStates[0].length < newCols) {
                const addlCols = Array.from({length: octaves*7}, () => 
                    Array.from({length: newCols - prevStates[0].length}, () => 
                        ({state: 0, hideLeftBorder: false, hideRightBorder: false})
                    )
                )
                return prevStates.map((row, index) => [...row, ...addlCols[index]])
            }
            // why do I need this? isn't it fine for noteCellStates to include data for columns that aren't currenly displayed?
            // if (prevStates[0].length > newCols) {
            //     return prevStates.map(row => row.slice(0, newCols))
            // }
            return prevStates
        })
    
        setChordCellStates(prevStates => {
            if (prevStates.length < newCols) {
                const addlCols = Array.from({length: newCols - prevStates.length}, () => 
                    ({state: 0, hideLeftBorder: false, hideRightBorder: false})
                )
                return [...prevStates, ...addlCols]
            }

            //similar to other places, dont really need this i think
            // if (prevStates.length > newCols) {
            //     return prevStates.slice(0, newCols)
            // }
            return prevStates
        })

        setRhythmCellStates(prevStates => {
            if (prevStates[0].length < newCols) {
                const addlCols = Array.from({length: octaves*7}, () => 
                    Array.from({length: newCols - prevStates[0].length}, () => 
                        ({state: 0, hideLeftBorder: false, hideRightBorder: false})
                    )
                )
                return prevStates.map((row, index) => [...row, ...addlCols[index]])
            }

            //leaving this out 
            // if (prevStates[0].length > newCols) {
            //     return prevStates.map(row => row.slice(0, newCols))
            // }
            return prevStates
        })

        setChords(prevChords => {
            if (prevChords.length < newCols) {
                const addlChords = Array.from({length: newCols - prevChords.length}, () => 1)
                return [...prevChords, ...addlChords]
            }
            //leaving this out
            // if (prevChords.length > newCols) {
            //     return prevChords.slice(0, newCols)
            // }
            return prevChords
        })

        setNotesComplex (prevNotesComplex => prevNotesComplex.map((row: number[][]) => {
            return row.map((rowGroup: number[]) => {
                return rowGroup.filter((col: number) => col < newCols)
            })
        }))

    }, [bars, beatsPerBar, notesPerBeat, octaves])

    // useEffect(() => {
    //     console.log("readonly bars", readOnlyBars)
    // }, [readOnlyBars])

    const retrieveSong = useCallback(async (songId: string) => {
        const song = await songStorage.load(songId);
        setSong(song)
    }, [])

    useEffect (() => {
        const songId = searchParams.get('id')
        if (!songId) setSongIsLoading(false)
        if (songId && preloadedSong == null) {
            retrieveSong(songId)
        }
    }, [searchParams, retrieveSong, preloadedSong])

    useEffect(() => {
        const now = Date.now(); // Current timestamp
        const cooldown = 500; // 500ms cooldown period

        if (now - lastScrollTime.current > cooldown) {
            // If enough time has passed, scroll and update the lastScrollTime
            if (playbackUIRef.current) {
                playbackUIRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });
            }
            lastScrollTime.current = now;
        }
    }, [playbackIndex]);

    useEffect(() => {
        if (song && song.chords && song.chords.length > 0) {
            // print song
            console.log("song", song)
            if (song.chords.length / (song.beatsPerBar*song.notesPerBeat) < bars) {
                setBars(song.chords.length / (song.beatsPerBar*song.notesPerBeat))
            }
            setBeatsPerBar(song.beatsPerBar)
            setNotesPerBeat(song.notesPerBeat)

            setNotesComplex(song.notes)
            setChords(song.chords) 
            setChordCellStates(song.chords.map((x: number) => ({state: x-1, hideLeftBorder: false, hideRightBorder: false})))
            setInstrumentCellStates(song.instruments)
            // similar deal, couldnt this be the length of the total song, not just the cols to display?
            // const newNoteCellStates = Array.from({length: octaves*7}, () => Array.from({length: cols}, () => ({state: 0, hideLeftBorder: false, hideRightBorder: false})))
            const newNoteCellStates = Array.from({length: octaves*7}, () => Array.from({length: song.chords.length}, () => ({state: 0, hideLeftBorder: false, hideRightBorder: false})))

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

            setSongIsLoading(false)
        }
    }, [song, octaves, cols, bars, beatsPerBar, notesPerBeat])

    // useEffect(() => {
    //     console.log("changebeatsperbar", changeBeatsPerBar, "changeNotesPerBeat", changeNotesPerBeat)
    // }, [changeBeatsPerBar, changeNotesPerBeat])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const masterGain = new Tone.Gain(0.5).toDestination(); 

            const instrumentsPromise = new Promise((resolve) => {
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
                        resolve(true);
                    }
                })
            });

            //load the drums
            const drumPromises = drumNames.map((drumkit) => 
                new Promise((resolve) => {
                    drumRefs.current[drumkit] = new Tone.Sampler ({
                        'C1': 'kick.mp3',
                        'D1': 'snare.mp3',
                        'E1': 'hihat.mp3',
                    }, {
                        baseUrl: `/samples/${drumkit}/`,
                        onload: () => {
                            drumRefs.current[drumkit].connect(masterGain)
                            resolve(true);
                        }
                    })
                })
            );

            Promise.all([instrumentsPromise, ...drumPromises]).then(() => {
                setSamplersLoading(false)
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
        //another instance where this should be the 100% length of the piece, i think
        // const notesByCol = Array.from({length: cols}, () => [] as number[][])
        const notesByCol = Array.from({length: chords.length}, () => [] as number[][])

        notesComplex.forEach((row, rowIndex) => {
            row.forEach((rowGroup) => {
                // console.log("rowGroup", rowGroup)
                if (notesByCol[rowGroup[0]]) notesByCol[rowGroup[0]].push([rowIndex, rowGroup.length])
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

    }, [notesComplex, cols, getNotes, instrumentCellStates, instrumentNames, chords])

    useEffect(() => {
        //and here
        // const drumsByCol = Array.from({length: cols}, () => [] as [string, string, number][])
        const drumsByCol = Array.from({length: chords.length}, () => [] as [string, string, number][])

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
    }, [rhythmCellStates, cols, getRhythm, drumkitCellStates, drumNames, chords])
    
    if(songIsLoading || samplersLoading) return <div className="flex h-screen w-screen flex-col items-center justify-center">loading...</div>

    return (
        <div className="flex h-screen w-screen flex-col outline-none grow justify-between touch-auto" 
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
            <div className="flex flex-col grow w-full overflow-auto bg-white">
                <div className="flex relative flex-col grow sticky top-0 bg-white z-50 basis-0 max-h-[40px]">
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
                    startingColIndex={startingColIndex}
                    soloMode={soloMode}
                    readOnlyBars={readOnlyBars}
                    playbackUIRef={playbackUIRef}
                    />
                </div>
                <TonalSequence 
                    octaves={octaves}
                    bars={bars}
                    beatsPerBar={beatsPerBar}
                    notesPerBeat={notesPerBeat}
                    mouseDown={mouseDown}
                    dragMode={dragMode}
                    notesComplex={notesComplex}
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
                    startingColIndex={startingColIndex}
                    soloMode={soloMode}
                    readOnlyBars={readOnlyBars}
                    playbackUIRef={playbackUIRef}
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
                    startingColIndex={startingColIndex}
                    soloMode={soloMode}
                    readOnlyBars={readOnlyBars}
                    playbackUIRef={playbackUIRef}
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
                beatsPerBar={beatsPerBar}
                setBeatsPerBar={setBeatsPerBar}
                notesPerBeat={notesPerBeat}
                setNotesPerBeat={setNotesPerBeat}
                changeBars={changeBars}
                changeBeatsPerBar={changeBeatsPerBar}
                changeNotesPerBeat={changeNotesPerBeat}
                soloMode={soloMode}
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
                startingColIndex={startingColIndex}
            />
        </div>
    );
}
