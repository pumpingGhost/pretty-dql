export const demoJoin: string = `
fetch spans, samplingRatio: 1, scanLimitGBytes: 50
| join [ fetch spans | fieldsAdd dt.entity.service | fields id = dt.entity.service, span.id],
    on: { left[dt.entity.service] == right[id] },
    fields: {
      id,
      dt.security.context,
      runs_on,
      belongs_to
    }, kind: inner`;
