from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.major import Major as MajorModel
from app.schemas.major import MajorCreate, MajorUpdate, Major

router = APIRouter(tags=["majors"])

@router.get("/", response_model=List[Major])
def get_majors(db: Session = Depends(get_db)):
    """获取所有专业列表"""
    majors = db.query(MajorModel).all()
    return majors

@router.get("/{major_id}", response_model=Major)
def get_major(major_id: int, db: Session = Depends(get_db)):
    """获取单个专业信息"""
    major = db.query(MajorModel).filter(MajorModel.id == major_id).first()
    if major is None:
        raise HTTPException(status_code=404, detail="Major not found")
    return major

@router.post("/", response_model=Major)
def create_major(major: MajorCreate, db: Session = Depends(get_db)):
    """创建新专业"""
    # 检查专业代码是否已存在
    existing = db.query(MajorModel).filter(MajorModel.code == major.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Major code already exists")
    
    db_major = MajorModel(**major.model_dump())
    db.add(db_major)
    db.commit()
    db.refresh(db_major)
    return db_major

@router.put("/{major_id}", response_model=Major)
def update_major(major_id: int, major: MajorUpdate, db: Session = Depends(get_db)):
    """更新专业信息"""
    db_major = db.query(MajorModel).filter(MajorModel.id == major_id).first()
    if db_major is None:
        raise HTTPException(status_code=404, detail="Major not found")
    
    # 如果更新了代码，检查是否与其他专业冲突
    if major.code and major.code != db_major.code:
        existing = db.query(MajorModel).filter(MajorModel.code == major.code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Major code already exists")
    
    for key, value in major.model_dump(exclude_unset=True).items():
        setattr(db_major, key, value)
    
    db.commit()
    db.refresh(db_major)
    return db_major

@router.delete("/{major_id}")
def delete_major(major_id: int, db: Session = Depends(get_db)):
    """删除专业"""
    db_major = db.query(MajorModel).filter(MajorModel.id == major_id).first()
    if db_major is None:
        raise HTTPException(status_code=404, detail="Major not found")
    
    db.delete(db_major)
    db.commit()
    return {"message": "Major deleted successfully"}
