function initialize(historyElement: HTMLElement) {
  const greeting = generateBanner();
  terminalPromptText.innerHTML = getPrompt();
  historyElement.innerHTML = greeting;
}

function updateHistory(historyElement: HTMLElement, inputElement: HTMLInputElement) {
  const inputValue = inputElement.value.trim();

  if (inputValue.startsWith('sudo')) {
    window.location.href = 'https://youtu.be/U8wLBOlCKPU?feature=shared';
  } else if (inputValue.startsWith('date')) {
    if (inputValue != 'date') {
      writeTooManyParameters('date', historyElement, inputElement);
      return;
    }
    const date = new Date();
    writeToHistory(inputElement.value, date.toString(), historyElement);
  } else if (inputValue.startsWith('help')) {
    const helptext =
      "Available Commands:\n" +
      "\n" +
      "help  - Displays this help message.\n" +
      "date  - Shows the current date and time.\n" +
      "ls    - Lists all files and directories in the current directory.\n" +
      "cat   - Concatenates and displays the content of files.\n" +
      "sudo  - Executes a command with superuser (root) privileges.\n" +
      "cd    - Changes the current directory to the specified path.\n";

    writeToHistory(inputElement.value, helptext, historyElement);
  } else if (inputValue.startsWith('cd')) {
    const output = cdCommand(inputValue);
    writeToHistory(inputElement.value, output, historyElement);
  } else if (inputValue.startsWith('cat')) {
    const output = catCommand(inputValue);
    writeToHistory(inputElement.value, output, historyElement);
  } else if (inputValue.startsWith('ls')) {
    const output = lsCommand(inputValue);
    writeToHistory(inputElement.value, output, historyElement);
  } else if (inputValue.startsWith('tree')) {
    if (inputValue != 'tree') {
      writeTooManyParameters('tree', historyElement, inputElement);
      return;
    }
    const output = treeCommand();
    writeToHistory(inputElement.value, output, historyElement);
  } else {
    writeToHistory(inputElement.value, 'bash: command not found: ' + inputValue, historyElement);
  }

  inputElement.value = '';
  terminalPromptText.innerHTML = getPrompt();
  terminalBody.scrollTo(0, terminalBody.scrollHeight);
}

function addCloseCability() {
  const buttons = document.getElementsByClassName('terminal-header_circle');
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i] as HTMLElement;
    button.onclick = closeTerminal;
  }
}

function closeTerminal() {
  const terminal = fetchElement('terminal');
  terminal.style.display = 'none';
}

const historyElement = fetchElement('terminal-history');
const terminalPromptText = fetchElement('terminal-prompt_text');
const terminalBody = fetchElement('terminal-body');
const inputElement = fetchElement('terminal-prompt_input') as HTMLInputElement;

inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    updateHistory(historyElement, inputElement);
  }
});
initialize(historyElement);
addCloseCability();
let oldPrompt = getPrompt();
