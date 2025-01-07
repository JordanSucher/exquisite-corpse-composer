'use client'

import { songStorage } from "../utils/songStorage";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Sequencer from "./Sequencer";

type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
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

type Player = {
    email: string;
    password: string;
}

export default function ContinueGame() {
    const searchParams = useSearchParams()
    const [players, setPlayers] = useState<Player[]>([])
    const [numPlayers, setNumPlayers] = useState(0)
    const [waitingOn, setWaitingOn] = useState(null)
    const [song, setSong] = useState({} as SongData)
    const [email, setEmail] = useState('')
    const [pw, setPw] = useState('')
    const [waitingOnPw, setWaitingOnPw] = useState('')
    const [invalidPw, setInvalidPw] = useState(false)
    const [showTheSequencer, setShowTheSequencer] = useState(false)
    const [measures, setMeasures] = useState<number>(0 as number)
    const [takenTurns, setTakenTurns] = useState(-1)

    const startingColIndex = useMemo(()=> Math.max(0, song?.chords?.length - (6 * song?.beatsPerBar * song?.notesPerBeat)), [song?.chords?.length, song?.beatsPerBar, song?.notesPerBeat])


    const joinPlayer = async () => {
        if (numPlayers-players.length > 0 && email !== '' && pw !== '') {
            try {
                const songId = searchParams.get('id')
                if (songId) {
                    const newPlayers = [...players, {email: email, password: pw}]
                    const newWaitingOn = waitingOn === null ? email : song.waitingOn
                    await songStorage.save({...song, players: newPlayers, waitingOn: newWaitingOn})
                    if (newWaitingOn == email) {
                        setShowTheSequencer(true)
                    } else {
                        await retrieveSong(songId)
                    }
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    const retrieveSong = async (songId: string) => {
        try {
            const song = await songStorage.load(songId);
            if (song) {
                setSong(song)
                setPlayers(song.players)
                setNumPlayers(song.numPlayers)
                setWaitingOn(song.waitingOn)
                setMeasures(song.chords.length / (song.beatsPerBar * song.notesPerBeat))
                const cookieEmail = document.cookie.split(`id=`)[1]
                if (cookieEmail && song.waitingOn == cookieEmail) {
                    setShowTheSequencer(true)
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const takeTurn = (password: string) => {
        if (password === players.find((player: Player) => player.email === waitingOn)?.password) {
            setShowTheSequencer(true)
        } else {
            setInvalidPw(true)
        }
    }

    useEffect (() => {
            const songId = searchParams.get('id')
            if (songId) {
                retrieveSong(songId)
            }
        }, [searchParams, showTheSequencer])

    useEffect (() => {
        setTakenTurns(measures / 5)
        if (measures == 30) {
            setShowTheSequencer(true)
        }
    }, [measures])

    if (showTheSequencer) {
        return (
            <Sequencer 
                currPlayer={players.find((player: Player) => player.email === waitingOn)}
                setShowTheSequencer={setShowTheSequencer}
                startingColIndex={measures == 30 ? 0 : startingColIndex}
                preloadedSong={song}
                changeBars={false}
                changeBeatsPerBar={takenTurns == 1 ? true : false}
                changeNotesPerBeat={takenTurns == 1 ? true : false}
                initBars={measures == 30 ? 30 : 6}
                readOnlyBars={measures == 30 ? Array.from({length: 30}, (_, i) => i) : takenTurns > 1 ? [0] : []}
            />
        )
    }

    else if (players.length==0) {
        return (<div>loading...</div>)
    }

    else {
            return (
            <div className="flex flex-col items-center justify-center h-screen w-screen">
                <div className="flex flex-col items-left justify-center h-screen w-[350px] gap-3">
                    <h1 className="text-2xl text-white font-bold">{`participants${numPlayers - players.length > 0 ? ` (${players.length}/${numPlayers})` : ''}`}</h1>
                    <div className="flex flex-col">
                        {players.map((player: Player, index: number) => {
                            return (
                                <p className="text-slate-600 italic" key={index}>{`${player.email}`}</p>
                            )
                        })}
                    </div>
        
        
                    {numPlayers - players.length > 0 &&
                    <>
                        <hr className="my-2"/>
                        <form className="flex flex-col gap-2" onSubmit={(e)=>{e.preventDefault(); joinPlayer()}}>
                            <div className="flex gap-2 w-full justify-between">
                                <p className="text-lg text-slate-600 italic">email</p>
                                <input type="email" className="text-xs text-orange-400 text-center bg-black border-dotted border-[1px] italic w-[150px] h-[25px] focus:outline-none invalid:border-red-500"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="flex gap-2 w-full justify-between">
                                <p className="text-lg text-slate-600 italic">a dumb password</p>
                                <input type="text" className="text-xs text-orange-400 text-center bg-black border-dotted border-[1px] italic w-[150px] h-[25px] focus:outline-none"
                                value={pw} 
                                onChange={(e) => setPw(e.target.value)}/>
                            </div>
                            <div className="flex gap-4 w-full justify-between">
                                <p> </p>
                                <button>
                                    <div className="h-[25px] flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                                        join
                                    </div>
                                </button>
                            </div>            
                        </form>
                    </>}
        
                    
                    {waitingOn !== null && 
                    <> 
                        <div className="flex gap-3 items-center">
                            <h1 className="text-2xl text-white font-bold">progress</h1>
                            <p className="text-slate-600 mt-1">
                                {` ${Array(6).fill("").map((_, index) => {
                                    return `${index < takenTurns ? '🟩' : '🟥'}`
                                }).join(' ')}`}
                            </p>
                            <p>{` ${Number((takenTurns/6)*(100)).toFixed(2)}%` }</p>
                        </div>
                        <form className="flex flex-col gap-3" onSubmit={(e) => {e.preventDefault(); takeTurn(waitingOnPw)}}> 
                            <div className="flex gap-2 w-full justify-between">
                                <p className="text-slate-600 italic">{`waiting on ${waitingOn}` }</p>
                                <input type="string" placeholder="password" value={waitingOnPw} onChange={(e) => setWaitingOnPw(e.target.value)} className={`text-sm text-orange-400 text-center bg-black border-dotted border-[1px] focus:outline-none h-[25px] ${invalidPw ? 'border-red-500' : ''}`}></input>
                            </div>
                            <div className="flex gap-4 w-full justify-between">
                                <p></p>
                                <button>
                                    <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded h-[25px] flex items-center justify-center">
                                        take turn
                                    </div>
                                </button>
                            </div>
                        </form>
                    </>            
                    }
        
                </div>
            </div>
            )
    }
}
