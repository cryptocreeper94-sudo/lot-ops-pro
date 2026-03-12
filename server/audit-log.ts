// Comprehensive audit logging for all API requests and responses
interface AuditLog {
  timestamp: string;
  method: string;
  endpoint: string;
  userPin?: string;
  userName?: string;
  requestBody?: any;
  responseStatus: number;
  responseData?: any;
  error?: string;
  ip?: string;
}

const auditLogs: AuditLog[] = [];

export function logApiRequest(req: any, res: any, endpoint: string) {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    const log: AuditLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      endpoint: endpoint,
      userPin: req.body?.pin || req.session?.userPin,
      userName: req.session?.userName,
      requestBody: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
      responseStatus: res.statusCode,
      responseData: data,
      ip: req.ip || req.connection?.remoteAddress
    };
    
    auditLogs.push(log);
    console.log(`[API LOG] ${log.method} ${log.endpoint} - Status: ${log.responseStatus} - User: ${log.userName || 'anonymous'}`);
    
    return originalJson.call(this, data);
  };
}

export function getAuditLogs() {
  return auditLogs;
}

export function clearAuditLogs() {
  auditLogs.length = 0;
}
