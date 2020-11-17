'use strict';

const isWebpack5 = require('../../helpers/isWebpack5');

(isWebpack5 ? describe : describe.skip)('DevServerEntryPlugin', () => {
  let plugin;
  const options = {};
  const entries = ['./foo.js', './bar.js'];

  const createDependency = jest.fn();
  const tapPromise = jest.fn();
  const compiler = {
    hooks: {
      make: {
        tapPromise,
      },
    },
  };
  const compilation = {
    addEntry: jest.fn((_context, _dep, _options, cb) => cb()),
  };

  beforeEach(() => {
    jest.setMock('webpack/lib/EntryPlugin.js', { createDependency });
    const DevServerEntryPlugin = require('../../../lib/utils/DevServerEntryPlugin');
    plugin = new DevServerEntryPlugin('context', entries, options);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set property', () => {
    expect(plugin.context).toBe('context');
    expect(plugin.entries).toBe(entries);
    expect(plugin.options).toBe(options);
  });

  it('should add hooks to add entries', async () => {
    plugin.apply(compiler);
    expect(tapPromise).toBeCalledTimes(1);
    expect(tapPromise.mock.calls[0]).toMatchSnapshot();

    await tapPromise.mock.calls[0][1](compilation);
    expect(compilation.addEntry).toBeCalledTimes(entries.length);
    expect(compilation.addEntry.mock.calls).toMatchSnapshot();

    expect(createDependency).toBeCalledTimes(entries.length);
    expect(createDependency.mock.calls).toMatchSnapshot();
  });

  it('should allow modifying entries after creation', async () => {
    plugin.apply(compiler);
    jest.clearAllMocks();

    const newEntries = ['./foobar.js'];
    plugin.entries = newEntries;
    expect(plugin.entries).toBe(newEntries);

    plugin.apply(compiler);

    expect(tapPromise).toBeCalledTimes(1);
    expect(tapPromise.mock.calls[0]).toMatchSnapshot();

    await tapPromise.mock.calls[0][1](compilation);
    expect(compilation.addEntry).toBeCalledTimes(newEntries.length);
    expect(compilation.addEntry.mock.calls).toMatchSnapshot();

    expect(createDependency).toBeCalledTimes(newEntries.length);
    expect(createDependency.mock.calls).toMatchSnapshot();
  });
});
