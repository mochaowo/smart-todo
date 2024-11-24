# Smart Todo

一個現代化的任務管理應用程式，具有智能排程和生產力追蹤功能。

## 功能特點

- 📋 任務管理與追蹤
- 📊 數據統計與分析
- 🎯 智能任務排程
- 🌙 深色模式支援
- ⌨️ 快捷鍵操作
- 📱 響應式設計

## 技術棧

### 前端
- React + TypeScript
- Tailwind CSS
- React Hooks

### 後端
- FastAPI
- SQLAlchemy
- SQLite
- Redis (計劃中)

## 快速開始

### 前端設置

```bash
cd frontend
npm install
npm start
```

### 後端設置

```bash
cd backend
python -m venv env
source env/bin/activate  # Windows: .\env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 系統要求

- Node.js 16+
- Python 3.8+
- SQLite 3

## 開發文檔

詳細的開發文檔請查看 [/docs](./docs/index.html)。

## 開發計劃

- [ ] AI 輔助功能
- [ ] 團隊協作功能
- [ ] 第三方服務整合
- [ ] 數據分析儀表板
- [ ] 多語言支援

## 貢獻指南

1. Fork 此專案
2. 創建新的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 授權

此專案使用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件
