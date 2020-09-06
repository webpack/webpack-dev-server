'use strict';

const prependEntries = (originalEntry, additionalEntries) => {
  if (typeof originalEntry === 'function') {
    return () =>
      Promise.resolve(originalEntry()).then((entry) =>
        prependEntries(entry, additionalEntries)
      );
  }

  if (typeof originalEntry === 'object' && !Array.isArray(originalEntry)) {
    const entryObj = {};

    Object.keys(originalEntry).forEach((key) => {
      const entryDescription = originalEntry[key];
      entryObj[key] = prependEntries(entryDescription, additionalEntries);
    });

    return entryObj;
  }

  // in this case, originalEntry is a string or an array.
  // make sure that we do not add duplicates.
  const entriesClone = additionalEntries.slice(0);
  [].concat(originalEntry).forEach((newEntry) => {
    if (!entriesClone.includes(newEntry)) {
      entriesClone.push(newEntry);
    }
  });
  return entriesClone;
};

module.exports = prependEntries;
