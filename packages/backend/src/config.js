const DEFAULT_PORT = 3030;

function parsePort(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

function getPort(env = process.env) {
  return parsePort(env.PORT);
}

module.exports = {
  DEFAULT_PORT,
  getPort,
  parsePort,
};