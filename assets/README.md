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

## Current set

29 images: 20 Hedgie, 6 Steve, 3 monster. Roughly 1000px on the long edge, ~1.4 MB total.

These were recovered from the legacy CloudFront/S3 image host after that service went
offline. They are now versioned here, so the library no longer depends on any host staying
up.

The library renders images at 100–350px wide, and 530px for the large centered one, so
~1000px is about right for a 2× display. There is no need for larger source art.
