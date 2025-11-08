#!/usr/bin/env node
/**
 * 🚀 Pre-build checklist
 *
 * 快速在打包前验证关键配置，避免把开发环境配置发布到线上。
 */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

const log = {
  ok(message) {
    console.log(`✅ ${message}`);
  },
  warn(message) {
    console.warn(`⚠️  ${message}`);
  },
  error(message) {
    console.error(`❌ ${message}`);
  },
};

let hasError = false;

function fail(message) {
  hasError = true;
  log.error(message);
}

function readFile(relativePath) {
  const filePath = path.join(projectRoot, relativePath);
  return fs.readFileSync(filePath, "utf8");
}

function fileExists(relativePath) {
  const filePath = path.join(projectRoot, relativePath);
  return fs.existsSync(filePath);
}

function resolveExpoPath(p) {
  if (typeof p !== "string") return null;
  if (p.startsWith("./")) {
    return p.slice(2);
  }
  return p;
}

function assertPngSize(relativePath, expectedWidth, expectedHeight) {
  const filePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    fail(`缺少图标文件: ${relativePath}`);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") {
    fail(`图标不是有效的 PNG 文件: ${relativePath}`);
    return;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  if (width !== expectedWidth || height !== expectedHeight) {
    fail(
      `图标尺寸错误: ${relativePath} (当前 ${width}x${height}, 期望 ${expectedWidth}x${expectedHeight})`
    );
  } else {
    log.ok(`图标尺寸正确: ${relativePath} (${width}x${height})`);
  }
}

// 1. IS_LOCAL_DEV 必须为 false
try {
  const awsConfig = readFile("src/config/aws-config.ts");
  if (/const\s+IS_LOCAL_DEV\s*=\s*false/.test(awsConfig)) {
    log.ok("IS_LOCAL_DEV 已关闭（生产环境）");
  } else {
    fail("请将 src/config/aws-config.ts 中的 IS_LOCAL_DEV 设置为 false");
  }
} catch (error) {
  fail(`无法读取 src/config/aws-config.ts: ${error.message}`);
}

// 2. DEV_MODE_FORCE_ONBOARDING 必须为 false
try {
  const appNavigator = readFile("src/navigation/AppNavigator.tsx");
  if (/const\s+DEV_MODE_FORCE_ONBOARDING\s*=\s*false/.test(appNavigator)) {
    log.ok("DEV_MODE_FORCE_ONBOARDING 已关闭");
  } else {
    fail(
      "请将 src/navigation/AppNavigator.tsx 中的 DEV_MODE_FORCE_ONBOARDING 设置为 false"
    );
  }
} catch (error) {
  fail(`无法读取 src/navigation/AppNavigator.tsx: ${error.message}`);
}

// 3. app.json 配置检查
try {
  const appJsonPath = path.join(projectRoot, "app.json");
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
  const expoConfig = appJson.expo || {};

  const bundleId = expoConfig.ios?.bundleIdentifier;
  const androidPackage = expoConfig.android?.package;
  const iconPath = expoConfig.icon;
  const faviconPath = expoConfig.web?.favicon;

  if (!bundleId || /yourcompany/i.test(bundleId)) {
    fail("app.json 中的 ios.bundleIdentifier 仍是占位符，请填写正式 Bundle ID");
  } else {
    log.ok(`iOS Bundle ID: ${bundleId}`);
  }

  if (!androidPackage || /yourcompany/i.test(androidPackage)) {
    fail("app.json 中的 android.package 仍是占位符，请填写正式包名");
  } else {
    log.ok(`Android 包名: ${androidPackage}`);
  }

  if (iconPath) {
    const iconResolved = resolveExpoPath(iconPath);
    if (iconResolved && fileExists(iconResolved)) {
      log.ok(`App 图标路径存在: ${iconPath}`);
    } else {
      fail(`app.json icon 路径不存在: ${iconPath}`);
    }
  } else {
    fail("app.json 中未配置 icon 路径");
  }

  if (faviconPath) {
    const faviconResolved = resolveExpoPath(faviconPath);
    if (faviconResolved && fileExists(faviconResolved)) {
      log.ok(`Web favicon 路径存在: ${faviconPath}`);
    } else {
      fail(`app.json web.favicon 路径不存在: ${faviconPath}`);
    }
  } else {
    fail("app.json 中未配置 web.favicon 路径");
  }
} catch (error) {
  fail(`无法解析 app.json: ${error.message}`);
}

// 4. 图标尺寸检查
assertPngSize("assets/app-icon.png", 1024, 1024);
assertPngSize("assets/favicon.png", 192, 192);

// 5. 额外提醒：检测 aws-config 中是否仍存在明显的调试日志
try {
  const awsConfig = readFile("src/config/aws-config.ts");
  if (/console\.log/.test(awsConfig)) {
    log.warn("检测到 aws-config.ts 中仍有 console.log，建议上线前移除或注释。");
  }
} catch {
  // 已在前面处理
}

if (hasError) {
  console.error("\n❌ Pre-build 检查未通过，请根据提示修复后重新运行。\n");
  process.exit(1);
}

console.log("\n🎉 所有检查通过，可以安全开始打包。\n");
process.exit(0);

