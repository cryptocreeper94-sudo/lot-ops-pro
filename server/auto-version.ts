/**
 * Auto-Version System for Production Deployments
 * 
 * Automatically increments and stores version when deployed to production.
 * Uses DEPLOYMENT_ID to detect new deployments.
 */

import { storage } from "./storage";
import { APP_VERSION } from "@shared/version";

// Codename pool for auto-generated releases
const CODENAMES = [
  "Aurora", "Blaze", "Cascade", "Delta", "Eclipse", "Frontier",
  "Galaxy", "Horizon", "Ignite", "Jupiter", "Kinetic", "Lightning",
  "Momentum", "Nebula", "Orbit", "Phoenix", "Quantum", "Radiance",
  "Stellar", "Titan", "Unity", "Velocity", "Wavelength", "Xenon",
  "Zenith", "Apollo", "Nova", "Pulsar", "Comet", "Meteor"
];

function getRandomCodename(): string {
  return CODENAMES[Math.floor(Math.random() * CODENAMES.length)];
}

function incrementVersion(currentVersion: string): { version: string; versionNumber: number } {
  // Parse version like "v2.1.5" or "2.1.5"
  const cleanVersion = currentVersion.replace(/^v/, '');
  const parts = cleanVersion.split('.').map(Number);

  if (parts.length === 3) {
    // Increment patch version
    parts[2]++;
    const newVersion = `v${parts.join('.')}`;
    // Calculate version number for sorting (major*10000 + minor*100 + patch)
    const versionNumber = parts[0] * 10000 + parts[1] * 100 + parts[2];
    return { version: newVersion, versionNumber };
  }

  // Fallback
  return { version: `${currentVersion}.1`, versionNumber: 1 };
}

export async function checkAndUpdateDeploymentVersion(): Promise<void> {
  const deploymentId = process.env.DEPLOYMENT_ID || process.env.RENDER_SERVICE_ID;

  // Only run in production deployments
  if (!deploymentId) {
    console.log("[Auto-Version] Not a production deployment, skipping auto-version");
    return;
  }

  console.log(`[Auto-Version] Detected deployment: ${deploymentId}`);

  try {
    // Get the latest release to check current version and deployment ID
    const latestRelease = await storage.getLatestRelease();

    // Check if this deployment already has a release
    if (latestRelease?.notes?.includes(deploymentId)) {
      console.log("[Auto-Version] Release already exists for this deployment");
      return;
    }

    // Calculate new version
    const currentVersion = latestRelease?.version || APP_VERSION.full;
    const { version: newVersion, versionNumber } = incrementVersion(currentVersion);
    const newCodename = getRandomCodename();

    console.log(`[Auto-Version] Creating new release: ${newVersion} "${newCodename}"`);

    // Create a new published release using correct schema
    await storage.createRelease({
      version: newVersion,
      versionType: "stable",
      versionNumber: versionNumber,
      title: newCodename, // Use codename as title
      changelog: JSON.stringify([`Automated release from production deployment`]),
      highlights: JSON.stringify([`Deployment: ${deploymentId.substring(0, 8)}...`]),
      status: "published",
      notes: `Deployment ID: ${deploymentId}`,
      createdBy: "auto-deploy",
    });

    // Now publish it to set publishedAt timestamp
    const releases = await storage.getReleases();
    const newRelease = releases.find((r: { version: string; id: number }) => r.version === newVersion);
    if (newRelease) {
      await storage.publishRelease(newRelease.id);
    }

    console.log(`[Auto-Version] Successfully created and published release ${newVersion}`);

  } catch (error) {
    console.error("[Auto-Version] Failed to auto-update version:", error);
    // Don't crash the server if this fails
  }
}
