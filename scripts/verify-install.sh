#!/usr/bin/env bash
#
# verify-install.sh
#
# Pre-launch smoke test for the event-outbound plugin.
#
# What this checks:
#  1. claude CLI is installed and on PATH
#  2. .claude-plugin/plugin.json validates against Anthropic's schema
#  3. marketplace manifest in ../claude-plugins validates (if present)
#  4. skill file exists where plugin.json expects it
#  5. all Apollo merge fields in the example sequences resolve from a known list
#  6. no banned phrases or em-dashes have snuck back into the prose docs
#  7. (optional) fresh Claude Code session can load the plugin via --plugin-dir
#
# Usage:
#  bash scripts/verify-install.sh                # run all checks
#  bash scripts/verify-install.sh --skip-live    # skip the live --plugin-dir test
#

set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

SKIP_LIVE=0
if [[ "${1:-}" == "--skip-live" ]]; then
  SKIP_LIVE=1
fi

pass=0
fail=0
warn=0

ok()   { printf "  \033[32mOK\033[0m   %s\n" "$1"; pass=$((pass+1)); }
bad()  { printf "  \033[31mFAIL\033[0m %s\n" "$1"; fail=$((fail+1)); }
soft() { printf "  \033[33mWARN\033[0m %s\n" "$1"; warn=$((warn+1)); }
step() { printf "\n\033[1m%s\033[0m\n" "$1"; }

step "1. claude CLI"
if command -v claude >/dev/null 2>&1; then
  ok "claude found at $(command -v claude) (version: $(claude --version 2>/dev/null | head -1))"
else
  bad "claude CLI not found on PATH. Install it from https://code.claude.com"
fi

step "2. Plugin manifest"
if [[ -f .claude-plugin/plugin.json ]]; then
  if claude plugin validate . >/dev/null 2>&1; then
    ok ".claude-plugin/plugin.json validates against Anthropic schema"
  else
    bad ".claude-plugin/plugin.json failed validation. Run: claude plugin validate ."
  fi
else
  bad ".claude-plugin/plugin.json missing"
fi

step "3. Marketplace manifest (sibling repo)"
MKT_REPO="$REPO_ROOT/../claude-plugins"
if [[ -f "$MKT_REPO/.claude-plugin/marketplace.json" ]]; then
  if claude plugin validate "$MKT_REPO" >/dev/null 2>&1; then
    ok "claude-plugins/.claude-plugin/marketplace.json validates"
  else
    bad "marketplace.json failed validation. Run: claude plugin validate $MKT_REPO"
  fi
else
  soft "claude-plugins repo not found at $MKT_REPO; skipping marketplace check"
fi

step "4. Skill path"
if [[ -f skills/event-outbound/SKILL.md ]]; then
  ok "skills/event-outbound/SKILL.md exists"
else
  bad "skills/event-outbound/SKILL.md missing. Plugin will load but skill will not register."
fi

step "5. Apollo merge fields"
ALLOWED='first_name|company|title|sender_first_name|sender_company|event_name|event_city|event_venue|event_day_of_week|booth_or_hall|peer_company|activity_signal|session_name|snake_case'
bad_fields=$(grep -hoE '\{\{[a-z_]+\}\}' examples/*/final_sequence.md 2>/dev/null \
  | sed -E 's/\{\{|\}\}//g' \
  | sort -u \
  | grep -vE "^($ALLOWED)$" || true)
if [[ -z "$bad_fields" ]]; then
  ok "All Apollo merge fields resolve to the documented glossary"
else
  bad "Unknown merge fields found in examples:"
  printf "%s\n" "$bad_fields" | sed 's/^/         /'
fi

step "6. Banned phrases in example touches"
# Only scan the generated sequences. The credits section intentionally mentions
# "no pitch-speak" when describing the validator; that is a rule description,
# not a touch violation.
banned=$(grep -rn -iE "want me to send|want me to drop|\bno pitch\b|not a pitch|peer channel|yours to keep" \
  examples/*/final_sequence.md 2>/dev/null \
  | grep -vE "banned-phrase|blocklist|no \"not a pitch\"|no gating" \
  || true)
if [[ -z "$banned" ]]; then
  ok "No banned phrases in example touches"
else
  bad "Banned phrases found in example touches:"
  printf "%s\n" "$banned" | sed 's/^/         /'
fi

step "7. Em-dashes in prose"
emd=$(grep -rn -- "—" README.md skills/event-outbound/SKILL.md CHANGELOG.md 2>/dev/null || true)
if [[ -z "$emd" ]]; then
  ok "No em-dashes in top-level prose"
else
  bad "Em-dashes found:"
  printf "%s\n" "$emd" | sed 's/^/         /'
fi

step "8. Cover image"
COVER="marketplace/cover-1200x630.png"
if [[ -f "$COVER" ]]; then
  dim=$(file "$COVER" 2>/dev/null | grep -oE '[0-9]+ x [0-9]+' | head -1)
  if [[ "$dim" == "1200 x 630" ]]; then
    size=$(wc -c < "$COVER" | tr -d ' ')
    ok "cover-1200x630.png: ${dim}, ${size} bytes"
  else
    bad "cover-1200x630.png has wrong dimensions: $dim (expected 1200 x 630)"
  fi
else
  bad "Cover image not found at $COVER"
fi

step "9. Live plugin load test"
if [[ $SKIP_LIVE -eq 1 ]]; then
  soft "Skipped (--skip-live). Run manually: claude --plugin-dir $REPO_ROOT"
else
  if command -v claude >/dev/null 2>&1; then
    # Non-interactive: ask claude to list plugins and confirm ours is loaded.
    out=$(claude --plugin-dir "$REPO_ROOT" -p "Run /plugin list and output only the plugin names you see, one per line." 2>&1 || true)
    if echo "$out" | grep -qi "event-outbound"; then
      ok "claude --plugin-dir loaded event-outbound successfully"
    else
      soft "Could not confirm plugin load via headless run. Output was:"
      echo "$out" | head -20 | sed 's/^/         /'
      echo "         (This check is best-effort; run 'claude --plugin-dir $REPO_ROOT' manually to verify.)"
    fi
  else
    bad "claude CLI missing; cannot run live load test"
  fi
fi

printf "\n\033[1mSummary\033[0m: %d passed, %d failed, %d warned\n" "$pass" "$fail" "$warn"
if [[ $fail -gt 0 ]]; then
  exit 1
fi
exit 0
