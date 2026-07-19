import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 5173;
const APK_DIR = '/workspace';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = decodeURIComponent(req.url || '/');

  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UniBeat APK 下载</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #0A0E1A 0%, #1a1f3a 100%);
      color: #E5E7EB;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      text-align: center;
    }
    .logo {
      font-size: 48px;
      font-weight: 900;
      background: linear-gradient(135deg, #00F0FF 0%, #7B2FF7 50%, #FF2E9F 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }
    .subtitle {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      margin-bottom: 32px;
    }
    .apk-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 16px;
      transition: all 0.3s;
    }
    .apk-card:hover {
      border-color: rgba(0, 240, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 240, 255, 0.15);
    }
    .apk-name {
      font-size: 18px;
      font-weight: 600;
      color: #00F0FF;
      margin-bottom: 4px;
    }
    .apk-info {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 16px;
    }
    .download-btn {
      display: inline-block;
      padding: 12px 32px;
      background: linear-gradient(135deg, #00F0FF 0%, #7B2FF7 100%);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s;
    }
    .download-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(0, 240, 255, 0.4);
    }
    .download-btn.debug {
      background: linear-gradient(135deg, #FF2E9F 0%, #7B2FF7 100%);
    }
    .tip {
      margin-top: 24px;
      padding: 16px;
      background: rgba(0, 240, 255, 0.05);
      border-radius: 12px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      text-align: left;
    }
    .tip strong { color: #00F0FF; }
    .status {
      margin-top: 20px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">UniBeat</div>
    <div class="subtitle">多平台音乐聚合 · Android 安装包下载</div>

    <div class="apk-card">
      <div class="apk-name">UniBeat v1.0 Release</div>
      <div class="apk-info">3.7 MB · 已签名 · 推荐 Android 7.0+</div>
      <a href="/UniBeat-v1.0-release.apk" download class="download-btn">
        下载 Release 版本
      </a>
    </div>

    <div class="apk-card">
      <div class="apk-name">UniBeat v1.0 Debug</div>
      <div class="apk-info">4.7 MB · 调试版本 · 含日志输出</div>
      <a href="/UniBeat-v1.0-debug.apk" download class="download-btn debug">
        下载 Debug 版本
      </a>
    </div>

    <div class="tip">
      <strong>安装说明：</strong><br>
      1. 下载 APK 文件到手机<br>
      2. 在手机设置中允许"安装未知来源应用"<br>
      3. 点击 APK 文件完成安装<br>
      4. 启动 UniBeat 应用<br><br>
      <strong>应用信息：</strong><br>
      · 包名：com.unibeat.music<br>
      · 版本：1.0 (versionCode: 1)<br>
      · 支持：Android 7.0 (API 24) 及以上
    </div>

    <div class="status">服务运行中 · 端口 ${PORT}</div>
  </div>
</body>
</html>
    `);
    return;
  }

  // 处理 APK 下载
  const fileName = path.basename(url);
  const apkPath = path.join(APK_DIR, fileName);

  if (!fs.existsSync(apkPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }

  const stat = fs.statSync(apkPath);
  const ext = path.extname(apkPath).toLowerCase();

  const contentTypes = {
    '.apk': 'application/vnd.android.package-archive',
    '.json': 'application/json',
    '.html': 'text/html; charset=utf-8',
    '.svg': 'image/svg+xml',
  };

  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="${fileName}"`,
    'Access-Control-Allow-Origin': '*',
  });

  const stream = fs.createReadStream(apkPath);
  stream.pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('UniBeat APK 下载服务已启动:');
  console.log('  本地访问:  http://localhost:' + PORT + '/');
  console.log('  网络访问:  http://10.64.27.229:' + PORT + '/');
});