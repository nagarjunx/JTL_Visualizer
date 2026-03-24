/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { parseJTLStream } from './parser';

describe('parseJTLStream', () => {
  it('should parse CSV correctly', async () => {
    const csvContent = `timeStamp,elapsed,label,responseCode,responseMessage,threadName,dataType,success,failureMessage,bytes,sentBytes,grpThreads,allThreads,URL,Latency,IdleTime,Connect
1678886400000,100,GET /api/users,200,OK,Thread Group 1-1,text,true,,500,100,1,1,http://localhost/api/users,50,0,10
1678886401000,200,GET /api/users,500,Internal Server Error,Thread Group 1-2,text,false,,500,100,2,2,http://localhost/api/users,100,0,10
`;
    // Create a mock File object
    const file = new Blob([csvContent], { type: 'text/csv' });
    file.name = 'test.csv';

    const results = await parseJTLStream(file, {}, () => {});
    
    expect(results.stats.total).toBe(2);
    expect(results.stats.successCount).toBe(1);
    expect(results.stats.failCount).toBe(1);
    expect(results.perLabelStats[0].label).toBe('GET /api/users');
  });

  it('should parse XML correctly', async () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<testResults version="1.2">
<httpSample t="100" it="0" lt="50" ct="10" ts="1678886400000" s="true" lb="GET /api/users" rc="200" rm="OK" tn="Thread Group 1-1" dt="text" by="500" sby="100" ng="1" na="1">
  <java.net.URL>http://localhost/api/users</java.net.URL>
</httpSample>
<httpSample t="200" it="0" lt="100" ct="10" ts="1678886401000" s="false" lb="GET /api/users" rc="500" rm="Internal Server Error" tn="Thread Group 1-2" dt="text" by="500" sby="100" ng="2" na="2">
  <java.net.URL>http://localhost/api/users</java.net.URL>
</httpSample>
</testResults>
`;
    // Create a mock File object
    const file = new Blob([xmlContent], { type: 'text/xml' });
    file.name = 'test.xml';

    const results = await parseJTLStream(file, {}, () => {});
    
    expect(results.stats.total).toBe(2);
    expect(results.stats.successCount).toBe(1);
    expect(results.stats.failCount).toBe(1);
    expect(results.perLabelStats[0].label).toBe('GET /api/users');
  });
});
