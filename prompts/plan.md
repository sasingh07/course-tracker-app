# Prompts: PLAN.md

Key prompts and decisions from planning the app with Claude Code. Claude suggested options for each section. I made the choices below.

## Setup
- Asked Claude to read the assignment and guide me step by step, asking before every action.
- **Idea:** "Course & assignment tracker"
- **Stack:** GitHub + Claude Code + Next.js + Supabase + Vercel. I asked about using Replit for the database, login, and hosting. I decided to "stick with Supabase + Vercel" because it fits the Claude Code + GitHub PR workflow better.

## Pitch
- My input: "7 classes this semester. Assignments live in bCourses, syllabus. I need a better look into future assignments to plan workload and anticipate issues... Open the app beginning of the week and end of the week."
- Claude suggested also tracking other commitments (professional, social, travel). I chose **Option A: assignments only** to keep the app focused.

## Features
- Accepted the 7 spine user stories as drafted.
- My 3 features: **Estimated hours, crunch-week warning, CSV import**, in that order.
- Crunch-week threshold: **15 hours**.
- Considered PDF/Word syllabus import (most syllabi are PDF/Word). Options were AI extraction (Claude API, small cost), a text helper, or CSV only. Chose **CSV only** to keep the app free and keep feature 10 small.

## Database
- Completion status: **true/false** (`is_done`).
- **Removed `weight_percent`**, so sort became "due date or newest added".
- Assignment types kept: homework, reading, quiz, exam, project, paper.
- Added a `color` column to `courses` for color-coding.

## Tests, technologies, design, risks
- Accepted both Given/When/Then tests as drafted.
- Login: **email + password**.
- Design: "keep style as dark mode rather than too bright", "color code the courses", inspiration: **Linear**.
- Risks and cuts: accepted as drafted (CSV import is the riskiest and gets cut first).
