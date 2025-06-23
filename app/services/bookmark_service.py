from datetime import datetime
from typing import List, Dict
from ..services.photo_service import list_photos

class BookmarkConfig:
    """書籤配置類"""
    def __init__(self, id: str, title: str, icon: str, color: str, 
                 route: str, description: str = "", enabled: bool = True,
                 date: str = None):
        self.id = id
        self.title = title
        self.icon = icon
        self.color = color
        self.route = route
        self.description = description
        self.enabled = enabled
        self.date = date or datetime.now().strftime('%Y.%m')

def get_all_bookmarks() -> List[BookmarkConfig]:
    """獲取所有可用的書籤"""
    
    # 動態獲取回憶膠卷的照片數量
    photos = list_photos()
    photo_count = len(photos)
    memory_description = f"{photo_count} 個珍貴回憶" if photo_count > 0 else "等待你的第一段回憶"
    
    bookmarks = [
        BookmarkConfig(
            id="memory_film",
            title="回憶膠卷",
            icon="🎞️",
            color="#FF6B6B",
            route="memory.index",
            description=memory_description,
            date="2024.06"
        ),
        BookmarkConfig(
            id="birthday",
            title="生日",
            icon="🎂",
            color="#4ECDC4", 
            route="birthday.index",
            description="每年生日",
            enabled=True,
            date="xxxx.06.26"
        ),
        BookmarkConfig(
            id="anniversary",
            title="開發中",
            icon="🗺️",
            color="#45B7D1",
            route="anniversary.index", 
            description="足跡遍佈的美好時光",
            enabled=False,  # 未啟用功能
            date=" "
        )
    ]
    
    return bookmarks

def get_bookmark_by_id(bookmark_id: str) -> BookmarkConfig:
    """根據ID獲取特定書籤"""
    bookmarks = get_all_bookmarks()
    for bookmark in bookmarks:
        if bookmark.id == bookmark_id:
            return bookmark
    return None

def get_enabled_bookmarks() -> List[BookmarkConfig]:
    """只獲取已啟用的書籤"""
    return [bookmark for bookmark in get_all_bookmarks() if bookmark.enabled]