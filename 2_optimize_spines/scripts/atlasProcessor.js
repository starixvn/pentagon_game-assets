/**
 * Atlas file processing functions
 * 
 * Specifically designed for Spine standard atlas files with proper texture extensions.
 */

const fs = require('fs');
const path = require('path');
const fileUtils = require('./fileUtils');

/**
 * Update an atlas file to use replacement texture names
 * @param {string} atlasFile - Path to atlas file
 * @param {Map} duplicates - Map of duplicate paths to original paths
 * @returns {Object} Update results including if file was updated and changes made
 */
function updateAtlasFile(atlasFile, duplicates) {
  let content = fs.readFileSync(atlasFile, 'utf8');
  let needsUpdate = false;
  const changes = []; // Track changes for this atlas
  
  const lines = content.split('\n');
  let updatedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const nextLine = i < lines.length - 1 ? lines[i+1].trim() : '';
    
    // Check if this is a texture page header
    if (trimmedLine !== '' && !line.startsWith(' ') && nextLine.startsWith('size:')) {
      // This is a texture section header
      let textureName = trimmedLine;
      
      // Skip references without extensions - only process standard Spine atlas texture references with extensions
      if (!fileUtils.hasImageExtension(textureName)) {
        updatedLines.push(line);
        continue;
      }
      
      let texturePath = path.join(path.dirname(atlasFile), textureName);
      
      if (duplicates.has(texturePath)) {
        // Get the replacement texture name
        let replacement = path.basename(duplicates.get(texturePath));
        
        needsUpdate = true;
        
        // Record this change
        changes.push({
          from: trimmedLine,
          to: replacement
        });
        
        updatedLines.push(replacement);
      } else {
        updatedLines.push(line);
      }
    } else {
      updatedLines.push(line);
    }
  }
  
  // Only write to the file if changes were made
  if (needsUpdate) {
    fs.writeFileSync(atlasFile, updatedLines.join('\n'));
  }
  
  return {
    updated: needsUpdate,
    changes: changes
  };
}

/**
 * Process atlas files to extract texture references
 * @param {string[]} atlasFiles - List of atlas files to process
 * @returns {Object} Processed data including texture references, maps, etc.
 */
function processAtlasFiles(atlasFiles) {
  const textureReferences = new Map(); // Map of texture name to count
  const textureToAtlasFiles = new Map(); // Map texture to atlas files
  const dirToTextureFiles = new Map(); // Map atlas directories to images
  
  console.log("\n🔎 Analyzing texture references in atlas files...");
  
  // Process each atlas file to extract references
  atlasFiles.forEach(atlasFile => {
    const atlasDir = path.dirname(atlasFile);
    const content = fs.readFileSync(atlasFile, 'utf8');
    const textureRefs = [];
    
    // Initialize directory mapping if needed
    if (!dirToTextureFiles.has(atlasDir)) {
      dirToTextureFiles.set(atlasDir, new Set());
    }
    
    // Parse atlas file to find all texture references
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = i < lines.length - 1 ? lines[i+1].trim() : '';
      
      // Check if this is potentially a texture page header
      if (line !== '' && !lines[i].startsWith(' ') && nextLine.startsWith('size:')) {
        // This appears to be a texture page reference
        let textureName = line;
        
        // Skip references without extensions - only process standard Spine atlas texture references with extensions
        if (!fileUtils.hasImageExtension(textureName)) {
          continue; // Skip this reference - don't process textures without extensions
        }
        
        // Process the texture reference
        textureRefs.push(textureName);
        
        // Create a full path for this texture
        const fullTexturePath = path.join(atlasDir, textureName);
        
        // Check if file exists
        let actualPath = fullTexturePath;
        let textureExists = fs.existsSync(fullTexturePath);
        
        if (textureExists) {
          // Add to the list of texture files in this directory
          dirToTextureFiles.get(atlasDir).add(actualPath);
          
          // Add to the global reference tracking
          const count = textureReferences.get(textureName) || 0;
          textureReferences.set(textureName, count + 1);
          
          // Track which atlas files reference this texture
          if (!textureToAtlasFiles.has(textureName)) {
            textureToAtlasFiles.set(textureName, []);
          }
          if (!textureToAtlasFiles.get(textureName).includes(atlasFile)) {
            textureToAtlasFiles.get(textureName).push(atlasFile);
          }
        }
      }
    }
    
    console.log(`  📄 ${atlasFile}: Found ${textureRefs.length} texture references`);
  });
  
  return {
    textureReferences,
    textureToAtlasFiles,
    dirToTextureFiles
  };
}

module.exports = {
  updateAtlasFile,
  processAtlasFiles
};
