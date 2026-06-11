import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle, DollarSign, TrendingUp, BarChart2, Download,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Sparkles, Search, ArrowRight,
  Shield, Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';
import { db, LoanApplication } from '@/lib/dashboardStore';

export default function FinancingDashboard({ view }: { view: string }) {
  const navigate = useNavigate();

  // Shared synchronized database state
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [ledgerSearch, setLedgerSearch] = useState('');

  const syncData = () => {
    setApplications(db.getLoanApplications());
  };

  useEffect(() => {
    syncData();
  }, [view]);

  // Approve loan and auto-redirect
  const handleApproveLoan = (id: number) => {
    const allLoans = db.getLoanApplications();
    const updated = allLoans.map(app => {
      if (app.id === id) {
        return { ...app, status: 'Approved' as const };
      }
      return app;
    });

    db.saveLoanApplications(updated);
    setApplications(updated);
    toast.success(`Loan application #${id} approved! Redirecting to Approved facilities...`);
    
    // Guided redirect
    setTimeout(() => {
      navigate('/dashboard/approved');
    }, 500);
  };

  // Reject loan
  const handleRejectLoan = (id: number) => {
    const allLoans = db.getLoanApplications();
    const updated = allLoans.map(app => {
      if (app.id === id) {
        return { ...app, status: 'Rejected' as const };
      }
      return app;
    });

    db.saveLoanApplications(updated);
    setApplications(updated);
    toast.info(`Loan application #${id} declined.`);
  };

  // Simulation Helper for new loan requests
  const simulateCustomerLoan = () => {
    const names = ['Jennifer Lawrence', 'Matthew McConaughey', 'Kate Winslet', 'SunCorp Logistics'];
    const amounts = [18200, 24500, 14000, 280000];
    const creditScores = [742, 790, 655, 810];
    const systemSizes = ['6.8 kW', '9.6 kW', '5.2 kW', '320 kWp'];
    const isCommercials = [false, false, false, true];

    const randomIdx = Math.floor(Math.random() * names.length);
    const app = db.addLoanApplication({
      applicant: names[randomIdx],
      amount: amounts[randomIdx],
      creditScore: creditScores[randomIdx],
      systemSize: systemSizes[randomIdx],
      isCommercial: isCommercials[randomIdx]
    });

    syncData();
    toast.success(`Simulation: New credit application submitted by ${app.applicant} for $${app.amount.toLocaleString()}!`);
  };

  // Download financing report file
  const handleDownloadReport = (title: string, fileType: string) => {
    toast.info(`Synthesizing financial reports for ${title}...`);
    setTimeout(() => {
      const activeTotal = applications.filter(a => a.status === 'Approved').reduce((acc, a) => acc + a.amount, 0);
      const pendingTotal = applications.filter(a => a.status === 'Pending').reduce((acc, a) => acc + a.amount, 0);

      const reportContent = `SOLARPHASE PORTFOLIO FINANCIAL REPORT\n` +
        `=======================================\n` +
        `Report Type: ${title}\n` +
        `Generated At: ${new Date().toLocaleString()}\n` +
        `---------------------------------------\n` +
        `Metrics Overview:\n` +
        `- Total Capital Approved: $${activeTotal.toLocaleString()}\n` +
        `- Total Capital Pending: $${pendingTotal.toLocaleString()}\n` +
        `- Active Accounts Count: ${applications.length}\n` +
        `- Default Ratio: 1.4% (Nominal)\n` +
        `- Weighted Avg. Borrow Credit Score: 735 FICO\n` +
        `=======================================\n` +
        `Confidential Partner Document. Transmitted via TLS.`;

      const element = document.createElement("a");
      const file = new Blob([reportContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${title.replace(/\s+/g, '_')}.${fileType.toLowerCase()}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Report file download completed.');
    }, 800);
  };

  // Sub-metrics arrays
  const pendingApps = applications.filter(a => a.status === 'Pending');
  const approvedApps = applications.filter(a => a.status === 'Approved');

  // Search Filter
  const filteredApproved = approvedApps.filter(a => 
    a.applicant.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
    a.systemSize.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
    a.id.toString().includes(ledgerSearch)
  );

  // Dynamic Chart Datasets
  const paymentData = [
    { month: 'Jan', scheduled: 42000, received: 42000 },
    { month: 'Feb', scheduled: 44000, received: 43200 },
    { month: 'Mar', scheduled: 46000, received: 45800 },
    { month: 'Apr', scheduled: 48000, received: 47100 },
    { month: 'May', scheduled: 50000, received: 50000 },
    { month: 'Jun', scheduled: 52000, received: 51600 },
  ];

  const scoreTiersData = [
    { name: 'Subprime (<680)', volume: applications.filter(a => a.creditScore < 680).length },
    { name: 'Prime (680-740)', volume: applications.filter(a => a.creditScore >= 680 && a.creditScore < 740).length },
    { name: 'Super-Prime (740+)', volume: applications.filter(a => a.creditScore >= 740).length },
  ];

  const disbursementGrowthData = [
    { month: 'Jan', amount: 140000 },
    { month: 'Feb', amount: 175000 },
    { month: 'Mar', amount: 190000 },
    { month: 'Apr', amount: 260000 },
    { month: 'May', amount: 285000 },
    { month: 'Jun', amount: approvedApps.reduce((acc, a) => acc + a.amount, 0) + 120000 },
  ];

  const transactionHistory = [
    { id: 'TX-PAY-984', borrower: 'David Morrison', amount: 242, status: 'Settled', date: 'Jun 10, 2026' },
    { id: 'TX-PAY-983', borrower: 'Carlos Diaz', amount: 410, status: 'Settled', date: 'Jun 8, 2026' },
    { id: 'TX-PAY-982', borrower: 'Rachel Green', amount: 185, status: 'Settled', date: 'Jun 7, 2026' },
    { id: 'TX-PAY-981', borrower: 'Santos Commercial', amount: 1240, status: 'Settled', date: 'Jun 5, 2026' },
  ];

  // 1. VIEW: LOAN APPLICATIONS
  if (view === 'applications') return (
    <div className="space-y-4 max-w-5xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-lg mb-1">Process Underwriting Applications</h2>
          <p className="text-xs text-muted-foreground">Review consumer debt levels and credit profiles to approve solar panel hardware loans.</p>
        </div>
        <button
          onClick={simulateCustomerLoan}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulate Loan Request
        </button>
      </div>

      <div className="space-y-3">
        {pendingApps.map(app => (
          <div key={app.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold">Applicant</p>
                  <p className="font-bold text-sm text-foreground mt-0.5">{app.applicant}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold">Requested Amount</p>
                  <p className="font-extrabold text-sm text-primary mt-0.5">${app.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold">Credit Standing</p>
                  <p className={`font-bold text-sm mt-0.5 ${app.creditScore >= 740 ? 'text-accent' : app.creditScore >= 680 ? 'text-yellow-600' : 'text-destructive'}`}>
                    FICO {app.creditScore}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold">Proposed Capacity</p>
                  <p className="font-semibold text-sm text-foreground mt-0.5">{app.systemSize}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 justify-between sm:justify-end flex-shrink-0">
                <button
                  onClick={() => handleApproveLoan(app.id)}
                  className="px-4 py-2 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 text-xs shadow-sm transition-colors"
                >
                  Approve Loan
                </button>
                <button
                  onClick={() => handleRejectLoan(app.id)}
                  className="px-4 py-2 bg-muted border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 text-muted-foreground rounded-xl text-xs font-semibold transition-colors"
                >
                  Reject File
                </button>
              </div>
            </div>
          </div>
        ))}

        {pendingApps.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <CheckCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-bold text-sm">Applications clear</p>
            <p className="text-xs text-muted-foreground mt-1">Underwriting queue is empty. Click "Simulate Loan Request" to audit files.</p>
          </div>
        )}
      </div>
    </div>
  );

  // 2. VIEW: APPROVED LOANS
  if (view === 'approved') return (
    <div className="space-y-4 max-w-5xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="font-bold text-lg mb-1">Funded Disbursements</h2>
          <p className="text-xs text-muted-foreground">List of approved credit facilities. Tracking escrow releases to solar installers.</p>
        </div>
        <div className="relative w-full sm:max-w-xs flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={ledgerSearch}
            onChange={e => setLedgerSearch(e.target.value)}
            placeholder="Search disbursements ledger..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredApproved.map(app => (
          <div key={app.id} className="bg-card border border-accent/20 bg-accent/5 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground text-sm">{app.applicant}</p>
                <span className="text-[9px] font-bold bg-accent/25 text-accent border border-accent/30 px-2 py-0.5 rounded uppercase flex items-center gap-0.5"><Check className="w-3 h-3" /> Escrow Disbursed</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Contract value: <span className="font-semibold text-foreground">${app.amount.toLocaleString()}</span> · Capacity: {app.systemSize} · Date: {app.date || 'Today'}</p>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="text-muted-foreground block text-[10px] font-semibold">Wire Transaction Token</span>
              <span className="font-mono text-primary font-bold">TXN-SOL-${app.id}93821</span>
            </div>
          </div>
        ))}

        {filteredApproved.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-bold text-sm">No funded loans match criteria</p>
            <p className="text-xs text-muted-foreground mt-1">Approve pending applications to initiate financing disbursements.</p>
          </div>
        )}
      </div>
    </div>
  );

  // 3. VIEW: TRACK PAYMENTS
  if (view === 'payments') return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-2">Loan Collection Amortization</h2>
        <p className="text-xs text-muted-foreground mb-6">Compare monthly scheduled principal and interest payments against cleared funds.</p>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={paymentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Bar dataKey="scheduled" fill="#2563EB" radius={[4, 4, 0, 0]} name="Scheduled Collections ($)" />
            <Bar dataKey="received" fill="#16A34A" radius={[4, 4, 0, 0]} name="Cleared Receipts ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Payment Receipts List */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-sm mb-4">Cleared Customer Installments Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border pb-2 text-muted-foreground font-semibold">
                <th className="py-2">Receipt Token</th>
                <th className="py-2">Client / Account</th>
                <th className="py-2">Settlement Date</th>
                <th className="py-2">Paid Installment</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactionHistory.map((t, idx) => (
                <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-mono font-bold text-foreground">{t.id}</td>
                  <td className="py-3 font-semibold text-foreground">{t.borrower}</td>
                  <td className="py-3 text-muted-foreground">{t.date}</td>
                  <td className="py-3 font-extrabold text-primary">${t.amount.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-accent/15 text-accent border border-accent/25">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 4. VIEW: GENERATE REPORTS
  if (view === 'reports') return (
    <div className="max-w-xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <h2 className="font-bold text-lg">Financing Ledger Exports</h2>
          <p className="text-xs text-muted-foreground">Download risk analysis charts and portfolio ledger sheets.</p>
        </div>

        <div className="space-y-3">
          {[
            { title: 'Monthly Portfolio Summary', desc: 'Summary of active facilities, disbursements, and yields.', type: 'XLSX' },
            { title: 'Default Rate Analysis', desc: 'Credit risk metrics and late-payment default tracking.', type: 'PDF' },
            { title: 'Lending Capital Ledger', desc: 'Audit record of credit approvals and capital positions.', type: 'XLSX' },
          ].map((r, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-muted border border-border rounded-xl text-xs">
              <div>
                <p className="font-bold text-foreground">{r.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
              </div>
              <button
                onClick={() => handleDownloadReport(r.title, r.type)}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download {r.type}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 5. DEFAULT VIEW: OVERVIEW
  return (
    <div className="space-y-6">
      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Pending Files', value: `${pendingApps.length}`, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Approved Facilities', value: `${approvedApps.length}`, icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Portfolio Assets YTD', value: `$${(2480000 + approvedApps.reduce((acc, a) => acc + a.amount, 0)).toLocaleString()}`, icon: DollarSign, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Repayment Performance', value: '98.4%', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Score Distribution Bar Chart */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Lending Distribution (Credit Score Tier)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreTiersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
              <Bar dataKey="volume" fill="#2563EB" radius={[4, 4, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side: Disbursement growth area chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Capital Disbursement Expansion</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={disbursementGrowthData}>
              <defs>
                <linearGradient id="disbursementGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
              <Area type="monotone" dataKey="amount" stroke="#16A34A" strokeWidth={2} fill="url(#disbursementGrowthGrad)" name="Disbursed Capital ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Underwriting quick summary list */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-sm mb-4">Underwriting Queue Quick Actions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border pb-2 text-muted-foreground font-semibold">
                <th className="py-2">Applicant</th>
                <th className="py-2">FICO Standing</th>
                <th className="py-2">Hardware Size</th>
                <th className="py-2">Amount Requested</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApps.map((app, idx) => (
                <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-bold text-foreground">{app.applicant}</td>
                  <td className="py-3 font-semibold">
                    <span className={app.creditScore >= 740 ? 'text-accent' : app.creditScore >= 680 ? 'text-yellow-600' : 'text-destructive'}>
                      FICO {app.creditScore}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{app.systemSize}</td>
                  <td className="py-3 font-extrabold text-primary">${app.amount.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() => handleApproveLoan(app.id)}
                        className="px-2 py-1 bg-accent text-white rounded font-bold hover:bg-accent/90 transition-colors text-[10px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectLoan(app.id)}
                        className="px-2 py-1 bg-muted text-muted-foreground border border-border rounded font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors text-[10px]"
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingApps.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground italic">No pending applications. All underwriting files are clear.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
