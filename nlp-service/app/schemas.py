from pydantic import BaseModel
from typing import List, Optional

class MeetingNotesRequest(BaseModel):
    notes: str
    meeting_title: Optional[str] = None
    meeting_date: Optional[str] = None

class Task(BaseModel):
    title: str
    assignee: Optional[str]
    priority: str
    due_date: Optional[str]
    keywords: List[str]
    confidence: float

class TaskExtractionResponse(BaseModel):
    tasks: List[Task]
    summary: str
    participants: List[str]
