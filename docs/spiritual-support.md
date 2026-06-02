# Spiritual Support Model

## Principle

Spiritual support is a user-selected layer. It is not the core solution engine
and it should not appear when the user has disabled it.

The core plan remains practical: actions, milestones, checkpoints, risks, and
decision points. Spiritual support can sit beside those steps as reflective
support.

## Source Project

The first candidate data source is:

```text
/Users/muratumutlu/Hassar/app-projects/5-min-dhikr/lib/coreDhikrs.ts
```

Current extracted inventory:

| Type | Count |
| --- | ---: |
| Esma | 100 |
| Dua | 4 |

Current timing distribution:

| Timing | Count |
| --- | ---: |
| HER GUN | 3 |
| PAZARTESI | 4 |
| SALI | 10 |
| CARSAMBA | 4 |
| PERSEMBE | 17 |
| CUMA | 25 |
| CUMARTESI | 9 |
| PAZAR | 32 |

Current intention categories:

- huzur
- muhabbet
- sukur
- guc
- sabir
- tevbe
- korunma
- bereket
- kazanc
- basari
- ilim
- iman
- itibar
- aile
- sifa

## Catalog Record

Each spiritual practice should be represented with a reviewed, source-aware
record:

```json
{
  "id": "core_esma_16",
  "type": "Esma",
  "label": "YA FETTAH",
  "displayText": "YA FETTAH",
  "transliteration": "YA FETTAH",
  "intentions": ["basari", "ilim"],
  "schedule": {
    "days": ["Car"],
    "timingLabel": "CARSAMBA",
    "timeOfDay": null,
    "count": 489
  },
  "source": {
    "project": "5-min-dhikr",
    "path": "lib/coreDhikrs.ts",
    "reviewStatus": "needs_religious_review"
  }
}
```

`timeOfDay` is separate from the catalog's day/timing label. If the source
contains exact clock times, they can be imported. If not, the user's reminder
settings should provide preferred times.

## Imported Catalog

The current catalog lives at:

```text
data/spiritual-practices.json
```

It is generated from the source project with:

```bash
npm run import:spiritual-catalog
```

The catalog schema lives at:

```text
schema/spiritual-practice-catalog.schema.json
```

The importer preserves source day labels, day arrays, target counts,
categories, and intention tags. It does not invent exact clock times; each
record keeps `schedule.timeOfDay` as `null` until a reviewed source or the
user's reminder settings provide one.

## User Settings

Recommended settings shape:

```json
{
  "spiritualSupport": {
    "enabled": false,
    "mode": "off",
    "allowedTypes": ["Esma", "Dua"],
    "preferredTimes": ["07:30", "21:30"],
    "allowAiSuggestions": true,
    "showInSolutionMap": true,
    "createReminders": false
  }
}
```

Allowed modes:

- `off`: do not generate or show spiritual support
- `gentle`: show a separate optional support block
- `integrated`: allow support practices to appear as optional plan nodes

## Recommendation Logic

1. Read the user's spiritual support settings.
2. If disabled, skip all spiritual support generation.
3. Extract intention categories from the confirmed problem and goal.
4. Match catalog items by intention category.
5. Respect the user's allowed practice types.
6. Preserve source day and count.
7. Apply user preferred reminder time if no exact source time exists.
8. Show why the suggestion was made.
9. Keep it optional and editable.

## Plan Integration

Spiritual support can appear as:

- a separate support panel
- optional plan nodes
- checkpoint reminders
- reflection prompts
- weekly review context

It should not replace practical action steps.
