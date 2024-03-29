#!/usr/bin/env node

import app from "../app";
import { DallEService, CacheService } from "../services";
import * as http from "http";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import debug from "debug";
import { SignatureVerifier } from "../helpers/verify";

dotenv.config();
/**
 * Module dependencies.
 */

const log = debug("collab-dall-e-action-express:server");

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Initialize all API key services, listen on provided port, on all network interfaces.
 */

Promise.all([SignatureVerifier.initVerifier()])
  .then((_) => {
    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);
  })
  .catch((e) => onError(e));

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
      process.exit(1);
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  log("Listening on " + bind);
  /**
   * Initialize services such as the OpenAI service and NodeCache service.
   */
  DallEService.initService();
  CacheService.initService();
}
