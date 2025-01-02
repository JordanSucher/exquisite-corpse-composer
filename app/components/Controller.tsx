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
}
export default function Controller({playing, setPlaying, saveSong, bpm, setBpm, bars, setBars}: ControllerProps) {

    return (
        <div 
            className={`w-screen p-2 bg-slate-200 
            flex items-center justify-center gap-4`}
        >
            <button 
                className="focus:outline-none flex items-center justify-center 
                bg-blue-500 w-[50px] h-[50px] rounded-full" 
                onClick={() => setPlaying(!playing)}
            >
                {playing ? <Pause color="white" fill="white" size = {30}/> 
                : <Play color="white" fill="white" size = {30}/>}
            </button>
            <div className="flex items-center gap-2 text-black focus:outline-none active:none">
                <input
                    type="range"
                    min="60"
                    max="400"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-32 focus:outline-none active:none select-none"
                />
                <span>{bpm} BPM</span>
            </div>
            {/* <div className="text-black">
                <input
                type="number"
                min="1"
                max="8"
                value={bars}
                onChange={(e) => setBars(Number(e.target.value))}
                className="w-32 focus:outline-none active:none select-none"
                />
            </div> */}


            <button 
                className={`text-black bg-blue-400 p-2 rounded active:bg-blue-500 focus:outline-none`}
                onClick={saveSong}>
                Save Song
            </button>
        </div>

    );
}
