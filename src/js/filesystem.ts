
let filesystem: FileSystemType = {
  "Banner.txt": generateBanner(),
  "PGP.txt": `-----BEGIN PGP PUBLIC KEY BLOCK-----
mDMEZ3VRmBYJKwYBBAHaRw8BAQdAexoQQs6PmYvINHJuHExxnRbpT4mkzaXIHYxJ
gngqHEq0IEFtb3MgR3Jvc3MgPGVtYWlsQGFtb3Nncm9zcy5jb20+iJkEExYKAEEW
IQQ9u444qi5/WxB/aUppsLWMiiansQUCZ3VRmAIbAwUJA8JnAAULCQgHAgIiAgYV
CgkICwIEFgIDAQIeBwIXgAAKCRBpsLWMiiansVXKAQC2iu3n8pXWQICYILDI6FB/
l/Vuo15a2qg8KvAVZYnP5AD+J/47zyQ/fGCOJXub/cDTx6q/vm4bBA3yZjruRmfV
EQe4OARndVGYEgorBgEEAZdVAQUBAQdAr71I7B2W9YzWjFLmTVmgU2e8xsOAZZH6
yq66IxbnCkgDAQgHiH4EGBYKACYWIQQ9u444qi5/WxB/aUppsLWMiiansQUCZ3VR
mAIbDAUJA8JnAAAKCRBpsLWMiianscOGAQDQ2b/Q+49eibNYYPpAPEbbR2uP7dVe
NCQR6nvgIzddCwEAh4r+7/c2zbK/UF0Li99gTQjEK4GXIM+zsscA/BG/Ywo=
=J2B/
-----END PGP PUBLIC KEY BLOCK-----`,
  "Socials": {
    "Linkedin.txt" : "https://www.linkedin.com/in/amos-gross/",
    "Github.txt": "https://github.com/grossamos/"
  },
  "Projects" : {
    "Oxos.md": "# OXOS\n" +
            "\n" +
            "A monolithic kernel that can run tic-tac-toe. Its process model is static and is based around a batch loader. It can only support one process at a time and the order of programms is set before boot. oxos has a synchronous interrupt-based Kernel API. Programms can use kernel functions by interacting with the oxos system library. The kernel offers syscalls for GPIO, display and UART.\n" +
            "You can find more information on [Github](https://github.com/grossamos/oxos)\n",
    "Rudra.md": "# Rudra\n" +
                "\n" +
                "Rudra is an openapi based test coverage analysis tool. It allows teams to set and enforce coverage levels for integration tests in CI/CD-pipelines.\n" +
                "You can find more information on [Github](https://github.com/grossamos/rudra)\n",
    "Throwscape.md": "# Throwscape\n" +
                     "Throwscape is a container-native static webserver written in rust. It attempts to improve upon the currently popular webservers by providing a simple and cloud driven aproach to deploying static content in a container driven context. \nIn our minds you shouldn't have to mess around creating docker images and configuration files to host your webpages only to find out that you're still carrying around all the added baggage of nginx, apache etc.\nWith throwscape you'll have a fully configured webserver in a single command.\n"+
                     "You can find more information on [Github](https://github.com/grossamos/throwscape)\n",
  }
}
/*
█▀█ █▀█▀█ █▀█ █▀▀  █▀▀ █▀█ █▀█ █▀▀ █▀▀
█▀█ █ ▀ █ █ █ ▀▀█  █ █ █▀▄ █ █ ▀▀█ ▀▀█
▀ ▀ ▀   ▀ ▀▀▀ ▀▀▀  ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀▀▀
*/
type FileSystemType = {
    [key: string]: string | FileSystemType;
};;

let current_directory = ['~'];

function get_err_no_directory_with_name(file: string): string {
  const errortext_no_directory_with_that_name = "cannot access " + file+ ": No such file or directory";
  return errortext_no_directory_with_that_name
}

function getPrompt() {
  const prompt_text = `<span class="green">amos@website</span><span class="blue"> ${current_directory[current_directory.length - 1]} $ </span>`;
  return prompt_text;
}

function catCommand(inputValue: string): string {
  inputValue = inputValue.substring(4);

  let cd = current_directory.concat(inputValue.split('/'));
  let file: any = filesystem;

  for (let i = 1; i < cd.length; i += 1) {
    file = file[cd[i]];
    if (i === cd.length - 1) {
      if (typeof file == 'string') {
        return file;
      }
    } else if (typeof file === 'undefined') {
      break;
    }
  }
  return "cat: no such file or directory";
}

function cdCommand(inputValue: string): string {
  inputValue = inputValue.substring(3);
  if (inputValue === '') {
    current_directory = ['~'];
    return ''
  } if (inputValue === '..') {
    current_directory.pop()
    return ''
  }

  let cd = current_directory.concat(inputValue.split('/'));
  let directory = filesystem;

  for (let i = 1; i < cd.length; i += 1) {
    directory = directory[cd[i]] as FileSystemType;
    if (typeof directory === 'undefined') {
      return "cd: " + get_err_no_directory_with_name(inputValue)
    } else if (typeof directory === 'string') {
      return "cd: not a directory: " + cd[i];
    }
  }

  current_directory = cd;

  return ''
}

function lsCommand(inputValue: string): string  {
  let output = "";

  inputValue = inputValue.substring(3);

  let prefix = '';
  let hasMoreInfo = false;
  if (inputValue.startsWith('-') && inputValue.substring(0,3).includes('l')) {
    prefix = 'rwxr-xr-x. 1 amos amos    420 Jan 1 00:01 ';
    hasMoreInfo = true;
  }

  let directory = filesystem;
  let cd = current_directory;

  const pattern = /(-\w+) (.*)/i;
  const match = inputValue.match(pattern);
  let filename = "~";
  if (match && match[2]) {
    filename = match[2];
    cd = cd.concat(match[2].toString().split('/'));
  }

  for (let i = 1; i < cd.length; i += 1) {
    directory = directory[cd[i]] as FileSystemType;
    if (typeof directory === 'undefined') {
      output = "ls: " + get_err_no_directory_with_name(filename);
      return output;
    } else if (typeof directory === 'string') {
      output = prefix + cd[cd.length - 1];
      return output;
    }
  }

  for (let child in directory) {
    output += prefix + child;
    if (typeof directory[child] != 'string') {
      output + '/';
    }
    if (hasMoreInfo) {
      output += "\n";
    } else {
      output += "  ";
    }
  }

  if (hasMoreInfo) {
    output = output.substring(0, output.length - 1);
  }

  return output;
}

const seperator_horrizontal = '── '
const seperator_vertical = '|'

function treeCommand():string {
  let output = current_directory[current_directory.length - 1] + "\n";
  output += produceStringForDir(filesystem, seperator_vertical)
  output = output.substring(0, output.length - 1);
  return output;
}

function produceStringForDir(parent_directory: FileSystemType, prefix: string): string {
  let result = ""
  for (let child in parent_directory) {
    result += prefix + seperator_horrizontal + child + '\n';
    if (typeof parent_directory[child] !== 'string') {
      result += produceStringForDir(parent_directory[child] as FileSystemType, prefix + "   " + seperator_vertical);
    }
  }
  return result
}
