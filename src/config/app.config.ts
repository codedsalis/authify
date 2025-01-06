export default () => ({
  appConfig: {
    name: process.env.APP_NAME || 'Authify',
    environment: process.env.NODE_ENV || 'production',
    port: parseInt(process.env.PORT, 10) || 3000,
    jwt_secret: process.env.JWT_SECRET,
    jwt_token_duration: '900s', // 15 minutes
  },
});
