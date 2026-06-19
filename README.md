# Welcome to Ollama Connect - Utilize Ollama APIs on WebUI

---

## Project Setup

- [Use Agent](agents/README.md) — Utilize Agentic LLM with Tools Capability
- [Setup Backend](backend/README.md) — Laravel API setup instructions
- [Setup Frontend](frontend/README.md) — React app setup instructions

---

# Local AI Stack Setup on Linux — Advanced Guide (Practiced & Tested)

**Stack:** Ollama + LM Studio + Qwen Code

## System Information

| Item | Value |
|---|---|
| OS | Kali Linux 6.18.9 (kali-amd64) |
| RAM | 16GB (6.5GB available during setup) |
| Node.js | v22.22.0 |

Command to find distro details:
```bash
uname -a
```

---

## Final Stack Status

| Tool | Notes |
|---|---|
| Ollama | Serving `qwen2.5-coder:7b` at `localhost:11434` |
| qwen2.5-coder:7b | 4.4GB Q4_K_M, stored at `/usr/share/ollama/.ollama/models/` |
| Qwen Code | v0.14.4 — binary: `qwen`, npm global |
| Qwen-Agent | Next step — Python SDK setup |

---

## Part 1: Ollama Setup

Ollama acts as the local model server. It runs as a background system service under its own dedicated `ollama` system user.

### Installation

```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl enable --now ollama
curl http://localhost:11434/api/tags   # verify API is live
```

### Model Selection

As a fullstack engineer, `qwen2.5-coder:7b` is the recommended model — fine-tuned specifically on code.

| RAM | Model | Command |
|---|---|---|
| 8GB | qwen2.5-coder:7b | `ollama pull qwen2.5-coder:7b` |
| 16GB | qwen2.5-coder:14b | `ollama pull qwen2.5-coder:14b` |
| 32GB+ | qwen2.5-coder:32b | `ollama pull qwen2.5-coder:32b` |

### Gotchas Encountered

- Ollama runs as system user `ollama` — home dir is `/usr/share/ollama` (not `/root` or `~/.ollama`)
- Model blobs are in `/usr/share/ollama/.ollama/models/blobs/` — owned by `ollama` user
- Add username to ollama group: `sudo usermod -aG ollama username`
- Fix directory traversal: `sudo chmod g+rx /usr/share/ollama/` (and subdirs)
- `qwen2.5-coder:7b` and `qwen2.5:7b` are different models — always use the **coder** variant

---

## Part 2: Qwen Code Setup

Qwen Code is a CLI tool that reads your project files and helps write, debug, and refactor code interactively.

### Installation

```bash
npm install -g @qwen-code/qwen-code
```

> **Important:** The binary name is `qwen`, not `qwen-code`. The package.json registers the binary as `qwen`.

Add npm global bin to PATH:

```bash
export PATH="$PATH:$(npm root -g)/../bin"
echo 'export PATH="$PATH:$(npm root -g)/../bin"' >> ~/.zshrc
qwen --version   # should show 0.14.4
```

### Configuration (Point to Ollama)

```bash
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_API_KEY=ollama
export OPENAI_MODEL=qwen2.5-coder:14b
```

### Usage

```bash
cd /var/www/html/project-dir
qwen   # starts interactive session with access to your project files
```

Example prompts to try:
- "What is this project and what tech stack does it use?"
- "Find any bugs in my Angular components"
- "Refactor this service to use async/await"
- "Write a Laravel API endpoint for user authentication"

---

## Troubleshooting Reference

**Ollama not responding**
```bash
sudo systemctl restart ollama
journalctl -u ollama -n 50
```

**`qwen` command not found after install**
```bash
export PATH="$PATH:$(npm root -g)/../bin"
```

**LM Studio AppImage won't open**
```bash
sudo apt install -y libfuse2
export TMPDIR=~/tmp && mkdir -p ~/tmp
./LM-Studio.AppImage --no-sandbox
```

**`/tmp` full — AppImage mount fails**
```bash
sudo rm -rf /tmp/*
echo 'export TMPDIR=~/tmp' >> ~/.zshrc
```

**EACCES on Ollama model files**
```bash
sudo usermod -aG ollama $USER
sudo chmod g+rx /usr/share/ollama/
sudo chmod g+rx /usr/share/ollama/.ollama/
sudo chmod g+rx /usr/share/ollama/.ollama/models/
sudo chmod g+rx /usr/share/ollama/.ollama/models/blobs/
newgrp ollama   # apply group in current session
```

**Out of RAM**
```bash
ollama pull qwen2.5:1.5b   # fallback lightweight model
```

---

## Quick Reference Card

| Tool | Start Command | Access |
|---|---|---|
| Ollama | `sudo systemctl start ollama` | http://localhost:11434 |
| Qwen Code | `qwen` (in any project dir) | Terminal CLI |
| Qwen-Agent | `source ~/qwen-env/bin/activate` | Python scripts (pending) |
