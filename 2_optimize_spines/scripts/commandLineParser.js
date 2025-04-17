/**
 * Command line argument processing
 */

const path = require('path');
const fs = require('fs');

/**
 * Process command line arguments and return configuration
 * @returns {Object} Program configuration
 */
function processCommandLineArgs() {
  const args = process.argv.slice(2);
  const config = {
    targetDir: null
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (!config.targetDir) {
      config.targetDir = args[i];
    }
  }

  // Validate target directory
  if (!config.targetDir) {
    console.error('❌ Error: Target directory path is required');
    console.error('Usage: node index.js <target_directory>');
    process.exit(1);
  }

  // Convert to absolute path if needed
  config.absoluteTargetDir = !path.isAbsolute(config.targetDir) 
    ? path.resolve(process.cwd(), config.targetDir)
    : config.targetDir;
    
  // Verify directory exists
  if (!fs.existsSync(config.absoluteTargetDir)) {
    console.error(`❌ Error: Directory ${config.absoluteTargetDir} does not exist`);
    process.exit(1);
  }

  return config;
}

module.exports = {
  processCommandLineArgs
};
