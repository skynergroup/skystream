module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@skystream/api': '../../packages/api/src',
          '@skystream/shared': '../../packages/shared/src',
        },
      },
    ],
  ],
};
