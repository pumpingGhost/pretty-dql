const someExternalDqlNode = '| fieldsAdd foo = "bar"';

const SemanticDictionaryConstants = {
  DT_ENTITY_SERVICE: 'dt.entity.service',
  DB_SYSTEM: 'db.system',
  DB_QUERY_TEXT: 'db.query.text',
  DB_NAMESPACE: 'db.namespace',
};

export const demoTemplateStringWithSemDictVariables = `
| fieldsAdd failed = if(span.status_code == "error" or isNotNull(error.type) or iAny(span.events[][span_event.name]=="exception"), samplingMultiplicity, else: 0)
| fieldsAdd failed = if(aggregation.exception_count > 0, failed * aggregation.exception_count, else: failed)

| summarize {
  queryCount = sum(samplingMultiplicity * aggregationMultiplicity),
  errorCount = sum(failed),
  cumulativeDuration = sum(samplingMultiplicity * aggregationDuration)
}, by: { $(someUaDqlVariable) }

${someExternalDqlNode}

| fields
  entity,
  queryCount = toLong(queryCount),
  errorCount = toLong(errorCount),
  ${SemanticDictionaryConstants.DT_ENTITY_SERVICE}.name,
  ${SemanticDictionaryConstants.DT_ENTITY_SERVICE},
  ${SemanticDictionaryConstants.DB_SYSTEM},
  ${SemanticDictionaryConstants.DB_QUERY_TEXT},
  ${SemanticDictionaryConstants.DB_NAMESPACE},
  queryDuration = cumulativeDuration / queryCount,
  cumulativeDuration
| limit 1010`;
