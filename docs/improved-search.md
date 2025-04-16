# Improved Search Capabilities

## Overview

The knowledge graph system now features an enhanced "fuzzy but smart" search algorithm that makes it easier to find entities and their relationships. This document explains the new search capabilities and provides examples of effective search patterns.

## Key Features

- **Token-Based Matching**: Search queries are broken into words (tokens), allowing entities to be found when their names appear within longer queries.
- **Smart Relevance Ranking**: Results are ranked by relevance, with exact matches prioritized over partial matches.
- **Bidirectional Relation Retrieval**: All relations connected to matched entities are returned, whether incoming or outgoing.
- **Case Insensitivity**: Searches work regardless of capitalization.
- **Special Character Handling**: Special characters in search queries are handled gracefully.
- **Performance Optimizations**: Early termination for high-confidence matches improves performance with large datasets.

## Search Algorithm Details

The search algorithm uses a sophisticated scoring system to rank results:

1. **Exact Token Match** (Highest Priority): When a token in the query exactly matches an entity name.
2. **Entity Name in Query**: When an entity name appears as a complete token within the query.
3. **Token in Entity Name**: When a token from the query appears within an entity name (higher score for tokens at the beginning).
4. **Substring Match**: When a token is a substring of an entity name.
5. **Entity Type Match**: When a token matches an entity type.
6. **Observation Match**: When a token matches content in an entity's observations.
7. **Legacy Substring Match** (Lowest Priority): Original substring matching for backward compatibility.

## Effective Search Patterns

### Finding Specific Entities

To find a specific entity by name, simply include the entity name in your query:

```
modern_conversion_result_widget.dart
```

### Finding Entities in Context

You can now find entities even when they're mentioned as part of a longer query:

```
Plan modern_conversion_result_widget.dart
```

This will return the entity "modern_conversion_result_widget.dart" even though it's part of a longer query.

### Finding Related Entities

To find entities related to a specific concept, include relevant terms:

```
conversion widget
```

This will find entities with names, types, or observations related to both "conversion" and "widget".

### Finding by Entity Type

To find entities of a specific type, include the type in your query:

```
Document Plan
```

This will prioritize Document entities related to "Plan".

## Edge Cases

- **Empty Queries**: Empty search queries return empty results.
- **Very Short Queries**: Queries with very short tokens (less than 3 characters) require higher match confidence to avoid false positives.
- **No Matches**: If no entities match the query, an empty result is returned.

## API Usage

The search functionality is accessed through the `searchNodes` method of the `KnowledgeGraphManager`:

```typescript
const results = await knowledgeGraphManager.searchNodes("Plan modern_conversion_result_widget.dart");
```

The returned object contains:
- `entities`: An array of matched entities, sorted by relevance
- `relations`: An array of relations connected to any of the matched entities

## Performance Considerations

For large knowledge graphs, the search algorithm implements early termination for high-confidence matches, significantly improving performance. When exact or near-exact matches are found, the algorithm limits results to the top matches rather than processing the entire dataset.