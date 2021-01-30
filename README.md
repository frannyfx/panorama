![Panorama header](docs/img/panorama.jpg)
# Panorama
## 📖 Description
The **Panorama** project aims to shine light on the amount of work that contributors have carried out on a group project.

## ☕️ Requirements
Panorama has the following requirements:
- Node.js ≥ 13.9.0;
- NPM ≥ 6.14.8;
- A Redis server for its distributed job queue system;
- `typescript` and `webpack-cli` installed as global Node modules.

## ⚙️ Compiling
The following values need to be added to the `config.json` file before compilation:
- 🔐 A valid RSA key generated using OpenSSL to sign tickets.
- 🐙 A valid GitHub client ID and secret.

You should build the frontend component first, as the script will also transfer the necessary files to the compilation directory.

### Frontend
To compile the frontend using Webpack, which will also take care of compiling the TypeScript code, simply run:

```
npm run build-client
```

### Backend
Firstly, install the NPM packages by running:
```
npm install
```

Additionally, if you haven't already, install the required modules globally:
```
npm install -g typescript webpack-cli
```

Then, compile the TypeScript code using the compiler:

```
npm run build-server
```

Make sure you let `node-gyp` compile `sqlite3` to a native module. If you get an error about this, just run:
```
npm rebuild
```

## 🏃‍♂️ Running
The server can be executed by running:

```
node dist/index.js
```

## 👨‍💻 Credits
- Francesco Compagnoni - Engineering
- Dr Jeroen Keppens - Supervisor
