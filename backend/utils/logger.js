const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const logger = {
  info: (msg, ...args) =>
    console.log(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.cyan}ℹ${colors.reset} ${msg}`, ...args),

  success: (msg, ...args) =>
    console.log(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.green}✓${colors.reset} ${msg}`, ...args),

  warn: (msg, ...args) =>
    console.warn(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.yellow}⚠${colors.reset} ${msg}`, ...args),

  error: (msg, ...args) =>
    console.error(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.red}✗${colors.reset} ${msg}`, ...args),

  db: (msg, ...args) =>
    console.log(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.magenta}🗄${colors.reset} ${msg}`, ...args),

  api: (method, path, status, ms) => {
    const statusColor = status < 300 ? colors.green : status < 400 ? colors.yellow : colors.red;
    console.log(
      `${colors.dim}[${timestamp()}]${colors.reset} ${colors.blue}→${colors.reset} ` +
      `${colors.bright}${method.padEnd(6)}${colors.reset} ${path.padEnd(35)} ` +
      `${statusColor}${status}${colors.reset} ${colors.dim}${ms}ms${colors.reset}`
    );
  },
};

module.exports = logger;
