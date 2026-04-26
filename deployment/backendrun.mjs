#!/usr/bin/env zx

/**
 * The Pickbazar mock REST/GraphQL API has been removed.
 * The Kolshi platform uses the Kolshi Spring Boot backend instead.
 *
 * To start the backend in a local/dev environment:
 *
 *   cd kolshi-backend
 *   docker compose -f docker-compose.dev.yml up
 *
 * Or run the Spring Boot app directly (requires JDK 21 + running Postgres):
 *
 *   cd kolshi-backend
 *   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
 *
 * See kolshi-backend/docker-compose.dev.yml and ENV_SETUP.md for details.
 */

echo(chalk.yellow("⚠  The Pickbazar mock API has been removed."));
echo(chalk.blue("   Start the Kolshi Spring Boot backend instead:"));
echo("");
echo(chalk.white("   cd kolshi-backend"));
echo(chalk.white("   docker compose -f docker-compose.dev.yml up"));
echo("");
