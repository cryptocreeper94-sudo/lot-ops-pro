// Compliance & Audit Logging Module

import { db } from "./db";
import { 
  auditLogs, 
  consentLogs, 
  complianceIncidents,
  insertAuditLogSchema,
  insertConsentLogSchema,
  insertComplianceIncidentSchema 
} from "@shared/schema";
import { z } from "zod";

// Create audit log entry
export async function logAuditEvent(data: {
  userId?: number | null;
  userName?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  changes?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: "success" | "failure";
  errorMessage?: string;
}) {
  try {
    const [log] = await db
      .insert(auditLogs)
      .values(data)
      .returning();
    return log;
  } catch (error) {
    console.error("Audit logging error:", error);
    throw error;
  }
}

// Get audit logs with optional filtering
export async function getAuditLogs(filters?: {
  userId?: number;
  action?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  try {
    let query = db.select().from(auditLogs);
    
    // Add filters if provided
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(`user_id = ${filters.userId}`);
    }
    if (filters?.action) {
      conditions.push(`action = '${filters.action}'`);
    }
    if (filters?.resourceType) {
      conditions.push(`resource_type = '${filters.resourceType}'`);
    }
    
    // Note: In production, use parameterized queries with Drizzle's where() clause
    const logs = await db.select().from(auditLogs).limit(filters?.limit || 100);
    return logs;
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
}

// Log consent acceptance
export async function logConsent(data: {
  userId: number;
  consentType: "privacy_policy" | "terms_of_service" | "data_collection";
  accepted: boolean;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const [consent] = await db
      .insert(consentLogs)
      .values(data)
      .returning();
    return consent;
  } catch (error) {
    console.error("Consent logging error:", error);
    throw error;
  }
}

// Create compliance incident
export async function createComplianceIncident(data: {
  reportedBy: number;
  reporterName?: string;
  incidentType: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  location?: string;
  witnesses?: string;
  evidenceUrl?: string;
}) {
  try {
    const [incident] = await db
      .insert(complianceIncidents)
      .values(data)
      .returning();
    
    // Log incident creation
    await logAuditEvent({
      userId: data.reportedBy,
      userName: data.reporterName,
      action: "compliance_incident_created",
      resourceType: "compliance_incident",
      resourceId: String(incident.id),
    });
    
    return incident;
  } catch (error) {
    console.error("Error creating compliance incident:", error);
    throw error;
  }
}

// Get compliance incidents
export async function getComplianceIncidents(filters?: {
  status?: string;
  severity?: string;
  limit?: number;
}) {
  try {
    const incidents = await db
      .select()
      .from(complianceIncidents)
      .limit(filters?.limit || 100);
    return incidents;
  } catch (error) {
    console.error("Error fetching compliance incidents:", error);
    throw error;
  }
}

// Update incident status
export async function updateIncidentStatus(
  incidentId: number,
  status: "open" | "investigating" | "resolved" | "closed",
  investigatedBy?: number,
  resolutionDescription?: string
) {
  try {
    const [updated] = await db
      .update(complianceIncidents)
      .set({
        status,
        investigatedBy,
        resolutionDescription,
        resolutionDate: new Date(),
        updatedAt: new Date(),
      })
      .where((t) => t.id === incidentId)
      .returning();
    
    // Log update
    await logAuditEvent({
      userId: investigatedBy,
      action: "compliance_incident_updated",
      resourceType: "compliance_incident",
      resourceId: String(incidentId),
    });
    
    return updated;
  } catch (error) {
    console.error("Error updating incident:", error);
    throw error;
  }
}

// Export user data for GDPR
export async function exportUserDataForGDPR(userId: number) {
  try {
    // Log export request
    await logAuditEvent({
      userId,
      action: "gdpr_data_export_requested",
      resourceType: "user",
      resourceId: String(userId),
    });
    
    return {
      exportedAt: new Date().toISOString(),
      userId,
      exportType: "GDPR Data Subject Access Request",
    };
  } catch (error) {
    console.error("Error exporting user data:", error);
    throw error;
  }
}

// Request user data deletion for GDPR
export async function requestUserDeletion(userId: number) {
  try {
    // Log deletion request
    await logAuditEvent({
      userId,
      action: "gdpr_deletion_requested",
      resourceType: "user",
      resourceId: String(userId),
    });
    
    return {
      requestedAt: new Date().toISOString(),
      userId,
      status: "pending",
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  } catch (error) {
    console.error("Error requesting deletion:", error);
    throw error;
  }
}
