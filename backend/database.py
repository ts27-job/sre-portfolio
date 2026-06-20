from sqlalchemy import create_engine

DATABASE_URL = "mysql+pymysql://root:Destino0527@mysql:3306/giants_sre_dashboard"

engine = create_engine(DATABASE_URL)