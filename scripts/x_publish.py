#!/usr/bin/env python3
"""
Twitter/X 自动发布脚本

通过 Chrome DevTools Protocol (CDP) 实现自动化发布
支持：文本、图片（最多4张）

Usage:
    # 发布纯文本
    python x_publish.py --text "Hello World"

    # 发布带图片
    python x_publish.py --text "Hello" --images img1.jpg img2.jpg

    # 无头模式
    python x_publish.py --headless --text "Hello" --images img1.jpg

    # 指定账号
    python x_publish.py --account myaccount --text "Hello"
"""

import argparse
import json
import os
import random
import sys
import time
from pathlib import Path

# Ensure UTF-8 output
if sys.platform == "win32":
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")

# Add parent dir to path
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

try:
    from chrome_launcher import ensure_chrome, restart_chrome
    from cdp_publish import CDPClient, CDPError
    from image_downloader import ImageDownloader
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're running from the correct directory")
    sys.exit(1)


class TwitterPublisher:
    """Twitter/X publisher using Chrome DevTools Protocol."""
    
    # Selectors for Twitter web interface
    # Note: These may need updating as Twitter changes their UI
    SELECTORS = {
        'compose_button': 'a[href="/compose/tweet"]',
        'compose_textarea': 'div[data-testid="tweetTextarea_0"]',
        'file_input': 'input[type="file"]',
        'tweet_button': 'button[data-testid="tweetButton"]',
        'tweet_button_inline': 'button[data-testid="tweetButtonInline"]',
        'home_nav': 'a[href="/home"]',
    }
    
    TWITTER_URL = "https://twitter.com"
    COMPOSE_URL = "https://twitter.com/compose/tweet"
    
    def __init__(self, host="127.0.0.1", port=9222, headless=False, 
                 timeout=60, timing_jitter=0.2, account=None):
        self.host = host
        self.port = port
        self.headless = headless
        self.timeout = timeout
        self.timing_jitter = timing_jitter
        self.account = account or "default"
        self.cdp = None
        self.image_downloader = ImageDownloader()
        
    def _random_delay(self, base_ms):
        """Add random delay to simulate human behavior."""
        jitter = base_ms * self.timing_jitter * (random.random() - 0.5) * 2
        delay = max(0, base_ms + jitter) / 1000
        time.sleep(delay)
        
    def start(self):
        """Start Chrome and connect via CDP."""
        print("🚀 启动 Chrome...")
        
        # Ensure Chrome is running
        chrome_info = ensure_chrome(
            host=self.host,
            port=self.port,
            headless=self.headless,
            timeout=self.timeout
        )
        
        print(f"✅ Chrome ready: {chrome_info}")
        
        # Connect via CDP
        self.cdp = CDPClient(self.host, self.port)
        
        # Check login status
        if not self._check_login():
            print("❌ 未登录 Twitter")
            if self.headless:
                print("🔄 切换到可视化模式重新登录...")
                restart_chrome(host=self.host, port=self.port, headless=False)
                self.headless = False
                return self.start()
            return False
            
        return True
        
    def _check_login(self):
        """Check if user is logged in to Twitter."""
        try:
            # Navigate to home
            self.cdp.navigate(self.TWITTER_URL)
            self._random_delay(2000)
            
            # Check for login indicator (home nav or compose button)
            result = self.cdp.evaluate("""
                !!(document.querySelector('a[href="/home"]') || 
                   document.querySelector('a[href="/compose/tweet"]') ||
                   document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]'))
            """)
            
            return result.get("result", {}).get("value", False)
            
        except Exception as e:
            print(f"Login check error: {e}")
            return False
            
    def publish(self, text: str, images: list = None, auto_publish: bool = False):
        """
        Publish a tweet.
        
        Args:
            text: Tweet text (max 280 chars for free, 4000 for Blue)
            images: List of image paths (max 4)
            auto_publish: If True, auto-click publish button
            
        Returns:
            dict with status and url
        """
        if not self.cdp:
            raise RuntimeError("CDP not connected. Call start() first.")
            
        # Validate input
        if len(text) > 4000:
            raise ValueError("Text exceeds 4000 character limit")
            
        if images and len(images) > 4:
            raise ValueError("Maximum 4 images allowed")
            
        print(f"📝 准备发布: {text[:50]}...")
        
        try:
            # Navigate to compose
            print("🌐 打开发布页面...")
            self.cdp.navigate(self.COMPOSE_URL)
            self._random_delay(3000)
            
            # Wait for compose textarea
            print("⏳ 等待页面加载...")
            self._wait_for_element(self.SELECTORS['compose_textarea'])
            self._random_delay(1000)
            
            # Enter text
            print("⌨️  输入文本...")
            self._type_text(text)
            self._random_delay(800)
            
            # Upload images if provided
            if images:
                print(f"🖼️  上传 {len(images)} 张图片...")
                self._upload_images(images)
                self._random_delay(2000)
                
            # Get tweet preview
            print("✅ 内容已填写完成")
            
            if auto_publish:
                print("📤 自动发布...")
                return self._click_publish()
            else:
                print("⏸️  等待手动发布（请在浏览器中点击发布按钮）")
                return {
                    "status": "ready_to_publish",
                    "message": "内容已填写，请在浏览器中确认并发布",
                    "compose_url": self.COMPOSE_URL
                }
                
        except Exception as e:
            print(f"❌ 发布失败: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
            
    def _wait_for_element(self, selector, timeout=30):
        """Wait for element to appear."""
        start = time.time()
        while time.time() - start < timeout:
            result = self.cdp.evaluate(f"!!document.querySelector('{selector}')")
            if result.get("result", {}).get("value", False):
                return True
            time.sleep(0.5)
        raise TimeoutError(f"Element not found: {selector}")
        
    def _type_text(self, text):
        """Type text into compose textarea."""
        # Click textarea first
        self.cdp.evaluate(f"""
            document.querySelector('{self.SELECTORS['compose_textarea']}').click()
        """)
        self._random_delay(300)
        
        # Type text character by character with random delays
        for char in text:
            self.cdp.evaluate(f"""
                document.execCommand('insertText', false, '{char}')
            """)
            self._random_delay(30)  # 30ms between characters
            
    def _upload_images(self, image_paths):
        """Upload images to tweet."""
        # Find file input
        result = self.cdp.evaluate(f"""
            (() => {{
                const input = document.querySelector('{self.SELECTORS['file_input']}');
                if (input) {{
                    input.style.display = 'block';
                    input.style.visibility = 'visible';
                    return true;
                }}
                return false;
            }})()
        """)
        
        if not result.get("result", {}).get("value", False):
            # Try clicking media button first
            self.cdp.evaluate("""
                const btn = document.querySelector('[data-testid="photo"]') ||
                           document.querySelector('input[type="file"]');
                if (btn) btn.click();
            """)
            self._random_delay(500)
            
        # Upload each image
        for img_path in image_paths:
            abs_path = os.path.abspath(img_path)
            if not os.path.exists(abs_path):
                raise FileNotFoundError(f"Image not found: {abs_path}")
                
            print(f"   📎 上传: {os.path.basename(abs_path)}")
            
            # Use CDP to set file
            self.cdp.send_command("DOM.setFileInputFiles", {
                "files": [abs_path],
                "selector": self.SELECTORS['file_input']
            })
            
            self._random_delay(1000)  # Wait for upload
            
    def _click_publish(self):
        """Click the publish button."""
        # Try different selectors
        selectors = [
            self.SELECTORS['tweet_button'],
            self.SELECTORS['tweet_button_inline'],
            'button[role="button"]:has-text("Post")',
            'button[role="button"]:has-text("Tweet")'
        ]
        
        for selector in selectors:
            result = self.cdp.evaluate(f"""
                (() => {{
                    const btn = document.querySelector('{selector}');
                    if (btn && !btn.disabled) {{
                        btn.click();
                        return true;
                    }}
                    return false;
                }})()
            """)
            
            if result.get("result", {}).get("value", False):
                print("✅ 已点击发布按钮")
                self._random_delay(2000)
                
                # Check if published
                url = self._get_tweet_url()
                return {
                    "status": "published",
                    "url": url
                }
                
        raise RuntimeError("Could not find or click publish button")
        
    def _get_tweet_url(self):
        """Get URL of published tweet."""
        try:
            result = self.cdp.evaluate("window.location.href")
            return result.get("result", {}).get("value", "")
        except:
            return ""
            
    def close(self):
        """Close CDP connection."""
        if self.cdp:
            self.cdp.close()


def main():
    parser = argparse.ArgumentParser(description="Publish to Twitter/X")
    parser.add_argument("--text", required=True, help="Tweet text")
    parser.add_argument("--images", nargs="+", help="Image paths (max 4)")
    parser.add_argument("--headless", action="store_true", help="Headless mode")
    parser.add_argument("--auto-publish", action="store_true", help="Auto click publish")
    parser.add_argument("--host", default="127.0.0.1", help="Chrome host")
    parser.add_argument("--port", type=int, default=9222, help="Chrome port")
    parser.add_argument("--account", help="Account name")
    parser.add_argument("--timeout", type=int, default=60, help="Timeout seconds")
    
    args = parser.parse_args()
    
    # Create publisher
    publisher = TwitterPublisher(
        host=args.host,
        port=args.port,
        headless=args.headless,
        account=args.account,
        timeout=args.timeout
    )
    
    try:
        # Start Chrome
        if not publisher.start():
            print("❌ 启动失败")
            sys.exit(1)
            
        # Publish
        result = publisher.publish(
            text=args.text,
            images=args.images,
            auto_publish=args.auto_publish
        )
        
        # Output result
        print("\n📊 结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        if result.get("status") in ["published", "ready_to_publish"]:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️  用户中断")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        sys.exit(1)
    finally:
        publisher.close()


if __name__ == "__main__":
    main()
