# InternetCorner 模組化擴充指南

## 📚 專案架構說明

這個專案現在採用模組化設計，讓你可以輕鬆新增更多功能書籤。

### 🏗️ 目前的架構

```
InternetCorner/
├── app/
│   ├── blueprints/           # 功能模組
│   │   ├── home.py          # 主畫面（書本）
│   │   ├── memory.py        # 回憶膠卷
│   │   ├── upload.py        # 上傳功能
│   │   └── delete.py        # 刪除功能
│   ├── services/            # 業務邏輯
│   │   ├── bookmark_service.py  # 書籤管理
│   │   ├── photo_service.py     # 照片服務
│   │   └── storage.py           # 儲存服務
│   └── models.py            # 資料模型
├── templates/
│   ├── home.html           # 書本主畫面
│   └── memory/
│       └── index.html      # 回憶膠卷頁面
└── static/
    ├── css/
    │   ├── home.css        # 主畫面樣式
    │   └── style.css       # 回憶膠卷樣式
    └── js/
        ├── home.js         # 主畫面交互
        └── ...
```

## 🆕 如何新增功能書籤

### 步驟 1：修改書籤配置

編輯 `app/services/bookmark_service.py`：

```python
# 在 get_all_bookmarks() 函數中新增書籤
BookmarkConfig(
    id="your_feature",           # 唯一ID
    title="你的功能名稱",         # 顯示名稱
    icon="🆕",                   # 表情符號圖標
    color="#FF6B6B",            # 書籤顏色（會自動應用漸層）
    route="your_feature.index",  # 路由名稱
    description="功能描述",      # 工具提示說明
    enabled=True,               # 是否啟用
    date="2024.12"              # 日期標籤
)
```

### 步驟 2：創建藍圖

創建 `app/blueprints/your_feature.py`：

```python
from flask import Blueprint, render_template

bp = Blueprint('your_feature', __name__, url_prefix='/your-feature')

@bp.route('/')
def index():
    """你的功能主頁面"""
    # 在這裡添加你的業務邏輯
    return render_template('your_feature/index.html')

@bp.route('/api/data')