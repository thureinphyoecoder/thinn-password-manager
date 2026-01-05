# Thinn Password Manager

A local-only password manager built with Electron.

This project is written using **HTML, CSS, and Vanilla JavaScript** only.
No frontend frameworks are used.

All data stays on your local machine.

---

## About

Thinn Password Manager is a desktop application that allows you to store and manage passwords securely without relying on any cloud service.

There are:

- No accounts
- No servers
- No background network connections

Everything is encrypted and stored locally.

---

## Important Notice

This is my **first serious project** built with Electron.

Because of that:

- There may be bugs
- There may be design flaws
- There may be edge cases I have not considered yet

I welcome **constructive feedback and suggestions** to improve the project.

---

## Features

- Local-only encrypted vault
- Master password–based encryption
- Password items with username, URL, and notes
- Category system (stored inside the vault)
- Auto-lock after inactivity
- Username settings
- Import and export encrypted vault files

---

## Security

- The vault is encrypted using the master password
- The master password is never stored
- There is **no password recovery**

If the master password is lost, the vault cannot be recovered.
This is a deliberate design choice.

---

## Tech Stack

- Electron
- Node.js (crypto)
- HTML
- CSS
- Vanilla JavaScript (ES modules)

No frameworks.
No UI libraries.

---

## Project Structure

See `file-structure.md` for a detailed explanation of the folder layout and responsibilities.

---

## Distribution

Prebuilt binaries are **not included yet**.

I plan to upload:

- `.deb` (Linux)
- `.exe` (Windows)

directly to GitHub releases in the future.

---

## Status

This project is currently in development.
Core functionality is working, but the application is still evolving.

---

## Author

Thu Rein Phyoe
