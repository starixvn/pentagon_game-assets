# Spine File Optimizer

## Overview

This tool optimizes game asset collections by identifying and eliminating duplicate PNG files referenced in spine atlas files. It **exclusively uses content hash (MD5)** for comparison, automatically updates atlas file references to point to a single shared instance of identical images, reducing disk space and improving load times.

## Background

### Problem
When working with spine atlases in game development:
- Identical images are often duplicated across different symbol sets
- These duplicates waste disk space and increase load times
- Manual identification of duplicates is time-consuming and error-prone

### Solution
This script automates the optimization process by:
1. Scanning all atlas files in a directory
2. Identifying duplicate PNG images through **content hash (MD5) comparison** (not just file names)
3. Updating atlas files to reference a single shared copy of each image
4. Removing redundant PNG files
5. Providing a detailed verification report

## Key Features

- Designed specifically for Spine animation standard atlas files
- **Uses MD5 content hash** for precise duplicate detection, ensuring only 100% identical content is considered duplicate
- Only processes texture references with proper image extensions (.png, .jpg, etc.)
- Skips texture references without file extensions for safety
- Processes each directory separately to optimize only within same directories
- Modular architecture for easy maintenance and extension

## AI Maintenance Design Principles

This project is designed for AI tool maintenance, following these principles:

1. **Modular Structure**: Each functionality is implemented in independent modules, allowing AI to easily understand and modify specific features without needing to understand the entire system
2. **Clear Responsibility Boundaries**: Each module has a single responsibility, such as file handling, Atlas parsing, duplicate file detection, etc.
3. **Detailed Comments**: All key functions have complete JSDoc comments, explaining parameters and return values
4. **Meaningful Variable Names**: Descriptive variable and function names clearly express their purpose
5. **Pure Function Design**: Using pure functions where possible, reducing side effects for easier testing and reasoning
6. **Direct Path References**: Avoiding complex relative paths, ensuring AI tools can easily track file relationships
7. **Content Hash Only**: Completely removed atlas metadata-dependent comparison methods, using only file content MD5 hash for comparison
9. **Directory Isolation Principle**: Ensuring files are processed separately in each directory, preventing cross-directory errors and enhancing security

AI tools maintaining this code should follow these patterns to ensure continued code readability and modularity.

## Usage Steps

### Prerequisites
- Node.js installed (version 12.x or higher recommended)

### Running the Tool
Run the script with the target directory as an argument:

```bash
# TODO: update
cp -Ri symbol-{0..10}/**/*.* .

cp -Ri symbol-{11..13}/**/*.* .
```

```bash
# From "game-assets" project root
node 2_optimize_spines/index.js <path to game folder>
```

### Examples

```bash
# From "game-assets" project root
node 2_optimize_spines/index.js speed-up-cascading/god-fortune
```

### Example Output
The script provides detailed feedback during operation and ends with a summary report:

```
🔍 Starting to process atlas files in /Users/neil.lu/projects/game-assets/speed-up-cascading/god-fortune...
🔍 Found 18 atlas files

🔎 Analyzing texture references in atlas files...
  📄 effect/effect-bigwin.atlas: Found 3 texture references
  📄 effect/effect-freespin.atlas: Found 1 texture references
  📄 effect/effect-megawin.atlas: Found 3 texture references
  📄 symbol-spines/symbol-1.atlas: Found 4 texture references
  📄 symbol-spines/symbol-5.atlas: Found 5 texture references
  ... (other atlas files omitted)

  🔄 Shared texture: effect-bigwin2.png is referenced in 3 atlas files
  🔄 Shared texture: effect-bigwin3.png is referenced in 3 atlas files
  🔄 Shared texture: symbol-02.png is referenced in 9 atlas files
  🔄 Shared texture: symbol-03.png is referenced in 7 atlas files
  🔄 Shared texture: symbol-04.png is referenced in 9 atlas files
  ... (other shared textures)
🔍 Found 8 textures referenced by multiple atlas files

🔎 Identifying duplicate image files by directory...
  
📁 Analyzing directory: effect
  🔄 Found duplicate: effect/effect-bigwin2-duplicate.png → effect/effect-bigwin2.png
  (Based on MD5 content hash: d41f8cd98f00b204e9800998ecf8427e)

📁 Analyzing directory: symbol-spines
  🔄 Found duplicate: symbol-spines/symbol-103-copy.png → symbol-spines/symbol-103.png
  (Based on MD5 content hash: a7c9d3e24c8f6b506b2e9a998e71c75f)

=== 🔍 OPTIMIZATION SUMMARY ===
📊 Total atlas files processed: 18
✏️ Total atlas files updated: 3
🗑️ Duplicate files to be removed: 4
💾 Potential disk space to be saved: 752.6 KB

=== 📝 ATLAS FILES MODIFICATION DETAILS ===
📄 symbol-spines/symbol-10.atlas:
  • symbol-103-copy.png ➡️ symbol-103.png

=== 🗑️ REMOVING DUPLICATE FILES ===
  🗑️ symbol-spines/symbol-103-copy.png → replaced with → symbol-103.png
  🗑️ effect/effect-bigwin2-duplicate.png → replaced with → effect-bigwin2.png

⚠️ IMPORTANT: Please verify that your game still loads correctly after these changes.
   If you experience any issues, restore from backup before making further changes.

✅ Processing complete!
```

## Project Structure

The project has been modularized for better maintenance and readability:

```
2_optimize_spines/
├── index.js              # Main entry point
├── README.md             # Documentation
└── scripts/              # Modular components
    ├── atlasProcessor.js # Atlas file parsing and updating
    ├── commandLineParser.js # Command line argument processing
    ├── duplicateFinder.js # MD5 content hash-based duplicate file detection and removal
    ├── fileUtils.js      # File system and utility functions
    └── reportGenerator.js # Reporting and output formatting
```

## Technical Implementation Details

### Content Hash Comparison Method
The script uses the MD5 content hash algorithm for duplicate file detection:

1. Reads the binary content of each texture file
2. Uses Node.js built-in crypto module to calculate MD5 hash
3. Stores hash values in a map to detect duplicates within the same directory
4. Only identifies files as duplicates when their MD5 hash values are exactly the same

This method ensures that only files with identical content are treated as duplicates, providing 100% accurate results.

## Important Considerations

### Before Running
- **Always back up your files** before running this script on production assets
- The script is designed to be non-destructive to original content, but unexpected issues can occur
- Ensure you have proper version control in place (Git, etc.)

### Compatibility Notes
- This tool works with standard Spine atlas files where PNG references appear on their own lines without leading spaces
- The script identifies duplicates **exclusively based on MD5 content hash**, not visual similarity or other metadata
- Changes will need to be validated in your game engine to ensure rendering remains correct

### Limitations
- The script does not analyze image content for visual similarity - only exact duplicates are detected
- Files with different content but the same visual appearance won't be detected as duplicates
- Very large projects may require more memory to process all files at once

## Workflow Integration
This optimization can be integrated into your asset pipeline:
1. After generating new sprite atlases with TexturePacker
2. Before building game packages
3. As part of your CI/CD pipeline

## Troubleshooting
If you encounter issues:
- Ensure atlas files follow the expected format
- Check file permissions (especially when deleting files)
- Verify the script has permission to access and modify the target directory
