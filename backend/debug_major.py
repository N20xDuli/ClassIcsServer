import sys
sys.path.insert(0, 'E:\\Vibe\\ClassIcsServer\\ClassIcsServer\\backend')

# Test schema
print("Testing schema...")
from app.schemas.major import MajorCreate, Major

major_data = MajorCreate(
    name='测试专业',
    code='TEST001',
    description='测试描述'
)
print(f'MajorCreate: {major_data}')
print(f'MajorCreate dict: {major_data.model_dump()}')

# Test database
print("\nTesting database...")
from app.database import SessionLocal
from app.models.major import Major as MajorModel

db = SessionLocal()
try:
    # Create
    db_major = MajorModel(**major_data.model_dump())
    db.add(db_major)
    db.commit()
    db.refresh(db_major)
    print(f'Created: {db_major}')
    
    # Read
    majors = db.query(MajorModel).all()
    print(f'All majors: {majors}')
    
    # Test response schema
    major_response = Major.model_validate(db_major)
    print(f'Major response: {major_response}')
    print(f'Major response dict: {major_response.model_dump()}')
    
except Exception as e:
    import traceback
    print(f'Error: {e}')
    traceback.print_exc()
finally:
    db.close()
