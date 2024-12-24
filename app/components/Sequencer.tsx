'use client';

import TonalSequence from "./TonalSequence";
// import RhythmSequence from "./RhythmSequence";
import Audio from "./Audio";
import Controller from "./Controller";
import { useState, useRef } from "react";
import * as Tone from 'tone'

export default function Sequencer() {
    const synth = useRef(new Tone.Synth().toDestination());
    const [octaves] = useState(2);
    const [bars] = useState(4);
    const [beatsPerBar] = useState(4);
    const [notesPerBeat] = useState(2);
    const [mouseDown, setMouseDown] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [playbackIndex, setPlaybackIndex] = useState(0)
    const cols = bars*beatsPerBar*notesPerBeat
    const [notes, setNotes] = useState<Array<Array<string>>>(Array.from({length: cols}, () => []))

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === ' ' || e.key === 'Space') {
            setPlaying(!playing)
        }
    }

    return (
        <div className="flex flex-col w-screen h-screen" 
        onMouseUp={() => setMouseDown(false)} 
        onMouseLeave={() => setMouseDown(false)}
        onKeyDown={onKeyDown}
        tabIndex={0}
        outline-none="true">
            <TonalSequence 
                octaves={octaves}
                bars={bars}
                beatsPerBar={beatsPerBar}
                notesPerBeat={notesPerBeat}
                mouseDown={mouseDown}
                setMouseDown={setMouseDown}
                setNotes={setNotes}
                playbackIndex={playbackIndex}
                synth={synth}
            />
            <Controller
                playing={playing}
                setPlaying={setPlaying}
            />
            <Audio
                notes={notes}
                isPlaying={playing}
                playbackIndex={playbackIndex}
                setPlaybackIndex={setPlaybackIndex}
            />
        </div>
    );
}
