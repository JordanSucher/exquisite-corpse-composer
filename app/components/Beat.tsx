import Cell from "./Cell";
import * as Tone from 'tone'

type BeatProps = {
    notesPerBeat: number;
    bar: number
    row: number
    mouseDown: boolean
    setMouseDown: (value: boolean) => void
    dragMode: boolean
    setDragMode: (value: boolean) => void
    startingCol: number
    beat: number
    setNotes: React.Dispatch<React.SetStateAction<Array<Array<string>>>>
    playbackIndex: number
    synth: React.RefObject<Tone.Synth>
}

export default function Beat({notesPerBeat, bar, row, mouseDown, setMouseDown, dragMode, setDragMode, startingCol, beat, setNotes, playbackIndex, synth}: BeatProps) {
    return (
        <span className={`flex grow`}>
            {Array.from({length: notesPerBeat}, (_, i) => (
                    <Cell 
                        key={i}
                        edge={i == 0 ? 'l' : i == notesPerBeat-1 ? 'r' : ''}
                        bar={bar}
                        row={row}
                        mouseDown={mouseDown}
                        setMouseDown={setMouseDown}
                        dragMode={dragMode}
                        setDragMode={setDragMode}
                        col={startingCol + beat*notesPerBeat + i}
                        setNotes={setNotes}
                        playbackIndex={playbackIndex}
                        synth={synth}
                    />
                ))
            }
        </span>

    );
}
