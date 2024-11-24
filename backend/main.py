from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import logging
import models
import schemas
from database import SessionLocal, init_db
from typing import List
from datetime import datetime
import pytz
import os

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# 基本 CORS 設置
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
]

# 從環境變量獲取額外的 origins
additional_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
origins.extend([origin.strip() for origin in additional_origins if origin.strip()])

logger.info(f"Configured origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化數據庫
init_db()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Smart Todo API is running"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(pytz.UTC).isoformat(),
        "version": "1.0.0"
    }

# 依賴注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/tasks", response_model=List[schemas.Task])
def get_tasks(db: Session = Depends(get_db)):
    try:
        tasks = db.query(models.Task).order_by(models.Task.position).all()
        return [task.to_dict() for task in tasks]
    except Exception as e:
        logger.error(f"Error getting tasks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/tasks", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    try:
        max_position = db.query(models.Task).count()
        
        db_task = models.Task(
            title=task.title,
            description=task.description,
            priority=task.priority,
            status=task.status,
            due_date=task.due_date,
            position=max_position,
            tags=task.tags
        )
        
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task.to_dict()
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    try:
        db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        update_data = task.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
        
        db.commit()
        db.refresh(db_task)
        return db_task.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    try:
        db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        db.delete(db_task)
        db.commit()
        return {"message": "Task deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/tasks/reorder")
def reorder_tasks(task_id: int, new_position: int, db: Session = Depends(get_db)):
    try:
        task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        old_position = task.position
        
        if new_position > old_position:
            db.query(models.Task).filter(
                models.Task.position > old_position,
                models.Task.position <= new_position
            ).update(
                {"position": models.Task.position - 1}
            )
        else:
            db.query(models.Task).filter(
                models.Task.position >= new_position,
                models.Task.position < old_position
            ).update(
                {"position": models.Task.position + 1}
            )
        
        task.position = new_position
        db.commit()
        
        return {"message": "Task reordered"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reordering task: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
