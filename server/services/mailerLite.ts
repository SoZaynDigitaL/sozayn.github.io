/**
 * MailerLite API Integration Service
 * 
 * This service handles all interactions with the MailerLite API:
 * - Adding subscribers to groups
 * - Updating subscriber details
 * - Triggering automation workflows
 * 
 * Based on MailerLite API v2: https://developers.mailerlite.com/docs
 */

import axios from 'axios';
import { PlanType } from '@shared/plans';

// Base configuration for MailerLite API
const mailerliteClient = axios.create({
  baseURL: 'https://connect.mailerlite.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
  }
});

// Cache for group IDs to avoid repeated lookups
const groupIdCache: Record<string, string> = {};

/**
 * Get group ID by name, with caching
 * @param groupName Name of the group to find
 * @returns Group ID or null if not found
 */
export async function getGroupIdByName(groupName: string): Promise<string | null> {
  // Check cache first
  if (groupIdCache[groupName]) {
    return groupIdCache[groupName];
  }

  try {
    const response = await mailerliteClient.get('/groups');
    const groups = response.data.data;

    const group = groups.find((g: any) => g.name.toLowerCase() === groupName.toLowerCase());
    
    if (group) {
      // Store in cache for later use
      groupIdCache[groupName] = group.id;
      return group.id;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching MailerLite groups:', error);
    return null;
  }
}

/**
 * Add or update subscriber in MailerLite
 * @param email User email
 * @param name User name
 * @param plan User subscription plan
 * @param additionalFields Additional fields to include
 */
export async function addOrUpdateSubscriber(
  email: string, 
  name: string, 
  plan: PlanType,
  additionalFields: Record<string, any> = {}
): Promise<boolean> {
  try {
    // Prepare subscriber data
    const subscriberData = {
      email,
      fields: {
        name,
        plan,
        ...additionalFields
      },
      status: 'active'
    };

    // Add or update subscriber
    await mailerliteClient.post('/subscribers', subscriberData);

    try {
      // Get group ID for the plan
      const groupId = await getGroupIdByName(plan);
      
      // If group exists, add subscriber to group
      if (groupId) {
        await mailerliteClient.post(`/subscribers/${encodeURIComponent(email)}/groups/${groupId}`);
      } else {
        // For error management - first check if we need to create the group
        console.warn(`MailerLite group "${plan}" not found. Will continue without assigning to group.`);
        
        // Create a tag with the plan name instead since we can't add to the group
        await tagSubscriber(email, `plan-${plan}`);
      }
    } catch (groupError) {
      console.error(`Error assigning subscriber to MailerLite group "${plan}":`, groupError);
      // Continue with the subscription process even if group assignment fails
    }

    return true;
  } catch (error: any) {
    console.error('Error adding/updating MailerLite subscriber:', error?.response?.data || error.message || error);
    return false;
  }
}

/**
 * Add user to MailerLite with plan information
 * 
 * This is the main function to be called from user registration flow
 */
export async function addUserToMailerLite(
  email: string, 
  name: string, 
  plan: PlanType,
  businessName?: string
): Promise<boolean> {
  // Additional custom fields
  const additionalFields: Record<string, any> = {
    signed_up_at: new Date().toISOString(),
    business_name: businessName || ''
  };

  return addOrUpdateSubscriber(email, name, plan, additionalFields);
}

/**
 * Update user plan in MailerLite when they upgrade/downgrade
 */
export async function updateUserPlanInMailerLite(
  email: string, 
  name: string, 
  newPlan: PlanType
): Promise<boolean> {
  // Additional custom fields for plan change
  const additionalFields: Record<string, any> = {
    plan_updated_at: new Date().toISOString(),
    previous_plan: '' // Ideally would be filled with actual previous plan
  };

  return addOrUpdateSubscriber(email, name, newPlan, additionalFields);
}

/**
 * Trigger an automation workflow in MailerLite
 * @param email User email 
 * @param automationId ID of the automation to trigger
 */
export async function triggerAutomation(email: string, automationId: string): Promise<boolean> {
  try {
    // Note: This endpoint might differ based on how MailerLite structures their automation API
    await mailerliteClient.post(`/automations/${automationId}/trigger`, {
      email
    });
    
    return true;
  } catch (error) {
    console.error('Error triggering MailerLite automation:', error);
    return false;
  }
}

/**
 * Tag a subscriber in MailerLite
 * @param email User email
 * @param tag Tag to apply
 */
export async function tagSubscriber(email: string, tag: string): Promise<boolean> {
  try {
    await mailerliteClient.post(`/subscribers/${encodeURIComponent(email)}/tags`, {
      tags: [tag]
    });
    
    return true;
  } catch (error) {
    console.error('Error tagging MailerLite subscriber:', error);
    return false;
  }
}