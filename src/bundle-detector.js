import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Detect if current working directory is a bundled department
 * @param {string} cwd - Current working directory
 * @returns {boolean} True if bundled, false otherwise
 */
export function isBundled(cwd) {
  return existsSync(join(cwd, '_bundle'));
}

/**
 * Get the base path for resolving dependencies
 * @param {string} cwd - Current working directory
 * @returns {string} Path to resolve dependencies from
 */
export function getBasePath(cwd) {
  if (isBundled(cwd)) {
    return join(cwd, '_bundle');
  }
  // For project mode, we need to find parent _vicevearsa
  // This assumes cwd is a department directory under departments/
  return join(cwd, '..', '..', '_vicevearsa');
}

/**
 * Resolve a path based on execution mode (bundled or project)
 * @param {string} relativePath - Path relative to project root (e.g., "_vicevearsa/core/runner.pipeline.md")
 * @param {string} cwd - Current working directory (department directory)
 * @returns {string} Resolved absolute path
 */
export function resolvePath(relativePath, cwd) {
  if (!isBundled(cwd)) {
    // Project mode: resolve relative to parent project
    // Assuming cwd is departments/{name}/
    const projectRoot = join(cwd, '..', '..');
    return join(projectRoot, relativePath);
  }

  // Bundle mode: translate paths
  if (relativePath.startsWith('_vicevearsa/')) {
    // _vicevearsa/ → _bundle/_vicevearsa/
    const bundlePath = relativePath.replace('_vicevearsa/', '_bundle/_vicevearsa/');
    return join(cwd, bundlePath);
  }

  if (relativePath.startsWith('skills/')) {
    // skills/ → _bundle/skills/
    const bundlePath = relativePath.replace('skills/', '_bundle/skills/');
    return join(cwd, bundlePath);
  }

  if (relativePath.startsWith('_config/')) {
    // _config/ paths stay the same
    return join(cwd, relativePath);
  }

  // Default: treat as relative to bundle root
  return join(cwd, relativePath);
}

/**
 * Get mode information for debugging/logging
 * @param {string} cwd - Current working directory
 * @returns {Object} Mode info
 */
export function getModeInfo(cwd) {
  const bundled = isBundled(cwd);
  return {
    mode: bundled ? 'bundle' : 'project',
    isBundled: bundled,
    basePath: getBasePath(cwd)
  };
}
