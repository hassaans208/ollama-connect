# Ollama Shell Agent

A lightweight CLI agent powered by a local **Ollama** model (`llama3.1:8b`), with shell and file access via [Agno](https://github.com/agno-agi/agno).

## Requirements

- Python 3.10+
- [Ollama](https://ollama.com) running locally with `llama3.1:8b` pulled

```bash
ollama pull llama3.1:8b
```

## Setup

```bash
cd agents/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python agent.py
```

Type your prompt at the `You:` line. Type `exit`, `quit`, or `q` to stop.

## ⚠️ Note

This agent can execute shell commands and read/write files based on model output. Run it only in a trusted, local environment.
