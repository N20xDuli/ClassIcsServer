from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import courses, ics, users, batch, classroom, majors

app = FastAPI()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(ics.router, prefix="/api/ics", tags=["ics"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(batch.router, prefix="/api/batch", tags=["batch"])
app.include_router(classroom.router, prefix="/api/classroom", tags=["classroom"])
app.include_router(majors.router, prefix="/api/majors", tags=["majors"])

@app.get("/")
def read_root():
    return {"message": "Welcome to ClassIcsServer"}
