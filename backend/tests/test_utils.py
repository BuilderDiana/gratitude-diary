from datetime import datetime
import pytest

def format_date(date_str: str) -> str:
    """格式化日期 (用于单元测试练习)"""
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        raise ValueError("Invalid date format")

def test_format_date():
    """测试正常情况"""
    result = format_date("2026-01-11T14:30:00Z")
    assert result == "2026-01-11"

def test_format_date_invalid():
    """测试异常情况"""
    with pytest.raises(ValueError, match="Invalid date format"):
        format_date("invalid date")

def test_format_date_edge_case():
    """测试边界情况：跨年"""
    result = format_date("2025-12-31T23:59:59Z")
    assert result == "2025-12-31"
