import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync } from 'node:fs';
import { bundleDepartment } from '../src/bundle.js';

test('bundleDepartment creates bundle structure', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'bundle-'));
  try {
    // Setup project structure
    await mkdir(join(dir, '_vicevearsa', 'core', 'best-practices'), { recursive: true });
    await mkdir(join(dir, '_vicevearsa', 'core', 'agents'), { recursive: true });
    await mkdir(join(dir, '_vicevearsa', '_memory'), { recursive: true });
    await mkdir(join(dir, 'skills', 'web_search'), { recursive: true });
    await mkdir(join(dir, 'departments', 'test-dept', 'agents'), { recursive: true });
    await mkdir(join(dir, 'departments', 'test-dept', 'pipeline'), { recursive: true });

    // Create minimal files
    await writeFile(
      join(dir, '_vicevearsa', '_memory', 'company.md'),
      'Test Company'
    );
    await writeFile(
      join(dir, '_vicevearsa', '_memory', 'preferences.md'),
      'en'
    );
    await writeFile(
      join(dir, '_vicevearsa', 'core', 'runner.pipeline.md'),
      'Pipeline Runner'
    );
    await writeFile(
      join(dir, '_vicevearsa', 'core', 'best-practices', 'test.md'),
      'Test Practice'
    );
    await writeFile(
      join(dir, '_vicevearsa', '.vicevearsa-version'),
      '1.0.0'
    );
    await writeFile(
      join(dir, 'skills', 'web_search', 'SKILL.md'),
      'Web Search Skill'
    );
    await writeFile(
      join(dir, 'departments', 'test-dept', 'department.yaml'),
      `name: test-dept
company: "_vicevearsa/_memory/company.md"
preferences: "_vicevearsa/_memory/preferences.md"
skills:
  - web_search
agents: []
pipeline:
  entry: pipeline/pipeline.yaml`
    );
    await writeFile(
      join(dir, 'departments', 'test-dept', 'department-party.csv'),
      'id,name'
    );

    // Bundle the department
    const result = await bundleDepartment('test-dept', dir);

    assert.ok(result.success, `Bundle failed: ${result.error}`);
    assert.ok(result.path);

    // Verify bundle structure exists
    const bundlePath = result.path;
    assert.ok(existsSync(join(bundlePath, '_bundle')));
    assert.ok(existsSync(join(bundlePath, '_config')));
    assert.ok(existsSync(join(bundlePath, '_bundle', '_vicevearsa', 'core', 'runner.pipeline.md')));
    assert.ok(existsSync(join(bundlePath, '_bundle', '_vicevearsa', 'core', 'best-practices')));
    // Note: web_search is a native skill, so it's not bundled
    assert.ok(existsSync(join(bundlePath, '_config', 'company.md')));
    assert.ok(existsSync(join(bundlePath, '_config', 'preferences.md')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('bundleDepartment rewrites YAML paths', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'bundle-yaml-'));
  try {
    // Setup minimal structure
    await mkdir(join(dir, '_vicevearsa', 'core'), { recursive: true });
    await mkdir(join(dir, '_vicevearsa', '_memory'), { recursive: true });
    await mkdir(join(dir, 'departments', 'test-dept'), { recursive: true });

    await writeFile(join(dir, '_vicevearsa', '_memory', 'company.md'), 'Company');
    await writeFile(join(dir, '_vicevearsa', '_memory', 'preferences.md'), 'en');
    await writeFile(join(dir, '_vicevearsa', 'core', 'runner.pipeline.md'), 'Runner');
    await writeFile(join(dir, '_vicevearsa', '.vicevearsa-version'), '1.0.0');

    const deptYaml = `name: test-dept
company: "_vicevearsa/_memory/company.md"
preferences: "_vicevearsa/_memory/preferences.md"
skills: []
agents: []`;

    await writeFile(join(dir, 'departments', 'test-dept', 'department.yaml'), deptYaml);
    await writeFile(join(dir, 'departments', 'test-dept', 'department-party.csv'), 'id,name');

    // Bundle
    const result = await bundleDepartment('test-dept', dir);
    assert.ok(result.success);

    // Read the rewritten YAML
    const bundledYaml = await readFile(join(result.path, 'department.yaml'), 'utf-8');

    // Verify paths are rewritten
    assert.ok(bundledYaml.includes('company: "_config/company.md"'));
    assert.ok(bundledYaml.includes('preferences: "_config/preferences.md"'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('bundleDepartment creates metadata', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'bundle-meta-'));
  try {
    // Setup minimal structure
    await mkdir(join(dir, '_vicevearsa', 'core'), { recursive: true });
    await mkdir(join(dir, '_vicevearsa', '_memory'), { recursive: true });
    await mkdir(join(dir, 'departments', 'test-dept'), { recursive: true });

    await writeFile(join(dir, '_vicevearsa', '_memory', 'company.md'), 'Company');
    await writeFile(join(dir, '_vicevearsa', '_memory', 'preferences.md'), 'en');
    await writeFile(join(dir, '_vicevearsa', 'core', 'runner.pipeline.md'), 'Runner');
    await writeFile(join(dir, '_vicevearsa', '.vicevearsa-version'), '1.0.0');
    await writeFile(join(dir, 'departments', 'test-dept', 'department.yaml'), `
name: test-dept
skills: []
agents: []
`);
    await writeFile(join(dir, 'departments', 'test-dept', 'department-party.csv'), 'id,name');

    // Bundle
    const result = await bundleDepartment('test-dept', dir);
    assert.ok(result.success);

    // Verify metadata exists and is valid
    const metaPath = join(result.path, '_bundle', '.meta.json');
    assert.ok(existsSync(metaPath));

    const meta = JSON.parse(await readFile(metaPath, 'utf-8'));
    assert.equal(meta.bundleVersion, 1);
    assert.equal(meta.departmentName, 'test-dept');
    assert.ok(meta.createdAt);
    assert.equal(meta.viceversa_version, '1.0.0');
    assert.ok(Array.isArray(meta.skills));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('bundleDepartment returns error when department not found', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'bundle-error-'));
  try {
    const result = await bundleDepartment('nonexistent-dept', dir);
    assert.equal(result.success, false);
    assert.ok(result.error.includes('Department not found'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('bundleDepartment returns error when department.yaml missing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'bundle-yaml-error-'));
  try {
    // Create department directory but no department.yaml
    await mkdir(join(dir, 'departments', 'test-dept'), { recursive: true });

    const result = await bundleDepartment('test-dept', dir);
    assert.equal(result.success, false);
    assert.ok(result.error.includes('department.yaml not found'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('bundleDepartment extracts skills from YAML', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'bundle-skills-'));
  try {
    // Setup minimal structure
    await mkdir(join(dir, '_vicevearsa', 'core'), { recursive: true });
    await mkdir(join(dir, '_vicevearsa', '_memory'), { recursive: true });
    await mkdir(join(dir, 'skills', 'custom-skill'), { recursive: true });
    await mkdir(join(dir, 'departments', 'test-dept'), { recursive: true });

    await writeFile(join(dir, '_vicevearsa', '_memory', 'company.md'), 'Company');
    await writeFile(join(dir, '_vicevearsa', '_memory', 'preferences.md'), 'en');
    await writeFile(join(dir, '_vicevearsa', 'core', 'runner.pipeline.md'), 'Runner');
    await writeFile(join(dir, '_vicevearsa', '.vicevearsa-version'), '1.0.0');
    await writeFile(join(dir, 'skills', 'custom-skill', 'SKILL.md'), 'Custom Skill');

    const deptYaml = `name: test-dept
skills:
  - web_search   # native, should be skipped
  - custom-skill # should be included
  - web_fetch    # native, should be skipped
agents: []`;

    await writeFile(join(dir, 'departments', 'test-dept', 'department.yaml'), deptYaml);
    await writeFile(join(dir, 'departments', 'test-dept', 'department-party.csv'), 'id,name');

    // Bundle
    const result = await bundleDepartment('test-dept', dir);
    assert.ok(result.success);
    assert.equal(result.bundleSize, 1);
    assert.ok(existsSync(join(result.path, '_bundle', 'skills', 'custom-skill')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('bundleDepartment creates README', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'bundle-readme-'));
  try {
    // Setup minimal structure
    await mkdir(join(dir, '_vicevearsa', 'core'), { recursive: true });
    await mkdir(join(dir, '_vicevearsa', '_memory'), { recursive: true });
    await mkdir(join(dir, 'departments', 'test-dept'), { recursive: true });

    await writeFile(join(dir, '_vicevearsa', '_memory', 'company.md'), 'Company');
    await writeFile(join(dir, '_vicevearsa', '_memory', 'preferences.md'), 'en');
    await writeFile(join(dir, '_vicevearsa', 'core', 'runner.pipeline.md'), 'Runner');
    await writeFile(join(dir, '_vicevearsa', '.vicevearsa-version'), '1.0.0');
    await writeFile(join(dir, 'departments', 'test-dept', 'department.yaml'), `
name: test-dept
skills: []
agents: []
`);
    await writeFile(join(dir, 'departments', 'test-dept', 'department-party.csv'), 'id,name');

    // Bundle
    const result = await bundleDepartment('test-dept', dir);
    assert.ok(result.success);

    // Verify README exists
    const readmePath = join(result.path, 'README.md');
    assert.ok(existsSync(readmePath));

    const readme = await readFile(readmePath, 'utf-8');
    assert.ok(readme.includes('test-dept'));
    assert.ok(readme.includes('ViceVearsa Bundle'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
