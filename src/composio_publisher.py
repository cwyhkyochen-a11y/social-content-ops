#!/usr/bin/env python3
"""
Composio 发布器 - 标准化版本

用途：
- 为 content-ops 提供 Composio 集成能力
- 支持多平台发布（Twitter、Instagram、Facebook 等）
- 自动处理 OAuth 授权流程

使用前提：
1. 设置环境变量 COMPOSIO_API_KEY
2. 在数据库中配置账号（auth_mode='composio'）
3. 用户完成 OAuth 授权

示例：
    from composio_publisher import ComposioPublisher
    
    publisher = ComposioPublisher()
    
    # 发布 Twitter 文本
    result = publisher.publish(
        entity_id="user_twitter_main",
        platform="twitter",
        action="create_post",
        params={"text": "Hello!"}
    )
"""

import os
import sys
from typing import Dict, List, Optional, Any, Literal
from composio import ComposioToolSet, App

# 平台映射
PLATFORM_MAP = {
    'twitter': App.TWITTER,
    'x': App.TWITTER,
    'instagram': 'INSTAGRAM',  # 如果 Composio 支持
    'facebook': 'FACEBOOK',
    'reddit': App.REDDIT,
    'pinterest': 'PINTEREST',
}

# 动作映射
ACTION_MAP = {
    'twitter': {
        'create_post': 'TWITTER_CREATE_POST',
        'upload_media': 'TWITTER_UPLOAD_MEDIA',
        'init_media_upload': 'TWITTER_INIT_MEDIA_UPLOAD',
        'append_media_upload': 'TWITTER_APPEND_MEDIA_UPLOAD',
        'finalize_media_upload': 'TWITTER_FINALIZE_MEDIA_UPLOAD',
    },
    'reddit': {
        'create_post': 'REDDIT_SUBMIT_POST',
    },
}


class ComposioPublisher:
    """Composio 发布器"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化 Composio 发布器
        
        Args:
            api_key: Composio API Key，如果不提供则从环境变量读取
        
        Raises:
            ValueError: 如果 API Key 未设置
        """
        self.api_key = api_key or os.getenv("COMPOSIO_API_KEY")
        if not self.api_key:
            raise ValueError(
                "COMPOSIO_API_KEY 未设置。\n"
                "请运行: export COMPOSIO_API_KEY='your_key'\n"
                "或在初始化时传入: ComposioPublisher(api_key='your_key')"
            )
        
        self._toolsets: Dict[str, ComposioToolSet] = {}
    
    def get_toolset(self, entity_id: str) -> ComposioToolSet:
        """
        获取或创建 ComposioToolSet 实例
        
        Args:
            entity_id: 实体ID（对应 account_id 或 composio_user_id）
        
        Returns:
            ComposioToolSet 实例
        """
        if entity_id not in self._toolsets:
            self._toolsets[entity_id] = ComposioToolSet(
                api_key=self.api_key,
                entity_id=entity_id
            )
        
        return self._toolsets[entity_id]
    
    def get_authorization_url(
        self,
        entity_id: str,
        platform: str,
        redirect_url: Optional[str] = None
    ) -> str:
        """
        获取 OAuth 授权链接
        
        Args:
            entity_id: 实体ID
            platform: 平台名称（twitter, instagram, facebook 等）
            redirect_url: 授权完成后的回调地址（可选）
        
        Returns:
            授权链接
        
        Raises:
            ValueError: 如果平台不支持
        
        Example:
            url = publisher.get_authorization_url(
                entity_id="user_123",
                platform="twitter"
            )
            print(f"请访问: {url}")
        """
        if platform not in PLATFORM_MAP:
            raise ValueError(f"不支持的平台: {platform}")
        
        app = PLATFORM_MAP[platform]
        toolset = self.get_toolset(entity_id)
        
        connection = toolset.initiate_connection(
            entity_id=entity_id,
            app=app
        )
        
        # 提取授权链接
        if hasattr(connection, 'redirectUrl'):
            return connection.redirectUrl
        elif isinstance(connection, dict):
            return connection.get('redirectUrl') or connection.get('connectionStatus', {}).get('redirectUrl')
        else:
            raise ValueError(f"无法获取授权链接: {connection}")
    
    def check_connection(self, entity_id: str, platform: str) -> bool:
        """
        检查平台是否已连接
        
        Args:
            entity_id: 实体ID
            platform: 平台名称
        
        Returns:
            是否已连接
        
        Example:
            if publisher.check_connection("user_123", "twitter"):
                print("Twitter 已连接")
        """
        toolset = self.get_toolset(entity_id)
        accounts = toolset.get_connected_accounts()
        
        platform_lower = platform.lower()
        for account in accounts:
            app_name = str(getattr(account, 'appName', '')).lower()
            if platform_lower in app_name:
                return True
        
        return False
    
    def get_connected_platforms(self, entity_id: str) -> List[str]:
        """
        获取已连接的平台列表
        
        Args:
            entity_id: 实体ID
        
        Returns:
            平台名称列表
        
        Example:
            platforms = publisher.get_connected_platforms("user_123")
            print(f"已连接: {platforms}")
        """
        toolset = self.get_toolset(entity_id)
        accounts = toolset.get_connected_accounts()
        
        platforms = []
        for account in accounts:
            app_name = str(getattr(account, 'appName', '')).lower()
            platforms.append(app_name)
        
        return platforms
    
    def publish(
        self,
        entity_id: str,
        platform: str,
        action: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        通用发布接口
        
        Args:
            entity_id: 实体ID
            platform: 平台名称（twitter, instagram 等）
            action: 动作名称（create_post, upload_media 等）
            params: 动作参数
        
        Returns:
            发布结果
        
        Raises:
            ValueError: 如果平台或动作不支持
        
        Example:
            result = publisher.publish(
                entity_id="user_123",
                platform="twitter",
                action="create_post",
                params={"text": "Hello!"}
            )
        """
        # 检查平台
        if platform not in ACTION_MAP:
            raise ValueError(f"不支持的平台: {platform}")
        
        # 检查动作
        if action not in ACTION_MAP[platform]:
            raise ValueError(f"平台 {platform} 不支持动作: {action}")
        
        # 获取 Composio 动作名称
        composio_action = ACTION_MAP[platform][action]
        
        # 执行动作
        toolset = self.get_toolset(entity_id)
        
        result = toolset.execute_action(
            action=composio_action,
            params=params,
            entity_id=entity_id
        )
        
        return result
    
    # ========== Twitter 专用方法 ==========
    
    def publish_twitter_text(
        self,
        entity_id: str,
        text: str
    ) -> Dict[str, Any]:
        """
        发布 Twitter 文本帖子
        
        Args:
            entity_id: 实体ID
            text: 帖子内容
        
        Returns:
            发布结果
        """
        return self.publish(
            entity_id=entity_id,
            platform='twitter',
            action='create_post',
            params={'text': text}
        )
    
    def publish_twitter_thread(
        self,
        entity_id: str,
        texts: List[str]
    ) -> Dict[str, Any]:
        """
        发布 Twitter thread
        
        Args:
            entity_id: 实体ID
            texts: 推文列表
        
        Returns:
            发布结果（包含所有推文）
        """
        results = []
        reply_to = None
        
        for i, text in enumerate(texts):
            params = {'text': text}
            if reply_to:
                params['reply'] = {'in_reply_to_tweet_id': reply_to}
            
            result = self.publish(
                entity_id=entity_id,
                platform='twitter',
                action='create_post',
                params=params
            )
            
            # 提取推文 ID 用于回复
            if isinstance(result, dict):
                data = result.get('data', {})
                reply_to = data.get('id') or data.get('tweet_id')
            
            results.append(result)
        
        return {
            'success': True,
            'thread_count': len(texts),
            'results': results
        }


def main():
    """命令行工具"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Composio 发布工具')
    parser.add_argument('--entity-id', required=True, help='实体ID')
    parser.add_argument('--platform', required=True, help='平台名称')
    parser.add_argument('--action', help='动作名称')
    parser.add_argument('--text', help='文本内容')
    parser.add_argument('--check', action='store_true', help='检查连接状态')
    parser.add_argument('--authorize', action='store_true', help='获取授权链接')
    
    args = parser.parse_args()
    
    publisher = ComposioPublisher()
    
    if args.check:
        # 检查连接
        connected = publisher.check_connection(args.entity_id, args.platform)
        if connected:
            print(f"✅ {args.platform} 已连接")
        else:
            print(f"❌ {args.platform} 未连接")
            print(f"请运行: --authorize 获取授权链接")
    
    elif args.authorize:
        # 获取授权链接
        url = publisher.get_authorization_url(args.entity_id, args.platform)
        print(f"请在浏览器中打开以下链接完成授权：")
        print(f"\n{url}\n")
    
    elif args.action and args.text:
        # 发布内容
        result = publisher.publish(
            entity_id=args.entity_id,
            platform=args.platform,
            action=args.action,
            params={'text': args.text}
        )
        print(f"✅ 发布成功")
        print(f"结果: {result}")
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
