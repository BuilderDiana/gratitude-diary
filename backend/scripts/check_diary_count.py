#!/usr/bin/env python3
"""
测试脚本:检查 DynamoDB 中的日记数量和日期范围
"""
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.dynamodb_service import DynamoDBService
from app.config import get_settings

def main():
    print("=" * 60)
    print("📊 检查 DynamoDB 中的日记数据")
    print("=" * 60)
    
    # 初始化服务
    db_service = DynamoDBService()
    settings = get_settings()
    
    # 从环境变量或配置中获取用户ID
    # 你需要替换为你的实际用户ID
    user_id = "14e83408-a0c1-70f4-7be4-bdfb32afd12b"  # ← 替换为你的用户ID
    
    print(f"\n🔍 查询用户: {user_id}")
    print(f"📦 表名: {settings.dynamodb_table_name}")
    print(f"🌍 区域: {settings.aws_region}\n")
    
    try:
        # 获取所有日记
        diaries = db_service.get_user_diaries(user_id)
        
        print(f"✅ 查询成功!")
        print(f"📝 总共找到: {len(diaries)} 条日记\n")
        
        if diaries:
            # 按日期分组统计
            from collections import defaultdict
            date_counts = defaultdict(int)
            
            for diary in diaries:
                date = diary.get('date', 'unknown')
                date_counts[date] += 1
            
            # 排序并显示
            print("📅 按日期分布:")
            print("-" * 60)
            for date in sorted(date_counts.keys(), reverse=True):
                count = date_counts[date]
                print(f"  {date}: {count} 条日记")
            
            print("\n" + "=" * 60)
            print(f"📊 最早日记: {min(d.get('date', '') for d in diaries if d.get('date'))}")
            print(f"📊 最新日记: {max(d.get('date', '') for d in diaries if d.get('date'))}")
            print("=" * 60)
            
            # 显示前3条和后3条日记的详细信息
            print("\n🔝 最新的 3 条日记:")
            for i, diary in enumerate(diaries[:3], 1):
                print(f"\n  {i}. {diary.get('title', '无标题')}")
                print(f"     日期: {diary.get('date')}")
                print(f"     创建时间: {diary.get('created_at')}")
                print(f"     ID: {diary.get('diary_id')}")
            
            if len(diaries) > 3:
                print(f"\n🔽 最旧的 3 条日记:")
                for i, diary in enumerate(diaries[-3:], 1):
                    print(f"\n  {i}. {diary.get('title', '无标题')}")
                    print(f"     日期: {diary.get('date')}")
                    print(f"     创建时间: {diary.get('created_at')}")
                    print(f"     ID: {diary.get('diary_id')}")
        else:
            print("⚠️  没有找到任何日记")
    
    except Exception as e:
        print(f"❌ 查询失败: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
