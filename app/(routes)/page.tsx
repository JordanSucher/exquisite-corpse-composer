'use client'

import Sequencer from "../components/Sequencer";
import { useState } from "react";
import NewGame from "../components/NewGame";
import { useSearchParams } from "next/navigation";
import ContinueGame from "../components/ContinueGame";

export default function Home() {

  const [giveTheSpiel, setGiveTheSpiel] = useState(true)
  const searchParams = useSearchParams()
  return (
    <>
      {searchParams.get('id') ?
      <ContinueGame />
      :
      giveTheSpiel ? 
        <NewGame 
          setGiveTheSpiel={setGiveTheSpiel}
        />
        :
        <Sequencer 
        key={0}
        soloMode={true}
        changeBars={true}
        changeBeatsPerBar={true}
        changeNotesPerBeat={true}
        initBars={2}/>
      }
    </>
  );
}
