module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|react-native|@react-navigation|@react-navigation/.*|react-native-screens|react-native-safe-area-context)',
  ],
};
