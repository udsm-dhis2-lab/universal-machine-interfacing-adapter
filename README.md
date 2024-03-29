<!--
 Copyright 2023 UDSM DHIS2 Lab All rights reserved.
 Use of this source code is governed by a BSD-style
 license that can be found in the LICENSE file.
-->

# Machine Interfacing

A desktop app that can be used to interface between Lab machines and LIS. The app is written in Electron and uses SQLite as data storage.

## Run Locally

Clone the project

```bash
  git clone https://github.com/udsm-dhis2-lab/machine-interfacing
```

Go to the project directory

```bash
  cd machine-interfacing
```

Install dependencies

```bash
  npm install --legacy-peer-deps
```

Start the server

```bash
  npm start
```

## Building

- The app can be built as an executable depending on the environment you choose since the underlying electron technology produces a cross-platform app.

- From your app directory in the terminal, run

```bash
npm run package
```

- By default, the above command produces an executable similar to the os used to run.

- The executable will be available in

```bash
releases
```

## Tech Stack

**Client:** Angular, Redux, Bootstrap, and Angular Material

**Renderer:** Electron

## Features Supported

### Authentication

![Login](./docs/images/login.png)

- In-app (App users)

- External login
  - External login is Supported since the app was built to link with any LIS and not just ETL so a user can either log in with in app user credentials or external system credentials.

### Settings

![Settings](./docs/images/settings.png)

      1. General Settings(Machine configurations and General System Settings)
      2. Functions and Secrets(To the core, the app uses functions for communication to any LIS)
      3. Mapping(If an external LIS uses mapped items for data, then you can add the mappings to be used in data sync)
      4. Users, Roles and Privileges(Creating in-app users and their credentials)

#### General Settings

![General Settings](./docs/images/general-settings.png)

- From this page, we can add new machines and their respective settings ready for connection.

- Adding new Machine with details

![Machine](./docs/images/machine.png)

#### Functions and Secrets

![Functions](./docs/images/functions.png)

- You can add new JavaScript functions that are used to sync between the app and LIS. Also, these externally written functions are the ones used for external login.

- Every function contains optional secrets that can be sensitive information inserted in the functions at the time of execution.

Adding a new function
![Function](./docs/images/function.png)

Adding new Secret
![Secret](./docs/images/secret.png)

#### Mapping

![Mapping](./docs/images/mappings.png)

- This section of settings helps with adding mappings if the LIS with which the app sending data requires that.

### Dashboard

![Dashboard](./docs/images/dashboard.png)

- The dashboard shows the following

  - Live application Logs(Data and sync logs)
    ![Logs](./docs/images/logs.png)
  - Sync status summaries
    ![Status](./docs/images/status.png)

  - Machine connection status(Shows the machine connection status, the last connected machine IP and Port and you can reconnect or choose a new machine to connect to )
    ![Connection Status](./docs/images/conn.png)

  - You can select a new machine to connect to from the list of available with the `connect` button from the previous image
    ![Selecting Machine](./docs/images/select.png)

  - A connected machine will look as in the image below
    ![Connected Machine](./docs/images/connected.png)

### Sync Data

- We can sync data between the app and LIS with the following methods

  - Manual sync one record at a time
    ![Manual](./docs/images/manual.png)

  - Run a function that is responsible for data sync
    ![Sync](./docs/images/sync.png)
  - You can also schedule your sync to run at your desired time
    ![Schedule](./docs/images/schedule.png)

  - In every machine, you can also set data to sync directly to LIS as soon as it is received in the general machine settings

## Contributing

The App is currently closed source but this information will be updated as soon as it is open sourced

## Used By

This project is used by the following companies:

- [NTLP](https://ntlp.go.tz/)
- [NPHL](https://nphl.go.tz)

## Roadmap

- Add support for FTP communication machines

- Add support for Serial communication machines

- Add support for multiple parallel connections
