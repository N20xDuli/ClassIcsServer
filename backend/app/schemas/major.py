from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class MajorBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class MajorCreate(MajorBase):
    pass

class MajorUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None

class Major(MajorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
