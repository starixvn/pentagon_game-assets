/**
 * File system utility functions
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Supported image file extensions
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tga'];

/**
 * Check if a filename has an image extension
 * @param {string} filename - Filename to check
 * @returns {boolean} True if file has a valid image extension
 */
function hasImageExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Recursively find files with specified extension(s)
 * @param {string} dir - Directory to search
 * @param {string|string[]} extension - File extension(s) to find
 * @returns {string[]} Array of file paths
 */
function findFiles(dir, extension) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively search subdirectories
      results = results.concat(findFiles(fullPath, extension));
    } else if (item.endsWith(extension) || (Array.isArray(extension) && extension.some(ext => item.endsWith(ext)))) {
      results.push(fullPath);
    }
  });
  
  return results;
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted size string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate MD5 hash for a file
 * @param {string} filePath - Path to the file
 * @returns {string} MD5 hash of the file content
 */
function getFileHash(filePath) {
  const fileContent = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileContent).digest('hex');
}

module.exports = {
  IMAGE_EXTENSIONS,
  hasImageExtension,
  findFiles,
  formatBytes,
  getFileHash
};
