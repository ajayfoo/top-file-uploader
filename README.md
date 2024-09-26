# TOP File Uploader
A dynamic website where logged in users can create folders and upload files in them, download the uploaded files and create an expirable public link of a file or folder to share it with others.
## Table Of Contents
- [How to setup?](#how-to-setup)
- [How to run?](#how-to-run)
- [Short Video Overview](#short-video-overview)

## How to setup?
The setup needs to be done only once.
### Step 1: Install PostgreSQL Or any RDBMS supported by Prsima ORM
You can use [The Odin Project's brilliant article](https://www.theodinproject.com/lessons/nodejs-installing-postgresql) to install PostgreSQL 
or follow the instructions given in [PostgreSQL's official website](https://www.postgresql.org/download/)

### Step 2: Create .env file
Create a file named .env in the project root folder and copy the contents of dot-env-example to .env. Then replace the placeholders with actuals values for 
each environment variables by following the hints given.

### Step 3: Bootstrap Database
Run the following commands in order in the project root folder after [installing nodejs](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)
```sh
# Installs the dependencies
npm install
```
```sh
# Creates database schema
npx prisma db push
```
## How to run?
Please [setup the project](#how-to-setup) before running it.  
For development
```sh
npm run debug
```
Launch a browser and go to localhost:3000 or localhost:<port number that you set in .env>, put username and password as demo.

## Short Video Overview
**Warning: Contains flashing lights**

https://github.com/user-attachments/assets/59aa5b8e-a4d2-4241-9154-104fe757c2c5

