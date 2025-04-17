/**
 * Report generation functions for optimization results
 */

const fileUtils = require('./fileUtils');

/**
 * Generate and display optimization summary
 * @param {string[]} atlasFiles - All atlas files processed
 * @param {string[]} updatedAtlasFiles - Atlas files that were updated
 * @param {Map} duplicates - Map of duplicate files
 * @param {Map} fileSizes - Map of file sizes
 */
function generateOptimizationSummary(atlasFiles, updatedAtlasFiles, duplicates, fileSizes) {
  console.log("\n=== 🔍 OPTIMIZATION SUMMARY ===");
  console.log(`📊 Total atlas files processed: ${atlasFiles.length}`);
  console.log(`✏️ Total atlas files updated: ${updatedAtlasFiles.length}`);
  console.log(`🗑️ Duplicate files to be removed: ${duplicates.size}`);
  
  // Calculate total potential saved bytes
  let totalSavedBytes = 0;
  for (const [duplicatePath, originalPath] of duplicates.entries()) {
    if (fileSizes.has(duplicatePath)) {
      totalSavedBytes += fileSizes.get(duplicatePath).bytes;
    }
  }
  console.log(`💾 Potential disk space to be saved: ${fileUtils.formatBytes(totalSavedBytes)}`);
}

/**
 * Display detailed information about atlas file changes
 * @param {string[]} updatedAtlasFiles - Atlas files that were updated
 * @param {Map} atlasChanges - Map of changes per atlas file
 */
function displayAtlasChangeDetails(updatedAtlasFiles, atlasChanges) {
  console.log("\n=== 📝 ATLAS FILES MODIFICATION DETAILS ===");
  
  updatedAtlasFiles.forEach(atlasFile => {
    const changes = atlasChanges.get(atlasFile) || [];
    console.log(`\n📄 ${atlasFile}:`);
    
    if (changes.length > 0) {
      changes.forEach(change => {
        console.log(`  • ${change.from} ➡️ ${change.to}`);
      });
    } else {
      console.log("  No changes made");
    }
  });
}

/**
 * Display shared texture information
 * @param {Map} textureToAtlasFiles - Map of textures to atlas files
 */
function displaySharedTextures(textureToAtlasFiles) {
  const sharedTextures = new Set();
  
  for (const [textureName, atlasFiles] of textureToAtlasFiles.entries()) {
    if (atlasFiles.length > 1) {
      sharedTextures.add(textureName);
      console.log(`  🔄 Shared texture: ${textureName} is referenced in ${atlasFiles.length} atlas files`);
    }
  }
  
  console.log(`🔍 Found ${sharedTextures.size} textures referenced by multiple atlas files`);
  return sharedTextures;
}

module.exports = {
  generateOptimizationSummary,
  displayAtlasChangeDetails,
  displaySharedTextures
};
