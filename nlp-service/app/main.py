from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import MeetingNotesRequest, TaskExtractionResponse
from .nlp_engine import extract_tasks_from_notes

app = FastAPI(title="NLP Task Extraction API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "running", "service": "nlp-task-extractor"}

@app.post("/extract-tasks", response_model=TaskExtractionResponse)
def extract_tasks(request: MeetingNotesRequest):
    if not request.notes or len(request.notes) < 8:
        raise HTTPException(400, "Notes are too short")

    tasks, summary, participants = extract_tasks_from_notes(request.notes)

    return TaskExtractionResponse(
        tasks=tasks,
        summary=summary,
        participants=participants,
    )
