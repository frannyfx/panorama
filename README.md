![Panorama header](docs/img/panorama.jpg)
# Panorama
## 📖 Description
The **Panorama** project aims to shine light on the amount of work that contributors have carried out on a group project. A deployed version of the project can be found at https://panorama.fran.codes/.

## ☕️ Requirements
Panorama has the following requirements:
- Node ≥ 15.12.0 and NPM ≥ 7.6.3;
- Redis;
- A MySQL server;
- OpenSSL or another utility capable of generating RSA keys.

## ⚙️ Set-up
You should build the frontend component first, as the script will also transfer the necessary files to the compilation directory.

It's worth noting that these instructions assume a  macOS or 🐧 Linux environment, so your mileage may vary.

### Prerequisites
#### GitHub
Panorama requires GitHub OAUTH tokens to use the GitHub API.
- Navigate to GitHub and log into your account.
- Navigate to *Settings > Developer Settings > OAuth Apps*.
- Click the *New OAuth App* button.
- Fill-in the required fields including the application's name.
- Ensure that the *Authorization Callback URL* field is set to "\<protocol\>://\<host\>/api/github/callback", replacing \<protocol\> with either "http" or "https" depending on your hosting, and \<host\> with the IP address or the URL on which you wish to host Panorama.
- Click *Register Application*.
- Copy the *Client ID* and *Client Secret* tokens and store them in a safe place (you may be asked to generate a new *Client Secret* token).

#### RSA Key
You will need a valid RSA private key which will be used in Panorama's cryptographic modules. To generate one, run:
```bash
openssl genrsa -out assets/crypto/key.pem
```
#### Dependencies
Install Panorama's dependencies by running:

```bash
npm install
```

Additionally, if you haven't already, install required packages globally:

```bash
npm install -g typescript webpack-cli
```

#### Database
Import the MySQL schema located in `deployment/panorama-db.sql` into your MySQL database using your preferred database management system.

### Frontend
To compile the frontend using Webpack, which will also take care of compiling the TypeScript code, simply run:

```bash
npm run build-client
```

Running Webpack in production mode will drastically reduce file size and optimise the output, but may take a long time to complete. To do so, run the following command:

```bash
npm run build-client-prod
```

### Backend
#### Configuration
Create a new `panorama.json` file by running:

```bash
cp src/server/panorama.default.json src/server/panorama.json
```

Edit the new config file in your preferred editor to include the *Client ID* and *Client Secret* tokens you generated for your app, MySQL database and Redis connection details. For reference, open the *Config.ts* file in *src/server* to read a description of every property.

```bash
nano src/server/panorama.json
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
- Francesco Compagnoni - Engineering.
- Dr Jeroen Keppens - Project supervisor.
- Dr Christian Urban - Guidance with lexing system.

### Notable works
- [POSIX Lexing with Derivatives of Regular Expressions](https://core.ac.uk/download/pdf/73346332.pdf) by Fahad Ausaf, Roy Dyckhoff and Christian Urban.