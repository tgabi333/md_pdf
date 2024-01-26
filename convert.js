const fs = require('fs');
const { mdToPdf } = require('md-to-pdf');

(async () => {
    const pdf = await mdToPdf({ path: 'munkaszerzodes.md', devtools: true }).catch(console.error);

    if (pdf) {
        fs.writeFileSync('munkaszerzodes.pdf', pdf.content);
    }
})();
