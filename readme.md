# Thinn Password Manager

Thinn Password Manager is a local-only desktop password manager built with Electron.

- No cloud sync
- No backend server
- No account system
- Encrypted vault stored only on your machine

## Features

- Create and unlock vault with master password
- Add, edit, delete password items
- Categories with filtering
- Search by site, username, and URL
- Manual lock + inactivity auto-lock (30s, 1m, 2m, 3m, 5m, never)
- Update account username
- Change master password
- Import/export encrypted vault files
- Password visibility toggle (`eye`) in auth/import/export flows

## Screenshots

### Create Account

![Create Account](./docs/screenshots/p1.png)

### Unlock Vault

![Unlock Vault](./docs/screenshots/p2.png)

### Settings (Security)

![Settings Security](./docs/screenshots/p3.png)

### Vault List

![Vault List](./docs/screenshots/Screenshot_2026-02-27_20-17-16.png)

## Security Notes

- Vault is encrypted before write to disk
- Master password is not stored in plaintext
- Decrypted data exists only in active unlocked session memory
- Auto-lock and manual lock clear active session state
- Invalid import files and wrong import passwords are rejected

If you forget the master password, recovery is not possible.

## Stack

- Electron
- Node.js `crypto` (AES-GCM + scrypt-based key derivation)
- Vanilla JavaScript (ES modules in renderer, CommonJS in main/vault)
- HTML/CSS

## Local Development

Requirements:

- Node.js 20+
- npm

Install:

```bash
npm install
```

Run in dev mode:

```bash
npm run dev
```

Run directly:

```bash
npm start
```

## Test

```bash
npm test
```

Current suite covers:

- Username validation/normalization
- Vault lock timing behavior (including 2-minute setting)
- Vault service lifecycle (save/unlock/CRUD/lock)
- Import/export success and failure paths
- Timestamp behavior (`createdAt`, `updatedAt`)

## Build Artifacts

Linux `.deb`:

```bash
npm run dist:linux
```

Windows `.exe` (NSIS):

```bash
npm run dist:win
```

Output directory:

```text
dist/
```

## CI/CD

GitHub Actions:

- `CI` (`.github/workflows/ci.yml`)
  - Trigger: push/PR on `main`
  - Runs install + `npm test`

- `CD Release` (`.github/workflows/cd-release.yml`)
  - Trigger: tag push (`v*`) or manual dispatch
  - Builds Linux `.deb` and Windows `.exe`
  - Publishes artifacts to GitHub Release assets

Release example:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Project Structure

- `src/main/` Electron main process + IPC
- `src/vault/` crypto/storage/business logic
- `src/renderer/` UI, state, features, styles
- `tests/` node:test coverage
- `build/` icon/build resources

Detailed tree: [file-structure.md](./file-structure.md)

## Vault Storage Location (Linux)

Typical Electron userData path:

```text
~/.config/thinn-password-manager/vault.bin
```

## Troubleshooting

- If desktop icon does not update, fully close app and reopen (OS icon cache).
- If CI dependency install fails intermittently, retry workflow (network issue).

## License

ISC

## Author

Thu Rein Phyoe
