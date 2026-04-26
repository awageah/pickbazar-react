# Automation scripts for Pickbazar React (Kolshi)

> **Note:** The Pickbazar mock REST/GraphQL backend (`api/rest`, `api/graphql`) has been
> removed. The Kolshi Spring Boot backend is used instead. Start it with:
> ```bash
> cd kolshi-backend
> docker compose -f docker-compose.dev.yml up
> ```

#### At first login your server from terminal

```bash
ssh SERVER_USERNAME@SERVERIP
```

#### Upload deployment project to Virtual Server from your PC - RUN on Local PC
To upload the zipped `deployment` files to server you need to run the below command from your pickbazar project root
> while running below command you will be asked for your server `username` and `ip address`;
> files path looks like `/home/your_project_folder_path/pickbazar-react/deployment.zip`

```bash
    bash deployment/deployment.sh
````

#### Server Environment setup script - RUN on Virtual Server

```bash
    bash /var/www/pickbazar-react/deployment/nodesetup.sh
````

#### Nginx Setup And Settings - RUN on Virtual Server

```bash
    zx /var/www/pickbazar-react/deployment/setenv.mjs
````

#### Frontend build script - RUN on Local PC
Run the below command from your pickbazar-react project root

```bash
    zx deployment/frontendbuildscript.mjs
```

#### Frontend run script - RUN on Virtual Server

```bash
    zx /var/www/pickbazar-react/deployment/frontendrunscript.mjs
```
