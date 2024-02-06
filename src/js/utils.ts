
function fetchElement(name: string): HTMLElement {
  const historyElement = document.getElementById(name);
  if (historyElement == null) {
    throw Error('No history element fount');
  }
  return historyElement;
}

function writeToHistory(input: string, result: string, historyElement: HTMLElement) {
  if (historyElement.innerHTML[historyElement.innerHTML.length - 1] !== '\n') {
    historyElement.innerHTML += '\n';
  }
  historyElement.innerHTML += oldPrompt + input + '\n' + result;
  oldPrompt = getPrompt();
}

function writeTooManyParameters(command: string, historyElement: HTMLElement, inputElement: HTMLInputElement) {
  const usage =
    "Usage: " + command + "\n" +
    "\n" +
    "This command does not require any parameters or options.";

    writeToHistory(inputElement.value, usage , historyElement);
}

function generateBanner() {
  const historyElement = fetchElement('terminal-history');

  let greeting = "Welcome to the website of\n";
  let fontSize = 12 * 1; // convert pt to pixels (assuming the density browsers default to)
  let availableCharacters = Math.ceil(historyElement.clientWidth / fontSize);

  if (availableCharacters >= 45) {
    greeting +=
      " _____                  _____                 \n" +
      "|  _  |_____ ___ ___   |   __|___ ___ ___ ___ \n" +
      "|     |     | . |_ -|  |  |  |  _| . |_ -|_ -|\n" +
      "|__|__|_|_|_|___|___|  |_____|_| |___|___|___|\n";
  } else if (availableCharacters >= 23) {
    greeting +=
      " _____               \n" +
      "|  _  |_____ ___ ___ \n" +
      "|     |     | . |_ -|\n" +
      "|__|__|_|_|_|___|___|\n" +
      " _____                 \n" +
      "|   __|___ ___ ___ ___ \n" +
      "|  |  |  _| . |_ -|_ -|\n" +
      "|_____|_| |___|___|___|\n";
  } else {
    greeting += "Amos Gross\n";
  }
  greeting +=
    "\n" +
    "I’m a software engineer at BMW. I love working with rust, android and in the cloud. Currently I’m doing my masters in Luxembourg and France, with a focus on cyber security.\n" +
    "\n" +
    "To navigate around use “ls” and “cd”. You can read files using “cat”. The file tree can be printed using tree.\n" +
    "Type in “help” for more information.";
  return greeting;
}

