from pydantic import BaseModel, field_serializer
from datetime import time, datetime, date
from typing import Optional

class setStoreInfoSchemas(BaseModel):
    id: int
    name: str
    address: str
    addressDetail: Optional[str] = None
    industry: str
    owner: str
    number: str

class returnMyStoresSchemas(BaseModel):
    code: int
    industry: str
    address: str
    addressDetail: str | None
    name: str
    owner: str
    number: str
    employee_count: int
    created_at: date

class updateNicknameSchemas(BaseModel):
    member_id: int
    nickname: str