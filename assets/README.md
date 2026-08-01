# Hedgehogify assets

Every image in this directory is bundled into the published package and listed in the
generated manifest at `src/assets.generated.ts`.

## Naming convention

The filename prefix determines the character, which is what makes the `disableSteve` and
`disableMonsters` options work client-side:

| Prefix     | Character | Disabled by         |
| ---------- | --------- | ------------------- |
| `hedgie-`  | Hedgie    | never               |
| `steve-`   | Steve     | `disableSteve`      |
| `monster-` | Monster   | `disableMonsters`   |

Anything not matching a known prefix is treated as `hedgie`.

Supported extensions: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`.

## Adding artwork

1. Drop files in here following the convention above, e.g. `hedgie-waving.png`.
2. Run `npm run assets` to regenerate the manifest.

`npm run build` regenerates the manifest automatically, so a normal build picks up new
files without a separate step.

## Placeholders

`hedgie-placeholder.svg`, `steve-placeholder.svg`, and `monster-placeholder.svg` are
stand-ins so the demo and test suite have something to render. **Replace them with the real
artwork before publishing** and delete these three files — they are not shipping art.
