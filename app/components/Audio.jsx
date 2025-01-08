'use client'

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export default function Audio({isPlaying, setIsPlaying, notes, drums, setPlaybackIndex, bpm, instrumentRefs, drumRefs, cols, startingColIndex, soloMode = false}) {
    const sequenceRef = useRef(null)
    const notesRef = useRef(notes)
    const drumsRef = useRef(drums)
    const colsRef = useRef(cols)
    const currentIndexRef = useRef(0)

    const resetSequencer = () => {
        // Clear any existing sequences
        if (sequenceRef.current) {
            Tone.Transport.clear(sequenceRef.current);
        }
        
        // Reset the transport
        Tone.Transport.stop();
        Tone.Transport.position = 0;
        
        // Reset our internal counter
        currentIndexRef.current = 0;
        setPlaybackIndex(soloMode ? 0 : startingColIndex);
        
        // Reset playing state
        setIsPlaying(false);
    }

    const setupSequence = () => {
        // Clear any existing sequences
        resetSequencer();

        

        if (sequenceRef.current) {
            // If we have an existing event ID, clear it
            Tone.Transport.clear(sequenceRef.current);
        }
    
        // Schedule a repeating event
        sequenceRef.current = Tone.Transport.scheduleRepeat(time => {
          

            let stepIndex = soloMode ? currentIndexRef.current : currentIndexRef.current + startingColIndex;

            const currNotes = notesRef.current[stepIndex] || []
            const currDrums = drumsRef.current[stepIndex] || []

            // Trigger notes
            currNotes.forEach(note => {
                const instrumentName = note[0];
                const instrument = instrumentRefs.current[instrumentName];
                const noteDuration = Tone.Time('8n').toSeconds() * note[2]
                if (instrument) instrument.triggerAttackRelease(note[1], noteDuration, time);
            })

            // Trigger drums
            currDrums.forEach(drum => {
                const drumName = drum[0];
                const kit = drumRefs.current[drumName];
                const noteDuration = Tone.Time('8n').toSeconds() * drum[2]
                if (kit) kit.triggerAttackRelease(drum[1], noteDuration, time);
            })
        
            // Update step
            currentIndexRef.current = (currentIndexRef.current + 1) % (colsRef.current)
            setPlaybackIndex(soloMode ? currentIndexRef.current : currentIndexRef.current + startingColIndex)
            //
           

        }, "8n");

    }

    const startPlayback = async () => {
        console.log("Starting playback")
        await Tone.start();
        
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
            setIsPlaying(true);
        }
    };

    const stopPlayback = () => {
        if (sequenceRef.current) {
            // Clear the scheduled event
            Tone.Transport.clear(sequenceRef.current);
        }
        Tone.Transport.stop();
        setIsPlaying(false);
    };

    useEffect(() => {
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.timeSignature = 4;
        console.log("Updating bpm", bpm)
    }, [bpm])

    useEffect(() => {
        notesRef.current = notes;
    }, [notes]);

    useEffect(() => {
        drumsRef.current = drums;
    }, [drums]);

    useEffect(() => {
        colsRef.current = cols;
    }, [cols]);

    useEffect(() => {
        if (isPlaying) {
            startPlayback()
        } else {
            stopPlayback()
        }
         // Cleanup on unmount
        return () => {
            if (sequenceRef.current) {
                Tone.Transport.clear(sequenceRef.current);
            }
        };
    }, [isPlaying])
    
    useEffect(() => {
        resetSequencer();
        setupSequence();

        return () => {
            resetSequencer();
        }
    }, [startingColIndex])

    return (<></>);
}
