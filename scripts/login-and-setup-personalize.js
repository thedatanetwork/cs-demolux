#!/usr/bin/env node

/**
 * One-command Personalize setup: log in -> mint a user authtoken -> run the
 * Personalize recommendations experience setup. No copying tokens around.
 *
 * Usage:
 *   cd scripts
 *   npm run personalize-setup
 *
 * It will prompt for your Contentstack email + password (password is hidden) and, if your
 * account has 2FA enabled, a TFA code. You can also skip prompts by exporting any of:
 *   CONTENTSTACK_EMAIL, CONTENTSTACK_PASSWORD, CONTENTSTACK_TFA_TOKEN, CONTENTSTACK_AUTHTOKEN
 *
 * The authtoken is held only in memory for this process and never written to disk.
 */

const readline = require('readline');
require('dotenv').config();
const authCache = require('./auth-cache');

const CMA_BASE = process.env.CONTENTSTACK_CMA_API || 'https://api.contentstack.io/v3';
const DEFAULT_EMAIL = process.env.CONTENTSTACK_EMAIL || 'todd.belcher@contentstack.com';

function ask(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.question(query, (value) => {
      rl.close();
      resolve(value.trim());
    });
  });
}

// Prompt without echoing keystrokes (for passwords / TFA codes).
function askHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.stdoutMuted = true;
    rl._writeToOutput = function (str) {
      if (!rl.stdoutMuted) rl.output.write(str);
    };
    process.stdout.write(query);
    rl.question('', (value) => {
      rl.close();
      process.stdout.write('\n');
      resolve(value.trim());
    });
  });
}

async function login(email, password, tfaToken) {
  const user = { email, password };
  if (tfaToken) user.tfa_token = tfaToken;
  const res = await fetch(`${CMA_BASE}/user-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user }),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json, text };
}

async function getAuthtoken() {
  if (process.env.CONTENTSTACK_AUTHTOKEN) {
    console.log('Using CONTENTSTACK_AUTHTOKEN from environment.');
    return process.env.CONTENTSTACK_AUTHTOKEN;
  }

  // Non-interactive when creds arrive via env (e.g. from personalize-setup.sh) so we never
  // block on stdin under npm. Only prompt directly if env creds are absent.
  const interactive = !(process.env.CONTENTSTACK_EMAIL && process.env.CONTENTSTACK_PASSWORD);

  const email =
    process.env.CONTENTSTACK_EMAIL ||
    (interactive ? (await ask(`Contentstack email [${DEFAULT_EMAIL}]: `)) || DEFAULT_EMAIL : DEFAULT_EMAIL);
  const password =
    process.env.CONTENTSTACK_PASSWORD || (interactive ? await askHidden('Password: ') : '');
  let tfa = process.env.CONTENTSTACK_TFA_TOKEN || '';

  console.log('\nLogging in...');
  let result = await login(email, password, tfa);

  // If 2FA is required, the API responds with an error asking for the TFA token.
  const needsTfa =
    !result.ok &&
    /tfa|two[-\s]?factor|verification code|authy|otp/i.test(result.text || '');
  if (needsTfa && !tfa) {
    if (!interactive) {
      console.error('\n2FA is required. Re-run and enter the 2FA code at the prompt.');
      process.exit(1);
    }
    tfa = await ask('2FA code: ');
    result = await login(email, password, tfa);
  }

  if (!result.ok || !result.json?.user?.authtoken) {
    console.error(`\nLogin failed (${result.status}): ${result.text}`);
    if (/sso|single sign/i.test(result.text || '')) {
      console.error(
        '\nYour account may use SSO, which blocks password login. In that case, generate an\n' +
          'OAuth/user authtoken another way and run:\n' +
          '  export CONTENTSTACK_AUTHTOKEN=<token> && npm run setup-personalize-recommendations'
      );
    }
    process.exit(1);
  }

  console.log('Logged in.');
  return result.json.user.authtoken;
}

async function main() {
  console.log('='.repeat(64));
  console.log('Personalize setup — login + configure');
  console.log('='.repeat(64));

  const authtoken = await getAuthtoken();
  // Cache the token so the setup can be re-run (and iterated on) without logging in again.
  if (authCache.writeToken(authtoken)) {
    console.log(`Authtoken cached to ${authCache.FILE} — future runs won't prompt.`);
  }
  // Make the token available to the setup module, which reads cfg at require time.
  process.env.CONTENTSTACK_AUTHTOKEN = authtoken;

  const { main: runSetup } = require('./setup-personalize-recommendations.js');
  await runSetup();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nFailed:', err.message);
    process.exit(1);
  });
}
