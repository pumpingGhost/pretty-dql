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

export const timeseries: string = `timeseries {
  receive.rate_per_minute = sum(dt.service.messaging.receive.count, scalar: true, rate: 1m, default: 0),
  publish.rate_per_minute = sum(dt.service.messaging.publish.count, scalar: true, rate: 1m, default: 0),
  process.rate_per_minute = sum(dt.service.messaging.process.count, scalar: true, rate: 1m, default: 0),
  process.failure_rate_per_minute = sum(dt.service.messaging.process.failure_count, scalar: true, rate: 1m, default: 0)
}
, by: {
  dt.entity.service,
  dt.entity.process_group,
  dt.entity.kubernetes_cluster,
  dt.entity.cloud_application_namespace,
  dt.entity.cloud_application,
  dt.host_group.id,
  messaging.destination.name,
  messaging.system,
  messaging.message.id,
  k8s.cluster.name,
  k8s.workload.name,
  k8s.workload.kind,
  k8s.namespace.name,
  k8s.cluster.uid
}, union: true
| fieldsAdd entityName(dt.entity.service)
| fieldsAdd idOld = toUid(hashMd5(concat(dt.entity.service, messaging.destination.name, messaging.system)))
| fieldsAdd id = toUid(hashMd5(concat(messaging.message.id, dt.entity.service, messaging.destination.name, messaging.system)))
| sort isNull(dt.entity.service.name) asc, lower(dt.entity.service.name) asc
| summarize {
receive.rate_per_minute = sum(receive.rate_per_minute),
publish.rate_per_minute = sum(publish.rate_per_minute),
process.rate_per_minute = sum(process.rate_per_minute),
process.failure_rate_per_minute = sum(process.failure_rate_per_minute) }
, by:{
  dt.entity.service,
  messaging.destination.name,
  messaging.system,
  id,
  idOld
}
| fieldsAdd process.failure_rate = 100 * (process.failure_rate_per_minute / process.rate_per_minute)
| fieldsAdd process.failure_rate = if(isNull(process.failure_rate), 0, else: process.failure_rate)
 
| fieldsAdd lifetime = entityAttr(dt.entity.service, "lifetime", type:"dt.entity.service")
| fieldsAdd customIconPath = entityAttr(dt.entity.service, "customIconPath", type:"dt.entity.service")
| fieldsAdd icon = entityAttr(dt.entity.service, "icon", type:"dt.entity.service")
| fieldsAdd entity = record(entityId = dt.entity.service,
        displayName = entityName(dt.entity.service),
        lifetimeEndMillis= unixMillisFromTimestamp(lifetime[end]),
        customIconPath = customIconPath,
        icon = icon[primaryIconType])
| fields id,idOld, messaging.destination.name, messaging.system, dt.entity.service, entity, receive.rate_per_minute, publish.rate_per_minute, process.rate_per_minute, process.failure_rate
| sort process.failure_rate desc
| summarize countDistinctExact(id), countDistinctExact(idOld), count()`;

export const newlines = `
fetch spans, from: -30m, samplingRatio: 1000, scanLimitGBytes: 50


  // based on the applied filters



// only show outgoing calls for filtered traces

| fieldsAdd sampling.probability = (power(2, 56) - coalesce(sampling.threshold, 0)) * power(2, -56) // comment
// only show outgoing calls for filtered traces

| fieldsAdd sampling.multiplicity = 1/sampling.probability




| fieldsAdd multiplicity = coalesce(sampling.multiplicity, 1) * coalesce(aggregation.count, 1) * dt.system.sampling_ratio`;

export const recordInCurlyBrackets = `| fieldsAdd requestCount_recent_rec = record({timeseries = requestCount_timeseries, value = requestCount_recent, isRecentValue = true })`;

export const record = `| fieldsAdd requestCount_recent_rec = record( timeseries = requestCount_timeseries, 
            value = requestCount_recent, isRecentValue = true)`;

export const simpleJoin = `| join [
       a,
       b
       ]`;

export const joinWithMultipleCommands = `| join [
       fetch spans
       | fieldsAdd x,
       y,
       z
       ]`;

export const nestedJoin2 = `fetch spans, samplingRatio: 1
| join [
      fetch spans
      | fieldsAdd dt.entity.service
      | fields id = dt.entity.service,
               entityName(dt.entity.service)
      | join [
            fetch spans
            | fieldsAdd span.id,
                        parentId = span.parent_id
          ],
          on: { left[ span.id ] == right[ parentId ] }
    ],
    on: { left[ dt.entity.service ] == right[ id ] }`;
