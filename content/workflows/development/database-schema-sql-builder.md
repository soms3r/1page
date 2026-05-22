---
title: "Database Schema & SQL Builder"
slug: "database-schema-sql-builder"
description: "Design normalized database schemas, write optimized SQL queries, and generate migration scripts."
category: "development"
tags:
  - sql
  - database
  - schema-design
  - queries
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
  - name: useCase
    label: Application Use Case
    required: true
    placeholder: "e.g. Multi-tenant SaaS for project management"
  - name: entities
    label: Core Entities
    required: true
    placeholder: "e.g. Users, Projects, Tasks, Comments, Teams"
  - name: databaseType
    label: Database Type
    required: false
    placeholder: "e.g. PostgreSQL, MySQL, SQLite, SQL Server"
  - name: queries
    label: Key Queries Needed
    required: false
    placeholder: "e.g. Dashboard aggregation, search, reporting"
  - name: performance
    label: Performance Requirements
    required: false
    placeholder: "e.g. Millions of rows, sub-second queries"
easyMode:
  enabled: true
  fields:
    - name: useCase
      type: text
      label: What are you building?
      placeholder: "e.g. Task management app, e-commerce store"
    - name: databaseType
      type: select
      options: ["PostgreSQL", "MySQL", "SQLite", "SQL Server"]
      label: Database
    - name: complexity
      type: select
      options: ["Simple (3-5 tables)", "Medium (6-15 tables)", "Complex (15+ tables with relations)"]
      label: Schema Complexity
  template: "You are a database architect. Design a {{databaseType}} schema for {{useCase}} with entities: {{entities}}. Complexity: {{complexity}}. Include: ERD description, all table definitions with data types, relationships (FKs), indexes, migration SQL, and optimized queries for {{queries}}. Follow normalization best practices."
---

You are a database architect. Design a production-ready database schema.

**Use Case**: {{useCase}}
**Core Entities**: {{entities}}
**Database Type**: {{databaseType || "PostgreSQL"}}
**Key Queries**: {{queries || "CRUD operations, search, listing"}}
**Performance Requirements**: {{performance || "Standard workload"}}

## Schema Design

### 1. Entity Relationship Overview
```
[Entity] 1---* [Entity] : [relationship description]
[Entity] *---* [Entity] : [through join table]
...
```

### 2. Table Definitions

**Table: [entity_name]**
| Column | Type | Constraints | Default | Index | Notes |
|--------|------|-------------|---------|-------|-------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | PK | Primary key |
| [field] | [type] | [constraints] | [default] | [index type] | [notes] |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | | |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | | |

```sql
CREATE TABLE [entity_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ... 
);
CREATE INDEX idx_[entity]_[field] ON [entity_name]([field]);
```

### 3. Relationships

| Parent | Child | Type | Foreign Key | ON DELETE |
|--------|-------|------|-------------|-----------|
| [table] | [table] | 1:N | [column] | CASCADE/SET NULL/RESTRICT |
| [table] | [table] | N:M | [join table] | CASCADE |

### 4. Migration Scripts

**Migration 001: Initial Schema**
```sql
-- Up
[CREATE statements]

-- Down
[DROP statements]
```

**Migration 002: [Description]**
```sql
-- Up
[ALTER statements]

-- Down
[ROLLBACK statements]
```

### 5. Optimized Queries

**List [Entity] with Pagination**
```sql
SELECT * FROM [entity]
WHERE [conditions]
ORDER BY [field] [ASC/DESC]
LIMIT $1 OFFSET $2;
```

**Search [Entity]**
```sql
SELECT * FROM [entity]
WHERE [text_field] ILIKE '%' || $1 || '%'
   OR [text_field] ILIKE '%' || $1 || '%'
ORDER BY [relevance_field] DESC;
-- Add full-text search index for production:
-- CREATE INDEX idx_[entity]_fts ON [entity] USING GIN(to_tsvector('english', [field]));
```

**Aggregation Query (Dashboard)**
```sql
SELECT 
  DATE_TRUNC('[period]', created_at) AS period,
  COUNT(*) AS total,
  COUNT(DISTINCT [column]) AS unique_count,
  AVG([numeric_field]) AS average
FROM [entity]
WHERE created_at > NOW() - INTERVAL '[interval]'
GROUP BY period
ORDER BY period DESC;
```

### 6. Performance Notes
- **Expected Data Size**: [rows/month, total size]
- **Index Strategy**: Which columns need B-tree, GIN, or partial indexes
- **Query Patterns**: Read-heavy, write-heavy, or mixed
- **Partitioning Recommendation**: If applicable
- **Connection Pooling**: Recommended pool size

### 7. Normalization Level
- **Current**: [3NF, Star Schema, etc.]
- **Denormalization Candidates**: Fields that could be cached for performance

Output with `code` blocks for all SQL, | table | for column definitions, **bold** for table names, and --- for migration separators.
