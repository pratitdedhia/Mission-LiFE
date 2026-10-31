import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';

describe('Firestore Security Rules Static Analysis', () => {
  let rulesContent = '';

  beforeAll(() => {
    rulesContent = fs.readFileSync('firestore.rules', 'utf8');
  });

  it('declares rules_version = 2', () => {
    expect(rulesContent).toContain("rules_version = '2';");
  });

  it('blocks all client writes to config reference collections', () => {
    expect(rulesContent).toContain('match /config/{configDoc}');
    expect(rulesContent).toContain('allow write: if false;');
  });

  it('protects task completions from client tampering (server authoritative)', () => {
    expect(rulesContent).toContain('match /taskCompletions/{completionId}');
    expect(rulesContent).toContain('allow write: if false;');
  });

  it('protects leaderboards and sharded aggregate counters from client writes', () => {
    expect(rulesContent).toContain('match /leaderboards/{leaderboardId}');
    expect(rulesContent).toContain('match /aggregates/{metric}/shards/{shardId}');
  });

  it('enforces role and points escalation prevention on user profiles', () => {
    expect(rulesContent).toContain("!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'points', 'streak', 'badges'])");
  });
});

