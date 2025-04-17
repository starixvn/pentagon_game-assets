#!/usr/bin/env node

/**
 * Spine Atlas Texture Optimizer
 * 
 * This script analyzes Spine standard atlas files and identifies duplicate texture 
 * image files that can be safely removed. It works by comparing texture content hashes
 * to identify duplicates. The script ONLY processes texture references with proper file
 * extensions (.png, .jpg, etc.) and will skip any references without extensions.
 * 
 * Basic usage: node index.js <target_directory>
 */

const fs = require('fs');
const path = require('path');

// Import modules
const fileUtils = require('./scripts/fileUtils');
const atlasProcessor = require('./scripts/atlasProcessor');
const duplicateFinder = require('./scripts/duplicateFinder');
const reportGenerator = require('./scripts/reportGenerator');
const commandLineParser = require('./scripts/commandLineParser');

/**
 * Main function to run the atlas optimizer
 */
function main() {
  // Parse command line arguments
  const config = commandLineParser.processCommandLineArgs();
  
  console.log(`🔍 Starting to process atlas files in ${config.absoluteTargetDir}...`);
  
  // Switch to target directory
  try {
    process.chdir(config.absoluteTargetDir);
  } catch (err) {
    console.error(`❌ Cannot access directory ${config.absoluteTargetDir}: ${err}`);
    process.exit(1);
  }
  
  // Find all atlas files
  const atlasFiles = fileUtils.findFiles('.', '.atlas');
  console.log(`🔍 Found ${atlasFiles.length} atlas files`);
  
  // Process atlas files to extract references
  const { 
    textureReferences, 
    textureToAtlasFiles, 
    dirToTextureFiles 
  } = atlasProcessor.processAtlasFiles(atlasFiles);
  
  console.log("");
  
  // Display shared textures info
  reportGenerator.displaySharedTextures(textureToAtlasFiles);
  
  // Find duplicate files
  const { duplicates, fileSizes } = duplicateFinder.findDuplicateFiles(dirToTextureFiles);
  
  // Update atlas files to remove duplicate references
  const updatedAtlasFiles = []; // Track which atlas files were updated
  const atlasChanges = new Map(); // Track changes per atlas file
  
  atlasFiles.forEach(atlasFile => {
    const updateResult = atlasProcessor.updateAtlasFile(atlasFile, duplicates);
    
    if (updateResult.updated) {
      updatedAtlasFiles.push(atlasFile);
      atlasChanges.set(atlasFile, updateResult.changes); // Store changes for summary
    }
  });
  
  // Generate reports and summaries
  reportGenerator.generateOptimizationSummary(atlasFiles, updatedAtlasFiles, duplicates, fileSizes);
  
  // Display atlas modification details
  if (updatedAtlasFiles.length > 0) {
    reportGenerator.displayAtlasChangeDetails(updatedAtlasFiles, atlasChanges);
  }
  
  // Remove unnecessary duplicate files
  if (duplicates.size > 0) {
    duplicateFinder.removeDuplicateFiles(duplicates, fileSizes);
  }
  
  console.log("\n✅ Processing complete!");
}

// Execute main function
main();
