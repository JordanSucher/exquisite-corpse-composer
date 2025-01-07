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
    startingColIndex: number
    soloMode: boolean
    readOnlyBars: Array<number>
    playbackUIRef: React.RefObject<HTMLDivElement> | React.RefObject<null>};

export default function ChordSelector({bars, beatsPerBar, notesPerBeat, mouseDown, playbackIndex, setChords, chords, cellStates, setCellStates, startingColIndex, soloMode, readOnlyBars, playbackUIRef}: ChordSelectorProps) {

    const keyDragMode = useRef(0)
    const icons = [
        <Popsicle key={0} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1 " />,
        <Puzzle key={1} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
        <Pyramid key={2} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
        <LifeBuoy key={3} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
        <Lamp key={4} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
        <Skull key={5} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />,
        <Pickaxe key={6} size={"100%"} stroke="black" fill="yellow" className="pointer-events-none bg-rose-300 p-1" />
    ];    
    const getNextState = (state: CellState) => {
        const newState = (state.state + 1) % 7
        return {...state, state: newState}
    }

    const getColors = useCallback(
        (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */ 
        _row: number) => {
        const colors = ['black', 'black', 'black', 'black', 'black', 'black', 'black']
        return colors
    }, [])

    // useEffect(() => {
    //     console.log("cell states", cellStates)
    // }, [cellStates])

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
                newCellStates[col].state = state
                return newCellStates
            })

        }, [setChords, setCellStates]
    )

    return (
        <Row
            row={-1}
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
            togglePlaybackIndexOpacity={false}
            zIndex={40}
            startingColIndex={startingColIndex}
            soloMode={soloMode}
            readOnlyBars={readOnlyBars}
            playbackUIRef={playbackUIRef}
        />
    )
}
