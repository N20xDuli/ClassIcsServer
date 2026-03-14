import sys
sys.path.insert(0, 'E:\\Vibe\\ClassIcsServer\\ClassIcsServer\\backend')

from app.database import SessionLocal
from app.models.major import Major
from app.schemas.major import MajorCreate

# Test creating a major
try:
    db = SessionLocal()
    major_data = MajorCreate(
        name='计算机科学与技术',
        code='CS2024',
        description='计算机专业'
    )
    
    # Check if code exists
    existing = db.query(Major).filter(Major.code == major_data.code).first()
    if existing:
        print(f'Code already exists: {existing}')
    else:
        db_major = Major(**major_data.model_dump())
        db.add(db_major)
        db.commit()
        db.refresh(db_major)
        print(f'Created major: {db_major}')
    
    # List all majors
    majors = db.query(Major).all()
    print(f'\nAll majors: {majors}')
    
    db.close()
except Exception as e:
    import traceback
    print(f'Error: {e}')
    traceback.print_exc()
