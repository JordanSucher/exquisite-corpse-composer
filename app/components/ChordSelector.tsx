import Row from "./Row";
import { useRef, useCallback } from "react";
import { Lamp, LifeBuoy, Pickaxe, Popsicle, Puzzle, Pyramid, Skull } from "lucide-react";

type CellState = {
    state: number;
    hideLeftBorder: boolean;
    hideRightBorder: boolean;
}
type ChordSelectorProps = {
    octaves: number;
    bars: number;
    beatsPerBar: number;
    notesPerBeat: number;
    mouseDown: React.RefObject<boolean>;
    playbackIndex: number
    chords: Array<number>;
    setChords: React.Dispatch<React.SetStateAction<Array<number>>>
    cellStates: Array<CellState>;
    setCellStates: React.Dispatch<React.SetStateAction<Array<CellState>>>
};

export default function ChordSelector({bars, beatsPerBar, notesPerBeat, mouseDown, playbackIndex, setChords, chords, cellStates, setCellStates}: ChordSelectorProps) {

    const keyDragMode = useRef(0)
    const icons = [
        <Popsicle key={0} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1 " />,
        <Puzzle key={1} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <Pyramid key={2} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <LifeBuoy key={3} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <Lamp key={4} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <Skull key={5} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />,
        <Pickaxe key={6} size={"full"} stroke="black" fill="yellow" className="pointer-events-none bg-orange-300 p-1" />
    ];    
    const getNextState = (state: CellState) => {
        const newState = (state.state + 1) % 7
        return {...state, state: newState}
    }

    const getColors = useCallback(
        (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */ 
        _row: number) => {
        const colors = ['gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800']
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
                newCellStates[col].state = (newCellStates[col].state + 1) % 7
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
            dragMode={keyDragMode}
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
