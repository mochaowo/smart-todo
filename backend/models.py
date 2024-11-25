from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base
from enum import Enum as PyEnum
from datetime import datetime
import logging
from sqlalchemy.types import TypeDecorator
import pytz

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 自定義 DateTime 類型，自動處理時區
class TZDateTime(TypeDecorator):
    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if not value.tzinfo:
                value = pytz.timezone('Asia/Taipei').localize(value)
            return value.astimezone(pytz.UTC)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return pytz.UTC.localize(value).astimezone(pytz.timezone('Asia/Taipei'))
        return value

class TaskStatus(str, PyEnum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000))
    priority = Column(Integer, default=2)
    status = Column(String, default=TaskStatus.TODO)
    due_date = Column(TZDateTime)
    created_at = Column(TZDateTime, server_default=func.now())
    updated_at = Column(TZDateTime, server_default=func.now(), onupdate=func.now())
    position = Column(Integer, default=0)
    tags = Column(String(255))

    def to_dict(self):
        """將模型轉換為字典"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'position': self.position,
            'tags': self.tags
        }

# 在模型加載時記錄
logger.info("Task model loaded successfully")

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(String(10000), nullable=False)
    summary = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    created_at = Column(TZDateTime, server_default=func.now())
    updated_at = Column(TZDateTime, server_default=func.now(), onupdate=func.now())
    views = Column(Integer, default=0)
    tags = Column(String(255), nullable=True)

    def to_dict(self):
        """將模型轉換為字典"""
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "summary": self.summary,
            "category": self.category,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "views": self.views,
            "tags": self.tags
        }

# 在模型加載時記錄
logger.info("Article model loaded successfully")
