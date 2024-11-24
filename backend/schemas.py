from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum
import logging

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    priority: int = Field(2, ge=1, le=3)
    status: TaskStatus = Field(default=TaskStatus.TODO)
    due_date: Optional[datetime] = None
    position: int = Field(default=0, ge=0)
    tags: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[int] = Field(None, ge=1, le=3)
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    position: Optional[int] = Field(None, ge=0)
    tags: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

# 記錄模型加載
logger.info("Pydantic models loaded successfully")
