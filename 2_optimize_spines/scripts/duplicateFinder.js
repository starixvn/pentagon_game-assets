/**
 * Functions for finding and managing duplicate files
 */

const fs = require('fs');
const path = require('path');
const fileUtils = require('./fileUtils');

/**
 * Find duplicates by file content hash
 * @param {string} texturePath - Path to texture file
 * @param {Map} dirFileHashMap - Map of file hashes to paths
 * @param {Map} fileSizes - Map to store file sizes
 * @returns {Object|null} Duplicate info or null if not a duplicate
 */
function findDuplicateByHash(texturePath, dirFileHashMap, fileSizes) {
  try {
    const fileContent = fs.readFileSync(texturePath);
    const fileHash = fileUtils.getFileHash(texturePath);
    const fileSize = fileContent.length;
    
    // Store file size
    fileSizes.set(texturePath, {
      formattedSize: fileUtils.formatBytes(fileSize),
      bytes: fileSize
    });
    
    // Check if we've seen this hash before
    if (dirFileHashMap.has(fileHash)) {
      const origFile = dirFileHashMap.get(fileHash);
      return {
        duplicate: texturePath,
        original: origFile
      };
    } else {
      dirFileHashMap.set(fileHash, texturePath);
      return null;
    }
  } catch (err) {
    console.error(`❌ Error processing ${texturePath}: ${err.message}`);
    return null;
  }
}

/**
 * Process directories to find duplicate files
 * @param {Map} dirToTextureFiles - Map of directories to texture files
 * @returns {Object} Results with duplicates and file sizes
 */
function findDuplicateFiles(dirToTextureFiles) {
  const duplicates = new Map(); // Key: duplicateFilePath, Value: originalFilePath
  const fileSizes = new Map(); // To store file sizes for the report
  
  // Process each directory separately to find duplicates
  console.log("\n🔎 Identifying duplicate image files by directory...");
  
  // Process each directory and find duplicates
  for (const [dir, textureFiles] of dirToTextureFiles.entries()) {
    // Skip empty directories
    if (textureFiles.size === 0) continue;
    
    console.log(`\n📁 Analyzing directory: ${dir}`);
    
    // Maps for this directory only
    const dirFileHashMap = new Map();
    
    // Only process texture files that exist 
    for (const texturePath of textureFiles) {
      if (fs.existsSync(texturePath)) {
        const duplicateResult = findDuplicateByHash(texturePath, dirFileHashMap, fileSizes);
        
        // Process if duplicate was found
        if (duplicateResult) {
          console.log(`  🔄 Found duplicate: ${duplicateResult.duplicate} → ${duplicateResult.original}`);
          duplicates.set(duplicateResult.duplicate, duplicateResult.original);
        }
      }
    }
  }
  
  return { duplicates, fileSizes };
}

/**
 * Remove duplicate files from the filesystem
 * @param {Map} duplicates - Map of duplicate files to original files
 * @param {Map} fileSizes - Map of file sizes for reporting
 */
function removeDuplicateFiles(duplicates, fileSizes) {
  console.log("\n=== 🗑️ REMOVING DUPLICATE FILES ===");
  const deletedFiles = [];
  
  for (const [duplicatePath, originalPath] of duplicates.entries()) {
    if (fs.existsSync(duplicatePath)) {
      console.log(`  🗑️ ${duplicatePath} → replaced with → ${path.basename(originalPath)}`);
      
      deletedFiles.push({
        file: duplicatePath,
        basename: path.basename(duplicatePath),
        replacement: path.basename(originalPath)
      });
      
      try {
        fs.unlinkSync(duplicatePath);
      } catch (err) {
        console.error(`  ❌ Error deleting ${duplicatePath}: ${err.message}`);
      }
    }
  }
  
  // Add guidance message
  if (deletedFiles.length > 0) {
    console.log("\n⚠️  IMPORTANT: Please verify that your game still loads correctly after these changes.");
    console.log("   If you experience any issues, restore from backup before making further changes.");
  }
  
  return deletedFiles;
}

module.exports = {
  findDuplicateByHash,
  findDuplicateFiles,
  removeDuplicateFiles
};
