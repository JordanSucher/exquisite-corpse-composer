'use client'

import React from "react";
import Beat from "./Beat";
import * as Tone from 'tone'

type BarProps = {
    row: number;
    bar: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: boolean;
    setMouseDown: (value: boolean) => void
    dragMode: boolean;
    setDragMode: (value: boolean) => void
    setNotes: React.Dispatch<React.SetStateAction<Array<Array<string>>>>
    playbackIndex: number
    synth: React.RefObject<Tone.Synth>
};


export default function Bar({row, bar, beatsPerBar, notesPerBeat, mouseDown, setMouseDown, dragMode, setDragMode, setNotes, playbackIndex, synth}: BarProps) {
    const startingCol = bar*beatsPerBar*notesPerBeat

    return (
        <span className={`flex grow`}>
            {Array.from({length: beatsPerBar}, (_, i) => (
                    <Beat 
                        key={i}
                        beat={i}
                        row={row}
                        bar={bar}
                        notesPerBeat={notesPerBeat}
                        mouseDown={mouseDown}
                        setMouseDown={setMouseDown}
                        dragMode={dragMode}
                        setDragMode={setDragMode}
                        startingCol={startingCol}
                        setNotes={setNotes}
                        playbackIndex={playbackIndex}
                        synth={synth}
                    />
                ))
            }
        </span>
    );
}
