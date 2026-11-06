// Signs the release APK with our own key when the signing secrets are present (CI).
// Without them it falls back to the default debug key, so local builds still work.
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let g = cfg.modResults.contents;
    if (g.includes('MYLIFE_KEYSTORE_FILE')) return cfg;
    const block = `
    signingConfigs {
        if (System.getenv('MYLIFE_KEYSTORE_FILE')) {
            mylife {
                storeFile file(System.getenv('MYLIFE_KEYSTORE_FILE'))
                storePassword System.getenv('MYLIFE_KEYSTORE_PASSWORD')
                keyAlias System.getenv('MYLIFE_KEY_ALIAS')
                keyPassword System.getenv('MYLIFE_KEY_PASSWORD')
            }
        }
`;
    // add our config inside the existing signingConfigs block
    g = g.replace(/signingConfigs\s*\{/, block.trimStart().replace(/^signingConfigs \{\n/, 'signingConfigs {\n'));
    // use it for release builds
    g = g.replace(/(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/, "$1signingConfig System.getenv('MYLIFE_KEYSTORE_FILE') ? signingConfigs.mylife : signingConfigs.debug");
    cfg.modResults.contents = g;
    return cfg;
  });
};
