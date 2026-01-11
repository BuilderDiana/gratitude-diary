# 🎓 Testing 101 - Learning by Doing

## 📚 **核心概念速查**

### **什么是测试？**

测试就是验证代码是否按预期工作。就像你做菜后要尝一尝味道一样！

### **为什么要测试？**

1. ✅ **防止 bug**：在上线前发现问题
2. ✅ **重构信心**：改代码时不怕弄坏功能
3. ✅ **文档作用**：测试就是最好的使用说明
4. ✅ **面试加分**：展示专业素养

---

## 🧪 **测试类型详解**

### **1. 单元测试 (Unit Test)**

**定义**：测试单个函数/方法

**例子**：

```python
# 要测试的函数
def add(a, b):
    return a + b

# 测试代码
def test_add():
    assert add(2, 3) == 5  # ✅ 通过
    assert add(-1, 1) == 0  # ✅ 通过
    assert add(0, 0) == 0   # ✅ 通过
```

**特点**：

- ⚡ 快速（毫秒级）
- 🎯 精准（只测一个功能）
- 🔧 易维护

---

### **2. 集成测试 (Integration Test)**

**定义**：测试多个模块协同工作

**例子**：

```python
# 测试 API 端点（涉及路由、业务逻辑、数据库）
def test_create_diary():
    response = client.post("/diary/voice", json={
        "audio_url": "https://example.com/audio.mp3"
    })
    assert response.status_code == 200
    assert "diary_id" in response.json()
```

**特点**：

- 🐢 较慢（秒级）
- 🔗 测试真实交互
- 💪 更接近实际使用

---

### **3. E2E 测试 (End-to-End Test)**

**定义**：模拟真实用户操作

**例子**：

```python
# 模拟用户完整流程
def test_user_journey():
    # 1. 打开应用
    # 2. 点击录音按钮
    # 3. 录音 5 秒
    # 4. 停止录音
    # 5. 等待 AI 处理
    # 6. 验证日记创建成功
```

**特点**：

- 🐌 最慢（分钟级）
- 🎭 模拟真实场景
- 💰 成本高（维护难）

---

## 🔧 **pytest 快速入门**

### **安装**

```bash
pip install pytest pytest-asyncio httpx
```

### **基本用法**

#### **1. 创建测试文件**

文件名必须以 `test_` 开头或 `_test` 结尾

```python
# test_example.py
def test_simple():
    assert 1 + 1 == 2
```

#### **2. 运行测试**

```bash
pytest                    # 运行所有测试
pytest test_example.py    # 运行单个文件
pytest -v                 # 详细输出
pytest -k "test_add"      # 只运行名称包含 "test_add" 的测试
```

#### **3. 断言 (Assert)**

```python
# 相等
assert a == b

# 不相等
assert a != b

# 包含
assert "hello" in text

# 异常
with pytest.raises(ValueError):
    raise ValueError("错误")
```

---

## 📝 **实战练习 1：单元测试**

### **目标**：测试日期格式化函数

#### **Step 1: 创建测试文件**

```python
# backend/tests/test_utils.py
from datetime import datetime

def format_date(date_str: str) -> str:
    """格式化日期"""
    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    return dt.strftime("%Y-%m-%d")

def test_format_date():
    # 测试正常情况
    result = format_date("2026-01-11T14:30:00Z")
    assert result == "2026-01-11"

def test_format_date_invalid():
    # 测试异常情况
    import pytest
    with pytest.raises(ValueError):
        format_date("invalid date")
```

#### **Step 2: 运行测试**

```bash
cd backend
pytest tests/test_utils.py -v
```

#### **预期输出**：

```
tests/test_utils.py::test_format_date PASSED
tests/test_utils.py::test_format_date_invalid PASSED

====== 2 passed in 0.05s ======
```

---

## 📝 **实战练习 2：API 集成测试**

### **目标**：测试日记列表 API

#### **Step 1: 创建测试文件**

```python
# backend/tests/test_api.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_diary_list():
    # 模拟请求
    response = client.get(
        "/diary/list",
        headers={"Authorization": "Bearer test_token"}
    )

    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert "diaries" in data
    assert isinstance(data["diaries"], list)
```

#### **Step 2: 运行测试**

```bash
pytest tests/test_api.py -v
```

---

## 🎯 **测试最佳实践**

### **1. AAA 模式**

```python
def test_example():
    # Arrange（准备）：设置测试数据
    user = User(name="Alice")

    # Act（执行）：调用要测试的功能
    result = user.get_greeting()

    # Assert（断言）：验证结果
    assert result == "Hello, Alice!"
```

### **2. 测试命名**

```python
# ❌ 不好
def test1():
    pass

# ✅ 好
def test_user_can_login_with_valid_credentials():
    pass
```

### **3. 一个测试只测一件事**

```python
# ❌ 不好：测试太多东西
def test_everything():
    assert add(1, 1) == 2
    assert subtract(5, 3) == 2
    assert multiply(2, 3) == 6

# ✅ 好：每个测试专注一个功能
def test_add():
    assert add(1, 1) == 2

def test_subtract():
    assert subtract(5, 3) == 2
```

---

## 📊 **测试覆盖率**

### **安装**

```bash
pip install pytest-cov
```

### **运行**

```bash
pytest --cov=app tests/
```

### **生成 HTML 报告**

```bash
pytest --cov=app --cov-report=html tests/
open htmlcov/index.html
```

---

## 🎓 **面试常见问题**

### **Q1: 单元测试和集成测试的区别？**

**A**:

- 单元测试：测试单个函数，速度快，不依赖外部服务
- 集成测试：测试多个模块交互，速度慢，可能依赖数据库/API

### **Q2: 为什么要写测试？**

**A**:

1. 防止 bug，提高代码质量
2. 重构时有信心，不怕改坏代码
3. 测试就是活文档，展示如何使用代码
4. 提升开发效率（长期看）

### **Q3: TDD 是什么？**

**A**: Test-Driven Development（测试驱动开发）

- 先写测试，再写代码
- 流程：Red（测试失败）→ Green（测试通过）→ Refactor（重构）

### **Q4: 测试覆盖率多少合适？**

**A**:

- 核心业务逻辑：80-100%
- 工具函数：70-90%
- UI 组件：30-50%（成本高，优先级低）

---

## 🚀 **下一步行动**

### **今天完成**：

1. ✅ 阅读这份文档
2. ✅ 运行手动测试清单
3. ✅ 编写第一个 pytest 测试
4. ✅ 运行测试并查看结果

### **明天学习**：

1. 📚 学习 Fixtures（测试数据准备）
2. 📚 学习 Mocking（模拟外部依赖）
3. 📚 学习异步测试（async/await）

---

## 💡 **记住这些金句**

> "测试不是浪费时间，而是节省时间的投资。"

> "没有测试的代码，就像没有刹车的汽车。"

> "好的测试让你睡得更香。"

---

**准备好了吗？让我们开始实战！** 🎯
