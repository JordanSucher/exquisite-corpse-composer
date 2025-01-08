'use client'

import { useState } from "react"
import { songStorage } from "../utils/songStorage"
import { useRouter } from "next/navigation"

type LandingProps = {
    setGiveTheSpiel: React.Dispatch<React.SetStateAction<boolean>>
}

export default function NewGame ({setGiveTheSpiel} : LandingProps) {
    const router = useRouter()

    const [step, setStep] = useState(0)
    const [numPlayers, setNumPlayers] = useState(2)
    const [email, setEmail] = useState('')
    // const [measures, setMeasures] = useState(60)
    const [pw, setPw] = useState('')
    const [octaves] = useState(2)
    const [bars] = useState(5)
    const [beatsPerBar] = useState(4)
    const [notesPerBeat] = useState(2)

    const createSong = async () => {
        try {
            const songData = await songStorage.save(
                {
                    bpm: 200,
                    beatsPerBar: 4,
                    notesPerBeat: 2,
                    numPlayers,
                    players: [{email: email, password: pw}],
                    notes: Array.from({length: octaves*7}, () => []),
                    chords: Array.from({length: bars*beatsPerBar*notesPerBeat}, () => 1),
                    instruments: Array.from({length: octaves*7}, ()=> ({state: 0, hideLeftBorder: false, hideRightBorder: false})),
                    kits: Array.from({length: 3}, ()=> ({state: 0, hideLeftBorder: false, hideRightBorder: false})),
                    drums: Array.from({length: 3}, () => Array.from({length: bars*beatsPerBar*notesPerBeat}, () => ({state: 0, hideLeftBorder: false, hideRightBorder: false}))),
                    id: null,
                    waitingOn: email
                 }
            )

            if (songData && songData.id) {
                console.log("song created", songData)
                document.cookie = `id=${email}`
                router.push(`/?id=${songData.id}`)
            }

        } catch (error) {
            console.error(error);
        }
    }

    switch (step) {
        case 0:
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-4xl font-bold mb-2 italic">decomposer</h1>
                    <p className="text-lg text-orange-400 mb-4 italic">an exquisite corpse music composition game</p>
                    <span className="flex gap-3 mt-3">
                        <button onClick={()=> setStep(1)}>
                            <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                                play
                            </div>
                        </button>
                        <button onClick={()=> setGiveTheSpiel(false)}>
                            <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                                solo
                            </div>    
                        </button>
                    </span>
                </div>
            )
        case 1:
            return (
                <div className="flex flex-col items-center justify-center h-screen w-screen ">
                    <h1 className="text-4xl font-bold mb-4 italic">make some choices</h1>
                    <div className="flex flex-col items-center w-[350px]">
                        <form onSubmit={(e)=>{e.preventDefault(); if (numPlayers>1 && email && pw) createSong()}} className="flex flex-col items-center w-full"> 
                            
                            <span className="flex gap-2 w-full justify-between">
                                <p className="text-lg text-slate-600 mb-4 italic">players</p>
                                <input 
                                type="number" 
                                max="6"
                                min="2"
                                className="text-lg text-orange-400 text-center bg-black border-dotted border-[1px] mb-4 italic w-[50px] focus:outline-none [&::-webkit-inner-spin-button]:opacity-100"
                                value={numPlayers} 
                                onChange={(e) => setNumPlayers(Number(e.target.value))}/>
                            </span>
                            <span className="flex gap-2 w-full justify-between">
                                <p className="text-lg text-slate-600 mb-4 italic">email</p>
                                <input type="email" className="text-xs text-orange-400 text-center bg-black border-dotted border-[1px] mb-4 italic w-[150px] focus:outline-none"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}/>
                            </span>
                            <span className="flex gap-2 w-full justify-between">
                                <p className="text-lg text-slate-600 mb-4 italic">a dumb password</p>
                                <input type="string" className="text-xs text-orange-400 text-center bg-black border-dotted border-[1px] mb-4 italic w-[150px] focus:outline-none"
                                value={pw} 
                                onChange={(e) => setPw(e.target.value)}/>
                            </span>

                            

                            <span className="flex gap-4 mt-3">
                                <button type="button" onClick={()=> setStep(0)}>
                                    <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                                        back
                                    </div>
                                </button>
                                <button type="submit">
                                    <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                                        start
                                    </div>
                                </button>
                            </span>
                        </form>
                    </div>
                </div>
            )
    }

    return 
}
