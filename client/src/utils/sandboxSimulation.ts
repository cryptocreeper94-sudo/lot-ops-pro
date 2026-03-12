// Sandbox Simulation Engine
// Simulates drivers, messages, and events in sandbox mode

export function isSandboxMode(): boolean {
  return localStorage.getItem("vanops_demo_mode") === "true";
}

export function getSimulatedDrivers() {
  return [
    { id: "D001", name: "Simulated Driver Alpha", status: "driving", lat: 36.0726, lng: -86.7845, location: "Lot 515" },
    { id: "D002", name: "Simulated Driver Beta", status: "parked", lat: 36.0730, lng: -86.7850, location: "Lot 516" },
    { id: "D003", name: "Simulated Driver Gamma", status: "driving", lat: 36.0720, lng: -86.7840, location: "Lot 502" },
  ];
}

export function getSimulatedMessages() {
  return [
    {
      id: "msg-1",
      fromName: "Simulated Driver Alpha",
      fromId: "D001",
      content: "I've moved 3 cars to Lot 513 so far today",
      timestamp: new Date(Date.now() - 5 * 60000),
      isRead: false,
    },
    {
      id: "msg-2",
      fromName: "Simulated Driver Beta",
      fromId: "D002",
      content: "Ready for next assignment",
      timestamp: new Date(Date.now() - 10 * 60000),
      isRead: false,
    },
    {
      id: "msg-3",
      fromName: "Simulated Driver Gamma",
      fromId: "D003",
      content: "Vehicle at Lot 502 is inoperable - needs repair",
      timestamp: new Date(Date.now() - 15 * 60000),
      isRead: true,
    },
  ];
}

// Simulate driver responses
export function getSimulatedAutoResponse(message: string): string {
  const responses = [
    "✅ Message received and understood. On it!",
    "👍 Got it. Moving to that location now.",
    "🚗 Confirmed. I'm heading there now.",
    "✔️ Copy that. Starting the move.",
    "📍 Message received. ETA 5 minutes.",
    "👀 Reading now. Will proceed immediately.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Simulate GPS movement
export function simulateDriverMovement(driverId: string) {
  const drivers = getSimulatedDrivers();
  const driver = drivers.find((d) => d.id === driverId);

  if (!driver) return null;

  // Add small random movement (±0.0005 degrees)
  return {
    ...driver,
    lat: driver.lat + (Math.random() - 0.5) * 0.001,
    lng: driver.lng + (Math.random() - 0.5) * 0.001,
  };
}

// Get workflow tips based on page
export function getWorkflowTips(role: string, page: string): string[] {
  const tips: Record<string, Record<string, string[]>> = {
    driver: {
      scanner: [
        "💡 Scan multiple cars to see how the system processes them",
        "💡 Try navigating to a location - the map shows your route",
        "💡 Send messages to supervisors to see how communication works",
      ],
      "crew-manager": [
        "💡 Select a van to start your shift",
        "💡 View your performance metrics as you complete moves",
        "💡 Take breaks and see how they're tracked",
      ],
    },
    supervisor: {
      "resource-allocation": [
        "💡 Create work orders by scanning car tickets",
        "💡 Assign work to drivers and watch them move in real-time",
        "💡 Monitor driver performance on the analytics dashboard",
      ],
    },
    operations_manager: {
      "operations-manager": [
        "💡 Configure facilities and lanes for your operation",
        "💡 Manage all employees and their roles",
        "💡 View comprehensive system analytics and reports",
      ],
    },
  };

  return tips[role]?.[page] || [];
}
