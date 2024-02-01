import * as fs from 'node:fs/promises';
import * as path from 'node:path'
import { createHash } from 'crypto'
import { mdToPdf } from 'md-to-pdf';

(async () => {
    let hashes
    try {
        await fs.access('./content/digest.json', fs.constants.F_OK | fs.constants.R_OK)
        hashes = new Map(JSON.parse(await fs.readFile('./content/digest.json')))
    } catch {
        hashes = new Map()
    }

    const contents = await fs.readdir('./content', { withFileTypes: true, recursive: true })
    for (const dirent of contents) {
        if (dirent.isFile() && dirent.name.endsWith('.md')) {
            const fileName = path.join(dirent.path, dirent.name)
            const content = await fs.readFile(fileName)
            const currentHash = createHash('sha256').update(content).digest('hex')

            const existingHash = hashes.get(fileName)
            const outputFileName = fileName.replace('content/', 'output/').replace('.md', '.pdf')

            let outputFileExists = true
            try {
                await fs.access(outputFileName, fs.constants.F_OK | fs.constants.R_OK)
            } catch {
                outputFileExists = false
            }

            if (!existingHash || existingHash != currentHash || !outputFileExists) {
                hashes.set(fileName, currentHash)

                const pdf = await mdToPdf({ path: fileName })
                if (pdf) {
                    await fs.mkdir(dirent.path.replace('content/', 'output/'), { recursive: true })
                    await fs.writeFile(outputFileName, pdf.content)
                } else {
                    console.error('CANNOT GENERATE', fileName)
                }
            }
        }
    }

    fs.writeFile('./content/digest.json', JSON.stringify(Array.from(hashes.entries()), null, 2))
})();
