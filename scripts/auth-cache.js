/**
 * Tiny local cache for a Contentstack user authtoken so it's entered once, not per run.
 * Stored at scripts/.cs-authtoken (gitignored, mode 0600). Held for dev convenience only.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '.cs-authtoken');

module.exports = {
  FILE,
  readToken() {
    try {
      const t = (fs.readFileSync(FILE, 'utf8') || '').trim();
      return t || null;
    } catch {
      return null;
    }
  },
  writeToken(token) {
    try {
      fs.writeFileSync(FILE, token, { mode: 0o600 });
      return true;
    } catch {
      return false;
    }
  },
};
