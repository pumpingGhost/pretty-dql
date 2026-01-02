export const demoSummarize: string = `
fetch spans,samplingRatio: $(samplingRatio),scanLimitGBytes: 50
| fieldsAdd dt.entity.service | summarize count(), queryCount = toLong(queryCount), errorCount = toLong(errorCount), by:{entity}, | fields queryCount, errorCount, entity
`;
