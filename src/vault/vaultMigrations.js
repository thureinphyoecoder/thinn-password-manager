function migrateVault(vault, version) {
  switch (version) {
    case 1:
      return vault;

    // future example
    // case 0:
    //   return migrateV0ToV1(vault);

    default:
      // unknown future version → best effort
      return vault;
  }
}

module.exports = { migrateVault };
