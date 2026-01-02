export const join: string = `
fetch spans, samplingRatio: 1, scanLimitGBytes: 50
| join [ fetch spans | fieldsAdd dt.entity.service | fields id = dt.entity.service, span.id],
    on: { left[dt.entity.service] == right[id] },
    fields: {
      id,
      dt.security.context,
      runs_on,
      belongs_to
    }, kind: inner, fields: [a,b,c]`;

export const fetch: string = `
fetch spans,samplingRatio: $(samplingRatio),scanLimitGBytes: 50
| fields a,b | fieldsAdd x
| fields entity = [entity], queryCount = {queryCount    }, queryCount = toLong(queryCount), errorCount = toLong(errorCount), x = {errorCount} | fieldsAdd x | summarize count(), by:{entity},
`;

export const normalArguments: string = `
| fields a,
         b,
         c
`;

export const semanticArguments: string = `
| fields a, c,
    by: b,
    kind: inner,
`;

export const nestedJoin: string = `
fetch spans, samplingRatio: 1
| join [fetch spans| fieldsAdd dt.entity.service | fields id = dt.entity.service, 
           asdf
                | join [ 
                fetch spans 
  | fieldsAdd subField, 
                        asdf 
                ],
                          on: { left[subField] == right[id] }
    ],
    on: { left[dt.entity.service] == right[id] },
    fields: {
         id,
      dt.security.context,
      runs_on,
      belongs_to
    }, 
    kind: inner,
      a,
            fields: [
      a,
      b,
      c
    ]`;
