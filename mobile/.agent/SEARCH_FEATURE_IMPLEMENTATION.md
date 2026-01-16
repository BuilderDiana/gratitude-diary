# 搜索功能完整实现指南

**版本**: v1.2.0  
**创建时间**: 2026-01-16  
**状态**: 待实现

---

## 📋 目录

1. [功能概述](#功能概述)
2. [技术架构](#技术架构)
3. [前端实现](#前端实现)
4. [后端实现](#后端实现)
5. [测试清单](#测试清单)
6. [已知问题](#已知问题)

---

## 功能概述

### 用户场景

> "我记得上个月写过关于旅行的日记，但忘了具体日期。我想搜索'旅行'找到那条日记。"

### 核心功能

- ✅ 实时搜索（输入即搜）
- ✅ 支持中英文模糊匹配
- ✅ 搜索标题和内容（不搜索AI反馈）
- ✅ 本地搜索 + 后端全文搜索
- ✅ 搜索结果高亮显示
- ✅ 按相关性和时间排序

### 技术要求

- 前端：React Native + TypeScript
- 后端：Python FastAPI + DynamoDB
- 防抖：300ms
- 支持特殊字符和emoji

---

## 技术架构

```
┌─────────────┐
│   用户输入   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  防抖 300ms │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  前端本地搜索（已加载日记）  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  后端全文搜索（所有日记）   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  合并结果并去重              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  渲染搜索结果（带高亮）      │
└─────────────────────────────┘
```

---

## 前端实现

### 步骤 1: 添加搜索UI

#### 文件: `mobile/src/screens/DiaryListScreen.tsx`

**位置**: 在文件顶部添加导入

```typescript
import { TextInput } from "react-native"; // 添加到现有导入中
```

**位置**: 在 state 定义区域（约第113行附近）添加

```typescript
// 搜索相关状态
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<Diary[]>([]);
const [isSearching, setIsSearching] = useState(false);
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```

**位置**: 修改 `renderHeader` 函数（约第1208行）

在汉堡菜单行（`</View>`，约第1221行）**之后**、顶部区域（`<View style={styles.topBar}>`，约第1224行）**之前**添加：

```typescript
{/* 搜索框 - 独立一行，放在汉堡菜单和问候语之间 */}
<View style={styles.searchContainer}>
  <View style={styles.searchInputWrapper}>
    <Ionicons
      name="search-outline"
      size={20}
      color="#80645A"
      style={styles.searchIcon}
    />
    <TextInput
      style={[
        styles.searchInput,
        {
          fontFamily: getFontFamilyForText(
            searchQuery || t('search.placeholder'),
            'regular'
          )
        }
      ]}
      placeholder={t('search.placeholder')}
      placeholderTextColor="#B8A89D"
      value={searchQuery}
      onChangeText={handleSearchChange}
      returnKeyType="search"
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="while-editing" // iOS清空按钮
    />
    {/* Android清空按钮 */}
    {Platform.OS === 'android' && searchQuery.length > 0 && (
      <TouchableOpacity
        onPress={() => {
          setSearchQuery('');
          setSearchResults([]);
          setIsSearching(false);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.clearButton}
      >
        <Ionicons name="close-circle" size={20} color="#B8A89D" />
      </TouchableOpacity>
    )}
  </View>

  {/* 搜索状态提示 */}
  {isSearching && (
    <View style={styles.searchingIndicator}>
      <ActivityIndicator size="small" color="#80645A" />
      <Text style={styles.searchingText}>{t('search.searching')}</Text>
    </View>
  )}

  {/* 搜索结果数量 */}
  {searchQuery.trim() !== '' && !isSearching && (
    <Text style={styles.searchResultCount}>
      {searchResults.length === 0
        ? t('search.noResults')
        : `${t('search.found')} ${searchResults.length} ${t('search.results')}`
      }
    </Text>
  )}
</View>
```

**位置**: 添加样式（在 `styles = StyleSheet.create({` 对象中，约第1924行）

```typescript
// 搜索相关样式
searchContainer: {
  marginTop: 16,
  marginBottom: 8,
},
searchInputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F8F4F0',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  borderWidth: 1,
  borderColor: '#E8DED0',
},
searchIcon: {
  marginRight: 8,
},
searchInput: {
  flex: 1,
  fontSize: 16,
  color: '#332824',
  paddingVertical: Platform.OS === 'ios' ? 0 : 4,
  height: Platform.OS === 'android' ? 40 : undefined,
},
clearButton: {
  marginLeft: 8,
},
searchingIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
  gap: 8,
},
searchingText: {
  fontSize: 14,
  color: '#80645A',
},
searchResultCount: {
  fontSize: 14,
  color: '#80645A',
  marginTop: 8,
},
```

---

### 步骤 2: 实现搜索逻辑

**位置**: 在 `DiaryListScreen` 组件内，`handleDeleteDiary` 函数后面（约第1086行之后）

```typescript
// ========== 搜索相关函数 ==========

/**
 * 搜索输入变化处理（带防抖）
 */
const handleSearchChange = (text: string) => {
  setSearchQuery(text);

  // 清空输入时重置
  if (text.trim() === "") {
    setSearchResults([]);
    setIsSearching(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    return;
  }

  // 防抖：等用户停止输入300ms后再搜索
  setIsSearching(true);

  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  searchTimeoutRef.current = setTimeout(() => {
    performSearch(text.trim());
  }, 300);
};

/**
 * 执行搜索（本地 + 后端）
 */
const performSearch = async (query: string) => {
  if (!query) {
    setSearchResults([]);
    setIsSearching(false);
    return;
  }

  try {
    console.log("🔍 开始搜索:", query);
    const lowercaseQuery = query.toLowerCase();

    // 1. 本地搜索（已加载的日记）
    const localResults = diaries.filter((diary) => {
      const title = (diary.title || "").toLowerCase();
      const originalContent = (diary.original_content || "").toLowerCase();
      const polishedContent = (diary.polished_content || "").toLowerCase();

      return (
        title.includes(lowercaseQuery) ||
        originalContent.includes(lowercaseQuery) ||
        polishedContent.includes(lowercaseQuery)
      );
    });

    console.log("📝 本地搜索结果:", localResults.length);

    // 2. 后端全文搜索（所有日记，包括未加载的）
    let backendResults: Diary[] = [];
    try {
      backendResults = await searchDiaries(query);
      console.log("🌐 后端搜索结果:", backendResults.length);
    } catch (backendError) {
      console.warn("⚠️ 后端搜索失败，仅显示本地结果:", backendError);
      // 降级：只使用本地结果
    }

    // 3. 合并结果并去重（优先本地结果）
    const mergedResults = mergeAndDeduplicateResults(
      localResults,
      backendResults,
    );

    console.log("✅ 最终搜索结果:", mergedResults.length);
    setSearchResults(mergedResults);
  } catch (error) {
    console.error("❌ 搜索失败:", error);
    // 发生错误时也显示本地搜索结果
    const localResults = diaries.filter((diary) => {
      const title = (diary.title || "").toLowerCase();
      const content = (
        diary.polished_content ||
        diary.original_content ||
        ""
      ).toLowerCase();
      return (
        title.includes(query.toLowerCase()) ||
        content.includes(query.toLowerCase())
      );
    });
    setSearchResults(localResults);
  } finally {
    setIsSearching(false);
  }
};

/**
 * 合并并去重搜索结果
 */
const mergeAndDeduplicateResults = (
  local: Diary[],
  backend: Diary[],
): Diary[] => {
  const seen = new Set<string>();
  const merged: Diary[] = [];

  // 优先添加本地结果（已加载，渲染更快）
  for (const diary of local) {
    if (!seen.has(diary.diary_id)) {
      seen.add(diary.diary_id);
      merged.push(diary);
    }
  }

  // 添加后端独有的结果
  for (const diary of backend) {
    if (!seen.has(diary.diary_id)) {
      seen.add(diary.diary_id);
      merged.push(diary);
    }
  }

  // 按创建时间倒序排序
  merged.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  return merged;
};
```

**位置**: 修改 `FlatList` 的 `data` 属性（约第1900行）

```typescript
<FlatList
  data={searchQuery.trim() !== '' ? searchResults : diaries}
  // ... 其他 props 保持不变
```

**位置**: 清理搜索定时器（在 `useEffect` 清理函数中）

在现有的 cleanup 逻辑中（约第340行的 `useFocusEffect` 或组件卸载时）添加：

```typescript
// 清理搜索定时器
return () => {
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }
  // ... 其他清理逻辑
};
```

---

### 步骤 3: 添加搜索API调用

#### 文件: `mobile/src/services/diaryService.ts`

**位置**: 在文件末尾，`createTextDiary` 函数之后添加

```typescript
/**
 * 搜索日记
 * @param query 搜索关键词
 * @returns 匹配的日记列表
 */
export async function searchDiaries(query: string): Promise<any[]> {
  try {
    const response = await axiosInstance.get("/api/diary/search", {
      params: { q: query },
    });

    console.log("🔍 搜索API响应:", response.data);
    return response.data.diaries || [];
  } catch (error: any) {
    console.error("❌ 搜索日记失败:", error);

    // 如果是404或500，返回空数组而不是抛出错误
    if (error.response?.status === 404 || error.response?.status === 500) {
      console.warn("⚠️ 后端搜索不可用，返回空结果");
      return [];
    }

    throw error;
  }
}
```

**重要**: 确保顶部已导入 `axiosInstance`:

```typescript
import { axiosInstance } from "../config/aws-config";
```

---

### 步骤 4: 创建高亮组件

#### 文件: `mobile/src/components/HighlightedText.tsx` (新建文件)

```typescript
import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface HighlightedTextProps {
  /**
   * 要显示的文本
   */
  text: string;

  /**
   * 搜索关键词（用于高亮）
   */
  searchQuery: string;

  /**
   * 文本样式
   */
  style?: StyleProp<TextStyle>;

  /**
   * 高亮部分的样式
   */
  highlightStyle?: StyleProp<TextStyle>;

  /**
   * 最大行数
   */
  numberOfLines?: number;
}

/**
 * 带搜索关键词高亮的文本组件
 *
 * 用法:
 * <HighlightedText
 *   text="今天去了北京旅行"
 *   searchQuery="旅行"
 *   style={styles.text}
 * />
 */
export function HighlightedText({
  text,
  searchQuery,
  style,
  highlightStyle,
  numberOfLines,
}: HighlightedTextProps) {
  // 如果没有搜索词，直接显示原文
  if (!searchQuery || searchQuery.trim() === '') {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  // 如果文本为空，返回空
  if (!text) {
    return <Text style={style} numberOfLines={numberOfLines}></Text>;
  }

  try {
    // 转义特殊正则字符
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 分割文本（忽略大小写）
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {parts.map((part, index) => {
          // 检查是否匹配（忽略大小写）
          const isMatch = part.toLowerCase() === searchQuery.toLowerCase();

          return isMatch ? (
            <Text
              key={index}
              style={[
                highlightStyle || {
                  backgroundColor: '#FFE5B4', // 浅橙色背景
                  color: '#FF6B35', // 深橙色文字
                  fontWeight: '600',
                },
              ]}
            >
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          );
        })}
      </Text>
    );
  } catch (error) {
    // 正则表达式错误时，显示原文
    console.warn('HighlightedText 错误:', error);
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }
}
```

---

### 步骤 5: 在日记卡片中使用高亮

#### 文件: `mobile/src/screens/DiaryListScreen.tsx`

**位置**: 在文件顶部添加导入

```typescript
import { HighlightedText } from "../components/HighlightedText";
```

**位置**: 修改 `renderDiaryCard` 函数中的标题显示（约第1537-1550行）

**原代码**:

```typescript
<Text
  style={[
    styles.cardTitle,
    {
      fontFamily: titleFontFamily,
      fontWeight: isChineseTitle ? '700' : '600',
      fontSize: isChineseTitle ? 18 : 18,
      lineHeight: isChineseTitle ? 26 : 24,
    },
  ]}
  numberOfLines={2}
>
  {item.title}
</Text>
```

**替换为**:

```typescript
<HighlightedText
  text={item.title}
  searchQuery={searchQuery}
  style={[
    styles.cardTitle,
    {
      fontFamily: titleFontFamily,
      fontWeight: isChineseTitle ? '700' : '600',
      fontSize: isChineseTitle ? 18 : 18,
      lineHeight: isChineseTitle ? 26 : 24,
    },
  ]}
  numberOfLines={2}
/>
```

**位置**: 修改内容显示（约第1570-1580行）

**原代码**:

```typescript
<Text
  style={[
    styles.cardContent,
    {
      fontFamily: contentFontFamily,
      fontSize: isChineseContent ? 16 : 16,
      lineHeight: isChineseContent ? 28 : 24,
    },
  ]}
  numberOfLines={3}
>
  {contentText}
</Text>
```

**替换为**:

```typescript
<HighlightedText
  text={contentText}
  searchQuery={searchQuery}
  style={[
    styles.cardContent,
    {
      fontFamily: contentFontFamily,
      fontSize: isChineseContent ? 16 : 16,
      lineHeight: isChineseContent ? 28 : 24,
    },
  ]}
  numberOfLines={3}
/>
```

---

### 步骤 6: 添加国际化文本

#### 文件: `mobile/src/i18n/zh.ts`

**位置**: 在 exports 对象中添加（约第150行附近）

```typescript
search: {
  placeholder: '搜索日记...',
  searching: '搜索中...',
  noResults: '未找到匹配的日记',
  found: '找到',
  results: '条日记',
},
```

#### 文件: `mobile/src/i18n/en.ts`

```typescript
search: {
  placeholder: 'Search diaries...',
  searching: 'Searching...',
  noResults: 'No matching diaries found',
  found: 'Found',
  results: 'diaries',
},
```

---

## 后端实现

### 文件: `backend/app/routers/diary.py`

**位置**: 在文件末尾，最后一个路由之后添加

```python
@router.get("/search")
async def search_diaries(
    q: str = Query(..., min_length=1, max_length=100, description="搜索关键词"),
    current_user: dict = Depends(get_current_user),
):
    """
    搜索日记

    - 支持标题和内容的全文搜索
    - 支持中英文模糊匹配
    - 按创建时间倒序返回结果

    TODO: 生产环境应使用 ElasticSearch 或 DynamoDB GSI 优化性能
    """
    try:
        user_id = current_user["user_id"]
        logger.info(f"用户 {user_id} 搜索: {q}")

        # 使用 DynamoDB scan 进行全文搜索
        # 注意：scan 会扫描整个表，对于大数据量效率较低
        # 生产环境建议使用 ElasticSearch 或创建 GSI

        response = diary_table.scan(
            FilterExpression=(
                Attr("user_id").eq(user_id) &
                (
                    Attr("title").contains(q) |
                    Attr("polished_content").contains(q) |
                    Attr("original_content").contains(q)
                )
            )
        )

        diaries = response.get("Items", [])

        # 按创建时间倒序排序
        diaries.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        logger.info(f"搜索到 {len(diaries)} 条日记")

        return {
            "diaries": diaries,
            "count": len(diaries)
        }

    except Exception as e:
        logger.error(f"搜索日记失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"搜索失败: {str(e)}"
        )
```

**重要**: 确保顶部已导入必要的模块

```python
from fastapi import Query  # 添加到现有的 fastapi 导入中
from boto3.dynamodb.conditions import Attr  # 添加到现有的 boto3 导入中
```

---

## 测试清单

### 前端测试

- [ ] **搜索框显示正常**
  - iOS 和 Android 上UI正常
  - 输入框可以正常输入中英文
  - 清空按钮工作正常

- [ ] **本地搜索功能**
  - 搜索中文内容能找到日记
  - 搜索英文内容能找到日记
  - 搜索标题能找到日记
  - 搜索内容能找到日记
  - 大小写不敏感

- [ ] **搜索体验**
  - 输入停止后300ms开始搜索
  - 显示"搜索中..."提示
  - 显示搜索结果数量
  - 无结果时显示提示
  - 清空搜索后恢复完整列表

- [ ] **搜索结果**
  - 结果按时间倒序排列
  - 点击搜索结果可以正常打开详情
  - 关键词高亮显示正确
  - 高亮颜色清晰可见

- [ ] **边界情况**
  - 特殊字符搜索不崩溃
  - emoji搜索不崩溃
  - 空格搜索正常
  - 网络断开时降级到本地搜索

### 后端测试

- [ ] **API端点**
  - `/api/diary/search?q=测试` 返回200
  - 返回数据格式正确
  - 只返回当前用户的日记

- [ ] **搜索准确性**
  - 中文搜索准确
  - 英文搜索准确
  - 部分匹配有效
  - 结果按时间排序

- [ ] **性能**
  - 搜索响应 < 1秒
  - 大数据量不超时

- [ ] **安全性**
  - 需要认证才能访问
  - XSS注入无效
  - SQL注入无效

---

## 已知问题与优化建议

### 当前限制

1. **DynamoDB Scan 性能问题**
   - 当前使用 `scan` 全表扫描
   - 用户日记 > 1000 条时性能下降
   - **建议**: 使用 ElasticSearch 或创建 DynamoDB GSI

2. **搜索结果分页**
   - 当前一次返回所有结果
   - 结果太多时可能卡顿
   - **建议**: 添加分页，每次返回50条

3. **搜索历史**
   - 当前不保存搜索历史
   - **建议**: 添加最近搜索功能

### 未来优化

1. **高级搜索**
   - 按日期范围搜索
   - 按情绪搜索
   - 按标签搜索

2. **搜索建议**
   - 热门搜索词
   - 搜索自动完成
   - 拼写纠正

3. **搜索分析**
   - 记录搜索行为
   - 优化搜索算法
   - 个性化搜索结果

---

## 实施步骤

### Day 1: 前端UI (2-3小时)

1. ✅ 添加搜索框 UI
2. ✅ 添加国际化文本
3. ✅ 测试UI在不同设备上的显示

### Day 2: 前端逻辑 (3-4小时)

1. ✅ 实现本地搜索
2. ✅ 添加防抖
3. ✅ 创建高亮组件
4. ✅ 集成到日记卡片

### Day 3: 后端API (2-3小时)

1. ✅ 实现搜索端点
2. ✅ 测试API
3. ✅ 前后端联调

### Day 4: 测试优化 (2-3小时)

1. ✅ 完整功能测试
2. ✅ 性能测试
3. ✅ Bug修复
4. ✅ 代码审查

---

## 提交清单

提交前确认:

- [ ] 所有文件已保存
- [ ] TypeScript 无编译错误
- [ ] 代码格式化完成
- [ ] 功能测试通过
- [ ] Commit message 清晰

```bash
git add .
git commit -m "feat: implement diary search functionality

- Add search UI with real-time input
- Implement local and backend search
- Add search result highlighting
- Support Chinese and English fuzzy matching
- Add debouncing (300ms)
- Backend search API with DynamoDB scan

Tested on iOS and Android"
```

---

**准备好了吗？让我们开始实现！** 🚀

有任何问题随时问我！
