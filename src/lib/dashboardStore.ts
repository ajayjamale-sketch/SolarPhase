// Shared Local Storage Database for SolarPhase Dashboard Mock State

export interface Lead {
  id: number;
  customer: string;
  size: string;
  location: string;
  date: string;
  budget: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  quotePrice?: string;
}

export interface Project {
  id: number;
  name: string;
  customer: string;
  status: 'Site Survey' | 'Design' | 'Permits' | 'Installation' | 'Commissioning' | 'Active';
  completion: number;
  date: string;
  technicianId?: string;
  checklist?: { label: string; done: boolean }[];
}

export interface ServiceRequest {
  id: number;
  customer: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  type: string;
  status: 'Open' | 'In Progress' | 'Completed';
  notes?: string;
  technician?: string;
  inspection?: {
    panelHealth: number;
    inverterReading: string;
    notes: string;
    completedAt?: string;
  };
  maintenanceChecklist?: { label: string; done: boolean }[];
  reportNotes?: string;
}

export interface LoanApplication {
  id: number;
  applicant: string;
  amount: number;
  creditScore: number;
  systemSize: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  isCommercial?: boolean;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Suspended';
}

export interface EnterpriseSite {
  id: number;
  name: string;
  generation: number;
  consumption: number;
  co2: number;
  status: 'Online' | 'Offline';
  appliedOptimizations?: string[];
}

export interface SolarAssessment {
  roofArea: string;
  shadeFactor: string;
  monthlyBill: string;
  score: number;
  size: string;
  savings: string;
  payback: string;
  panels: number;
  co2Offset: number;
}

// Keys
const LEADS_KEY = 'solarphase_mock_leads';
const PROJECTS_KEY = 'solarphase_mock_projects';
const REQUESTS_KEY = 'solarphase_mock_requests';
const LOANS_KEY = 'solarphase_mock_loans';
const ADMIN_USERS_KEY = 'solarphase_mock_users';
const SITES_KEY = 'solarphase_mock_sites';
const ASSESSMENTS_KEY = 'solarphase_mock_assessments';

// Initial Seed Data
const INITIAL_LEADS: Lead[] = [
  { id: 1, customer: 'James Franklin', size: '6.2 kW', location: 'Austin, TX', date: 'Jun 8, 2026', budget: '$14,000–$18,000', status: 'Pending' },
  { id: 2, customer: 'Maria Santos', size: '8.4 kW', location: 'Denver, CO', date: 'Jun 9, 2026', budget: '$18,000–$24,000', status: 'Pending' },
  { id: 3, customer: 'Robert Kim', size: '4.8 kW', location: 'Phoenix, AZ', date: 'Jun 10, 2026', budget: '$11,000–$14,000', status: 'Pending' },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Franklin Residence',
    customer: 'James Franklin',
    status: 'Installation',
    completion: 65,
    date: 'Jun 15',
    checklist: [
      { label: 'Panels mounted and secured', done: true },
      { label: 'Inverter connected', done: true },
      { label: 'Wiring completed and inspected', done: false },
      { label: 'Grid sync verification', done: false },
      { label: 'System test and commissioning', done: false }
    ]
  },
  {
    id: 2,
    name: 'Santos Commercial',
    customer: 'Maria Santos',
    status: 'Permits',
    completion: 30,
    date: 'Jun 22',
    checklist: [
      { label: 'Structural roof survey', done: true },
      { label: 'Electrical grid load analysis', done: true },
      { label: 'Permit application filing', done: false },
      { label: 'Environmental impact review', done: false }
    ]
  },
  {
    id: 3,
    name: 'Kim Residence',
    customer: 'Robert Kim',
    status: 'Site Survey',
    completion: 10,
    date: 'Jul 1',
    checklist: [
      { label: 'Drone photogrammetry', done: true },
      { label: 'Shading analysis reports', done: false },
      { label: 'Structural verification', done: false }
    ]
  },
];

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 1,
    customer: 'Paul Turner',
    location: 'San Jose, CA',
    priority: 'High',
    type: 'Inverter fault',
    status: 'Open',
    maintenanceChecklist: [
      { label: 'Diagnose inverter error code E30', done: false },
      { label: 'Check DC disconnect switch status', done: false },
      { label: 'Test AC output current and voltage', done: false },
      { label: 'Inspect firmware and update inverter parameters', done: false }
    ]
  },
  {
    id: 2,
    customer: 'Lisa Monroe',
    location: 'Oakland, CA',
    priority: 'Medium',
    type: 'Panel shading issue',
    status: 'Open',
    maintenanceChecklist: [
      { label: 'Assess shading from neighbor tree', done: false },
      { label: 'Run optimizer efficiency report', done: false },
      { label: 'Clean dirt and debris from affected cells', done: false }
    ]
  },
  {
    id: 3,
    customer: 'Tom Walsh',
    location: 'Fremont, CA',
    priority: 'Low',
    type: 'Annual service',
    status: 'In Progress',
    technician: 'Mike Torres',
    maintenanceChecklist: [
      { label: 'Clean solar panels (dry wipe)', done: true },
      { label: 'Check all wiring connections', done: true },
      { label: 'Verify inverter display readings', done: false },
      { label: 'Test battery connection (if applicable)', done: false },
      { label: 'Inspect mounting hardware', done: false },
    ]
  },
];

const INITIAL_LOANS: LoanApplication[] = [
  { id: 1, applicant: 'David Morrison', amount: 22000, creditScore: 748, systemSize: '8.4 kW', status: 'Pending', date: 'Jun 9' },
  { id: 2, applicant: 'Rachel Green', amount: 15000, creditScore: 692, systemSize: '5.6 kW', status: 'Pending', date: 'Jun 10' },
  { id: 3, applicant: 'Carlos Diaz', amount: 31000, creditScore: 803, systemSize: '11.2 kW', status: 'Approved', date: 'Jun 7' },
  { id: 4, applicant: 'Amy Chen', amount: 18500, creditScore: 621, systemSize: '6.8 kW', status: 'Rejected', date: 'Jun 6' },
];

const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: 1, name: 'Elena Morrison', email: 'elena@solarhome.com', role: 'Residential Customer', status: 'Active' },
  { id: 2, name: 'James Okafor', email: 'james@brightgrid.com', role: 'Solar Installer', status: 'Active' },
  { id: 3, name: 'Priya Nair', email: 'priya@greenfinance.io', role: 'Financing Partner', status: 'Active' },
  { id: 4, name: 'Carlos Reyes', email: 'carlos@solarcorp.com', role: 'Commercial Business', status: 'Suspended' },
  { id: 5, name: 'Sophie Laurent', email: 'sophie@techteam.io', role: 'Maintenance Technician', status: 'Active' },
  { id: 6, name: 'Marcus Wei', email: 'marcus@enterprise.com', role: 'Enterprise Energy Manager', status: 'Active' },
];

const INITIAL_SITES: EnterpriseSite[] = [
  { id: 1, name: 'HQ', generation: 142, consumption: 128, co2: 64, status: 'Online', appliedOptimizations: [] },
  { id: 2, name: 'Warehouse', generation: 89, consumption: 95, co2: 40, status: 'Online', appliedOptimizations: [] },
  { id: 3, name: 'Factory', generation: 235, consumption: 198, co2: 106, status: 'Online', appliedOptimizations: [] },
];

// Helper wrapper functions
function getStoredItem<T>(key: string, initial: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(val) as T;
  } catch {
    return initial;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Public API
export const db = {
  getLeads: (): Lead[] => getStoredItem<Lead[]>(LEADS_KEY, INITIAL_LEADS),
  saveLeads: (leads: Lead[]) => setStoredItem(LEADS_KEY, leads),
  addLead: (lead: Omit<Lead, 'id' | 'status'>) => {
    const leads = db.getLeads();
    const newLead: Lead = {
      ...lead,
      id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1,
      status: 'Pending'
    };
    leads.push(newLead);
    db.saveLeads(leads);
    return newLead;
  },

  getProjects: (): Project[] => getStoredItem<Project[]>(PROJECTS_KEY, INITIAL_PROJECTS),
  saveProjects: (projects: Project[]) => setStoredItem(PROJECTS_KEY, projects),
  addProject: (project: Omit<Project, 'id'>) => {
    const projects = db.getProjects();
    const newProj: Project = {
      ...project,
      id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
    };
    projects.push(newProj);
    db.saveProjects(projects);
    return newProj;
  },

  getServiceRequests: (): ServiceRequest[] => getStoredItem<ServiceRequest[]>(REQUESTS_KEY, INITIAL_REQUESTS),
  saveServiceRequests: (reqs: ServiceRequest[]) => setStoredItem(REQUESTS_KEY, reqs),
  addServiceRequest: (req: Omit<ServiceRequest, 'id' | 'status'>) => {
    const reqs = db.getServiceRequests();
    const newReq: ServiceRequest = {
      ...req,
      id: reqs.length > 0 ? Math.max(...reqs.map(r => r.id)) + 1 : 1,
      status: 'Open',
      maintenanceChecklist: [
        { label: 'Inspect onsite mechanical connections', done: false },
        { label: 'Verify electrical wiring safety', done: false },
        { label: 'Benchmark system generation against model parameters', done: false }
      ]
    };
    reqs.push(newReq);
    db.saveServiceRequests(reqs);
    return newReq;
  },

  getLoanApplications: (): LoanApplication[] => getStoredItem<LoanApplication[]>(LOANS_KEY, INITIAL_LOANS),
  saveLoanApplications: (apps: LoanApplication[]) => setStoredItem(LOANS_KEY, apps),
  addLoanApplication: (app: Omit<LoanApplication, 'id' | 'status' | 'date'>) => {
    const apps = db.getLoanApplications();
    const newApp: LoanApplication = {
      ...app,
      id: apps.length > 0 ? Math.max(...apps.map(a => a.id)) + 1 : 1,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    apps.push(newApp);
    db.saveLoanApplications(apps);
    return newApp;
  },

  getAdminUsers: (): AdminUser[] => getStoredItem<AdminUser[]>(ADMIN_USERS_KEY, INITIAL_ADMIN_USERS),
  saveAdminUsers: (users: AdminUser[]) => setStoredItem(ADMIN_USERS_KEY, users),
  addAdminUser: (user: Omit<AdminUser, 'id' | 'status'>) => {
    const users = db.getAdminUsers();
    const newUser: AdminUser = {
      ...user,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      status: 'Active'
    };
    users.push(newUser);
    db.saveAdminUsers(users);
    return newUser;
  },

  getSites: (): EnterpriseSite[] => getStoredItem<EnterpriseSite[]>(SITES_KEY, INITIAL_SITES),
  saveSites: (sites: EnterpriseSite[]) => setStoredItem(SITES_KEY, sites),
  addSite: (site: Omit<EnterpriseSite, 'id' | 'status' | 'appliedOptimizations'>) => {
    const sites = db.getSites();
    const newSite: EnterpriseSite = {
      ...site,
      id: sites.length > 0 ? Math.max(...sites.map(s => s.id)) + 1 : 1,
      status: 'Online',
      appliedOptimizations: []
    };
    sites.push(newSite);
    db.saveSites(sites);
    return newSite;
  },

  getAssessments: (): Record<string, SolarAssessment> => getStoredItem<Record<string, SolarAssessment>>(ASSESSMENTS_KEY, {}),
  saveAssessments: (assessments: Record<string, SolarAssessment>) => setStoredItem(ASSESSMENTS_KEY, assessments),
  getAssessmentForUser: (email: string): SolarAssessment | null => {
    const assessments = db.getAssessments();
    return assessments[email.toLowerCase()] || null;
  },
  saveAssessmentForUser: (email: string, assessment: SolarAssessment) => {
    const assessments = db.getAssessments();
    assessments[email.toLowerCase()] = assessment;
    db.saveAssessments(assessments);
  }
};
