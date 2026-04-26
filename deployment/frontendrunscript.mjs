#!/usr/bin/env zx
// NOTE: Kolshi uses REST only. GraphQL admin (admin/graphql) has been removed.

echo(chalk.blue("#Step 1 - Installing Frontend project dependencies"));
echo("Please wait a while till the successful installation of the dependencies");
await $`yarn --cwd /var/www/pickbazar-react/`;

echo(chalk.blue("#Step 2 - Starting REST apps with pm2"));

echo(chalk.blue("Running Shop (REST) with pm2"));
await $`pm2 --name shop-rest start yarn --cwd /var/www/pickbazar-react -- run start:shop-rest`;

echo(chalk.blue("Running Admin (REST) with pm2"));
await $`pm2 --name admin-rest start yarn --cwd /var/www/pickbazar-react -- run start:admin-rest`;
