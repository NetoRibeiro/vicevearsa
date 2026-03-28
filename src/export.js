import { bundleDepartment } from './bundle.js';

/**
 * Export a department as a standalone bundle
 * @param {string[]} args - Command arguments [departmentName, --format, format, --output, path, etc.]
 * @param {string} projectDir - Project root directory
 * @returns {Object} Result with success status
 */
export async function exportDepartment(args, projectDir) {
  if (!args || args.length === 0) {
    console.log(`
  Usage: npx vicevearsa export <department> [options]

  Options:
    --format [bundle|zip]   Output format (default: bundle)
    --output <path>         Custom output directory
    --zip                   Create ZIP file (shorthand)

  Examples:
    npx vicevearsa export my-carousel
    npx vicevearsa export my-carousel --format zip
    npx vicevearsa export my-carousel --output ~/exports
    `);
    return { success: false };
  }

  const departmentName = args[0];
  let options = { output: undefined, zip: false };

  // Parse options
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--format' && i + 1 < args.length) {
      if (args[i + 1] === 'zip') options.zip = true;
      i++;
    } else if (args[i] === '--zip') {
      options.zip = true;
    } else if (args[i] === '--output' && i + 1 < args.length) {
      options.output = args[i + 1];
      i++;
    }
  }

  // Bundle the department
  const result = await bundleDepartment(departmentName, projectDir, options);

  if (!result.success) {
    console.error(`❌ Export failed: ${result.error}`);
    return { success: false };
  }

  return { success: true };
}
