export type RoleCode =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'ACCOUNTANT'
  | 'SALES_EXEC'
  | 'RTO_STAFF'
  | 'INSURANCE_STAFF';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: RoleCode;
  designation: string;
  avatarText: string;
}

export interface RoleConfig {
  code: RoleCode;
  label: string;
  description: string;
  allowedSections: string[];
  deniedSections: string[];
}

export const ROLE_CONFIGS: Record<RoleCode, RoleConfig> = {
  SUPER_ADMIN: {
    code: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Full root access to all dealership modules, financial settings, staff roster, and audit logs.',
    allowedSections: [
      'overview',
      'inventory',
      'stock_inward',
      'sales',
      'bookings',
      'payments',
      'refunds',
      'invoices',
      'finance',
      'rto',
      'settings',
      'staff',
      'audit_logs',
      'reports',
      'calls',
      'pricing',
      'offers',
    ],
    deniedSections: [],
  },
  OWNER: {
    code: 'OWNER',
    label: 'Dealership Owner',
    description: 'Executive governance, financial health, sales performance, and audit oversight.',
    allowedSections: [
      'overview',
      'inventory',
      'stock_inward',
      'sales',
      'bookings',
      'payments',
      'refunds',
      'invoices',
      'finance',
      'rto',
      'settings',
      'staff',
      'audit_logs',
      'reports',
      'calls',
      'pricing',
      'offers',
    ],
    deniedSections: [],
  },
  MANAGER: {
    code: 'MANAGER',
    label: 'General Manager',
    description: 'Operational control over stock, bookings, sales completion, staff tasks, and customer escalations.',
    allowedSections: [
      'overview',
      'inventory',
      'stock_inward',
      'sales',
      'bookings',
      'payments',
      'refunds',
      'invoices',
      'finance',
      'rto',
      'staff',
      'reports',
      'calls',
      'pricing',
      'offers',
    ],
    deniedSections: ['settings'], // Master GSTIN / banking settings locked to Owner / Super Admin
  },
  ACCOUNTANT: {
    code: 'ACCOUNTANT',
    label: 'Accountant / Finance Officer',
    description: 'Sole authority to approve refunds, verify payment receipts, manage GST invoices, and reconcile ledgers.',
    allowedSections: [
      'overview',
      'sales',
      'payments',
      'refunds',
      'invoices',
      'finance',
      'settings',
      'reports',
      'calls',
    ],
    deniedSections: ['inventory', 'stock_inward', 'staff'],
  },
  SALES_EXEC: {
    code: 'SALES_EXEC',
    label: 'Sales Executive',
    description: 'Frontline customer engagement: leads, test rides, quotations, new bookings, and sales delivery.',
    allowedSections: [
      'overview',
      'inventory',
      'bookings',
      'sales',
      'test_rides',
      'leads',
      'calls',
    ],
    deniedSections: [
      'settings',
      'staff',
      'refunds', // Can request, but strictly cannot view full ledger or approve
      'invoices',
      'audit_logs',
      'reports',
    ],
  },
  RTO_STAFF: {
    code: 'RTO_STAFF',
    label: 'RTO & Registration Officer',
    description: 'Specialist managing MH-04 Thane RTO documentation, HSRP number plates, and Form 20 submissions.',
    allowedSections: ['overview', 'inventory', 'rto'],
    deniedSections: ['settings', 'staff', 'refunds', 'payments', 'reports'],
  },
  INSURANCE_STAFF: {
    code: 'INSURANCE_STAFF',
    label: 'Insurance Desk Lead',
    description: 'Specialist handling IRDAI 1+5 comprehensive motorcycle insurance policies and endorsements.',
    allowedSections: ['overview', 'finance', 'bookings'],
    deniedSections: ['settings', 'staff', 'refunds', 'payments', 'inventory'],
  },
};

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-001',
    name: 'Vaibhav Sonkusre',
    email: 'vaibhav.admin@thebikeyard.in',
    role: 'SUPER_ADMIN',
    designation: 'Principal Dealership Administrator',
    avatarText: 'VS',
  },
  {
    id: 'user-002',
    name: 'Amit Verma',
    email: 'amit.verma@thebikeyard.in',
    role: 'MANAGER',
    designation: 'General Operations Manager',
    avatarText: 'AV',
  },
  {
    id: 'user-003',
    name: 'Rajesh Gokhale',
    email: 'rajesh.gokhale@thebikeyard.in',
    role: 'ACCOUNTANT',
    designation: 'Chief Dealership Accountant',
    avatarText: 'RG',
  },
  {
    id: 'user-004',
    name: 'Suraj Patil',
    email: 'suraj.patil@thebikeyard.in',
    role: 'SALES_EXEC',
    designation: 'Senior Sales Executive',
    avatarText: 'SP',
  },
];

export function canUserAccessSection(role: RoleCode, section: string): boolean {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  if (config.deniedSections.includes(section)) return false;
  return config.allowedSections.includes(section);
}

export function canApproveRefund(role: RoleCode, requesterName: string, approverName: string): {
  allowed: boolean;
  reason?: string;
} {
  // 1. Role requirement: Only Super Admin, Owner, Manager, or Accountant can approve
  if (!['SUPER_ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT'].includes(role)) {
    return {
      allowed: false,
      reason: 'Role restricted: Only Accountants or Managers can authorize financial refunds.',
    };
  }

  // 2. Separation of duties: Requester cannot self-approve
  if (requesterName.trim().toLowerCase() === approverName.trim().toLowerCase()) {
    return {
      allowed: false,
      reason: 'Separation of duties violation: Requester cannot approve their own refund.',
    };
  }

  return { allowed: true };
}
