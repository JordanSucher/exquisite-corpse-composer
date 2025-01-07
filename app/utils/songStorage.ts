type SongData = {
    notes: number[][][];
    chords: number[];
    bpm: number;
    id: string | null;
    instruments: object[];
    kits: object[];
    drums: object[]
    numPlayers: number
    players: object[]
    beatsPerBar: number
    notesPerBeat: number
    waitingOn: string | null
}

export const songStorage = {
    async save(songData: SongData) {
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(songData),
        });

        if (!response.ok) throw new Error('Failed to save song');
        const song = await response.json();
        return song;
    },

    async load(id: string) {
        const response = await fetch(`/api/songs?id=${id}`);
        if (!response.ok) throw new Error('Failed to load song');
        return response.json();
    }
};
