# 🙏 Thankly - 感恩日记

> 记录生活中的美好时刻，用 AI 为你的日记增添温暖

[![iOS](https://img.shields.io/badge/iOS-Available-lightgrey)](https://apps.apple.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)](https://reactnative.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-green)](https://fastapi.tiangolo.com)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange)](https://aws.amazon.com/lambda)

一个全栈感恩日记应用，帮助用户记录生活中的美好时刻，并通过 AI 技术提供个性化的内容润色和暖心反馈。

## ✨ 功能特性

### 📱 移动端（iOS/Android）

- 🔐 **多种登录方式**：支持 Apple、Google、邮箱、手机号登录
- 📝 **文字日记**：随时记录感恩时刻
- 🎤 **语音日记**：说话即可记录，自动转文字
- ✨ **AI 润色**：自动美化日记内容
- 💬 **AI 反馈**：每篇日记都有个性化的暖心回应
- 📚 **日记管理**：查看、编辑、删除历史日记
- 🌍 **多语言支持**：中文、英文

### 🚀 后端服务

- ⚡ **无服务器架构**：基于 AWS Lambda，按需计费
- 🔒 **安全认证**：AWS Cognito 用户管理
- 💾 **数据存储**：DynamoDB + S3
- 🤖 **AI 集成**：OpenAI Whisper（语音转文字）+ GPT-4o-mini（润色和反馈）
- 📊 **API 文档**：自动生成的 Swagger 文档

## 🛠️ 技术栈

### 前端

- **框架**：React Native 0.81.5
- **开发工具**：Expo SDK 54
- **导航**：React Navigation
- **状态管理**：React Hooks
- **国际化**：i18n-js
- **UI 组件**：自定义组件 + Expo 组件库

### 后端

- **框架**：FastAPI 0.115.0
- **运行时**：Python 3.11
- **部署**：AWS Lambda（容器镜像）
- **数据库**：Amazon DynamoDB
- **存储**：Amazon S3
- **认证**：AWS Cognito
- **AI 服务**：OpenAI API

### 基础设施

- **CI/CD**：GitHub Actions
- **容器化**：Docker
- **版本控制**：Git

## 📁 项目结构

```
gratitude-journal/
├── mobile/                 # 移动端应用（React Native + Expo）
│   ├── src/
│   │   ├── components/     # UI 组件
│   │   ├── screens/        # 页面
│   │   ├── services/       # API 服务
│   │   ├── navigation/     # 导航配置
│   │   └── config/         # 配置文件
│   ├── assets/             # 静态资源
│   └── app.json            # Expo 配置
│
├── backend/                # 后端服务（FastAPI）
│   ├── app/
│   │   ├── routers/        # API 路由
│   │   ├── services/       # 业务逻辑
│   │   ├── models/         # 数据模型
│   │   └── utils/          # 工具函数
│   ├── Dockerfile          # Docker 镜像
│   └── deploy.sh           # 部署脚本
│
├── docs/                   # 项目文档
│   ├── DEPLOYMENT_GUIDE.md
│   ├── GITHUB_ACTIONS_SETUP.md
│   └── ...
│
└── scripts/                # 工具脚本
```

## 🚀 快速开始

### 前置要求

- Node.js 18+ 和 npm
- Python 3.11+
- Docker（用于后端部署）
- AWS 账户（用于部署）
- Expo CLI（用于移动端开发）

### 移动端开发

```bash
# 进入移动端目录
cd mobile

# 安装依赖
npm install

# 启动开发服务器
npm start

# 在 iOS 模拟器中运行
npm run ios

# 在 Android 模拟器中运行
npm run android
```

### 后端开发

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量（创建 .env 文件）
cp .env.example .env  # 如果存在
# 编辑 .env 文件，填入必要的配置

# 启动开发服务器
./start-local.sh
# 或
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

访问 API 文档：http://localhost:8000/docs

## 📦 部署

### 后端部署

#### 方式一：GitHub Actions 自动部署（推荐）

1. 配置 GitHub Secrets：
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_ACCOUNT_ID`

2. 推送代码到 `master` 分支，自动触发部署

#### 方式二：手动部署

```bash
cd backend
./deploy.sh
```

详细部署指南请查看：[部署文档](./docs/DEPLOYMENT_GUIDE.md)

### 移动端构建

```bash
cd mobile

# 使用 EAS Build
eas build --platform ios
eas build --platform android
```

详细构建指南请查看：[上线检查清单](./docs/上线前完整检查清单.md)

## 📚 文档

- [部署指南](./docs/DEPLOYMENT_GUIDE.md) - 完整的部署说明
- [GitHub Actions 配置](./docs/GITHUB_ACTIONS_SETUP.md) - CI/CD 配置
- [快速部署](./docs/QUICK_DEPLOYMENT.md) - 快速参考
- [故障排除](./docs/GITHUB_ACTIONS_TROUBLESHOOTING.md) - 常见问题
- [后端 README](./backend/README.md) - 后端详细文档
- [文档目录](./docs/README.md) - 所有文档索引

## 🔧 开发工具

### 有用的脚本

- `backend/deploy.sh` - 手动部署后端
- `backend/start-local.sh` - 启动本地后端服务器
- `mobile/scripts/pre-build-check.js` - 构建前检查

## 🏗️ 架构设计

```
┌─────────────┐
│   Mobile    │  React Native + Expo
│   (iOS/     │
│   Android)  │
└──────┬──────┘
       │ HTTPS
       │ JWT Token
       ▼
┌─────────────┐
│   AWS       │  API Gateway / Function URL
│   Lambda    │
└──────┬──────┘
       │
       ├──► DynamoDB (日记数据)
       ├──► S3 (音频文件)
       ├──► Cognito (用户认证)
       └──► OpenAI API (AI 处理)
```

## 🔒 安全

- 所有敏感信息存储在环境变量中
- JWT Token 认证（AWS Cognito）
- S3 文件访问使用预签名 URL
- API 支持 CORS 配置
- `.env` 文件已添加到 `.gitignore`

## 📄 许可证

本项目为私有项目。

## 👥 贡献

本项目目前为个人项目，暂不接受外部贡献。

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 查看 [文档](./docs/)
- 提交 Issue（如果仓库公开）

---

**版本**：1.0.0  
**最后更新**：2025-12-21

Made with ❤️ by [Your Name]

