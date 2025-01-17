import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Initialize Redis
const redis = Redis.fromEnv();

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

export const POST = async (req: NextRequest) => {
    try {
        const data: SongData = await req.json();
        const id = data.id !== null ? data.id : crypto.randomUUID();
        const newData = { ...data, id };
        await redis.set(`song:${id}`, JSON.stringify(newData));
        return new NextResponse(JSON.stringify(newData), { status: 200 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Failed to save song", { status: 500 });
    }
};

export const GET = async (req : NextRequest) => {
    try {
        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return new NextResponse("Missing id", { status: 400 });
        }

        const songData = await redis.get(`song:${id}`);

        if (!songData) {
            return new NextResponse("Song not found", { status: 404 });
        }

        return new NextResponse(JSON.stringify(songData), { status: 200 });

    } catch (error) {
        console.error(error);
        return new NextResponse("Failed to fetch song", { status: 500 });
    }
}
