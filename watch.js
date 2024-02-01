import chokidar from 'chokidar'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execPromise = promisify(exec)

let currentPromise = null

chokidar.watch('./content', { ignoreInitial: true }).on('all', (event, path) => {
    if (path === 'content/digest.json') {
        return
    }

    console.log(event, path)
    if (!currentPromise) {
        console.log('CONVERT')
        currentPromise = execPromise('node convert').then(() => {
            console.log('CONVERT DONE')
            currentPromise = null
        })
    }
});
