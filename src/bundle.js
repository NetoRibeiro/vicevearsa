import { copyFile, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Bundle a department into a self-contained package
 * @param {string} departmentName - Name of department to bundle
 * @param {string} projectDir - Project root directory
 * @param {Object} options - Bundle options
 * @param {string} [options.output] - Custom output path (defaults to departments/{dept}/dist/)
 * @param {boolean} [options.zip] - Create ZIP file (not implemented yet)
 * @returns {Object} Result with success status and path
 */
export async function bundleDepartment(departmentName, projectDir, options = {}) {
  try {
    const departmentPath = join(projectDir, 'departments', departmentName);
    const outputPath = options.output || join(projectDir, 'departments', departmentName, 'dist');
    const bundlePath = join(outputPath, departmentName);

    // Verify department exists
    if (!existsSync(departmentPath)) {
      return { success: false, error: `Department not found: ${departmentName}` };
    }

    // Verify department.yaml exists
    const deptYamlPath = join(departmentPath, 'department.yaml');
    if (!existsSync(deptYamlPath)) {
      return { success: false, error: `department.yaml not found in ${departmentName}` };
    }

    console.log(`\n📦 Bundling department: ${departmentName}`);

    // Create bundle directory structure
    await mkdir(join(bundlePath, '_bundle', '_vicevearsa', 'core', 'best-practices'), { recursive: true });
    await mkdir(join(bundlePath, '_bundle', '_vicevearsa', 'core', 'agents'), { recursive: true });
    await mkdir(join(bundlePath, '_bundle', 'skills'), { recursive: true });
    await mkdir(join(bundlePath, '_config'), { recursive: true });

    console.log(`  ✓ Created bundle directory structure`);

    // Step 1: Copy core runner
    const runnerSource = join(projectDir, '_vicevearsa', 'core', 'runner.pipeline.md');
    const runnerDest = join(bundlePath, '_bundle', '_vicevearsa', 'core', 'runner.pipeline.md');
    if (existsSync(runnerSource)) {
      await copyFile(runnerSource, runnerDest);
      console.log(`  ✓ Bundled pipeline runner`);
    }

    // Step 2: Copy best practices
    const bestPracticesSource = join(projectDir, '_vicevearsa', 'core', 'best-practices');
    if (existsSync(bestPracticesSource)) {
      const files = await readdir(bestPracticesSource);
      for (const file of files) {
        const src = join(bestPracticesSource, file);
        const dst = join(bundlePath, '_bundle', '_vicevearsa', 'core', 'best-practices', file);
        await copyFile(src, dst);
      }
      console.log(`  ✓ Bundled best practices (${files.length} files)`);
    }

    // Step 3: Copy base agents
    const agentsSource = join(projectDir, '_vicevearsa', 'core', 'agents');
    if (existsSync(agentsSource)) {
      const files = await readdir(agentsSource);
      for (const file of files) {
        const src = join(agentsSource, file);
        const dst = join(bundlePath, '_bundle', '_vicevearsa', 'core', 'agents', file);
        await copyFile(src, dst);
      }
      console.log(`  ✓ Bundled base agents (${files.length} files)`);
    }

    // Step 4: Copy and analyze department.yaml to find skills
    const deptYamlContent = await readFile(deptYamlPath, 'utf-8');
    const skills = extractSkillsFromYaml(deptYamlContent);

    // Step 5: Copy skills
    const skillsDir = join(projectDir, 'skills');
    for (const skill of skills) {
      const skillSource = join(skillsDir, skill);
      if (existsSync(skillSource)) {
        await copyDirRecursive(skillSource, join(bundlePath, '_bundle', 'skills', skill));
      }
    }
    console.log(`  ✓ Bundled ${skills.length} skill(s)`);

    // Step 6: Copy company context and preferences
    const companySource = join(projectDir, '_vicevearsa', '_memory', 'company.md');
    const prefsSource = join(projectDir, '_vicevearsa', '_memory', 'preferences.md');

    if (existsSync(companySource)) {
      await copyFile(companySource, join(bundlePath, '_config', 'company.md'));
    }
    if (existsSync(prefsSource)) {
      await copyFile(prefsSource, join(bundlePath, '_config', 'preferences.md'));
    }
    console.log(`  ✓ Bundled company context and preferences`);

    // Step 7: Copy all department files (agents, pipeline, data, memory, output)
    const dirsToCopy = ['agents', 'pipeline', '_memory', 'output'];
    const filesToCopy = ['department-party.csv'];

    for (const dir of dirsToCopy) {
      const src = join(departmentPath, dir);
      if (existsSync(src)) {
        const dst = join(bundlePath, dir);
        await copyDirRecursive(src, dst);
      }
    }

    // Copy individual files
    for (const file of filesToCopy) {
      const src = join(departmentPath, file);
      if (existsSync(src)) {
        const dst = join(bundlePath, file);
        await copyFile(src, dst);
      }
    }
    console.log(`  ✓ Copied department files and structure`);

    // Step 8: Rewrite department.yaml with bundle paths
    const updatedYaml = rewriteYamlPaths(deptYamlContent);
    await writeFile(join(bundlePath, 'department.yaml'), updatedYaml);

    // Step 9: Create bundle metadata
    const versionFile = join(projectDir, '_vicevearsa', '.vicevearsa-version');
    let version = 'unknown';
    if (existsSync(versionFile)) {
      version = (await readFile(versionFile, 'utf-8')).trim();
    }

    const metadata = {
      bundleVersion: 1,
      departmentName,
      createdAt: new Date().toISOString(),
      viceversa_version: version,
      skills: skills.sort(),
      author: 'ViceVearsa Bundle Generator'
    };

    await writeFile(
      join(bundlePath, '_bundle', '.meta.json'),
      JSON.stringify(metadata, null, 2)
    );
    console.log(`  ✓ Created bundle metadata`);

    // Step 10: Create a README for the bundle
    const readmeContent = `# ${departmentName} — ViceVearsa Bundle

This is a self-contained ViceVearsa department bundle created on ${new Date().toLocaleDateString()}.

## Quick Start

1. **Unzip this folder** (if it came as a ZIP)
2. **Navigate to the department directory:**
   \`\`\`bash
   cd ${departmentName}
   \`\`\`
3. **Run the department:**
   \`\`\`bash
   npx vicevearsa run
   \`\`\`

## About This Bundle

- **Created**: ${new Date().toLocaleString()}
- **ViceVearsa Version**: ${version}
- **Included Skills**: ${skills.join(', ') || 'None (uses native skills only)'}
- **Department**: ${departmentName}

## What's Inside

\`\`\`
${departmentName}/
├── _bundle/              # Bundled ViceVearsa runtime and dependencies
│   ├── _vicevearsa/     # Core execution engine
│   └── skills/          # Bundled custom skills
├── _config/             # Department-specific configuration
│   ├── company.md       # Company context
│   └── preferences.md   # User preferences
├── agents/              # Custom agent definitions
├── pipeline/            # Department pipeline and data
├── _memory/             # Execution memory and learnings
├── department.yaml      # Department configuration
├── department-party.csv # Agent roster
└── output/              # Execution artifacts
\`\`\`

## Using This Bundle

Once you extract and run this department, it will:
1. Load all agents from the orchestration
2. Execute the complete pipeline with all agents working together
3. Store outputs and memory locally
4. Can be shared again or customized by your team

## Support

For questions about ViceVearsa, visit: https://github.com/netoribeiro/vicevearsa

---

*This bundle is self-contained and can be moved, shared, and run on any machine with Node.js >= 20.0.0*
`;

    await writeFile(join(bundlePath, 'README.md'), readmeContent);
    console.log(`  ✓ Created README`);

    console.log(`\n✅ Bundle created successfully!\n  Location: ${bundlePath}\n`);

    return {
      success: true,
      path: bundlePath,
      bundleSize: skills.length,
      department: departmentName
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Extract skill names from department.yaml content
 */
function extractSkillsFromYaml(yamlContent) {
  const skills = new Set();
  const skillsMatch = yamlContent.match(/skills:\s*\n([\s\S]*?)(?:\n\w+:|$)/);

  if (skillsMatch) {
    const skillsBlock = skillsMatch[1];
    const skillLines = skillsBlock.split('\n').filter(line => line.trim().startsWith('-'));
    skillLines.forEach(line => {
      const match = line.match(/- (.+?)(?:\s*#|$)/);
      if (match) {
        const skill = match[1].trim();
        // Don't include native skills
        if (!['web_search', 'web_fetch'].includes(skill)) {
          skills.add(skill);
        }
      }
    });
  }

  return Array.from(skills);
}

/**
 * Rewrite YAML paths for bundled mode
 */
function rewriteYamlPaths(yamlContent) {
  let updated = yamlContent;

  // Replace company path
  updated = updated.replace(
    /company:\s*['"]?_vicevearsa\/_memory\/company\.md['"]?/,
    'company: "_config/company.md"'
  );

  // Replace preferences path
  updated = updated.replace(
    /preferences:\s*['"]?_vicevearsa\/_memory\/preferences\.md['"]?/,
    'preferences: "_config/preferences.md"'
  );

  return updated;
}

/**
 * Recursively copy directory
 */
async function copyDirRecursive(src, dst) {
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const dstPath = join(dst, entry.name);

    if (entry.isDirectory()) {
      await mkdir(dstPath, { recursive: true });
      await copyDirRecursive(srcPath, dstPath);
    } else {
      await mkdir(dst, { recursive: true });
      await copyFile(srcPath, dstPath);
    }
  }
}
