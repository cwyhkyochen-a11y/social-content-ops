#!/usr/bin/env python3
"""
Composio 快速测试脚本

用途：
- 快速测试 Composio 连接
- 验证账号授权状态
- 测试发布功能

使用方式：
    # 1. 设置 API Key
    export COMPOSIO_API_KEY="your_key"
    
    # 2. 运行测试
    python3 quick_test_composio.py
"""

import os
import sys

# 添加 src 到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from composio_publisher import ComposioPublisher

def main():
    print("=" * 60)
    print("Composio 快速测试")
    print("=" * 60)
    
    # 检查 API Key
    api_key = os.getenv("COMPOSIO_API_KEY")
    if not api_key:
        print("\n❌ 错误：COMPOSIO_API_KEY 未设置")
        print("\n请运行：")
        print("  export COMPOSIO_API_KEY='your_api_key'")
        print("\n或在 Composio 平台获取 API Key：")
        print("  https://platform.composio.dev/settings")
        sys.exit(1)
    
    print(f"\n✅ API Key: {api_key[:10]}...")
    
    # 初始化发布器
    try:
        publisher = ComposioPublisher()
        print("✅ ComposioPublisher 初始化成功")
    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        sys.exit(1)
    
    # 获取 Entity ID
    print("\n" + "=" * 60)
    entity_id = input("请输入 Entity ID (留空使用 'test_user'): ").strip()
    if not entity_id:
        entity_id = "test_user"
    
    print(f"使用 Entity ID: {entity_id}")
    
    # 选择平台
    print("\n支持的平台:")
    print("  1. twitter")
    print("  2. reddit")
    
    platform_choice = input("\n选择平台 (1/2，默认 1): ").strip()
    platform = "twitter" if platform_choice != "2" else "reddit"
    
    print(f"选择平台: {platform}")
    
    # 检查连接状态
    print("\n" + "=" * 60)
    print(f"检查 {platform} 连接状态...")
    
    try:
        connected = publisher.check_connection(entity_id, platform)
        
        if connected:
            print(f"✅ {platform} 已连接")
            
            # 获取已连接平台
            platforms = publisher.get_connected_platforms(entity_id)
            print(f"\n已连接的平台: {', '.join(platforms)}")
            
            # 询问是否测试发布
            print("\n" + "=" * 60)
            test_publish = input("是否测试发布？(y/N): ").strip().lower()
            
            if test_publish == 'y':
                text = input("输入测试内容（留空使用默认）: ").strip()
                if not text:
                    text = "Hello from Composio! 🚀 #test"
                
                print(f"\n📤 发布中...")
                print(f"   内容: {text}")
                
                try:
                    result = publisher.publish(
                        entity_id=entity_id,
                        platform=platform,
                        action='create_post',
                        params={'text': text}
                    )
                    
                    print(f"\n✅ 发布成功！")
                    print(f"   结果: {result}")
                
                except Exception as e:
                    print(f"\n❌ 发布失败: {e}")
                    import traceback
                    traceback.print_exc()
            else:
                print("⏭️  跳过发布测试")
        
        else:
            print(f"❌ {platform} 未连接")
            print(f"\n需要先完成 OAuth 授权")
            
            # 询问是否获取授权链接
            get_auth = input("\n是否获取授权链接？(Y/n): ").strip().lower()
            
            if get_auth != 'n':
                print(f"\n🔗 获取授权链接...")
                
                try:
                    url = publisher.get_authorization_url(entity_id, platform)
                    
                    print(f"\n{'=' * 60}")
                    print(f"请在浏览器中打开以下链接完成授权：")
                    print(f"\n{url}\n")
                    print(f"{'=' * 60}")
                    
                    print(f"\n授权完成后，重新运行此脚本测试发布功能。")
                
                except Exception as e:
                    print(f"\n❌ 获取授权链接失败: {e}")
                    import traceback
                    traceback.print_exc()
    
    except Exception as e:
        print(f"❌ 检查连接失败: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == '__main__':
    main()
