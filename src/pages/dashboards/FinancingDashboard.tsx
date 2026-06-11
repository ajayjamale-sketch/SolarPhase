import { useState, useEffect } from 'react';
import {
  FileText, CheckCircle, DollarSign, TrendingUp, BarChart2, Download,
  CheckCircle2, XCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { db, LoanApplication } from '@/lib/dashboardStore';

export default function FinancingDashboard({ view }: { view: string }) {
  // Shared state
  const [applications, setApplications] = useState<LoanApplication[]>([]);

  useEffect(() => {
    // Load loan applications
    setApplications(db.getLoanApplications());
  }, [view]);

  // Approve loan
  const handleApproveLoan = (id: number) => {
    const updated = applications.map(app => {
      if (app.id === id) {
        return { ...app, status: 'Approved' as const };
      }
      return app;
    });

    db.saveLoanApplications(updated);
    setApplications(updated);
    toast.success(`Loan application #${id} approved! Client notified to sign contract.`);
  };

  // Reject loan
  const handleRejectLoan = (id: number) => {
    const updated = applications.map(app => {
      if (app.id === id) {
        return { ...app, status: 'Rejected' as const };
      }
      return app;
    });

    db.saveLoanApplications(updated);
    setApplications(updated);
    toast.info(`Loan application #${id} declined.`);
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

  const paymentData = [
    { month: 'Jan', scheduled: 42000, received: 42000 },
    { month: 'Feb', scheduled: 44000, received: 43200 },
    { month: 'Mar', scheduled: 46000, received: 45800 },
    { month: 'Apr', scheduled: 48000, received: 47100 },
    { month: 'May', scheduled: 50000, received: 50000 },
    { month: 'Jun', scheduled: 52000, received: 51600 },
  ];

  const pendingApps = applications.filter(a => a.status === 'Pending');
  const approvedApps = applications.filter(a => a.status === 'Approved');

  // 1. VIEW: LOAN APPLICATIONS
  if (view === 'applications') return (
    <div className="space-y-4 max-w-5xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-1">Process Underwriting Applications</h2>
        <p className="text-xs text-muted-foreground">Review consumer debt levels and credit profiles to approve solar panel hardware loans.</p>
      </div>

      <div className="space-y-3">
        {pendingApps.map(app => (
          <div key={app.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Applicant</p>
                  <p className="font-bold text-sm text-foreground mt-0.5">{app.applicant}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Requested Amount</p>
                  <p className="font-extrabold text-sm text-primary mt-0.5">${app.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Credit Standing</p>
                  <p className={`font-bold text-sm mt-0.5 ${app.creditScore >= 740 ? 'text-accent' : app.creditScore >= 680 ? 'text-yellow-600' : 'text-destructive'}`}>
                    FICO {app.creditScore}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Proposed Capacity</p>
                  <p className="font-semibold text-sm text-foreground mt-0.5">{app.systemSize}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 justify-between sm:justify-end flex-shrink-0">
                <button
                  onClick={() => handleApproveLoan(app.id)}
                  className="px-4 py-2 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 text-xs shadow-sm"
                >
                  Approve Loan
                </button>
                <button
                  onClick={() => handleRejectLoan(app.id)}
                  className="px-4 py-2 bg-muted border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 text-muted-foreground rounded-xl text-xs font-semibold"
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
            <p className="text-xs text-muted-foreground mt-1">Underwriting queue is empty. No pending loan applications found.</p>
          </div>
        )}
      </div>
    </div>
  );

  // 2. VIEW: APPROVED LOANS
  if (view === 'approved') return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-1">Funded Disbursements</h2>
        <p className="text-xs text-muted-foreground">List of approved credit facilities. Tracking escrow releases to solar installers.</p>
      </div>

      <div className="space-y-3">
        {approvedApps.map(app => (
          <div key={app.id} className="bg-card border border-accent/20 bg-accent/5 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground text-sm">{app.applicant}</p>
                <span className="text-[9px] font-bold bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded uppercase">Escrow Disbursed</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Contract value: <span className="font-semibold text-foreground">${app.amount.toLocaleString()}</span> · Capacity: {app.systemSize}</p>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="text-muted-foreground block text-[10px]">Wire Transaction Token</span>
              <span className="font-mono text-primary font-bold">TXN-SOL-${app.id}93821</span>
            </div>
          </div>
        ))}

        {approvedApps.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-bold text-sm">No funded loans</p>
            <p className="text-xs text-muted-foreground mt-1">Approve pending applications to initiate financing disbursements.</p>
          </div>
        )}
      </div>
    </div>
  );

  // 3. VIEW: TRACK PAYMENTS
  if (view === 'payments') return (
    <div className="space-y-6 max-w-4xl">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Pending Files', value: `${pendingApps.length}`, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Approved Facilities', value: `${approvedApps.length}`, icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Portfolio Assets under Management', value: `$2.48M`, icon: DollarSign, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Repayment Performance', value: '98.4%', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
