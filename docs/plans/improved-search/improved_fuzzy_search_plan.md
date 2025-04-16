# Improved Fuzzy Search Plan

## Overview

The current search functionality in our knowledge graph system is limited to exact substring matches. We need to enhance it to be more "fuzzy but smart," with the primary goal of finding entities when their names appear within a longer search query (e.g., "Plan modern_conversion_result_widget.dart" should return the entity named "modern_conversion_result_widget.dart").

## Phase 1: Unit Testing

### Task 1.1: Create Search Test Suite
- Create a new test file `src/graph/search.test.ts` focused on search capabilities
- Set up test fixtures with sample entities and relations
- Configure test environment with isolated test data

### Task 1.2: Implement Core Test Cases
- Test exact name matching (baseline functionality)
- Test entity name within longer query strings (primary requirement)
- Test with entity name in different positions (beginning, middle, end of query)
- Test case insensitivity
- Test with various entity types

### Task 1.3: Implement Relation Test Cases
- Test that relations connected to matched entities are returned
- Test bidirectional relation retrieval (both incoming and outgoing)
- Test multiple matched entities with shared relations

## Phase 2: Improved Search Algorithm Implementation

### Task 2.1: Enhance Entity Matching Logic
- Update the `searchNodes` method in `KnowledgeGraphManager`
- Implement tokenization to break search queries into words
- Add exact token matching for entity names
- Maintain existing substring matching for backward compatibility
- Implement relevance scoring for matched entities

### Task 2.2: Enhance Relation Handling
- Modify relation filtering to include all relations connected to any matched entity
- Ensure both incoming and outgoing relations are captured
- Create helper functions to extract connected relations efficiently

### Task 2.3: Result Ranking Implementation
- Add relevance scoring to prioritize results
- Sort entities by relevance score
- Consider exact matches more relevant than partial matches
- Factor in match position (whole word vs partial word)

## Phase 3: Edge Cases and Optimization

### Task 3.1: Handle Edge Cases
- Empty search queries
- Very short queries (less than 3 characters)
- Queries with special characters
- Handling of multiple potential matches
- No matches found scenarios

### Task 3.2: Performance Optimization
- Ensure search remains efficient with larger datasets
- Consider indexing strategies if performance degrades
- Add optional early termination for high-confidence matches
- Benchmark search performance with different dataset sizes

## Phase 4: Integration and Documentation

### Task 4.1: Integration Testing
- Test with real-world knowledge graph data
- Verify compatibility with MCP server interface
- Validate behavior with edge-connecting queries

### Task 4.2: Documentation
- Update code documentation for modified search functions
- Document new search capabilities for users
- Provide examples of effective search patterns
- Update any relevant API documentation

## Implementation Details

### Core Algorithm Changes

The main changes will focus on the `searchNodes` method in `KnowledgeGraphManager`. The current implementation does simple substring matching:

```typescript
async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    const filteredEntities = graph.entities.filter(e =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.entityType.toLowerCase().includes(query.toLowerCase()) ||
        e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
    );

    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    const filteredRelations = graph.relations.filter(r =>
        filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    return {
        entities: filteredEntities,
        relations: filteredRelations,
    };
}
```

The enhanced version will:

1. Tokenize the search query into words
2. Check for exact token matches against entity names
3. Include entities with partial matches as fallback
4. Include all relations where a matched entity is either source or target
5. Score and rank results by relevance

## Success Criteria

This implementation will be considered successful when:

- [x] All test cases pass
- [x] Searching for "Plan modern_conversion_result_widget.dart" returns the entity "modern_conversion_result_widget.dart"
- [x] Searching for "FileChange modern_conversion_result_widget.dart" returns the entity "modern_conversion_result_widget.dart"
- [x] All relations connecting to matched entities are included in results
- [x] Search performance remains acceptable with larger datasets
- [x] Edge cases are properly handled

## Implementation Checklist

- [x] Phase 1: Unit Testing
  - [x] Task 1.1: Create Search Test Suite
  - [x] Task 1.2: Implement Core Test Cases
  - [x] Task 1.3: Implement Relation Test Cases

- [x] Phase 2: Improved Search Algorithm Implementation
  - [x] Task 2.1: Enhance Entity Matching Logic
  - [x] Task 2.2: Enhance Relation Handling
  - [x] Task 2.3: Result Ranking Implementation

- [x] Phase 3: Edge Cases and Optimization
  - [x] Task 3.1: Handle Edge Cases
  - [x] Task 3.2: Performance Optimization

- [x] Phase 4: Integration and Documentation
  - [x] Task 4.1: Integration Testing
  - [x] Task 4.2: Documentation