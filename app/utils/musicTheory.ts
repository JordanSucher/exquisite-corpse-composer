export const MusicTheory = {
    generateScale: (chord: number, steps: number) => {        
        const degrees = [[1, 'major'], [2, 'minor'], [3, 'minor'], [4, 'major'], [5, 'major'], [6, 'minor'], [7, 'diminished']]
        const scalePatterns = {'major': [0, 2, 4, 5, 7, 9, 11], 'minor': [0, 2, 3, 5, 7, 8, 10], 'diminished': [0, 2, 3, 5, 6, 8, 10]}
        const semitones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        const degree = degrees[chord-1]
                
        const firstNoteIndex = scalePatterns['major'][Number(degree[0])-1]
        const firstNote = semitones[firstNoteIndex]

        let pattern = scalePatterns[degree[1] as keyof typeof scalePatterns]

        pattern = pattern.map((note: number) => {
            let index = note + firstNoteIndex
            if (index > 11) {
                index -= 12
            }
            return index
        })

        let notePattern = semitones.filter((_, index) => {
            return pattern.includes(index)
        })

        const sortNotePattern = (notePattern: string[]) => {
            if (notePattern[0] == firstNote) {
                return notePattern
            } else {
                return sortNotePattern(notePattern.slice(1).concat(notePattern[0]))
            }
        }

        notePattern = sortNotePattern(notePattern)

        let octave = 3
        let prevNote = firstNote

        const notes = Array.from({length: steps}, (_, i) => {
            const note = notePattern[i%notePattern.length]
            const noteIndex = semitones.indexOf(note)
            const prevIndex = semitones.indexOf(prevNote)
            if (noteIndex < prevIndex) {
                octave++
            }
            const result = note + octave.toString()
            prevNote = note
            return result
        })

        return notes
    }

}
