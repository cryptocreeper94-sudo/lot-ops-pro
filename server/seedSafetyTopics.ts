import { db } from "./db";
import { safetyTopics } from "@shared/schema";

const topics = [
  {
    category: "ppe",
    title: "Proper Safety Vest Usage",
    content: "Safety vests are required PPE for all lot operations. High-visibility vests ensure you're visible to other drivers and equipment operators at all times. Reflective strips must be clean and intact. Replace damaged vests immediately.",
    bulletPoints: ["Always wear high-vis safety vest", "Reflective strips must be visible", "Replace if torn or faded", "Keep vest clean for maximum visibility"],
    suggestedFrequency: "monthly",
    createdBy: "system"
  },
  {
    category: "speeding",
    title: "15 MPH Speed Limit Reminder",
    content: "Our facility has a strict 15 MPH speed limit for all vehicles. Speeding creates serious safety hazards in our busy lot environment. Vehicles, pedestrians, and equipment are constantly moving. Slow down, stay alert, and arrive safely.",
    bulletPoints: ["15 MPH maximum speed", "Watch for pedestrians and other drivers", "Extra caution in high-traffic areas", "Violations are tracked and reported"],
    suggestedFrequency: "weekly",
    createdBy: "system"
  },
  {
    category: "weather",
    title: "Cold Weather Safety",
    content: "Cold weather requires extra precautions. Dress in layers, take warming breaks as needed, and watch for icy conditions. Hypothermia and frostbite can happen quickly. Stay dry, stay warm, and communicate if you need a break.",
    bulletPoints: ["Dress in warm layers", "Take warming breaks every hour", "Watch for ice on walkways", "Report unsafe conditions immediately"],
    suggestedFrequency: "as_needed",
    createdBy: "system"
  },
  {
    category: "weather",
    title: "Hot Weather & Heat Safety",
    content: "Heat exhaustion and heat stroke are serious risks during summer months. Stay hydrated, take cooling breaks in shade or AC, and watch for signs of heat illness in yourself and coworkers. Don't push through dizziness or nausea.",
    bulletPoints: ["Drink water every 15-20 minutes", "Take cooling breaks frequently", "Watch for heat exhaustion symptoms", "Buddy system - check on each other"],
    suggestedFrequency: "as_needed",
    createdBy: "system"
  },
  {
    category: "vehicle_safety",
    title: "Three Points of Contact",
    content: "Always use three points of contact when entering or exiting vehicles. This means keeping three limbs in contact with the vehicle at all times - two hands and one foot, or two feet and one hand. This prevents slips and falls.",
    bulletPoints: ["Use handholds and steps properly", "Never jump down from vehicles", "Keep three points of contact", "Report damaged steps or handholds"],
    suggestedFrequency: "monthly",
    createdBy: "system"
  },
  {
    category: "vehicle_safety",
    title: "Backing Safety & Awareness",
    content: "Most lot accidents happen when backing. Always check mirrors and blind spots before backing. Ask a coworker to help watch if needed. Back slowly and be ready to stop. If you can't see clearly, get out and look.",
    bulletPoints: ["Check all mirrors before backing", "Back slowly with caution", "Ask for help if visibility is limited", "When in doubt, get out and look"],
    suggestedFrequency: "weekly",
    createdBy: "system"
  },
  {
    category: "emergency_procedures",
    title: "Emergency Situations & Communication",
    content: "In an emergency, safety comes first. Know the emergency contact numbers and procedures. Report all accidents, injuries, and near-misses immediately. Don't try to handle emergencies alone - call for help.",
    bulletPoints: ["Safety first in all situations", "Report incidents immediately", "Know emergency contact numbers", "Don't handle emergencies alone"],
    suggestedFrequency: "monthly",
    createdBy: "system"
  },
  {
    category: "emergency_procedures",
    title: "Severe Weather Protocol",
    content: "When severe weather alerts are issued, follow supervisor instructions immediately. Seek shelter in designated safe areas. Do not try to finish tasks during tornado warnings. Your life is more important than any vehicle move.",
    bulletPoints: ["Follow supervisor emergency instructions", "Know shelter locations", "Monitor weather alerts", "Safety over productivity always"],
    suggestedFrequency: "as_needed",
    createdBy: "system"
  },
  {
    category: "general_safety",
    title: "Situational Awareness",
    content: "Stay alert and aware of your surroundings at all times. Watch for moving vehicles, other workers, and changing conditions. Avoid distractions like phones while driving. If you're tired or distracted, take a break.",
    bulletPoints: ["Keep eyes on surroundings", "Watch for other drivers and pedestrians", "No phone use while driving", "Take breaks when tired"],
    suggestedFrequency: "weekly",
    createdBy: "system"
  },
  {
    category: "ppe",
    title: "Gloves & Hand Protection",
    content: "Protect your hands when handling vehicles and equipment. Wear gloves when needed for grip and protection. Watch for sharp edges, hot surfaces, and pinch points. Report hand injuries immediately - even small cuts can become infected.",
    bulletPoints: ["Wear gloves when handling vehicles", "Watch for sharp edges and pinch points", "Report all hand injuries", "Keep gloves clean and in good condition"],
    suggestedFrequency: "monthly",
    createdBy: "system"
  }
];

export async function seedSafetyTopics() {
  try {
    console.log("Seeding safety topics...");
    
    for (const topic of topics) {
      await db.insert(safetyTopics).values(topic).onConflictDoNothing();
    }
    
    console.log(`✓ Seeded ${topics.length} safety topics successfully`);
  } catch (error) {
    console.error("Error seeding safety topics:", error);
  }
}

// Run if executed directly
seedSafetyTopics().then(() => process.exit(0));
