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
            id="diary",
            title="心情日記",
            icon="📔",
            color="#4ECDC4", 
            route="diary.index",
            description="記錄每一天的心情",
            enabled=False,  # 未啟用功能
            date="2024.07"
        ),
        BookmarkConfig(
            id="travel_log",
            title="旅行記錄",
            icon="🗺️",
            color="#45B7D1",
            route="travel.index", 
            description="足跡遍佈的美好時光",
            enabled=False,  # 未啟用功能
            date="2024.08"
        ),
        BookmarkConfig(
            id="music_box",
            title="音樂盒",
            icon="🎵",
            color="#96CEB4",
            route="music.index",
            description="收藏喜愛的音樂回憶",
            enabled=False,  # 未啟用功能
            date="2024.09"
        ),
        BookmarkConfig(
            id="todo_list",
            title="待辦事項",
            icon="✅",
            color="#FFEAA7",
            route="todo.index",
            description="規劃未來的美好",
            enabled=False,  # 未啟用功能
            date="2024.10"
        ),
        BookmarkConfig(
            id="recipe_book", 
            title="食譜收藏",
            icon="🍳",
            color="#DDA0DD",
            route="recipe.index",
            description="美味料理的秘密",
            enabled=False,  # 未啟用功能
            date="2024.11"
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