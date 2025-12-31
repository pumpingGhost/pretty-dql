export const DQL_TRANSFORMATION_COMMANDS = [
  // Filter and search commands
  'dedup',
  'filter',
  'filterOut',
  'search',
  // Selection and modification commands
  'fields',
  'fieldsAdd',
  'fieldsKeep',
  'fieldsRemove',
  'fieldsRename',
  // Extraction and parsing commands
  'parse',
  // Ordering commands
  'limit',
  'sort',
  // Structuring commands
  'expand',
  'fieldsFlatten',
  // Aggregation commands
  'fieldsSummary',
  'makeTimeseries',
  'summarize',
  // Correlation and join commands
  'append',
  'join',
  'joinNested',
  'lookup',
  // Smartscape commands
  'smartscapeNodes',
  'smartscapeEdges',
  'traverse',
];
