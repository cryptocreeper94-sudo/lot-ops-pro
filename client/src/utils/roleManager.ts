/**
 * Role Manager Utility
 * Handles role switching between van driver and inventory driver modes
 */

export type UserRole = 'driver' | 'inventory';

/**
 * Get the active role, checking override first, then falling back to canonical user role
 */
export function getActiveRole(): UserRole {
  // Check for override role first
  const overrideRole = localStorage.getItem('vanops_active_role');
  if (overrideRole === 'driver' || overrideRole === 'inventory') {
    return overrideRole;
  }

  // Fall back to canonical user role
  const userStr = localStorage.getItem('vanops_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role === 'driver' ? 'driver' : 'inventory';
    } catch (e) {
      console.error('Error parsing user data:', e);
      return 'inventory'; // Safe default
    }
  }

  return 'inventory'; // Default if no user found
}

/**
 * Get the user's canonical role (ignoring overrides)
 */
export function getCanonicalRole(): UserRole {
  const userStr = localStorage.getItem('vanops_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role === 'driver' ? 'driver' : 'inventory';
    } catch (e) {
      console.error('Error parsing user data:', e);
      return 'inventory';
    }
  }
  return 'inventory';
}

/**
 * Set the active role override and navigate to appropriate page
 * CRITICAL: Only allows role switching for users whose canonical role is 'driver'
 */
export function setActiveRole(role: UserRole, navigate: (path: string) => void): boolean {
  const canonicalRole = getCanonicalRole();
  
  // SECURITY: Only drivers can switch between van/inventory modes
  if (canonicalRole !== 'driver') {
    console.warn('Role switching denied: canonical role must be "driver"');
    return false;
  }
  
  localStorage.setItem('vanops_active_role', role);
  
  // Navigate to appropriate page
  if (role === 'driver') {
    navigate('/crew-manager');
  } else {
    navigate('/scanner');
  }
  
  return true;
}

/**
 * Clear the role override (return to canonical role)
 */
export function clearActiveRole(): void {
  localStorage.removeItem('vanops_active_role');
}

/**
 * Check if current role is an override (different from canonical)
 */
export function isRoleOverridden(): boolean {
  const activeRole = getActiveRole();
  const canonicalRole = getCanonicalRole();
  return activeRole !== canonicalRole;
}

/**
 * Get the full user role from storage (supervisor, operations_manager, driver, inventory_driver, developer)
 */
export function getFullUserRole(): string | null {
  const userStr = localStorage.getItem('vanops_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role || null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  return null;
}

/**
 * Check if user is in demo/sandbox mode
 */
export function isInSandboxMode(): boolean {
  return localStorage.getItem('vanops_demo_mode') === 'true';
}

/**
 * Check if user has supervisor or manager level access
 * Only supervisors, operations_managers, and developers can edit lot/lane/map configurations
 */
export function canEditConfiguration(): boolean {
  const role = getFullUserRole();
  const isSandbox = isInSandboxMode();
  
  // Sandbox mode = no real edits
  if (isSandbox) return false;
  
  // Only supervisors, operations managers, and developers can edit
  return role === 'supervisor' || role === 'operations_manager' || role === 'developer';
}

/**
 * Check if user can access live van locator map
 * Van drivers, supervisors, and operations managers need to locate lost crew members
 * Inventory drivers and temporary workers do NOT need this access
 */
export function canAccessVanLocator(): boolean {
  const role = getFullUserRole();
  const isSandbox = isInSandboxMode();
  
  // Allow sandbox viewing
  if (isSandbox) return true;
  
  // Van drivers, supervisors, operations managers, and developers can see live locations
  return role === 'driver' || role === 'supervisor' || role === 'operations_manager' || role === 'developer';
}
