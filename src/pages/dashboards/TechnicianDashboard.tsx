import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Activity, CheckCircle, Shield, Upload, Download, Eye,
  AlertCircle, Check, Wrench, FileText, Sparkles, Search, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { db, ServiceRequest } from '@/lib/dashboardStore';

export default function TechnicianDashboard({ view }: { view: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Synced state
  const [tickets, setTickets] = useState<ServiceRequest[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('solarphase_tech_selected_ticket_id');
      return stored ? parseInt(stored) : null;
    } catch {
      return null;
    }
  });

  // Form states
  const [inspectForm, setInspectForm] = useState({ panelHealth: 85, inverterReading: '4.2', notes: '' });
  const [reportNotes, setReportNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Warranty states
  const [warrantySearch, setWarrantySearch] = useState('');
  const [warrantyLookupCode, setWarrantyLookupCode] = useState('');
  const [warrantyLookupResult, setWarrantyLookupResult] = useState<any | null>(null);

  const warranties = [
    { customer: 'Paul Turner', component: 'SunPower SPR-X22 Modules (24)', expiry: 'Dec 15, 2047', serial: 'PV-MOD-400W', status: 'Active' },
    { customer: 'Lisa Monroe', component: 'SolarEdge SE7600H Inverter', expiry: 'Mar 22, 2037', serial: 'SOL-INV-7.6', status: 'Active' },
    { customer: 'Tom Walsh', component: 'LG RESU10H Battery Storage', expiry: 'Aug 5, 2035', serial: 'BAT-RESU-10', status: 'Active' },
    { customer: 'Jenny Liu', component: 'Enphase IQ8 Microinverters (20)', expiry: 'Feb 28, 2035', serial: 'SOL-MIC-IQ8', status: 'Expiring Soon' },
  ];

  const syncData = () => {
    setTickets(db.getServiceRequests());
  };

  useEffect(() => {
    syncData();
    window.addEventListener('solarphase_data_updated', syncData);
    return () => window.removeEventListener('solarphase_data_updated', syncData);
  }, [view]);

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets.find(t => t.technician === user?.name && t.status === 'In Progress') || tickets[0];

  // Accept/Assign ticket to self
  const handleAcceptTicket = (id: number) => {
    const allReqs = db.getServiceRequests();
    const updated = allReqs.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'In Progress' as const,
          technician: user?.name || 'Mike Torres'
        };
      }
      return t;
    });

    db.saveServiceRequests(updated);
    setTickets(updated);
    setSelectedTicketId(id);
    localStorage.setItem('solarphase_tech_selected_ticket_id', id.toString());
    toast.success(`Service request ticket #${id} accepted. Redirecting to inspect systems...`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
    
    // Guided redirect
    setTimeout(() => {
      navigate('/dashboard/inspect');
    }, 500);
  };

  // Submit system inspection details
  const handleSubmitInspection = () => {
    if (!activeTicket) {
      toast.error('No active service ticket selected to inspect.');
      return;
    }

    const allReqs = db.getServiceRequests();
    const updated = allReqs.map(t => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          inspection: {
            panelHealth: inspectForm.panelHealth,
            inverterReading: inspectForm.inverterReading,
            notes: inspectForm.notes,
            completedAt: new Date().toLocaleDateString()
          }
        };
      }
      return t;
    });

    db.saveServiceRequests(updated);
    setTickets(updated);
    toast.success('Inspection telemetry uploaded! Redirecting to Perform Maintenance...');
    window.dispatchEvent(new Event('solarphase_data_updated'));
    
    // Guided redirect
    setTimeout(() => {
      navigate('/dashboard/perform');
    }, 500);
  };

  // Check checklist parameter
  const handleToggleChecklist = (itemIdx: number) => {
    if (!activeTicket || !activeTicket.maintenanceChecklist) return;

    const allReqs = db.getServiceRequests();
    const updated = allReqs.map(t => {
      if (t.id === activeTicket.id && t.maintenanceChecklist) {
        const list = [...t.maintenanceChecklist];
        list[itemIdx] = { ...list[itemIdx], done: !list[itemIdx].done };
        return { ...t, maintenanceChecklist: list };
      }
      return t;
    });

    db.saveServiceRequests(updated);
    setTickets(updated);
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Complete maintenance
  const handleMarkCompleted = () => {
    if (!activeTicket) return;

    const allReqs = db.getServiceRequests();
    const updated = allReqs.map(t => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          status: 'Completed' as const
        };
      }
      return t;
    });

    db.saveServiceRequests(updated);
    setTickets(updated);
    toast.success(`Ticket #${activeTicket.id} completed! Redirecting to Update Reports...`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
    
    // Guided redirect
    setTimeout(() => {
      navigate('/dashboard/reports');
    }, 500);
  };

  // Simulated File Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileName = files[0].name;
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setUploadedFiles(prevFiles => [...prevFiles, fileName]);
          toast.success(`File "${fileName}" uploaded successfully.`);
          return null; // hide progress
        }
        return prev + 20;
      });
    }, 150);
  };

  // Download Report File
  const handleGeneratePDF = () => {
    if (!activeTicket) {
      toast.error('No ticket selected.');
      return;
    }
    if (!reportNotes) {
      toast.error('Please enter service notes before generating report.');
      return;
    }

    toast.info('Formulating service telemetry...');
    setTimeout(() => {
      const content = `SOLARPHASE MAINTENANCE SERVICE REPORT\n` +
        `======================================\n` +
        `Report ID: TEC-${activeTicket.id}-${Date.now().toString().slice(-4)}\n` +
        `Customer: ${activeTicket.customer}\n` +
        `Location: ${activeTicket.location}\n` +
        `Issue: ${activeTicket.type}\n` +
        `Status: Completed\n` +
        `Technician: ${user?.name || 'Mike Torres'}\n` +
        `--------------------------------------\n` +
        `Inspection Findings:\n` +
        `- Panel Degradation: ${activeTicket.inspection?.panelHealth || inspectForm.panelHealth}%\n` +
        `- Inverter Output: ${activeTicket.inspection?.inverterReading || inspectForm.inverterReading} kW\n` +
        `--------------------------------------\n` +
        `Service Operations Performed:\n` +
        `${reportNotes}\n` +
        `======================================\n` +
        `Generated: ${new Date().toLocaleString()}`;

      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `SolarPhase_ServiceReport_Ticket_${activeTicket.id}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Service report file downloaded successfully!');
    }, 800);
  };

  const handleWarrantyLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyLookupCode) return;
    const match = warranties.find(w => w.serial.toLowerCase() === warrantyLookupCode.trim().toLowerCase());
    if (match) {
      setWarrantyLookupResult(match);
      toast.success('Warranty details successfully queried.');
    } else {
      setWarrantyLookupResult({ error: `Serial number "${warrantyLookupCode}" not found in manufacturer index.` });
      toast.error('Warranty search failed.');
    }
  };

  const myActiveTickets = tickets.filter(t => t.technician === user?.name && t.status === 'In Progress');

  // Overview metrics datasets
  const dispatchData = [
    { name: 'Open Requests', count: tickets.filter(t => t.status === 'Open').length },
    { name: 'In Progress', count: tickets.filter(t => t.status === 'In Progress').length },
    { name: 'Completed', count: tickets.filter(t => t.status === 'Completed').length },
  ];

  const degradationData = [
    { year: 'Yr 1', health: 100 },
    { year: 'Yr 2', health: 98.2 },
    { year: 'Yr 3', health: 96.9 },
    { year: 'Yr 4', health: 95.1 },
    { year: 'Yr 5', health: 93.8 },
  ];

  // Filters
  const filteredWarranties = warranties.filter(w =>
    w.customer.toLowerCase().includes(warrantySearch.toLowerCase()) ||
    w.component.toLowerCase().includes(warrantySearch.toLowerCase()) ||
    w.serial.toLowerCase().includes(warrantySearch.toLowerCase())
  );

  // 1. VIEW: SERVICE REQUESTS
  if (view === 'requests') return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-1">Field Service Requests</h2>
        <p className="text-xs text-muted-foreground">Accept pending maintenance alerts or load checklist tasks for assigned site jobs.</p>
      </div>

      <div className="space-y-3">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-foreground">{ticket.customer}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${ticket.priority === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-muted text-muted-foreground'}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
                <p className="text-xs font-semibold text-primary">{ticket.type} · {ticket.location}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ticket.notes}</p>
                {ticket.technician && <p className="text-[10px] text-accent font-semibold mt-1">Assigned Tech: {ticket.technician}</p>}
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 justify-between sm:justify-end flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-secondary/10 text-secondary' : ticket.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600' : 'bg-accent/10 text-accent border border-accent/20'}`}>
                  {ticket.status}
                </span>

                {ticket.status === 'Open' && (
                  <button
                    onClick={() => handleAcceptTicket(ticket.id)}
                    className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-xs shadow-sm"
                  >
                    Accept Ticket
                  </button>
                )}

                {ticket.status === 'In Progress' && ticket.technician === user?.name && (
                  <button
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      localStorage.setItem('solarphase_tech_selected_ticket_id', ticket.id.toString());
                      navigate('/dashboard/inspect');
                    }}
                    className="px-4 py-2 bg-muted border border-border hover:bg-muted/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 2. VIEW: INSPECT SYSTEMS
  if (view === 'inspect') return (
    <div className="max-w-xl space-y-6">
      {activeTicket ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-bold text-lg">System Inspection Report</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ticket #{activeTicket.id} — Customer: {activeTicket.customer}</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span>Solar Panel Health Index</span>
                <span className="text-primary">{inspectForm.panelHealth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={inspectForm.panelHealth}
                onChange={e => setInspectForm(p => ({ ...p, panelHealth: parseInt(e.target.value) }))}
                className="w-full accent-primary bg-muted rounded-lg appearance-none h-2 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2">Inverter AC Reading (kW Output)</label>
              <input
                type="number"
                step="0.1"
                value={inspectForm.inverterReading}
                onChange={e => setInspectForm(p => ({ ...p, inverterReading: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2">Inspection Engineering Notes</label>
              <textarea
                rows={3}
                value={inspectForm.notes}
                onChange={e => setInspectForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Document shade parameters, dust layering index, wiring physical defects, etc."
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleSubmitInspection}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm shadow-md"
            >
              Upload Inspection Telemetry
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="font-bold text-sm">No ticket selected</p>
          <p className="text-xs text-muted-foreground mt-1">Accept an active ticket from the Requests tab to start inspecting.</p>
        </div>
      )}
    </div>
  );

  // 3. VIEW: PERFORM MAINTENANCE
  if (view === 'perform') return (
    <div className="max-w-xl space-y-6">
      {activeTicket && activeTicket.maintenanceChecklist ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-bold text-lg">Field Maintenance Tasks</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ticket #{activeTicket.id} — Action: {activeTicket.type}</p>
          </div>

          <div className="space-y-2.5">
            {activeTicket.maintenanceChecklist.map((task, i) => (
              <button
                key={i}
                onClick={() => handleToggleChecklist(i)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all ${task.done ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-primary/50'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.done ? 'bg-accent border-accent' : 'border-border'}`}>
                  {task.done && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-xs font-semibold ${task.done ? 'line-through text-muted-foreground font-normal' : ''}`}>{task.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleMarkCompleted}
            className="w-full py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-all text-sm shadow-md"
          >
            Mark Maintenance Ticket Completed
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="font-bold text-sm">No active tasks</p>
          <p className="text-xs text-muted-foreground mt-1">Please select an in-progress ticket to execute tasks.</p>
        </div>
      )}
    </div>
  );

  // 4. VIEW: UPDATE REPORTS
  if (view === 'reports') return (
    <div className="max-w-xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <h2 className="font-bold text-lg">Submit Maintenance Report</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Formulate service reports, upload logs, and trigger file exports.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2">Service Operations Notes</label>
            <textarea
              rows={4}
              value={reportNotes}
              onChange={e => setReportNotes(e.target.value)}
              placeholder="Document replacement parts, firmware flashes, or inverter recabling operations performed..."
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2">Upload Telemetry / Photo Attachments</label>
            <input
              type="file"
              id="tech-file-upload"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div
              onClick={() => document.getElementById('tech-file-upload')?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 cursor-pointer rounded-2xl p-6 text-center transition-colors"
            >
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-semibold">Click to attach photos or sensor dump files</p>
            </div>

            {uploadProgress !== null && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span>Uploading telemetry...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Attached Files ({uploadedFiles.length})</p>
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/60 text-xs border border-border/50">
                    <span className="font-semibold truncate max-w-[200px]">{file}</span>
                    <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5"><Check className="w-3.5 h-3.5" /> Uploaded</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGeneratePDF}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm shadow-md"
          >
            <Download className="w-4 h-4" /> Download Service Report PDF
          </button>
        </div>
      </div>
    </div>
  );

  // 5. VIEW: WARRANTY TRACKING
  if (view === 'warranty') return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={warrantySearch}
              onChange={e => setWarrantySearch(e.target.value)}
              placeholder="Search components or serials..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredWarranties.map((w, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex justify-between items-center gap-4">
              <div>
                <p className="font-bold text-sm text-foreground">{w.customer}</p>
                <p className="text-xs font-semibold text-primary mt-0.5">{w.component}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-muted border border-border/80 px-2 py-0.5 rounded font-mono font-medium text-foreground">S/N: {w.serial}</span>
                  <span className="text-[10px] text-muted-foreground">Expires: {w.expiry}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${w.status === 'Active' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'}`}>
                {w.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Side Warranty Lookup Tool */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base flex items-center gap-1.5"><Shield className="w-5 h-5 text-primary" /> Warranty Lookup</h3>
          <p className="text-xs text-muted-foreground">Query manufacturer servers directly using equipment serial markers.</p>
          <form onSubmit={handleWarrantyLookupSubmit} className="space-y-3">
            <input
              type="text"
              value={warrantyLookupCode}
              onChange={e => setWarrantyLookupCode(e.target.value)}
              placeholder="e.g. PV-MOD-400W"
              required
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
            />
            <button
              type="submit"
              className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 transition-colors shadow-sm"
            >
              Verify Coverage
            </button>
          </form>

          {warrantyLookupResult && (
            <div className="mt-4 border-t border-border pt-4 text-xs">
              {warrantyLookupResult.error ? (
                <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="font-medium text-[11px] leading-relaxed">{warrantyLookupResult.error}</p>
                </div>
              ) : (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-3.5 space-y-2.5">
                  <p className="font-bold text-accent text-[11px] uppercase tracking-wider">Manufacturer Record Found</p>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between pb-1 border-b border-border/40"><span className="text-muted-foreground">Owner</span><span className="font-bold">{warrantyLookupResult.customer}</span></div>
                    <div className="flex justify-between pb-1 border-b border-border/40"><span className="text-muted-foreground">Equipment</span><span className="font-semibold">{warrantyLookupResult.component}</span></div>
                    <div className="flex justify-between pb-1 border-b border-border/40"><span className="text-muted-foreground">Status</span><span className="font-bold text-accent">{warrantyLookupResult.status}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Expiration</span><span className="font-semibold">{warrantyLookupResult.expiry}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 6. DEFAULT VIEW: OVERVIEW
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Open Tickets', value: `${tickets.filter(t => t.status === 'Open').length}`, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Jobs', value: `${myActiveTickets.length}`, icon: Activity, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Completed Repairs', value: `${tickets.filter(t => t.status === 'Completed').length}`, icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Coverage Warranties', value: '4', icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Diagnostics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Technician Dispatch Workload</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dispatchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Ticket Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Standard Panel Health Degradation Profile</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={degradationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
              <Line type="monotone" dataKey="health" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 4, fill: '#16A34A' }} name="Health Index (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Assignments Table */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-sm mb-4">My In-Progress Service Tickets</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border pb-2 text-muted-foreground font-semibold">
                <th className="py-2">Ticket ID</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Priority</th>
                <th className="py-2">Operations Job</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myActiveTickets.map(t => (
                <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-bold text-foreground"># {t.id}</td>
                  <td className="py-3 text-muted-foreground">{t.customer}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-bold border text-[9px] ${
                      t.priority === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-primary">{t.type}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        localStorage.setItem('solarphase_tech_selected_ticket_id', t.id.toString());
                        navigate('/dashboard/inspect');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:bg-primary/95 transition-colors shadow-sm"
                    >
                      Begin Inspection <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {myActiveTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground italic">No in-progress tickets assigned. Go to the Service Requests tab to accept dispatches.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
