module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env', // This is how you'll import the variables
          path: '.env',       // Path to your .env file
          allowUndefined: false,
        },
      ],
    ],
  };
};