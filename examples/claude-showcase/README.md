# Claude Showcase Runs

These fixtures are real Claude runs against the installed `event-outbound` skill. They are not golden copy to paste blindly. They are inspectable evidence for what Claude produced with the current skill instructions, plus deterministic checks for the quality invariants we care about.

Generated on 2026-05-11 with:

```bash
claude --plugin-dir /path/to/event-outbound \
  --permission-mode bypassPermissions \
  --no-session-persistence
```

## Cases

| Case | What it proves |
|---|---|
| `rich-positive-availability-unknown/` | Rich input produces a validator-passing sequence without invented proof, assets, or sender logistics. |
| `thin-input-probe/` | Thin input does not produce plausible vendor copy. Claude asks for the missing sender, proof, asset, and fit context. |
| `impossible-cadence/` | The skill refuses impossible cadence math instead of squeezing six pre-event emails into seven days. |
| `wrong-persona-guard/` | Persona-angle mismatch is flagged before drafting. |

Run the deterministic checks:

```bash
npm run check:showcase
```

To regenerate these with Claude, run the prompts in each case directory. Because Claude output is nondeterministic and requires local auth, regeneration is intentionally not part of CI.
