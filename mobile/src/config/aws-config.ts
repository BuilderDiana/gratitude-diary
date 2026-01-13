/**
 * AWS Cognito配置
 */

// 📱 生产环境URL
const PRODUCTION_URL = "https://api.thankly.app";

// 🔄 环境切换：true = 本地开发，false = 生产环境
const IS_LOCAL_DEV = false; 

export const API_BASE_URL = IS_LOCAL_DEV ? "http://192.168.0.94:8000" : PRODUCTION_URL;

const awsConfig = {
  region: "us-east-1",
  userPoolId: "us-east-1_1DgDNffb0",
  userPoolWebClientId: "6e521vvi1g2a1efbf3l70o83k2",
  oauth: {
    domain: "auth.thankly.app",
    scope: ["email", "openid", "profile"],
    redirectSignIn: "myapp://callback",
    redirectSignOut: "myapp://signout",
    responseType: "code",
  },
};

export default awsConfig;
