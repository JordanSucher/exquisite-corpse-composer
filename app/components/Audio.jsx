'use client'

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export default function Audio({isPlaying, setIsPlaying, notes, setPlaybackIndex, bpm, instrumentRefs}) {
    const sequenceRef = useRef(null)
    const notesRef = useRef(notes)
    


    const setupSequence = () => {
        if (sequenceRef.current) {
            // If we have an existing event ID, clear it
            Tone.Transport.clear(sequenceRef.current);
        }

        let currentStep = 0
    
        // Schedule a repeating event
        sequenceRef.current = Tone.Transport.scheduleRepeat(time => {
            const currNotes = notesRef.current[currentStep];

            if (currNotes.length > 0) console.log("currNotes", currNotes)

            currNotes.forEach(note => {
                const instrumentName = note[0];
                const instrument = instrumentRefs.current[instrumentName];
                const noteDuration = Tone.Time('8n').toSeconds() * note[2]
                if (instrument) instrument.triggerAttackRelease(note[1], noteDuration, time);
            })
        
            // Update playback index
            setPlaybackIndex(currentStep);
            
            // Update step
            currentStep = (currentStep + 1) % notes.length;

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
        setupSequence();
        return () => {
            if (sequenceRef.current) {
                Tone.Transport.clear(sequenceRef.current);
            }
        };
    }, []);

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
    


    return (<></>);
}
