#!/usr/bin/env bash
#
# One-command Personalize setup: prompts for credentials (password hidden),
# mints a user authtoken, and runs the recommendations experience setup.
# The token lives only in this process — nothing is written to disk.
#
#   cd scripts && npm run personalize-setup
#
set -euo pipefail
cd "$(dirname "$0")"

DEFAULT_EMAIL="todd.belcher@contentstack.com"
read -r -p "Contentstack email [$DEFAULT_EMAIL]: " EMAIL
EMAIL="${EMAIL:-$DEFAULT_EMAIL}"

read -r -s -p "Password: " PASSWORD
echo

read -r -p "2FA code (leave blank if none): " TFA

export CONTENTSTACK_EMAIL="$EMAIL"
export CONTENTSTACK_PASSWORD="$PASSWORD"
[ -n "${TFA:-}" ] && export CONTENTSTACK_TFA_TOKEN="$TFA"

exec node login-and-setup-personalize.js
