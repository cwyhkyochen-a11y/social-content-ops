#!/usr/bin/env tsx
/**
 * 添加 Threads 目标账号
 * 
 * 使用：
 *   npx tsx scripts/add-threads-account.ts
 *   npx tsx scripts/add-threads-account.ts --name "My Account" --token YOUR_TOKEN
 */

import { db } from '../src/db/index.js';
import { targetAccounts } from '../src/db/schema.js';
import { randomUUID } from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

interface AddThreadsOptions {
  name?: string;
  token?: string;
  username?: string;
  positioning?: string;
  targetAudience?: string;
  contentDirection?: string;
}

async function addThreadsAccount(options: AddThreadsOptions = {}) {
  console.log('\n🧵 添加 Threads 账号\n');
  
  // 检查依赖
  console.log('⚠️  提醒: 使用 Threads 发布需要先安装依赖:');
  console.log('   pip install requests\n');
  
  console.log('📋 获取 Access Token:');
  console.log('   1. 访问 https://developers.facebook.com/apps/');
  console.log('   2. 创建应用，添加 "Threads" 产品');
  console.log('   3. 配置 OAuth 获取 Client ID 和 Secret');
  console.log('   4. 授权 URL:');
  console.log('      https://threads.net/oauth/authorize?');
  console.log('      client_id=CLIENT_ID&');
  console.log('      redirect_uri=REDIRECT_URI&');
  console.log('      scope=threads_basic,threads_content_publish&');
  console.log('      response_type=code');
  console.log('   5. 用 code 换取 access_token');
  console.log('\n   所需权限:');
  console.log('   - threads_basic: 读取用户信息');
  console.log('   - threads_content_publish: 发布内容');
  console.log('   - threads_manage_insights: 获取数据\n');
  
  // 获取信息
  const name = options.name || await ask('Threads 账号名称: ');
  const username = options.username || await ask('Threads 用户名: ');
  const token = options.token || await ask('Access Token: ');
  
  const positioning = options.positioning || await ask('账号定位: ');
  const targetAudience = options.targetAudience || await ask('目标受众: ');
  const contentDirection = options.contentDirection || await ask('内容方向: ');
  
  // 选择视觉风格
  const styles = ['minimal', 'bold', 'cinematic', 'playful', 'elegant', 'tech', 'lifestyle', 'editorial'];
  console.log('\n可选视觉风格:');
  styles.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  const styleIndex = parseInt(await ask('\n选择风格 (1-8，默认 1): ') || '1') - 1;
  const visualStyle = styles[styleIndex] || 'minimal';
  
  // 选择布局
  const layouts = ['sparse', 'balanced', 'dense', 'list', 'comparison', 'flow'];
  console.log('\n可选布局:');
  layouts.forEach((l, i) => console.log(`  ${i + 1}. ${l}`));
  const layoutIndex = parseInt(await ask('\n选择布局 (1-6，默认 2): ') || '2') - 1;
  const layoutPreference = layouts[layoutIndex] || 'balanced';
  
  // 创建账号
  const accountId = randomUUID();
  
  await db.insert(targetAccounts).values({
    id: accountId,
    accountType: 'target',
    platform: 'threads',
    accountName: name,
    accountId: username,
    homepageUrl: `https://threads.net/@${username}`,
    status: 'active',
    apiConfig: JSON.stringify({ 
      access_token: token
    }),
    positioning,
    targetAudience,
    contentDirection,
    visualStyle,
    layoutPreference,
    imageAspectRatio: '1:1', // Threads 推荐 1:1 或 9:16
    platformConfig: JSON.stringify({
      supports_text: true,
      supports_images: true,
      supports_videos: true,
      supports_carousel: true,
      max_carousel_images: 10,
      max_text_length: 500,
      supports_analytics: true,
      api_rate_limit: 200, // per hour
      optimal_ratios: ['1:1', '9:16'],
      optimal_ratio: '1:1'
    })
  });
  
  console.log('\n✅ Threads 账号添加成功!');
  console.log(`   ID: ${accountId}`);
  console.log(`   名称: ${name}`);
  console.log(`   用户名: @${username}`);
  console.log(`   风格: ${visualStyle}`);
  console.log(`   布局: ${layoutPreference}`);
  console.log(`   最佳图片比例: 1:1 或 9:16`);
  console.log('\n💡 提示:');
  console.log('   1. Token 有效期通常 60 天，有 refresh_token');
  console.log('   2. 运行 threads_publish.py 进行发布');
  console.log('   3. 使用 --info 查看账号信息');
  console.log('   4. Threads 支持文字 + 图片 + 视频 + Carousel');
  console.log('   5. 字符限制 500 字');
  console.log(`   6. 修改风格: npx tsx scripts/configure-account-style.ts --account-id ${accountId}\n`);
  
  rl.close();
}

// 解析命令行参数
function parseArgs(): AddThreadsOptions {
  const args = process.argv.slice(2);
  const options: AddThreadsOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':
      case '-n':
        options.name = args[++i];
        break;
      case '--username':
      case '-u':
        options.username = args[++i];
        break;
      case '--token':
      case '-t':
        options.token = args[++i];
        break;
      case '--positioning':
        options.positioning = args[++i];
        break;
      case '--target-audience':
        options.targetAudience = args[++i];
        break;
      case '--content-direction':
        options.contentDirection = args[++i];
        break;
      case '--help':
        console.log(`
用法: npx tsx scripts/add-threads-account.ts [选项]

选项:
  -n, --name <name>              账号名称
  -u, --username <username>      Threads 用户名
  -t, --token <token>            Threads Access Token
      --positioning <text>       账号定位
      --target-audience <text>   目标受众
      --content-direction <text> 内容方向
      --help                     显示帮助

依赖安装:
  pip install requests

获取 Token:
  1. 访问 https://developers.facebook.com/apps/
  2. 创建应用，添加 "Threads" 产品
  3. 配置 OAuth，获取 Client ID 和 Secret
  4. 授权获取 Access Token
  5. 需要权限: threads_basic, threads_content_publish, threads_manage_insights

Threads 特点:
  - 文字 + 图片/视频/Carousel
  - 最多 500 字符
  - Carousel 支持 2-10 张图片
  - 速率限制: 200 requests/hour
  - API: Meta Graph API (threads.net)

示例:
  npx tsx scripts/add-threads-account.ts
  npx tsx scripts/add-threads-account.ts -n "My Account" -u myuser -t YOUR_TOKEN
        `);
        process.exit(0);
        break;
    }
  }
  
  return options;
}

// 主函数
async function main() {
  const options = parseArgs();
  await addThreadsAccount(options);
}

main().catch(console.error);
