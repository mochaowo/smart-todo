from sqlalchemy import create_engine, event
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
    """初始化數據庫，保留現有數據"""
    import models  # 導入模型以確保它們被註冊
    
    try:
        # 檢查數據庫文件是否存在
        if os.path.exists(DB_PATH):
            logger.info("使用現有數據庫")
            # 如果存在，只確保表結構是最新的
            Base.metadata.create_all(bind=engine, checkfirst=True)
        else:
            logger.info("創建新數據庫")
            # 如果不存在，創建新的數據庫和表
            Base.metadata.create_all(bind=engine)
        
        logger.info("數據庫初始化成功")
    except Exception as e:
        logger.error(f"數據庫初始化失敗: {str(e)}")
        raise

# 初始化數據庫
init_db()
