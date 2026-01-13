---
description: 发布应用到 App Store 和 Google Play 完整指南
---

# 📱 发布应用到 App Store 和 Google Play - 完整指南

## 🎯 学习目标

通过这个指南,你将学会:

- 如何配置应用的多语言支持(中文"感记")
- 如何构建 iOS 应用并提交到 App Store
- 如何构建 Android 应用并提交到 Google Play
- 如何管理应用版本和更新

---

## 第一部分:准备工作 🛠️

### 步骤 1:更新应用配置,添加中文支持

首先,我们需要在 `app.json` 中添加中文名称和描述。

**需要修改的文件:** `mobile/app.json`

**要添加的内容:**

```json
{
  "expo": {
    "name": "Thankly",
    "slug": "gratitude-diary",
    "version": "1.1.0",
    "locales": {
      "zh": {
        "displayName": "感记",
        "description": "用心记录,感恩生活"
      },
      "en": {
        "displayName": "Thankly",
        "description": "Gratitude journaling made simple"
      }
    }
  }
}
```

### 步骤 2:检查版本号

**iOS 版本:**

- 当前 buildNumber: 5
- 新版本应该是: 6 (因为我们有新功能)

**Android 版本:**

- 当前 versionCode: 1
- 新版本应该是: 2

---

## 第二部分:iOS App Store 发布 🍎

### 步骤 3:登录 EAS (Expo Application Services)

// turbo

```bash
cd /Users/dengdan/Desktop/thankly/mobile
eas login
```

**解释:** EAS 是 Expo 提供的构建和发布服务,就像一个帮你打包应用的机器人。

### 步骤 4:构建 iOS 应用

// turbo

```bash
eas build --platform ios --profile production
```

**解释:**

- `--platform ios` 表示我们要构建 iOS 版本
- `--profile production` 表示这是正式版本(不是测试版)

**这一步会做什么:**

1. 上传你的代码到 Expo 服务器
2. 在云端编译你的应用
3. 生成一个 `.ipa` 文件(这是 iOS 应用的安装包)
4. 大约需要 10-20 分钟

**等待时间:** ⏰ 10-20 分钟,你可以去喝杯水!

### 步骤 5:提交到 App Store

构建完成后,运行:

```bash
eas submit --platform ios --latest
```

**解释:**

- `--latest` 表示使用刚才构建的最新版本
- 这个命令会自动把应用上传到 App Store Connect

**需要的信息:**

- Apple ID 账号
- App-specific password (应用专用密码)

### 步骤 6:在 App Store Connect 中完成提交

1. 打开浏览器,访问: https://appstoreconnect.apple.com
2. 登录你的 Apple Developer 账号
3. 找到你的应用 "Thankly" / "感记"
4. 点击 "准备提交" 或 "Prepare for Submission"

**需要填写的信息:**

#### 📝 应用信息

- **应用名称 (英文):** Thankly
- **应用名称 (中文):** 感记
- **副标题 (英文):** Gratitude journaling made simple
- **副标题 (中文):** 用心记录,感恩生活

#### 📸 截图要求

你需要准备以下尺寸的截图:

- iPhone 6.7" (iPhone 15 Pro Max): 至少 3 张
- iPhone 6.5" (iPhone 14 Plus): 至少 3 张

**如何制作截图:**

1. 在模拟器中运行应用
2. 截取主要功能的屏幕
3. 使用 Figma 或 Sketch 添加美化

#### 📄 描述文字

**英文描述示例:**

```
Thankly is your personal gratitude journal that helps you cultivate a positive mindset through daily reflections.

Features:
• Voice journaling with AI-powered transcription
• Photo diary entries
• Emotion tracking and insights
• Beautiful, minimalist design
• Privacy-focused: your data stays yours

Start your gratitude journey today!
```

**中文描述示例:**

```
感记是你的私人感恩日记,通过每日反思帮助你培养积极心态。

功能特色:
• 语音日记,AI 智能转写
• 图片日记
• 情绪追踪与洞察
• 简洁优雅的设计
• 注重隐私:你的数据属于你

今天就开始你的感恩之旅!
```

#### 🔑 关键词 (Keywords)

**英文:** gratitude, journal, diary, mindfulness, reflection, emotions, AI
**中文:** 感恩,日记,正念,反思,情绪,AI

#### 🏷️ 分类

- **主分类:** Health & Fitness (健康健美)
- **次分类:** Lifestyle (生活)

#### 🔞 年龄分级

选择 "4+" (适合所有年龄)

### 步骤 7:提交审核

1. 填写完所有信息后,点击 "提交审核" (Submit for Review)
2. 回答问卷:

   - 是否使用加密? **否** (已在 Info.plist 中设置)
   - 是否有广告? **否**
   - 是否有内购? **否**

3. 点击最终提交按钮

**审核时间:** 通常 1-3 天,有时可能更快!

---

## 第三部分:Android Google Play 发布 🤖

### 步骤 8:构建 Android 应用

```bash
eas build --platform android --profile production
```

**解释:**

- 这会生成一个 `.aab` 文件 (Android App Bundle)
- AAB 是 Google Play 要求的新格式

**等待时间:** ⏰ 10-15 分钟

### 步骤 9:提交到 Google Play

```bash
eas submit --platform android --latest
```

**需要的信息:**

- Google Play Console 服务账号 JSON 密钥

**如果没有服务账号密钥,需要先创建:**

1. 访问 Google Play Console: https://play.google.com/console
2. 设置 → API 访问 → 创建服务账号
3. 下载 JSON 密钥文件

### 步骤 10:在 Google Play Console 中完成设置

1. 访问: https://play.google.com/console
2. 选择你的应用
3. 进入 "生产" → "创建新版本"

**需要填写的信息:**

#### 📝 应用详情

**应用名称:**

- 英文: Thankly
- 中文: 感记

**简短描述 (80 字符以内):**

- 英文: Your personal gratitude journal with AI
- 中文: 你的 AI 感恩日记

**完整描述:**

```
感记是你的私人感恩日记,通过每日反思帮助你培养积极心态。

✨ 主要功能:
• 语音日记 - AI 智能转写,支持中英文
• 图片日记 - 用照片记录美好瞬间
• 情绪追踪 - 了解你的情绪变化
• 简洁设计 - 专注于记录本身
• 隐私保护 - 你的数据完全属于你

🎯 为什么选择感记?
• 简单易用,无需复杂设置
• AI 辅助,让记录更轻松
• 跨平台同步
• 无广告,无打扰

今天就开始你的感恩之旅!
```

#### 📸 图片资源

**应用图标:**

- 512 x 512 px (高分辨率图标)

**功能图片:**

- 1024 x 500 px (至少 2 张)

**手机截图:**

- 至少 2 张,最多 8 张
- 建议尺寸: 1080 x 1920 px

#### 🏷️ 分类和标签

- **应用类别:** 健康与健身
- **内容分级:** 所有人

#### 🌍 国家/地区

选择你想发布的国家:

- 中国大陆 (需要额外审批)
- 美国
- 其他国家

### 步骤 11:提交审核

1. 填写完所有信息
2. 点击 "审核" → "开始发布"
3. Google Play 审核通常比 App Store 快,可能几小时到 1 天

---

## 第四部分:版本管理 📊

### 如何更新应用?

当你有新功能或修复 bug 时:

1. **更新版本号:**

   - iOS: 增加 `buildNumber`
   - Android: 增加 `versionCode`
   - 两者都要更新 `version` (如 1.1.0 → 1.2.0)

2. **重新构建:**

   ```bash
   eas build --platform all --profile production
   ```

3. **重新提交:**
   ```bash
   eas submit --platform all --latest
   ```

### 版本号规则 (语义化版本)

格式: `主版本.次版本.修订号` (例如: 1.2.3)

- **主版本 (1.x.x):** 重大更新,可能不兼容旧版本
- **次版本 (x.2.x):** 新功能,向后兼容
- **修订号 (x.x.3):** Bug 修复,小改进

**示例:**

- 1.0.0 → 1.1.0: 添加了新功能(如情绪追踪)
- 1.1.0 → 1.1.1: 修复了一个 bug
- 1.1.1 → 2.0.0: 重大改版

---

## 第五部分:常见问题 ❓

### Q1: 构建失败怎么办?

**A:** 检查以下几点:

1. 是否登录了 EAS? (`eas whoami`)
2. 证书是否过期?
3. 查看构建日志,找到具体错误

### Q2: 审核被拒绝怎么办?

**A:**

1. 仔细阅读拒绝原因
2. 修复问题
3. 重新提交,并在备注中说明修改内容

### Q3: 如何测试应用?

**A:** 使用 TestFlight (iOS) 和 Internal Testing (Android):

```bash
eas build --platform ios --profile preview
```

### Q4: 如何查看构建状态?

**A:**

1. 访问: https://expo.dev/accounts/dianadeng/projects/gratitude-diary/builds
2. 或运行: `eas build:list`

---

## 🎉 恭喜!

完成这些步骤后,你的应用就会出现在 App Store 和 Google Play 上了!

**记住:**

- 第一次发布可能需要更长时间审核
- 保持耐心,审核团队会仔细检查
- 准备好回复审核团队的问题

**下一步:**

- 监控用户反馈
- 收集崩溃报告
- 计划下一个版本的功能

祝你发布顺利! 🚀
