# Git 使用指南

## 基本概念
Git 是一個分布式版本控制系統，用於追蹤文件的變化。以下是一些基本概念：
- **Repository（倉庫）**：存放項目的地方
- **Commit（提交）**：記錄文件修改的快照
- **Branch（分支）**：獨立的開發線
- **Remote（遠程）**：遠程倉庫，如 GitHub

## 常用命令

### 1. 基本操作
```bash
# 查看當前狀態
git status

# 查看修改內容
git diff

# 查看提交歷史
git log
git log --oneline  # 簡短版本
```

### 2. 文件操作
```bash
# 添加文件到暫存區
git add 文件名
git add .  # 添加所有文件

# 提交更改
git commit -m "提交信息"
```

### 3. 分支操作
```bash
# 查看分支
git branch

# 創建分支
git branch 分支名

# 切換分支
git checkout 分支名

# 創建並切換分支
git checkout -b 新分支名
```

### 4. 遠程操作
```bash
# 推送到遠程
git push

# 拉取更新
git pull
```

### 5. 版本回退
```bash
# 回到指定版本（保留修改）
git reset --soft 提交ID

# 回到指定版本（放棄修改）
git reset --hard 提交ID
```

## 常見問題解決

### 1. 如何退出 git log
當你運行 `git log` 後進入了分頁模式：
- 按 `q` 退出
- 使用 ↑↓ 或 j/k 上下滾動
- 空格鍵向下翻頁
- `b` 鍵向上翻頁

### 2. 如何撤銷修改
```bash
# 撤銷未暫存的修改
git checkout -- 文件名

# 撤銷已暫存的修改
git reset HEAD 文件名
```

## 提交信息規範
建議使用以下前綴：
- `feat`: 新功能
- `fix`: 修復 bug
- `docs`: 文檔更新
- `style`: 代碼格式修改
- `refactor`: 重構代碼
- `test`: 添加測試
- `chore`: 構建過程或輔助工具的變動

例如：`feat: 添加用戶登錄功能`

## 最佳實踐
1. 經常提交，保持提交小而精確
2. 寫清晰的提交信息
3. 使用分支進行功能開發
4. 定期拉取和推送更改
5. 在提交前檢查修改內容

## 進階技巧
1. **暫存修改**
```bash
# 暫存當前修改
git stash

# 恢復暫存的修改
git stash pop
```

2. **合併分支**
```bash
# 合併其他分支到當前分支
git merge 分支名
```

3. **查看特定文件的修改歷史**
```bash
git log -p 文件名
```

記住：Git 是一個強大的工具，熟練使用可以大大提高開發效率！
