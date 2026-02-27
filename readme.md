# Thinn Password Manager

Thinn Password Manager is a local-only desktop password manager built with Electron.

All vault data is encrypted and stored on your machine.  
No account system, no cloud sync, and no background server dependency.

## Core Principles

- Local first
- User-controlled encryption
- Minimal dependencies
- Clear and predictable UX

## Current Features

- Master-password protected encrypted vault
- Add, edit, delete password items
- Category-based organization and filtering
- Search by site, username, and URL
- Manual lock and inactivity auto-lock
- Account username update
- Change master password flow
- Import and export encrypted vault files

## Security Model (Current)

- Vault is encrypted before disk write
- Master password is not stored directly
- Vault is unlocked only in active app session
- Session is locked on demand and by inactivity timer
- No password recovery mechanism

If master password is lost, vault cannot be recovered.

## Tech Stack

- Electron
- Node.js `crypto`
- Vanilla JavaScript (ES modules)
- HTML + CSS

No frontend framework and no UI library.

## Run Locally

### Requirements

- Node.js (LTS recommended)
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production-like Run

```bash
npm start
```

## Scripts

- `npm run dev` - run Electron with `electronmon`
- `npm start` - run Electron directly
- `npm run lint` - syntax check for source files
- `npm test` - CI smoke checks
- `npm run ci:check` - full CI smoke checks

## CI/CD

GitHub Actions workflows are included:

- `CI` (`.github/workflows/ci.yml`)
  - Runs on push to `main` and pull requests targeting `main`
  - Installs dependencies
  - Runs `npm run lint` and `npm test`

- `CD Release` (`.github/workflows/cd-release.yml`)
  - Runs on version tags like `v1.0.0` (and manual dispatch)
  - Runs CI checks
  - Creates source bundles (`.tar.gz` and `.zip`)
  - Publishes them to GitHub Release assets

Release trigger example:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Project Layout

Main areas:

- `src/main/` - Electron main process and IPC handlers
- `src/vault/` - encryption, storage, vault business logic
- `src/renderer/` - UI, state, features, styles

For detailed tree, see [file-structure.md](./file-structure.md).

## Data Location (Linux)

By default, encrypted vault file is stored in Electron `userData` path, typically:

```text
~/.config/thinn-password-manager/vault.bin
```

## Import / Export

- Export produces an encrypted vault file protected by export password
- Import replaces current vault with selected encrypted file after password verification
- Wrong password or invalid file format is rejected

## Known Limits

- No sync / multi-device support
- No browser extension
- No recovery for forgotten master password
- Packaging/release pipeline is still in progress

## Roadmap (Planned)

- Better test coverage
- Release artifacts (`.deb`, `.exe`)
- UX polish for settings and item management
- More validation and edge-case hardening

## Contributing

Issues and pull requests are welcome.

When reporting bugs, include:

- OS version
- Reproduction steps
- Expected vs actual behavior
- Console/log output if available

## License

ISC

## Author

Thu Rein Phyoe
