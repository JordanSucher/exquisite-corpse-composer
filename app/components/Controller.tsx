import { Pause, Play } from "lucide-react";

type ControllerProps = {
    playing: boolean;
    setPlaying: (playing: boolean) => void;
}
export default function Controller({playing, setPlaying}: ControllerProps) {

    return (
        <div className={`w-screen h-[100px] bg-slate-200 flex items-center justify-center`}>
            <button className="focus:outline-none flex items-center justify-center bg-blue-500 w-[70px] h-[70px] rounded-full" onClick={() => setPlaying(!playing)}>
                {playing ? <Pause color="white" fill="white" size = {50}/> : <Play color="white" fill="white" size = {50}/>}
            </button>
        </div>

    );
}
