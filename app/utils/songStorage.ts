type SongData = {
    notes: number[][][];
    chords: number[];
    bpm: number;
    id: string | null;
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
        const { id } = await response.json();
        return id;
    },

    async load(id: string) {
        const response = await fetch(`/api/songs?id=${id}`);
        if (!response.ok) throw new Error('Failed to load song');
        return response.json();
    }
};
