'use client'

import { Pause, Play } from "lucide-react";

type ControllerProps = {
    playing: boolean;
    setPlaying: (playing: boolean) => void;
    saveSong: () => void
    bpm: number
    setBpm: (bpm: number) => void
    bars: number
    setBars: (bars: number) => void
    beatsPerBar: number
    setBeatsPerBar: (beatsPerBar: number) => void
    notesPerBeat: number
    setNotesPerBeat: (notesPerBeat: number) => void
    changeBars: boolean
    changeBeatsPerBar: boolean
    changeNotesPerBeat: boolean
    soloMode?: boolean
}
export default function Controller({playing, setPlaying, saveSong, bpm, setBpm, bars, setBars, beatsPerBar, setBeatsPerBar, notesPerBeat, setNotesPerBeat, changeBars, changeBeatsPerBar, changeNotesPerBeat}: ControllerProps) {

    return (
        <div 
            className={`w-screen p-2 bg-rose-300 text-black
            flex items-center justify-center gap-4`}
        >
            <button 
                tabIndex={-1}
                className="focus:outline-none flex items-center justify-center 
                bg-white w-[40px] h-[40px] rounded-full" 
                onClick={(e) => {setPlaying(!playing); (e.target as HTMLButtonElement).blur() }}
            >
                {playing ? <Pause color="black" fill="black" size = {25}/> 
                : <Play color="black" fill="black" size = {25}/>}
            </button>
            <div tabIndex={-1} className="flex items-center gap-2 focus:outline-none active:none text-xs md:text-md">
                <input
                    tabIndex={-1}
                    type="range"
                    min="60"
                    max="500"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-32 focus:outline-none active:none select-none accent-white hover:none"
                />
                <span>{bpm} tempo</span>
            </div>

            {changeBars &&
                <div tabIndex={-1} className="hidden md:flex gap-2 focus:outline-none text-xs md:text-md items-center justify-center">
                    <input
                    tabIndex={-1}
                    type="number"
                    min="1"
                    max="9"
                    value={bars}
                    onChange={(e) => setBars(Number(e.target.value))}
                    className="w-8  focus:outline-none active:none select-none [&::-webkit-inner-spin-button]:opacity-100 p-1"
                    />
                    bars
                </div>}

            {changeBeatsPerBar &&
                <div tabIndex={-1} className="hidden md:flex gap-2 focus:outline-none text-xs md:text-md items-center justify-center">
                    <input
                    tabIndex={-1}
                    type="number"
                    min="1"
                    max="5"
                    value={beatsPerBar}
                    onChange={(e) => setBeatsPerBar(Number(e.target.value))}
                    className="w-8 focus:outline-none active:none select-none [&::-webkit-inner-spin-button]:opacity-100 p-1"
                    />
                    beats ber bar   
                </div>}
                
            {changeNotesPerBeat &&
                <div tabIndex={-1} className="hidden md:flex gap-2 focus:outline-none text-xs md:text-md items-center justify-center">
                    <input
                    tabIndex={-1}
                    type="number"
                    min="1"
                    max="5"
                    value={notesPerBeat}
                    onChange={(e) => setNotesPerBeat(Number(e.target.value))}
                    className="w-8 focus:outline-none active:none select-none [&::-webkit-inner-spin-button]:opacity-100 p-1"
                    />
                    notes per beat
                </div>
            }


            <button 
                tabIndex={-1}
                className={` h-[30px] text-black text-xs md:text-md flex items-center justify-center bg-white p-2 rounded active:bg-blue-500 focus:outline-none`}
                onClick={saveSong}>
                {changeBars ? `Save Song` : `Take Turn`}
            </button>
        </div>

    );
}
