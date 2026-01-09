/\*\*

- 日记列表懒加载实现方案
-
- 目标:
- 1.  初始加载 20 条日记
- 2.  滚动到底部时自动加载更多
- 3.  使用 FlatList 的虚拟滚动优化性能
-
- 实现步骤:
- 1.  修改后端 API,支持分页参数 (limit, lastKey)
- 2.  修改前端,实现滚动加载逻辑
- 3.  添加加载状态指示器
      \*/

## 后端修改 (backend/app/routers/diary.py)

### 1. 修改 API 端点,支持分页

```python
@router.get("/list", response_model=DiaryListResponse, summary="获取日记列表(支持分页)")
async def get_diaries(
    limit: int = 20,  # 每页数量
    last_key: Optional[str] = None,  # 上一页的最后一个key (Base64编码的JSON)
    user: Dict = Depends(get_current_user)
):
    """
    获取用户的日记列表(支持分页)

    Args:
        limit: 每页返回数量(默认 20)
        last_key: 上一页的最后一个key,用于分页
        user: 当前登录用户

    Returns:
        {
            "diaries": [...],
            "last_key": "...",  # 下一页的key,如果为null表示没有更多数据
            "has_more": true/false
        }
    """
    try:
        user_id = user.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail="用户ID无效")

        # 解码 last_key
        exclusive_start_key = None
        if last_key:
            import json
            import base64
            try:
                decoded = base64.b64decode(last_key).decode('utf-8')
                exclusive_start_key = json.loads(decoded)
            except Exception as e:
                print(f"⚠️ 解码last_key失败: {e}")

        # 调用修改后的 DynamoDB 服务
        result = db_service.get_user_diaries_paginated(
            user_id=user_id,
            limit=limit,
            exclusive_start_key=exclusive_start_key
        )

        # 编码 next_key
        next_key = None
        if result.get('last_evaluated_key'):
            import json
            import base64
            json_str = json.dumps(result['last_evaluated_key'])
            next_key = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')

        return {
            "diaries": result['diaries'],
            "last_key": next_key,
            "has_more": result.get('has_more', False)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 获取日记列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取日记列表失败: {str(e)}")
```

### 2. 添加响应模型

```python
class DiaryListResponse(BaseModel):
    diaries: List[DiaryResponse]
    last_key: Optional[str] = None
    has_more: bool = False
```

## DynamoDB 服务修改 (backend/app/services/dynamodb_service.py)

### 添加分页查询方法

```python
def get_user_diaries_paginated(
    self,
    user_id: str,
    limit: int = 20,
    exclusive_start_key: Optional[dict] = None
) -> dict:
    """
    获取用户的日记列表(分页版本)

    参数:
        user_id: 用户ID
        limit: 每页数量
        exclusive_start_key: 分页起始key

    返回:
        {
            'diaries': [...],
            'last_evaluated_key': {...},  # 下一页的key
            'has_more': True/False
        }
    """
    try:
        print(f"🔍 DynamoDB分页查询 - 用户: {user_id}, limit: {limit}")

        # 验证用户ID
        if not user_id or not user_id.strip():
            raise ValueError("用户ID不能为空")

        # 构建查询参数
        query_params = {
            'KeyConditionExpression': Key('userId').eq(user_id),
            'ScanIndexForward': False,  # 倒序排列(最新的在前)
            'Limit': limit
        }

        # 如果有分页key,添加到查询参数
        if exclusive_start_key:
            query_params['ExclusiveStartKey'] = exclusive_start_key
            print(f"📄 继续从上次位置查询...")

        # 执行查询
        response = self.table.query(**query_params)

        # 处理数据
        items = response.get('Items', [])
        print(f"📊 DynamoDB响应 - 返回: {len(items)} 条")

        # 转换格式
        diaries = []
        for item in items:
            item_type = item.get('itemType', 'diary').lower()
            if item_type != 'diary':
                continue

            diary_id = item.get('diaryId')
            if not diary_id or str(diary_id).lower() == 'unknown':
                continue

            if 'originalContent' not in item and 'polishedContent' not in item:
                continue

            diaries.append({
                'diary_id': diary_id,
                'user_id': item.get('userId', ''),
                'created_at': item.get('createdAt', ''),
                'date': item.get('date', ''),
                'language': item.get('language', 'zh'),
                'title': item.get('title', '日记'),
                'original_content': item.get('originalContent', ''),
                'polished_content': item.get('polishedContent', ''),
                'ai_feedback': item.get('aiFeedback', ''),
                'audio_url': item.get('audioUrl'),
                'audio_duration': item.get('audioDuration'),
                'image_urls': item.get('imageUrls'),
                'emotion_data': item.get('emotionData')
            })

        # 获取分页key
        last_evaluated_key = response.get('LastEvaluatedKey')
        has_more = last_evaluated_key is not None

        print(f"✅ 分页查询成功 - 返回: {len(diaries)} 条, 还有更多: {has_more}")

        return {
            'diaries': diaries,
            'last_evaluated_key': last_evaluated_key,
            'has_more': has_more
        }

    except Exception as e:
        print(f"❌ 分页查询失败: {str(e)}")
        raise
```

## 前端修改 (mobile/src/screens/DiaryListScreen.tsx)

### 1. 添加状态管理

```typescript
const [diaries, setDiaries] = useState<Diary[]>([]);
const [lastKey, setLastKey] = useState<string | null>(null);
const [hasMore, setHasMore] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [isRefreshing, setIsRefreshing] = useState(false);
```

### 2. 修改加载函数

```typescript
const loadDiaries = async (isLoadMore: boolean = false) => {
  try {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      // 初始加载或刷新
      setIsRefreshing(true);
      setLastKey(null);
      setHasMore(true);
    }

    console.log("📖 加载日记列表...", { isLoadMore, lastKey });

    // 调用新的分页API
    const response = await getDiariesPaginated(
      isLoadMore ? lastKey : null,
      20 // 每页20条
    );

    if (isLoadMore) {
      // 追加数据
      setDiaries((prev) => [...prev, ...response.diaries]);
    } else {
      // 替换数据
      setDiaries(response.diaries);
    }

    setLastKey(response.last_key);
    setHasMore(response.has_more);

    console.log("✅ 日记加载成功:", {
      total: response.diaries.length,
      hasMore: response.has_more,
    });
  } catch (error: any) {
    console.error("❌ 加载日记失败:", error);
    // 错误处理...
  } finally {
    setIsLoadingMore(false);
    setIsRefreshing(false);
  }
};
```

### 3. 添加滚动加载逻辑

```typescript
const handleLoadMore = () => {
  if (!isLoadingMore && hasMore && lastKey) {
    loadDiaries(true);
  }
};

const renderFooter = () => {
  if (!isLoadingMore) return null;

  return (
    <View style={styles.loadingFooter}>
      <ActivityIndicator size="small" color="#FF6B6B" />
      <Text style={styles.loadingText}>加载更多...</Text>
    </View>
  );
};
```

### 4. 修改 FlatList

```tsx
<FlatList
  data={diaries}
  renderItem={renderDiaryCard}
  keyExtractor={(item) => item.diary_id}
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={() => loadDiaries(false)}
    />
  }
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5} // 距离底部50%时触发
  ListFooterComponent={renderFooter}
  removeClippedSubviews={true} // 优化性能
  maxToRenderPerBatch={10} // 每批渲染10个
  windowSize={21} // 渲染窗口大小
/>
```

## 前端服务修改 (mobile/src/services/diaryService.ts)

```typescript
export async function getDiariesPaginated(
  lastKey: string | null = null,
  limit: number = 20
): Promise<{
  diaries: Diary[];
  last_key: string | null;
  has_more: boolean;
}> {
  console.log("📖 获取日记列表(分页)", { lastKey, limit });

  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (lastKey) {
    params.append("last_key", lastKey);
  }

  const response = await apiService.get<{
    diaries: Diary[];
    last_key: string | null;
    has_more: boolean;
  }>(`/diary/list?${params.toString()}`);

  return response;
}
```

## 样式

```typescript
const styles = StyleSheet.create({
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
});
```

## 优点

1. ✅ **性能优化**: 初始只加载 20 条,快速响应
2. ✅ **无限滚动**: 自动加载更多,用户体验流畅
3. ✅ **虚拟滚动**: FlatList 自动优化,只渲染可见项
4. ✅ **内存友好**: 不会一次性加载所有数据
5. ✅ **向后兼容**: 保留原有的 get_user_diaries 方法

## 实施建议

1. 先实现后端分页 API
2. 测试后端分页逻辑
3. 实现前端懒加载
4. 测试滚动加载体验
5. 优化加载动画和提示
