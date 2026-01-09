# 🐛 Modal 遮罩层残留 Bug 修复

## 问题描述

用户在使用多模态输入(图片+文字+语音)后,点击保存并关闭,整个屏幕变得不可点击,底部出现灰色遮罩层。

## 根本原因

**Modal 关闭时序问题**:

1. `onClose()` 被调用,但 Modal 还没有完全关闭
2. 立即调用 `onSuccess()` 刷新列表
3. 在刷新过程中,Modal 的遮罩层还在,导致界面不可点击

## 修复方案

### ✅ 调整关闭顺序和延迟

**修改前**:

```typescript
// ❌ 问题代码
showToast(t("success.diaryCreated"));
onClose(); // Modal 还没完全关闭
await new Promise((resolve) => setTimeout(resolve, 300));
onSuccess(); // 此时 Modal 遮罩层可能还在
```

**修改后**:

```typescript
// ✅ 修复后
onClose(); // 1. 先关闭 Modal

// 2. 等待 Modal 完全关闭（使用 requestAnimationFrame）
await new Promise((resolve) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 100); // 额外100ms确保完全关闭
    });
  });
});

// 3. 显示成功 Toast
showToast(t("success.diaryCreated"));

// 4. 等待 Toast 显示
await new Promise((resolve) => setTimeout(resolve, 500));

// 5. 最后刷新列表
onSuccess();
```

### 关键改进

1. **先关闭 Modal**: 确保 Modal 开始关闭动画
2. **等待渲染完成**: 使用 `requestAnimationFrame` 等待 2 帧 + 100ms
3. **Toast 在 Modal 关闭后显示**: 避免 Toast 被 Modal 遮挡
4. **延长等待时间**: 从 300ms 增加到 500ms,确保用户看到 Toast

## 测试步骤

### 场景 1: 图片+文字+语音

1. 选择图片
2. 输入文字
3. 录制语音
4. 点击完成
5. **等待处理完成**
6. 在结果页面点击"保存"
7. **验证**: Modal 应该完全关闭,列表可以正常点击

### 场景 2: 图片+文字

1. 选择图片
2. 输入文字
3. 点击保存
4. **等待处理完成**
5. 在结果页面点击"保存"
6. **验证**: Modal 应该完全关闭,列表可以正常点击

### 场景 3: 纯图片

1. 选择图片
2. 点击"直接保存"
3. **验证**: Modal 应该完全关闭,列表可以正常点击

## 技术细节

### requestAnimationFrame 的作用

```typescript
requestAnimationFrame(() => {
  // 第1帧: Modal 开始关闭动画
  requestAnimationFrame(() => {
    // 第2帧: Modal 关闭动画进行中
    setTimeout(resolve, 100);
    // 第3帧(+100ms): Modal 完全关闭
  });
});
```

### 为什么需要等待 2 帧?

- **第 1 帧**: React 更新 DOM,Modal 的 `visible` 变为 `false`
- **第 2 帧**: React Native 执行关闭动画
- **+100ms**: 确保动画完全结束,遮罩层完全移除

## 发布前检查

- [x] 修复 Modal 关闭时序问题
- [x] 添加 requestAnimationFrame 等待
- [x] 增加延迟时间到 500ms
- [ ] **用户测试**: 在真机上测试所有场景
- [ ] **压力测试**: 快速连续创建多个日记
- [ ] **边界测试**: 网络慢时的表现

## 相关文件

- `/Users/dengdan/Desktop/thankly/mobile/src/components/ImageDiaryModal.tsx`
  - 修改了 `handleSaveAndClose` 函数
  - 调整了关闭顺序和延迟时间

---

**修复完成时间**: 2026-01-08 19:46
**优先级**: 🔴 Critical
**状态**: ✅ 已修复,等待测试
