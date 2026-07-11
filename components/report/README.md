# Report Components

Components for the report page and report-related features.

## Files

- `report-history.tsx` — Reads localStorage (`scout:history`) and renders clickable history cards on the landing page

## Data

History stored in localStorage under `scout:history` key (max 20 items). Each item is a `CaptureData` object.
