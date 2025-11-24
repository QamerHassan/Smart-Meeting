import re
from datetime import datetime, timedelta

PRIORITY_KEYWORDS = {
    "critical": ["urgent", "asap", "emergency", "immediately"],
    "high": ["important", "priority", "high"],
    "medium": ["should", "need to", "must"],
    "low": ["later", "eventually", "when possible"],
}

DATE_PATTERNS = [
    r"\bby (\w+ \d{1,2})",
    r"\b(\d{1,2}/\d{1,2}/\d{4})\b",
    r"\b(tomorrow|next week|next month)\b",
]

def extract_dates(text: str):
    dates = []
    for pattern in DATE_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        dates.extend(matches)
    return list(set(dates))

def determine_priority(sentence: str):
    s = sentence.lower()
    for p, keys in PRIORITY_KEYWORDS.items():
        if any(k in s for k in keys):
            return p
    return "medium"
