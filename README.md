![Panorama header](docs/img/panorama.jpg)
# Panorama
## 📖 Description
The **Panorama** project aims to shine light on the amount of work that contributors have carried out on a group project.

## ☕️ Requirements
Panorama has the following requirements:
- Node ≥ 15.12.0 and NPM ≥ 7.6.3;
- Redis;

## ⚙️ Set-up
You should build the frontend component first, as the script will also transfer the necessary files to the compilation directory.

It's worth noting that these instructions assume a  macOS or 🐧 Linux environment, so your mileage may vary.

### Frontend
To compile the frontend using Webpack, which will also take care of compiling the TypeScript code, simply run:

```bash
npm run build-client
```

Running Webpack in production mode will drastically reduce file size, but may take a long time to complete. To do so, run the following command:

```bash
npm run build-client-prod
```

### Backend
#### Configuration
Create a new `panorama.json` file by running:

```bash
cp src/server/panorama.default.json src/server/panorama.json
```

Edit the new config file in your preferred editor to include the client ID and secret for your app, and modify the parameters as you need.

```bash
nano src/server/panorama.json
```

You will also need a valid RSA private key used in Panorama's cryptographic modules. To generate one, run:

```bash
openssl genrsa -out assets/crypto/key.pem
```

#### Prerequisites
Firstly, install the NPM packages by running:

```bash
npm install
```

Additionally, if you haven't already, install the required modules globally:

```bash
npm install -g typescript webpack-cli
```

#### Compiling
Then, compile the TypeScript code using the compiler:

```bash
npm run build-server
```

Make sure you let `node-gyp` compile `sqlite3` to a native module. If you get an error about this, just run:

```bash
npm rebuild
```

#### Database
Import the Panorama MySQL schema located in `deployment/panorama-db.sql` into your MySQL database and make sure to update the `panorama.json` configuration file with the correct connection details.

## 🏃‍♂️ Running
The server can be executed by running:

```bash
node dist/server/index.js
```

## 🧪 Testing
All test suites can be executed by running:

```bash
npm test
```

It is highly recommended to create a `panorama.test.json` config file which points to a test database to prevent tests from conflicting with your production environment. If the test suite does not find this file, it will fall back to `panorama.json` and `panorama.default.json`.

## 👨‍💻 Credits
### Project
- Francesco Compagnoni - Engineering
- Dr Jeroen Keppens - Project supervisor
- Dr Christian Urban - Thanks for his amazing help with lexing

### Notable works
- [POSIX Lexing with Derivatives of Regular Expressions](https://core.ac.uk/download/pdf/73346332.pdf) by Fahad Ausaf, Roy Dyckhoff and Christian Urban.