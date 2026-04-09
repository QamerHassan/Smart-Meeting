import spacy
from fastapi import HTTPException

from .utils import extract_dates, determine_priority

ACTION_KEYWORDS = [
    "create", "build", "fix", "update", "review", "send", "complete", "finalize",
    "prepare", "schedule", "deploy", "design", "investigate", "check", "resolve",
    "follow up", "contact", "analyze", "setup", "configure"
]

try:
    nlp = spacy.load("en_core_web_sm")
except:
    raise HTTPException(500, "SpaCy model not found. Run: python -m spacy download en_core_web_sm")

def extract_tasks_from_notes(notes: str):
    doc = nlp(notes)

    tasks = []
    participants = list({ent.text for ent in doc.ents if ent.label_ == "PERSON"})

    for sent in doc.sents:
        s = sent.text.strip()
        lower = s.lower()

        # Skip useless lines
        if len(s) < 8:
            continue

        if not any(k in lower for k in ACTION_KEYWORDS):
            continue

        # Extract assignee
        assignees = [ent.text for ent in sent.ents if ent.label_ == "PERSON"]
        assignee = assignees[0] if assignees else "Unassigned"

        # Extract dates
        dates = extract_dates(s)
        due = dates[0] if dates else None

        priority = determine_priority(s)

        # Collect keywords
        keywords = [
            token.lemma_.lower()
            for token in sent
            if token.pos_ in ["NOUN", "VERB", "PROPN"] and len(token.text) > 3
        ]
        keywords = keywords[:6]

        # Confidence calculation
        confidence = 0.45
        if assignee != "Unassigned":
            confidence += 0.2
        if due:
            confidence += 0.15
        if len(keywords) > 3:
            confidence += 0.15

        tasks.append({
            "title": s,
            "assignee": assignee,
            "priority": priority,
            "due_date": due,
            "keywords": keywords,
            "confidence": round(min(confidence, 1.0), 2)
        })

    summary = f"Detected {len(tasks)} tasks | {len(participants)} participants."

    return tasks, summary, participants
