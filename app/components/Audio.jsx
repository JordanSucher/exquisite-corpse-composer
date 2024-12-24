'use client'

import { Song, Track, Instrument, Effect } from 'reactronica';
import { useState, useEffect } from 'react';
import * as Tone from 'tone';

export default function Audio({isPlaying, notes, playbackIndex, setPlaybackIndex}) {

    return (
        <Song bpm={140} isPlaying={isPlaying}>
            <Track 
            steps={notes}
            onStepPlay={(stepNotes, index)=>{
                setPlaybackIndex(index)
            }}
            >
                <Instrument 
                    type="synth"
                  >
                    <Effect >
                        <Effect />
                    </Effect>
                </Instrument>
            </Track>
        </Song>
    );
}
