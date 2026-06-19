from agno.agent import Agent
from agno.models.ollama import Ollama
from agno.tools.shell import ShellTools
from agno.tools.file import FileTools

agent = Agent(
    model=Ollama(id="llama3.1:8b"),
    tools=[ShellTools(), FileTools()],
    debug_mode=True,
)

while True:
    prompt = input("\nYou: ").strip()
    if prompt.lower() in ("exit", "quit", "q"):
        break
    if not prompt:
        continue
    agent.print_response(prompt)
