# 🎵 UniBeat

> 多音源聚合音乐播放器 - 类似 LX Music / 洛雪音乐

![Platform](https://img.shields.io/badge/Platform-Android-blue)
![Language](https://img.shields.io/badge/Language-TypeScript%20%2B%20React-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 📱 简介

UniBeat 是一款基于 Capacitor + React + TypeScript 构建的安卓音乐播放器应用。采用类似 **LX Music（洛雪音乐）** 的音源模式设计：软件本身不提供任何音乐内容，所有音乐数据均来自用户自行配置的音源服务。

## ✨ 特性

- 🎨 **沉浸式UI** - 科技感深色主题，唱片旋转、频谱可视化、粒子背景
- 🔄 **音源模式** - 支持添加多个音源，自由切换
- 🔍 **在线搜索** - 从配置的音源搜索音乐
- 🎵 **真实播放** - 动态获取音频URL播放
- 📝 **歌词同步** - LRC歌词实时显示
- 💾 **本地持久化** - 音源配置自动保存
- 📱 **原生体验** - Capacitor 打包为原生 Android APK

## 📦 下载安装

前往 [Releases 页面](https://github.com/ccccshark/UniBeatMusic/releases) 下载最新 APK，安装到安卓手机即可使用。

## 🚀 使用方法

### 1. 添加音源

打开应用后，进入「音源管理」页面：
- 点击「添加音源」
- 选择音源类型（网易云/QQ音乐/酷狗/酷我/自定义）
- 输入音源 API 地址
- 点击「测试连接」验证可用性
- 设为当前音源

### 2. 搜索播放

- 在主页面点击「搜索音乐」
- 输入歌曲名或歌手名
- 点击搜索结果即可播放

### 3. 音源接口规范

音源需兼容 NeteaseCloudMusicApi 接口风格：

| 接口 | 说明 |
| --- | --- |
| `/search?keywords=xxx` | 搜索歌曲 |
| `/song/url?id=123` | 获取播放地址 |
| `/song/detail?ids=1,2,3` | 歌曲详情 |
| `/lyric?id=123` | 获取歌词 |
| `/playlist/detail?id=123` | 歌单详情 |
| `/recommend/songs` | 推荐歌曲 |
| `/login/qr/key` | 获取扫码登录key |
| `/login/qr/check?key=xxx` | 检查扫码状态 |

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript
- **构建**: Vite
- **状态管理**: Zustand + persist
- **动画**: Framer Motion
- **样式**: Tailwind CSS
- **移动端**: Capacitor (Android)
- **路由**: React Router v6

## 📂 项目结构

```
src/
├── components/         # 组件
│   ├── CoverArt/       # 封面组件
│   ├── Player/         # 播放器组件
│   ├── ParticleBackground/
│   └── QrLogin/        # 扫码登录
├── pages/              # 页面
│   ├── Login/          # 启动页（音源配置入口）
│   ├── MusicSource/    # 音源管理
│   ├── Recommend/      # 推荐流
│   ├── Discover/       # 发现
│   ├── Player/         # 播放器
│   └── Profile/        # 个人中心
├── services/           # 服务
│   └── musicApi.ts     # 音源 API 封装
├── store/              # 状态管理
│   ├── playerStore.ts
│   ├── userStore.ts
│   └── musicSourceStore.ts  # 音源配置
├── types/              # 类型定义
└── data/               # 静态数据
```

## ⚠️ 免责声明

- 本软件仅为音乐播放器框架，**不提供任何音乐内容**
- 所有音乐数据来源于用户自行配置的音源服务
- 请确保您使用的音源服务符合相关法律法规
- 本项目不对用户使用音源的行为承担责任
- 仅供学习和交流使用，不得用于商业用途

## 📄 License

MIT License
