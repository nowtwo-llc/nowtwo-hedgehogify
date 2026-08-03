# Security Policy

## Supported versions

Only the latest published version of `@nowtwo-llc/hedgehogify` receives security fixes.

## Reporting a vulnerability

Please **do not open a public issue** for a security report.

Use GitHub's private vulnerability reporting instead — go to the
[Security tab](https://github.com/nowtwo-llc/nowtwo-hedgehogify/security/advisories/new)
and open a draft advisory. That keeps the report private until a fix ships.

If you cannot use that, email <support@nowtwo.io>.

Please include what the issue is, how to reproduce it, and which version you tested.
We aim to acknowledge reports within a few business days.

## Scope

This is a browser animation library with no runtime dependencies and no backend. It creates
DOM elements, animates them, and optionally listens for a key sequence. Nothing about the
host page — its URL, its visitors, or their activity — is transmitted anywhere.

The things most worth reporting:

- **Image loading.** The only network requests are for the bundled images. Where they come
  from depends on `imageBaseUrl`: an explicit value, else a path resolved from the loading
  `<script>` tag, else this project's GitHub Pages deployment. Bundler consumers who do not
  set `imageBaseUrl` fall back to that third case, which is a normal cross-origin image
  request. If you find a way to make the library fetch from somewhere a caller did not
  intend, that is a vulnerability.
- **DOM injection.** Elements are built with `createElement` and attribute/property
  assignment; the library never touches `innerHTML`. If you find a path that turns
  caller-supplied input into parsed markup or executed script, we want to hear about it.
- **The Konami listener.** `konami()` attaches a `keydown` listener to `document` and
  `destroy()` removes it. Report anything that lets that listener outlive `destroy()`, or
  observe keystrokes beyond matching the fixed sequence.
- **Supply chain.** Anything about the published artifacts, the build, or the release
  workflow — for example a discrepancy between the published tarball and the tagged source.
  Releases are published from CI and carry build provenance, which you can verify with
  `npm audit signatures`.

Denial of service caused by requesting an unreasonable number of hedgehogs is not a
vulnerability — that is the caller's choice.
