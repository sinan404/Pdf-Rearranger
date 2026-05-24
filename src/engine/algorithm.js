export function generatePageSequence(N) {
    const oddStream = []
    const evenStream = []

    for (let i = 1; i <= N; i++) {
        if (i % 2 !== 0) oddStream.push(i)
        else evenStream.push(i)
    }

    const result = []

    while (oddStream.length > 0 || evenStream.length > 0) {
        // ODD SET — pull 9, pad with 0s
        const oddSet = oddStream.splice(0, 9)
        while (oddSet.length < 9) oddSet.push(0)
        result.push(...oddSet)

        // EVEN SET — 3 blocks of 3, each reversed
        const evenSet = []
        for (let b = 0; b < 3; b++) {
            const block = evenStream.splice(0, 3)
            while (block.length < 3) block.push(0)
            block.reverse()
            evenSet.push(...block)
        }
        result.push(...evenSet)
    }

    return result
}