# Natural Language Task Parsing Improvements (T7.4.5)

**Status**: ✅ Complete  
**Completed**: January 2026

## Overview

This document describes the natural language parsing improvements implemented for Todone. These enhancements make task input more intuitive by understanding common abbreviations, natural deadline phrases, action types, and multi-part task detection.

## New Features

### 1. Text Normalization (`normalizer.ts`)

The normalizer runs before parsing and handles:

#### Abbreviation Expansion
Common abbreviations are automatically expanded:

| Abbreviation | Expansion |
|--------------|-----------|
| tmrw, tmr, tomo | tomorrow |
| mtg, mtgs | meeting, meetings |
| appt, appts | appointment, appointments |
| fup | follow up |
| w/ | with |
| w/o | without |
| eod | end of day |
| eow | end of week |
| eom | end of month |
| asap | as soon as possible |
| mon, tue, wed, thu, fri, sat, sun | Full weekday names |

#### Character Normalization
- Smart quotes → regular quotes
- Em/en dashes → hyphens
- Ellipsis → three dots

### 2. Urgency & Deadline Detection (`urgencyExtractor.ts`)

Natural language urgency and deadline phrases are now detected and converted to due dates and priorities:

#### High Urgency (P1)
- "asap", "as soon as possible"
- "urgent", "urgently", "emergency", "critical"
- "immediately", "right away", "right now"

#### Deadline Phrases (Hard Deadlines)
- "by end of day" / "by eod" / "by cob" → Today at 5pm
- "by noon" / "before lunch" → Today at 12pm
- "by tomorrow" → Tomorrow at 5pm
- "by tomorrow morning" / "first thing tomorrow" → Tomorrow at 9am
- "by end of week" / "by eow" → Friday
- "by end of month" / "by eom" → Last day of month
- "by Monday/Tuesday/etc." → Next occurrence of that weekday

#### Soft Urgency (P2-P4)
- "important", "high priority" → P2
- "this week", "soon" → P3
- "when you get a chance", "no rush", "whenever", "someday" → P4

### 3. Action Type Detection (`actionExtractor.ts`)

The parser now identifies action types and provides estimated durations:

| Action Type | Detection Patterns | Default Duration |
|-------------|-------------------|------------------|
| call | call, phone, ring | 15 min |
| email | email, e-mail, mail | 15 min |
| message | message, text, dm, slack | 5 min |
| meeting | meet, meeting, sync, standup, 1:1 | 30 min |
| follow_up | follow up, check-in | 15 min |
| review | review, check, look at | 30 min |
| write | write, draft, compose | 60 min |
| research | research, investigate, look into | 45 min |
| buy | buy, purchase, order | 15 min |
| pay | pay, settle, transfer | 10 min |
| create | create, make, build | 45 min |
| update | update, edit, modify | 20 min |
| fix | fix, repair, debug | 30 min |
| send | send, share, forward | 10 min |
| read | read, study, go through | 30 min |
| prepare | prepare, prep, get ready | 30 min |

### 4. Multi-Part Task Detection (`multiPartDetector.ts`)

The parser detects when a task contains multiple distinct actions:

**Detected Separators:**
- "and" / "and then" / "and also"
- "then"
- "also" / "plus"
- Semicolons (;)
- Dashes with spaces ( - )

**Example:**
```
Input: "Call mom and email John about dinner"
Output:
  isMultiPart: true
  suggestedSubtasks: ["Call mom", "Email John about dinner"]
```

### 5. Enhanced ParsedTaskIntent

The `ParsedTaskIntent` interface now includes additional fields:

```typescript
interface ParsedTaskIntent {
  // ... existing fields ...
  
  // New fields
  normalizedText: string              // Text after normalization
  actionType?: ActionType             // Detected action type
  estimatedDuration?: number          // Duration estimate in minutes
  estimatedDurationConfidence?: number // Confidence in the estimate
  isMultiPart?: boolean               // Whether task has multiple parts
  suggestedSubtasks?: string[]        // Suggested split tasks
  implicitPriority?: Priority         // Priority from urgency phrases
  implicitPriorityConfidence?: number // Confidence in implicit priority
}
```

## Integration

The improved parser is already integrated into the existing `parseTaskInput` function. No changes are required to existing code that uses the NLP module.

### Processing Order

1. **Normalize** - Expand abbreviations, clean characters
2. **Extract Urgency** - Detect deadline/urgency phrases
3. **Extract DateTime** - Parse dates and times
4. **Extract Entities** - Priority, projects, labels, duration, recurrence
5. **Extract Action** - Detect action type and estimate duration
6. **Detect Multi-Part** - Check for multiple tasks
7. **Clean Title** - Remove parsed elements, preserve context

## Examples

### Before Improvements
```
Input: "Mtg w/ John tmrw at 3pm"
Output: Title="Mtg w/ John", DueDate=Tomorrow, DueTime=15:00
```

### After Improvements
```
Input: "Mtg w/ John tmrw at 3pm"
Output: 
  Title="Meeting with John"
  DueDate=Tomorrow
  DueTime=15:00
  ActionType=meeting
  EstimatedDuration=30 min
```

### Complex Example
```
Input: "Call client by eod and email report asap #work @urgent"
Output:
  Title="Call client"
  DueDate=Today
  DueTime=17:00
  Priority=P1
  Project=Work
  Labels=[urgent]
  ActionType=call
  EstimatedDuration=15 min
  IsMultiPart=true
  SuggestedSubtasks=["Call client", "Email report"]
```

## Testing

Run the NLP tests with:
```bash
npm run test -- src/utils/nlp/
```

Test coverage includes:
- Normalization (30+ tests)
- Urgency extraction (35+ tests)
- Action detection (35+ tests)
- Multi-part detection (20+ tests)
- Integration with existing parser (25+ tests)

## Performance

- Normalization: <1ms for typical input
- All parsing combined: <5ms for complex input
- No external dependencies or API calls

## Future Improvements

Potential areas for further enhancement:
- User-configurable abbreviation dictionary
- Learning from user's typing patterns
- Context-aware duration estimates based on historical data
- Locale-specific date/time parsing
- Support for more languages
