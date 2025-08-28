const fs = require('fs');

class TextFileSync {
    constructor(filename) {
        this.filename = filename;
    }

    read() {
        try {
            return fs.readFileSync(this.filename, 'utf-8');
        } catch (err) {
            return null;
        }
    }

    write(data) {
        fs.writeFileSync(this.filename, data, 'utf-8');
    }
}

module.exports = { TextFileSync };
