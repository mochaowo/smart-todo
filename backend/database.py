from sqlalchemy import create_engine, event, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
import os

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 獲取當前文件所在目錄
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "todo.db")

# 創建數據庫 URL
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# 創建數據庫引擎
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# 配置 SQLite 以支持外鍵
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

# 創建會話工廠
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 創建基類
Base = declarative_base()

def get_db():
    """獲取數據庫會話"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """初始化數據庫，創建所有表"""
    try:
        # 導入模型以確保它們被註冊
        import models
        
        # 創建所有表
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # 檢查表是否存在
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"Existing tables: {tables}")
        
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

# 初始化數據庫
init_db()
