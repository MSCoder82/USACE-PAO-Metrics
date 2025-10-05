import React from 'react';

export enum EntryType {
  OUTPUT = 'Output',
  OUTTAKE = 'Outtake',
  OUTCOME = 'Outcome',
}

export interface Team {
  id: number;
  name: string;
}

export interface KpiDataPoint {
  id: number;
  date: string; // ISO 8601 format: "YYYY-MM-DD"
  type: EntryType;
  metric: string;
  quantity: number;
  notes?: string;
  campaignId?: number;
  link?: string;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export type View = 'dashboard' | 'table' | 'data-entry' | 'plan-builder' | 'campaigns' | 'profile';

export type Role = 'chief' | 'staff';

export interface Profile {
    role: Role;
    teamId: number;
    teamName: string;
    avatarUrl?: string;
}

// Fix: Changed icon type to React.ComponentType to resolve "Cannot find namespace 'JSX'" error. This requires importing React.
export interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}