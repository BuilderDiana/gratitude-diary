# 感恩日记 API 后端

感恩日记应用的后端服务，基于 FastAPI 构建，部署在 AWS Lambda 上。

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [本地开发](#本地开发)
- [部署](#部署)
- [API 文档](#api-文档)

## ✨ 功能特性

- 🔐 **用户认证**：集成 AWS Cognito，支持多种登录方式（Apple、Google、邮箱、手机号）
- 📝 **日记管理**：支持文字和语音日记的创建、查看、更新、删除
- 🎤 **语音转文字**：使用 OpenAI Whisper 将语音转换为文字
- ✨ **AI 润色**：使用 GPT-4o-mini 对日记内容进行润色和优化
- 💬 **AI 反馈**：为每篇日记生成个性化的暖心反馈
- 📦 **云端存储**：使用 DynamoDB 存储日记数据，S3 存储音频文件

## 🛠️ 技术栈

- **框架**：FastAPI 0.115.0
- **运行时**：Python 3.11
- **部署平台**：AWS Lambda
- **数据库**：Amazon DynamoDB
- **存储**：Amazon S3
- **认证**：AWS Cognito
- **AI 服务**：OpenAI (Whisper, GPT-4o-mini)
- **容器化**：Docker

## 📁 项目结构

```
backend/
├── app/
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置管理
│   ├── models/              # 数据模型
│   │   └── diary.py
│   ├── routers/             # API 路由
│   │   ├── auth.py          # 认证相关
│   │   ├── account.py       # 账号管理
│   │   └── diary.py         # 日记管理
│   ├── services/             # 业务逻辑
│   │   ├── dynamodb_service.py
│   │   ├── s3_service.py
│   │   └── openai_service.py
│   └── utils/                # 工具函数
│       ├── auth.py
│       └── cognito_auth.py
├── lambda_handler.py         # Lambda 入口
├── Dockerfile                # Docker 镜像构建
├── requirements.txt          # Python 依赖
├── deploy.sh                 # 手动部署脚本
└── README.md                 # 本文档
```

## 🚀 快速开始

### 前置要求

- Python 3.11+
- Docker（用于构建镜像）
- AWS CLI（用于部署）
- AWS 账户和相应权限

### 安装依赖

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

## ⚙️ 环境配置

创建 `.env` 文件（参考 `.env.example`，如果存在）：

```bash
# AWS 配置
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=GratitudeDiaries
S3_BUCKET_NAME=your-bucket-name

# Cognito 配置
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxx
COGNITO_DOMAIN=auth.thankly.app

# OpenAI 配置
OPENAI_API_KEY=sk-xxxxx
```

**注意**：`.env` 文件包含敏感信息，不应提交到 Git。已在 `.gitignore` 中排除。

## 💻 本地开发

### 启动开发服务器

```bash
# 方式 1: 使用启动脚本
./start-local.sh

# 方式 2: 直接运行
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

服务器启动后：

- API 文档：http://localhost:8000/docs
- ReDoc 文档：http://localhost:8000/redoc
- 健康检查：http://localhost:8000/health

### 测试 API

```bash
# 健康检查
curl http://localhost:8000/health

# 获取 API 文档
open http://localhost:8000/docs
```

## 🚢 部署

### 方式一：GitHub Actions 自动部署（推荐）

1. 配置 GitHub Secrets：

   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_ACCOUNT_ID`

2. 推送代码到 `master` 分支：

   ```bash
   git push origin master
   ```

3. GitHub Actions 会自动：
   - 构建 Docker 镜像
   - 推送到 ECR
   - 更新 Lambda 函数

### 方式二：手动部署

```bash
# 运行部署脚本
./deploy.sh
```

部署脚本会：

1. 检查必要工具（Docker、AWS CLI）
2. 登录到 ECR
3. 构建 Docker 镜像
4. 推送镜像到 ECR
5. 更新 Lambda 函数

### Lambda 配置

- **函数名**：`gratitude-diary-api`
- **运行时**：Container image
- **架构**：arm64（Apple 芯片）或 x86_64
- **环境变量**：在 Lambda 控制台配置（参考 `.env` 文件）

## 📚 API 文档

### 认证

所有日记相关的 API 都需要 JWT Token 认证。

**获取 Token**：

1. 通过 AWS Cognito 登录
2. 获取 `id_token` 或 `access_token`
3. 在请求头中添加：`Authorization: Bearer <token>`

### 主要端点

- `GET /health` - 健康检查
- `POST /auth/login` - 用户登录
- `GET /diary/list` - 获取日记列表
- `POST /diary/text` - 创建文字日记
- `POST /diary/voice` - 创建语音日记
- `GET /diary/{diary_id}` - 获取日记详情
- `PUT /diary/{diary_id}` - 更新日记
- `DELETE /diary/{diary_id}` - 删除日记

完整 API 文档请访问：`/docs`（Swagger UI）

## 🔧 开发工具

### 有用的脚本

- `start-local.sh` - 启动本地开发服务器
- `deploy.sh` - 手动部署到 Lambda
- `test_cognito_login.py` - 测试 Cognito 登录

## 📝 开发规范

- 使用类型提示（Type Hints）
- 遵循 PEP 8 代码风格
- API 响应使用 Pydantic 模型
- 错误处理使用 FastAPI 的 HTTPException

## 🔒 安全注意事项

- 所有敏感信息存储在环境变量中
- JWT Token 验证使用 AWS Cognito
- S3 文件访问使用预签名 URL
- API 支持 CORS 配置

## 📞 支持

如有问题，请查看：

- [部署指南](../../docs/DEPLOYMENT_GUIDE.md)
- [GitHub Actions 配置](../../docs/GITHUB_ACTIONS_SETUP.md)
- [故障排除](../../docs/GITHUB_ACTIONS_TROUBLESHOOTING.md)

---

**版本**：1.0.0  
**最后更新**：2025-12-21
