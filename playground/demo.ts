export const join: string = `
| join [ fetch dt.entity.service, dt.service ],
    on: { left[dt.entity.service] == right[id] },
    fields: {
      id,
      dt.security.context,
      runs_on,
      belongs_to
    }, kind: inner`;

export const fetch: string = `
fetch spans,samplingRatio: $(samplingRatio),scanLimitGBytes: 50
| fields a,b | fieldsAdd x
| fields [entity], {queryCount    } = toLong(queryCount), errorCount = toLong(errorCount), | fieldsAdd x | summarize count(), by:{entity},
`;

export const normalArguments: string = `
| fields a,
         b,
         c
`;

export const semanticArguments: string = `
| fields a,
    by: b,
    kind: inner,
`;
