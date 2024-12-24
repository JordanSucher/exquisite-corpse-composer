import Bar from "./Bar";
import React, { useEffect } from "react";
import * as Tone from 'tone';

type RowProps = {
    row: number;
    bars: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: boolean;
    setMouseDown: (value: boolean) => void;
    dragMode: boolean
    setDragMode: (value: boolean) => void
    setNotes: React.Dispatch<React.SetStateAction<Array<Array<string>>>>
    playbackIndex: number
    synth: React.RefObject<Tone.Synth>

};

export default function Row({row, bars, beatsPerBar, notesPerBeat, mouseDown, setMouseDown, dragMode, setDragMode, setNotes, playbackIndex, synth}: RowProps) {
    const cols = bars*beatsPerBar*notesPerBeat

    return (
        <span className="flex w-screen grow">
            {Array.from({length: bars}, (_, i) => (
                    <Bar
                        key={i}
                        bar={i}
                        row={row}
                        beatsPerBar={beatsPerBar}
                        notesPerBeat={notesPerBeat}
                        mouseDown={mouseDown}
                        setMouseDown={setMouseDown}
                        dragMode={dragMode}
                        setDragMode={setDragMode}
                        cols = {cols}
                        setNotes={setNotes}
                        playbackIndex={playbackIndex}
                        synth={synth}
                    />
                ))
            }
        </span>
    );
}
