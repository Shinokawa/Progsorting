# 节目表排序系统

本项目是一个基于 FastAPI（Python后端）和 React（前端）的活动时间表管理工具。它能够从CSV文件中读取初始数据，将活动分为上午与下午两个时段，并提供图形化界面进行拖拽排序、时长修改、时段起始时间调整以及最终将修改结果实时保存回CSV文件。同时，用户可导出当前调整完成后的时间表为CSV文件，方便存档和分享。

## 功能特性


### 活动数据导入与管理：

* 通过 events.csv 初始化活动列表，每个活动包含开始与结束时间、内容、类型、社团/表演者、备注和时长信息。
* 活动自动分为上午与下午两个时段（如上午9:20固定开始，下午14:00固定开始），并可在前端动态调整这两个时段的起始时间。

### 图形化拖拽编辑界面：

* 前端使用 React 与 react-beautiful-dnd 实现拖拽操作，可在浏览器中直观地移动、排序活动，并在两个时段间自由切换。
* 被拖拽物支持在全页面范围内移动、半透明显示和轻微缩放效果，实现流畅且直观的用户体验。
* 其他卡片在让位时具有平滑的过渡动画，提供更好的视觉反馈。

### 编辑活动信息：

* 双击活动卡片可弹出编辑对话框，修改该活动的持续时间或标题，实时更新时间表。

### 自动更新CSV：
* 每次通过后端API修改活动顺序、持续时间或起始时间后，后端会自动将最新数据写回 events.csv，确保数据的持久化和易读性。
* 用户无需手动保存，所有更改自动记录至CSV文件。
### 导出CSV：
* 前端界面提供“导出CSV”按钮，将当前已修改的最新时间表状态以CSV文件形式下载，方便分享与归档。

## 项目结构

project/\
├─ backend/\
│   ├─ main.py              # FastAPI后端逻辑 \
│   ├─ events.csv           # 初始数据文件，后续修改亦写回该文件 \
│   └─ requirements.txt     # 后端Python依赖 \
├─ frontend/ \
│   ├─ src/ \
│   │   ├─ App.js \
│   │   ├─ api.js \
│   │   ├─ components/ \
│   │   │   ├─ EventItem.js \
│   │   │   ├─ EventLists.js \
│   │   │   ├─ EditDialog.js \
│   │   │   └─ Portal.js \
│   │   └─ index.js \
│   ├─ package.json         # 前端NPM依赖说明 \
│   └─ ... \
└─ README.md                # 项目说明文档\


## 安装与运行
### 后端环境搭建
安装Python 3.9+和conda环境（可选）。
进入 backend 目录：
```bash
cd backend
pip install -r requirements.txt
```
运行后端服务器：
```bash
uvicorn main:app --reload
```
默认服务器监听 http://127.0.0.1:8000

### 前端环境搭建
进入 frontend 目录：
```bash
cd frontend
npm install
```
开发模式下运行：
```bash
npm start
```
前端运行在 http://localhost:3000

