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

# CORS 設置
default_origins = [
    "http://localhost:3000",
    "http://localhost:5173"
]

# 從環境變量獲取額外的 origins
# 可以用逗號分隔多個域名，例如：
# ALLOWED_ORIGINS=https://app1.vercel.app,https://app2.vercel.app
additional_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
origins = default_origins + [origin.strip() for origin in additional_origins if origin.strip()]

# 記錄允許的 origins
logger.info(f"Default origins: {default_origins}")
logger.info(f"Additional origins from env: {[o for o in additional_origins if o.strip()]}")
logger.info(f"Final allowed origins: {origins}")

# CORS 中間件設置
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 使用具體的 origins 列表而不是 ["*"]
    allow_credentials=True,  # 允許攜帶憑證
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With"
    ],
    expose_headers=["*"],
    max_age=3600,
)

@app.options("/{full_path:path}")
async def options_route(request: Request):
    origin = request.headers.get("origin", "")
    logger.info(f"Received OPTIONS request from origin: {origin}")
    
    if origin in origins:
        logger.info(f"Origin {origin} is allowed")
        return JSONResponse(
            content="OK",
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            },
        )
    logger.warning(f"Origin {origin} is not allowed. Allowed origins: {origins}")
    return JSONResponse(status_code=400, content={"message": "Invalid origin"})

@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "")
    logger.debug(f"Request from origin: {origin}")
    
    response = await call_next(request)
    
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

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
