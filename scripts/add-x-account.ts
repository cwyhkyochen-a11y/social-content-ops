#!/usr/bin/env tsx
/**
 * 添加 X (Twitter) 目标账号
 * 
 * 使用：
 *   npx tsx scripts/add-x-account.ts
 *   npx tsx scripts/add-x-account.ts --username myhandle --password mypass
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

interface AddXAccountOptions {
  username?: string;
  password?: string;
  positioning?: string;
  targetAudience?: string;
  contentDirection?: string;
  visualStyle?: string;
}

async function addXAccount(options: AddXAccountOptions = {}) {
  console.log('\n🐦 添加 X (Twitter) 账号\n');
  
  // 获取信息
  const username = options.username || await ask('X 用户名 (不加 @): ');
  const password = options.password || await ask('X 密码 (可选，回车跳过): ');
  const positioning = options.positioning || await ask('账号定位: ');
  const targetAudience = options.targetAudience || await ask('目标受众: ');
  const contentDirection = options.contentDirection || await ask('内容方向: ');
  
  // 选择视觉风格
  const styles = ['cute', 'fresh', 'warm', 'bold', 'minimal', 'retro', 'pop', 'notion', 'chalkboard'];
  console.log('\n可选视觉风格:');
  styles.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  const styleIndex = parseInt(await ask('\n选择风格 (1-9，默认 1): ') || '1') - 1;
  const visualStyle = styles[styleIndex] || 'cute';
  
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
    platform: 'x',
    accountName: username,
    homepageUrl: `https://twitter.com/${username}`,
    status: 'active',
    apiConfig: password ? JSON.stringify({ password }) : null,
    positioning,
    targetAudience,
    contentDirection,
    visualStyle,
    layoutPreference,
    imageAspectRatio: '16:9', // X 更适合横屏
    platformConfig: JSON.stringify({
      max_chars: 280, // 普通账号限制
      supports_media: true,
      max_images: 4
    })
  });
  
  console.log('\n✅ X 账号添加成功!');
  console.log(`   ID: ${accountId}`);
  console.log(`   用户名: @${username}`);
  console.log(`   风格: ${visualStyle}`);
  console.log(`   布局: ${layoutPreference}`);
  console.log('\n💡 提示:');
  console.log('   1. 首次发布时需要手动登录');
  console.log('   2. 运行 x_publish.py 进行发布');
  console.log(`   3. 修改风格: npx tsx scripts/configure-account-style.ts --account-id ${accountId}\n`);
  
  rl.close();
}

// 解析命令行参数
function parseArgs(): AddXAccountOptions {
  const args = process.argv.slice(2);
  const options: AddXAccountOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--username':
      case '-u':
        options.username = args[++i];
        break;
      case '--password':
      case '-p':
        options.password = args[++i];
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
用法: npx tsx scripts/add-x-account.ts [选项]

选项:
  -u, --username <name>          X 用户名
  -p, --password <pass>          X 密码（可选）
  --positioning <text>           账号定位
  --target-audience <text>       目标受众
  --content-direction <text>     内容方向
  --style <style>                视觉风格
  --help                         显示帮助

示例:
  npx tsx scripts/add-x-account.ts
  npx tsx scripts/add-x-account.ts -u myhandle -p mypass
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
  await addXAccount(options);
}

main().catch(console.error);
