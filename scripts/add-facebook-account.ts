#!/usr/bin/env tsx
/**
 * 添加 Facebook 目标账号
 * 
 * 使用：
 *   npx tsx scripts/add-facebook-account.ts
 *   npx tsx scripts/add-facebook-account.ts --name "My Page" --token YOUR_TOKEN
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

interface AddFacebookOptions {
  name?: string;
  token?: string;
  pageId?: string;
  positioning?: string;
  targetAudience?: string;
  contentDirection?: string;
  visualStyle?: string;
}

async function addFacebookAccount(options: AddFacebookOptions = {}) {
  console.log('\n📘 添加 Facebook 账号\n');
  
  // 检查依赖
  console.log('⚠️  提醒: 使用 Facebook 发布需要先安装依赖:');
  console.log('   pip install facebook-sdk\n');
  
  console.log('📋 获取 Access Token:');
  console.log('   1. 访问 https://developers.facebook.com/tools/explorer/');
  console.log('   2. 创建应用或使用现有应用');
  console.log('   3. 获取 User Access Token');
  console.log('   4. 如需发布到页面，需要 pages_manage_posts 权限\n');
  
  // 获取信息
  const accountType = await ask('账号类型 (1=个人, 2=页面): ') || '1';
  const isPage = accountType === '2';
  
  const name = options.name || await ask(isPage ? '页面名称: ' : '个人名称: ');
  const token = options.token || await ask('Access Token: ');
  const pageId = isPage ? (options.pageId || await ask('Page ID: ')) : null;
  
  const positioning = options.positioning || await ask('账号定位: ');
  const targetAudience = options.targetAudience || await ask('目标受众: ');
  const contentDirection = options.contentDirection || await ask('内容方向: ');
  
  // 选择视觉风格
  const styles = ['cute', 'fresh', 'warm', 'bold', 'minimal', 'retro', 'pop', 'notion', 'chalkboard'];
  console.log('\n可选视觉风格:');
  styles.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  const styleIndex = parseInt(await ask('\n选择风格 (1-9，默认 2): ') || '2') - 1;
  const visualStyle = styles[styleIndex] || 'fresh';
  
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
    platform: 'facebook',
    accountName: name,
    accountId: pageId, // 对于页面，存储 Page ID
    homepageUrl: pageId 
      ? `https://facebook.com/${pageId}`
      : `https://facebook.com/me`,
    status: 'active',
    apiConfig: JSON.stringify({ 
      access_token: token,
      is_page: isPage,
      page_id: pageId
    }),
    positioning,
    targetAudience,
    contentDirection,
    visualStyle,
    layoutPreference,
    imageAspectRatio: '16:9', // Facebook 更适合横屏
    platformConfig: JSON.stringify({
      supports_links: true,
      supports_photos: true,
      supports_videos: true,
      max_photos_per_post: 10,
      aspect_ratios: ['16:9', '4:3', '1:1'],
      link_preview: true
    })
  });
  
  console.log('\n✅ Facebook 账号添加成功!');
  console.log(`   ID: ${accountId}`);
  console.log(`   名称: ${name}`);
  console.log(`   类型: ${isPage ? '页面' : '个人'}`);
  console.log(`   风格: ${visualStyle}`);
  console.log(`   布局: ${layoutPreference}`);
  console.log('\n💡 提示:');
  console.log('   1. Token 有效期有限，过期后需要重新获取');
  console.log('   2. 运行 facebook_publish.py 进行发布');
  console.log('   3. 可使用 --list-pages 查看管理的页面');
  console.log(`   4. 修改风格: npx tsx scripts/configure-account-style.ts --account-id ${accountId}\n`);
  
  rl.close();
}

// 解析命令行参数
function parseArgs(): AddFacebookOptions {
  const args = process.argv.slice(2);
  const options: AddFacebookOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':
      case '-n':
        options.name = args[++i];
        break;
      case '--token':
      case '-t':
        options.token = args[++i];
        break;
      case '--page-id':
        options.pageId = args[++i];
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
      case '--style':
        options.visualStyle = args[++i];
        break;
      case '--help':
        console.log(`
用法: npx tsx scripts/add-facebook-account.ts [选项]

选项:
  -n, --name <name>              账号/页面名称
  -t, --token <token>            Facebook Access Token
      --page-id <id>             Page ID (如果是页面账号)
      --positioning <text>       账号定位
      --target-audience <text>   目标受众
      --content-direction <text> 内容方向
      --style <style>            视觉风格
      --help                     显示帮助

依赖安装:
  pip install facebook-sdk

获取 Token:
  1. 访问 https://developers.facebook.com/tools/explorer/
  2. 创建应用并获取 Access Token
  3. 个人发布需要: publish_posts 权限
  4. 页面发布需要: pages_manage_posts 权限

示例:
  npx tsx scripts/add-facebook-account.ts
  npx tsx scripts/add-facebook-account.ts -n "My Page" -t YOUR_TOKEN --page-id 123456
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
  await addFacebookAccount(options);
}

main().catch(console.error);
