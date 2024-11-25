from fastapi import FastAPI, Depends, HTTPException, status, Request, Query, Path, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import logging
import models
import schemas
from database import SessionLocal, init_db
from typing import List, Optional
from datetime import datetime
import pytz
import os
from sqlalchemy import func

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# 基本 CORS 設置
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://smart-todo-13aw-6ct87quow-mochaowos-projects.vercel.app",
    "https://smart-todo-mochaowo.vercel.app"
]

# 從環境變量獲取額外的 origins
additional_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
origins.extend([origin.strip() for origin in additional_origins if origin.strip()])

logger.info(f"Configured origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "")
    logger.info(f"Request from origin: {origin}")
    
    response = await call_next(request)
    
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "false"
    
    return response

# 初始化數據庫
init_db()

# 根路由
@app.get("/")
def read_root():
    return {"status": "ok"}

# 健康檢查
@app.get("/health")
def health_check():
    try:
        db = next(get_db())
        db.execute("SELECT 1")
        return {"status": "healthy"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 依賴注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 任務相關的路由
@app.get("/tasks", response_model=List[schemas.Task])
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).order_by(models.Task.position).all()
    return tasks

@app.post("/tasks", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    try:
        # 獲取當前最大的 position
        max_position = db.query(func.max(models.Task.position)).scalar() or -1
        
        # 創建新任務，position 設為最大值 + 1
        db_task = models.Task(**task.dict())
        db_task.position = max_position + 1
        
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
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
        if db_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # 更新任務
        update_data = task.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        
        db.commit()
        db.refresh(db_task)
        return db_task
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
        if db_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # 獲取被刪除任務的 position
        deleted_position = db_task.position
        
        # 刪除任務
        db.delete(db_task)
        
        # 更新其他任務的 position
        db.query(models.Task).filter(models.Task.position > deleted_position).update(
            {models.Task.position: models.Task.position - 1}
        )
        
        db.commit()
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.put("/tasks/{task_id}/reorder")
def reorder_tasks(task_id: int, new_position: int, db: Session = Depends(get_db)):
    try:
        # 檢查任務是否存在
        task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        old_position = task.position
        
        # 如果位置相同，不需要更新
        if old_position == new_position:
            return {"status": "success"}
        
        # 更新其他任務的位置
        if old_position < new_position:
            # 向下移動
            db.query(models.Task).filter(
                models.Task.position > old_position,
                models.Task.position <= new_position
            ).update(
                {models.Task.position: models.Task.position - 1}
            )
        else:
            # 向上移動
            db.query(models.Task).filter(
                models.Task.position >= new_position,
                models.Task.position < old_position
            ).update(
                {models.Task.position: models.Task.position + 1}
            )
        
        # 更新目標任務的位置
        task.position = new_position
        db.commit()
        
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reordering task: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# 文章相關的路由
@app.get("/articles", response_model=List[schemas.Article])
async def get_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Fetching articles with skip={skip} and limit={limit}")
        articles = db.query(models.Article).offset(skip).limit(limit).all()
        logger.info(f"Found {len(articles)} articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching articles: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/articles/{article_id}", response_model=schemas.Article)
async def get_article(
    article_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Fetching article with id={article_id}")
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if article is None:
            logger.warning(f"Article {article_id} not found")
            raise HTTPException(status_code=404, detail="Article not found")
        article.views += 1
        db.commit()
        logger.info(f"Article {article_id} found and views updated")
        return article
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching article: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/articles", response_model=schemas.Article)
async def create_article(
    article: schemas.ArticleCreate,
    db: Session = Depends(get_db)
):
    try:
        logger.info("Creating new article")
        db_article = models.Article(**article.dict())
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
        logger.info(f"Article created with id={db_article.id}")
        return db_article
    except Exception as e:
        logger.error(f"Error creating article: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.put("/articles/{article_id}", response_model=schemas.Article)
async def update_article(
    article_id: int = Path(..., ge=1),
    article_update: schemas.ArticleUpdate = Body(...),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Updating article {article_id}")
        db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if db_article is None:
            logger.warning(f"Article {article_id} not found")
            raise HTTPException(status_code=404, detail="Article not found")
        
        update_data = article_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_article, field, value)
        
        db.commit()
        db.refresh(db_article)
        logger.info(f"Article {article_id} updated successfully")
        return db_article
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating article: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.delete("/articles/{article_id}")
async def delete_article(
    article_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Deleting article {article_id}")
        db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if db_article is None:
            logger.warning(f"Article {article_id} not found")
            raise HTTPException(status_code=404, detail="Article not found")
        
        db.delete(db_article)
        db.commit()
        logger.info(f"Article {article_id} deleted successfully")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting article: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
