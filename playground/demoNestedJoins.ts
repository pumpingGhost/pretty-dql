export const nestedJoin: string = `
fetch spans, samplingRatio: 1
| join [fetch spans | fieldsAdd dt.entity.service | fields id = dt.entity.service, entityName(dt.entity.service)
            | join [ fetch spans 
                        | fieldsAdd span.id, parentId = span.parent_id],
                         on: { left[span.id] == right[parentId] }],
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
