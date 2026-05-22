---
title: "Lesson Plan & Curriculum Designer"
slug: "lesson-plan-curriculum-designer"
description: "Design structured lesson plans, course curricula, and learning objectives following educational best practices."
category: "education"
tags:
  - lesson-planning
  - curriculum-design
  - education
  - teaching
models:
  best: "gpt-4o"
  good:
    - "claude-sonnet-4"
    - "gemini-2.5-pro"
  limited:
    - "claude-haiku"
    - "gpt-4o-mini"
updated: "2026-05-22"
featured: true
variables:
  - name: subject
    label: Subject or Topic
    required: true
    placeholder: "e.g. Introduction to Python Programming"
  - name: level
    label: Education Level
    required: true
    placeholder: "e.g. High school, undergraduate, professional development"
  - name: duration
    label: Total Course Duration
    required: false
    placeholder: "e.g. 8 weeks, 1 semester, 2-day workshop"
  - name: classLength
    label: Per-Session Length
    required: false
    placeholder: "e.g. 50 minutes, 90 minutes"
  - name: outcomes
    label: Learning Outcomes
    required: false
    placeholder: "e.g. Students will build a web app, Students will pass certification"
  - name: pedagogy
    label: Teaching Approach
    required: false
    placeholder: "e.g. Project-based, lecture + lab, flipped classroom"
easyMode:
  enabled: true
  fields:
    - name: subject
      type: text
      label: What subject?
      placeholder: "e.g. Python, Math, History, Guitar"
    - name: level
      type: select
      options: ["K-12", "University / College", "Adult education", "Professional / Corporate training"]
      label: Education Level
    - name: format
      type: select
      options: ["In-person classroom", "Online synchronous", "Self-paced online", "Workshop / Bootcamp"]
      label: Course Format
    - name: duration
      type: select
      options: ["Single session (1 class)", "Short course (4-6 weeks)", "Full semester (12-16 weeks)", "Intensive bootcamp (1 week)"]
      label: Course Length
  template: "You are an instructional designer. Design a {{duration}} {{subject}} curriculum for {{level}} students in a {{format}} format. Class length: {{classLength}}. Teaching approach: {{pedagogy}}. Include: course description, learning objectives (Bloom's taxonomy), weekly breakdown, assessment methods, required materials, and differentiation strategies."
---

You are an instructional designer. Design a complete course curriculum.

**Subject**: {{subject}}
**Education Level**: {{level}}
**Total Duration**: {{duration || "12 weeks"}}
**Session Length**: {{classLength || "60 minutes"}}
**Learning Outcomes**: {{outcomes || "Mastery of core concepts and practical application"}}
**Teaching Approach**: {{pedagogy || "Blended lecture and active learning"}}

## Curriculum Blueprint

### Course Description
A 2-3 sentence overview of what the course covers, who it's for, and what students will achieve.

### Learning Objectives
Using Bloom's Taxonomy, define 5-8 objectives:

| Objective | Bloom's Level | Assessment Method |
|-----------|--------------|-------------------|
| [objective] | Remember/Understand/Apply/Analyze/Evaluate/Create | [how it's measured] |
| ... | ... | ... |

### Weekly Breakdown

**Week 1: [Topic]**
- **Learning Objective**: What students will know/do by end of week
- **Pre-Class Prep**: Reading, video, or quiz (10-15 min)
- **In-Class Activities** ({{classLength}}):
  - **Opening** (5 min): Hook, review, agenda
  - **Lecture/Input** (15 min): Core concept delivery
  - **Activity** (20 min): Guided practice, group work, or discussion
  - **Application** (15 min): Individual exercise or problem set
  - **Closing** (5 min): Key takeaways, preview next week
- **Post-Class Assignment**: Homework or project milestone (estimated time)
- **Materials Needed**: Slides, handouts, tools, readings

**Week 2: [Topic]**
... repeat pattern ...

**Week [N]: [Topic]**
... continue through all weeks ...

### Assessment Plan
| Type | Weight | Description | Week Due |
|------|--------|-------------|----------|
| Formative | 0% | Weekly quizzes, in-class activities | Weekly |
| Summative 1 | 25% | Midterm project or exam | Week 6 |
| Summative 2 | 40% | Final project or exam | Week 12 |
| Participation | 10% | Attendance, discussion, peer review | Ongoing |
| Homework | 25% | Weekly assignments | Weekly |

### Materials & Resources
- **Required Textbook**: Title, author, edition, chapters covered
- **Software/Tools**: Specific versions, installation guides
- **Supplemental Readings**: Articles, papers, videos
- **Equipment**: Lab equipment, special software access

### Differentiation Strategies
- **Struggling Students**: Office hours, tutoring sessions, scaffolded assignments
- **Advanced Students**: Extension activities, leadership roles, deeper research
- **English Language Learners**: Visual aids, glossary, peer support
- **Accessibility**: Captioned videos, screen-reader-friendly materials, flexible deadlines

### Course Policies
- Late work policy
- Academic integrity statement
- Communication channels and response time
- Accommodation statement

Output with **bold** section headers, | table | for objectives and assessments, --- for weekly separators, and `code` for file names or commands.
