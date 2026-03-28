import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { isBundled, resolvePath, getBasePath, getModeInfo } from '../src/bundle-detector.js';

test('isBundled returns true when _bundle directory exists', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'detector-'));
  try {
    await mkdir(join(dir, '_bundle'));
    assert.equal(isBundled(dir), true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('isBundled returns false when _bundle directory does not exist', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'detector-'));
  try {
    assert.equal(isBundled(dir), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('resolvePath handles bundle mode paths correctly', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'detector-bundle-'));
  try {
    await mkdir(join(dir, '_bundle'));

    // Test _vicevearsa/ path conversion
    const viceverPath = resolvePath('_vicevearsa/core/runner.pipeline.md', dir);
    assert.ok(viceverPath.includes('_bundle'));
    assert.ok(viceverPath.includes('_vicevearsa'));

    // Test skills/ path conversion
    const skillPath = resolvePath('skills/web_search/SKILL.md', dir);
    assert.ok(skillPath.includes('_bundle'));
    assert.ok(skillPath.includes('skills'));

    // Test _config/ path (stays same)
    const configPath = resolvePath('_config/company.md', dir);
    assert.ok(configPath.includes('_config'));
    assert.ok(!configPath.includes('_bundle')); // _config is at root
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('resolvePath handles project mode paths correctly', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'detector-project-'));
  try {
    // No _bundle directory = project mode
    const viceverPath = resolvePath('_vicevearsa/core/runner.pipeline.md', dir);
    // Should resolve relative to parent project
    assert.ok(viceverPath.includes('_vicevearsa'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('getBasePath returns bundle path when bundled', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'detector-base-'));
  try {
    await mkdir(join(dir, '_bundle'));
    const basePath = getBasePath(dir);
    assert.ok(basePath.includes('_bundle'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('getBasePath returns project vicevearsa path when not bundled', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'detector-base-proj-'));
  try {
    const basePath = getBasePath(dir);
    assert.ok(basePath.includes('_vicevearsa'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('getModeInfo returns correct information', async () => {
  const bundledDir = await mkdtemp(join(tmpdir(), 'detector-mode-bundle-'));
  try {
    await mkdir(join(bundledDir, '_bundle'));
    const bundledInfo = getModeInfo(bundledDir);
    assert.equal(bundledInfo.mode, 'bundle');
    assert.equal(bundledInfo.isBundled, true);
    assert.ok(bundledInfo.basePath);
  } finally {
    await rm(bundledDir, { recursive: true, force: true });
  }

  const projectDir = await mkdtemp(join(tmpdir(), 'detector-mode-proj-'));
  try {
    const projectInfo = getModeInfo(projectDir);
    assert.equal(projectInfo.mode, 'project');
    assert.equal(projectInfo.isBundled, false);
    assert.ok(projectInfo.basePath);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});
