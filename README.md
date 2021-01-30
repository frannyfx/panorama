![Panorama header](docs/img/panorama.jpg)
# Panorama
## 📖 Description
The **Panorama** project aims to shine light on the amount of work that contributors have carried out on a group project.

## ☕️ Requirements
Panorama has the following requirements:
- Node.js ≥ 13.9.0;
- NPM ≥ 6.14.8;
- A Redis server for its distributed job queue system;

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
The backend code is written in TypeScript, so it needs to be compiled. Simply run the TypeScript compiler to do so:

```
npm run build-server
```

## 🏃‍♂️ Running
The server can be executed by running:

```
node dist/index.js
```

## 👨‍💻 Credits
- Francesco Compagnoni - Engineering
- Dr Jeroen Keppens - Supervisor
