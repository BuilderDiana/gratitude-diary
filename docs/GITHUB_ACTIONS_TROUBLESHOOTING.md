# 🔧 GitHub Actions 故障排除指南

## ❌ 问题 1: Node.js 版本不兼容

### 错误信息
```
error minimatch@10.1.1: The engine "node" is incompatible with this module. 
Expected version "20 || >=22". Got "18.20.8"
```

### 原因
- 某些依赖包（如 `minimatch@10.1.1`）需要 Node.js 20 或更高版本
- 工作流中设置的 Node.js 版本是 18

### 解决方案 ✅
已修复：将 Node.js 版本更新到 20

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # 从 '18' 改为 '20'
```

---

## ❌ 问题 2: 过时的 expo-cli

### 错误信息
```
warning expo-cli@6.3.10: The global Expo CLI has been superseded by 
'npx expo' and eas-cli
```

### 原因
- `expo-cli` 已经被弃用
- Expo 官方推荐使用 `npx expo` 或 `eas-cli`

### 解决方案 ✅
已修复：直接使用 EAS CLI，不再使用过时的 `expo/expo-github-action`

```yaml
# 旧方式（已弃用）
- name: Login to Expo
  uses: expo/expo-github-action@v8  # ❌ 内部使用过时的 expo-cli

# 新方式（推荐）
- name: Install EAS CLI
  run: npm install -g eas-cli@latest

- name: Login to Expo
  run: eas login --non-interactive --token ${{ secrets.EXPO_TOKEN }}
```

---

## 📋 修复后的完整工作流

查看 `.github/workflows/deploy-mobile.yml` 文件，主要改动：

1. ✅ Node.js 版本：`18` → `20`
2. ✅ 移除 `expo/expo-github-action`，直接使用 `eas-cli`
3. ✅ 添加错误处理，检查 `EXPO_TOKEN` 是否配置

---

## 🔍 如何验证修复

### 步骤 1: 提交修复
```bash
git add .github/workflows/deploy-mobile.yml
git commit -m "修复: 更新 Node.js 版本到 20，移除过时的 expo-cli"
git push origin master
```

### 步骤 2: 查看 GitHub Actions
1. 打开 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看最新的工作流运行
4. 应该不再出现 Node.js 版本错误

---

## ⚠️ 其他常见问题

### Q: 仍然提示 "EXPO_TOKEN 未配置"

**解决：**
1. 打开 GitHub 仓库
2. Settings → Secrets and variables → Actions
3. 添加 `EXPO_TOKEN`（从 Expo 网站获取）

**获取 EXPO_TOKEN：**
```bash
# 方法 1: 使用 EAS CLI
eas login
# 然后在 Expo 网站生成 token

# 方法 2: 直接在 Expo 网站
# https://expo.dev/accounts/[your-account]/settings/access-tokens
```

---

### Q: 构建仍然失败，提示依赖问题

**解决：**
1. 检查 `mobile/package.json` 中的依赖版本
2. 运行 `npm audit fix` 修复已知问题
3. 确保所有依赖都是最新兼容版本

---

### Q: 缓存恢复失败

**错误：**
```
Warning: Failed to restore: Cache service responded with 400
```

**解决：**
- 这是警告，不是错误
- 如果构建成功，可以忽略
- 如果构建失败，可以清除缓存重新构建

---

## 📚 相关文档

- [GitHub Actions 配置指南](./GITHUB_ACTIONS_SETUP.md)
- [快速部署指南](./QUICK_DEPLOYMENT.md)
- [完整部署指南](./DEPLOYMENT_GUIDE.md)

---

## 🎯 总结

**已修复的问题：**
- ✅ Node.js 版本不兼容（18 → 20）
- ✅ 过时的 expo-cli 依赖
- ✅ 添加了错误处理和检查

**下一步：**
1. 提交修复后的工作流文件
2. 配置 `EXPO_TOKEN`（如果还没有）
3. 测试自动构建

