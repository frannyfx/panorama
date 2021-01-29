# 6CCS3PRJ Individual Project
## Description
The **Panorama** project aims to shine light on the amount of work that contributors have carried out on a group project.

## Compiling
The following values need to be added to the `config.json` file before compilation:
- A valid RSA key generated using OpenSSL to sign tickets.
- GitHub client ID and secret.

### Backend
The backend code is written in TypeScript, so it needs to be compiled. Simply run the TypeScript compiler to do so:

```
npm run build-server
```

### Frontend
To compile the frontend using Webpack, which will also take care of compiling the TypeScript code, simply run:

```
npm run build-client
```

## Running
The server can be executed by running:

```
node dist/index.js
```

## Credits
- Francesco Compagnoni - Engineering
- Dr Jeroen Keppens - Supervisor
