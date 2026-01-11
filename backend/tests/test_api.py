from fastapi.testclient import TestClient
import pytest
import sys
import os

# 将项目根目录添加到 python 路径，确保可以导入 app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

# 创建一个测试客户端
client = TestClient(app)

def test_root_endpoint():
    """测试根接口是否存活"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "感恩" in data["message"]

def test_get_diary_list_unauthorized():
    """测试未授权访问日记列表"""
    response = client.get("/diary/list")
    # 因为我们有认证中间件，不带 Token 应该返回 401 或报错
    # 根据你的实现，这里可能是 401 或者具体的错误码
    assert response.status_code in [401, 403, 500] 

def test_health_check():
    """测试健康检查接口"""
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
