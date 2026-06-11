export type UserRole =
  | 'Residential Customer'
  | 'Commercial Business'
  | 'Solar Installer'
  | 'Maintenance Technician'
  | 'Financing Partner'
  | 'Enterprise Energy Manager'
  | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  avatar?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface EnergyDataPoint {
  date: string;
  generation: number;
  consumption: number;
  export: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: string;
  dismissed: boolean;
}

export interface DashboardStats {
  todayGeneration: number;
  co2Saved: number;
  moneySaved: number;
  systemHealth: number;
}

export interface Lead {
  id: string;
  customer: string;
  systemSize: string;
  location: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  date: string;
  budget: string;
}

export interface Project {
  id: string;
  name: string;
  customer: string;
  status: 'Site Survey' | 'Design' | 'Permits' | 'Installation' | 'Commissioning' | 'Active';
  completion: number;
  startDate: string;
  installer?: string;
}

export interface LoanApplication {
  id: string;
  applicant: string;
  amount: number;
  creditScore: number;
  systemSize: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}
