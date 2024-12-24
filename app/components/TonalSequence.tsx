import Row from "./Row";
import { useState, useEffect } from "react";
import * as Tone from 'tone'

type TonalSequenceProps = {
    octaves: number;
    bars: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: boolean;
    setMouseDown: (value: boolean) => void;
    setNotes: React.Dispatch<React.SetStateAction<Array<Array<string>>>>
    playbackIndex: number
    synth: React.RefObject<Tone.Synth>
};

export default function TonalSequence({octaves, bars, beatsPerBar, notesPerBeat, mouseDown, setMouseDown, setNotes, playbackIndex, synth}: TonalSequenceProps) {
    const rows = octaves*7
    const [dragMode, setDragMode] = useState(false)

    return (
        <div 
            className="flex flex-col-reverse w-screen h-screen"
        >
            {Array.from({length: rows}, (_, i) => (
                    <Row
                        key={i}
                        row={i}
                        bars={bars}
                        beatsPerBar={beatsPerBar}
                        notesPerBeat={notesPerBeat}
                        mouseDown={mouseDown}
                        setMouseDown={setMouseDown} 
                        dragMode={dragMode}
                        setDragMode={setDragMode}
                        setNotes={setNotes}
                        playbackIndex={playbackIndex}
                        synth={synth}
                    />
                ))
            }
        </div>
    );
}
