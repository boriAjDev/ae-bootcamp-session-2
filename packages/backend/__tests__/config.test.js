const { DEFAULT_PORT, parsePort, getPort } = require('../src/config');

describe('backend config', () => {
  it('uses the default port when PORT is not provided', () => {
    expect(getPort({})).toBe(DEFAULT_PORT);
  });

  it('uses the provided PORT value', () => {
    expect(getPort({ PORT: '4040' })).toBe(4040);
  });

  it('rejects invalid PORT values', () => {
    expect(() => parsePort('not-a-port')).toThrow('Invalid PORT value: not-a-port');
  });
});