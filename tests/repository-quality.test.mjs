import test from 'node:test';
import assert from 'node:assert/strict';
import { repositoryQualityScore, isRepositoryReady } from '../quality/coverage-target.mjs';
test('calcula score de qualidade', () => {
  assert.equal(repositoryQualityScore(20, 20), 100);
  assert.equal(repositoryQualityScore(16, 20), 80);
  assert.equal(repositoryQualityScore(0, 0), 0);
});
test('valida o limiar de qualidade', () => {
  assert.equal(isRepositoryReady(80), true);
  assert.equal(isRepositoryReady(79), false);
});
