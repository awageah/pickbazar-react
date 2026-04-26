#!/usr/bin/env zx
// NOTE: Kolshi uses REST only. GraphQL admin (admin/graphql) has been removed.

echo(chalk.blue("Front end project build"));

echo(chalk.blue("#Step 1 - Setting Up Server & Project"));
let domainName = await question("What is your domain name? ");
echo(chalk.green(`Your domain name is: ${domainName} \n`));

echo(chalk.blue("#Step 2 - Config Next Admin App For /admin Sub Directory"));
await $`cp admin/rest/next.config.js ./admin/rest/temp.js`;
await $`awk '{sub(/i18n,/, "i18n,basePath:\`/admin\`,"); print $0}' ./admin/rest/temp.js > ./admin/rest/next.config.js`;
await $`rm -rf ./admin/rest/temp.js`;

echo(chalk.blue("#Step 3 - Installing Frontend project dependencies"));
echo("Please wait a while till the successful installation of the dependencies");
await $`yarn`;

echo(chalk.blue("#Step 4 - Configuring environment variables"));

await $`rm -f ./shop/.env`;
await $`cp ./shop/.env.template ./shop/.env`;
await $`chmod 777 ./shop/.env`;
await $`awk '{gsub(/NEXT_PUBLIC_REST_API_ENDPOINT=.+"$/,"NEXT_PUBLIC_REST_API_ENDPOINT=\\"https://${domainName}/api\\""); print $0}' ./shop/.env.template > ./shop/.env`;
await $`awk '{gsub(/FRAMEWORK_PROVIDER=.+"$/,"FRAMEWORK_PROVIDER=\\"rest\\""); print $0}' ./shop/.env > ./shop/tmp && mv ./shop/tmp ./shop/.env && rm -rf ./shop/tmp`;

await $`rm -f ./admin/rest/.env`;
await $`cp ./admin/rest/.env.template ./admin/rest/.env`;
await $`chmod 777 ./admin/rest/.env`;
await $`awk '{gsub(/NEXT_PUBLIC_REST_API_ENDPOINT=.+"$/,"NEXT_PUBLIC_REST_API_ENDPOINT=\\"https://${domainName}/api\\""); print $0}' ./admin/rest/.env.template > ./admin/rest/.env`;

await $`cp ./shop/tsconfig.rest.json ./shop/tsconfig.json`;

await $`cp ./shop/next.config.js ./shop/temp.js`;
await $`awk '{sub(/YOUR_DOMAIN/, "${domainName}"); print $0}' ./shop/temp.js > ./shop/next.config.js`;
await $`rm -rf ./shop/temp.js`;

await $`cp ./admin/rest/next.config.js ./admin/rest/temp.js`;
await $`awk '{sub(/YOUR_DOMAIN/, "${domainName}"); print $0}' ./admin/rest/temp.js > ./admin/rest/next.config.js`;
await $`rm -rf ./admin/rest/temp.js`;

echo(chalk.blue("#Step 5 - Building REST apps"));
await $`yarn --cwd ./ build:shop-rest`;
await $`yarn --cwd ./ build:admin-rest`;

echo(chalk.blue("#Step 6 - Upload project file to server"));
let username = await question("Enter your server username (ex: ubuntu): ");
let ip_address = await question("Enter server ip address (ex: 11.111.111.11): ");

echo("########### connecting to server... ###########");

echo("Remove node_modules folder");
await $`rm -rf shop/node_modules`;
await $`rm -rf admin/rest/node_modules`;
await $`rm -rf ./node_modules`;

echo("Zipping shop, admin, package.json and yarn.lock");
await $`zip -r frontend.zip shop admin package.json yarn.lock`;

echo(chalk.green("frontend.zip file created"));
echo("Uploading frontend.zip to server, Please wait...");
await $`scp ./frontend.zip ${username}@${ip_address}:/var/www/pickbazar-react`;
echo(chalk.green("Uploaded frontend.zip to server"));

await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "unzip /var/www/pickbazar-react/frontend.zip -d /var/www/pickbazar-react";`;

echo(chalk.green("Your application build successful"));
