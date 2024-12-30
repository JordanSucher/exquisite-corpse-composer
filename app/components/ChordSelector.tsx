import Row from "./Row";
import { useState, useCallback } from "react";
import { Lamp, LifeBuoy, Pickaxe, Popsicle, Puzzle, Pyramid, Skull } from "lucide-react";


type ChordSelectorProps = {
    octaves: number;
    bars: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: boolean;
    setMouseDown: (value: boolean) => void;
    playbackIndex: number
    chords: Array<number>;
    setChords: React.Dispatch<React.SetStateAction<Array<number>>>
    cellStates: Array<number>;
    setCellStates: React.Dispatch<React.SetStateAction<Array<number>>>
};

export default function ChordSelector({bars, beatsPerBar, notesPerBeat, mouseDown, setMouseDown, playbackIndex, setChords, chords, cellStates, setCellStates}: ChordSelectorProps) {

    const [keyDragMode, setKeyDragMode] = useState(0)
    const icons = [
        <Popsicle key={0} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1 " />,
        <Puzzle key={1} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <Pyramid key={2} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <LifeBuoy key={3} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <Lamp key={4} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <Skull key={5} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <Pickaxe key={6} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />
    ];    
    const getNextState = (state: number) => {
        return (state + 1) % 7
    }

    const getColors = useCallback(
        (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */ 
        _row: number) => {
        const colors = ['bg-gray-200', 'bg-gray-300 p-1', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800']
        return colors
    }, [])


    const getValue = useCallback(
        ( _row: number, _col: number, state: number) => {
            const degrees = [1, 2, 3, 4, 5, 6, 7]
            return String(degrees[state])
    }, [])
    

    const onSelect = useCallback (
        (_row: number, col: number, state: number) => {
            const degrees = [1, 2, 3, 4, 5, 6, 7]

            setChords(chords => {
                const newChords = [...chords]
                newChords[col] = degrees[state]
                return newChords
            })
            console.log("setCellStates", setCellStates)
            setCellStates(cellStates => {
                const newCellStates = [...cellStates]
                newCellStates[col] = (newCellStates[col] + 1) % 7
                return newCellStates
            })

        }, [setChords, setCellStates]
    )

    return (
        <Row
            row={0}
            bars={bars}
            beatsPerBar={beatsPerBar}
            notesPerBeat={notesPerBeat}
            mouseDown={mouseDown}
            setMouseDown={setMouseDown} 
            dragMode={keyDragMode}
            setDragMode={setKeyDragMode}
            playbackIndex={playbackIndex}
            onSelect={onSelect}
            getNextState={getNextState}
            getColors={getColors}
            getValue={getValue}
            chords={chords}
            cellStates={cellStates}
            icons={icons}
        />
    )
}
