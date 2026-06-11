import { useState, useEffect } from 'react';
import {
  ClipboardList, Activity, CheckCircle, Shield, Upload, Download, Eye,
  AlertCircle, Check, Wrench, FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { db, ServiceRequest } from '@/lib/dashboardStore';

export default function TechnicianDashboard({ view }: { view: string }) {
  const { user } = useAuth();
  
  // Synced state
  const [tickets, setTickets] = useState<ServiceRequest[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  // Form states
  const [inspectForm, setInspectForm] = useState({ panelHealth: 85, inverterReading: '4.2', notes: '' });
  const [reportNotes, setReportNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileName = files[0].name;
    
    // Simulate upload progress
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

  useEffect(() => {
    // Load service requests
    setTickets(db.getServiceRequests());
  }, [view]);

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets.find(t => t.technician === user?.name && t.status === 'In Progress') || tickets[0];

  // Accept/Assign ticket to self
  const handleAcceptTicket = (id: number) => {
    const updated = tickets.map(t => {
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
    toast.success(`Service request ticket #${id} accepted. Maintenance checklist created.`);
  };

  // Submit system inspection details
  const handleSubmitInspection = () => {
    if (!activeTicket) {
      toast.error('No active service ticket selected to inspect.');
      return;
    }

    const updated = tickets.map(t => {
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
    toast.success('Mechanical inspection telemetry uploaded.');
  };

  // Check checklist parameter
  const handleToggleChecklist = (itemIdx: number) => {
    if (!activeTicket || !activeTicket.maintenanceChecklist) return;

    const updated = tickets.map(t => {
      if (t.id === activeTicket.id && t.maintenanceChecklist) {
        const list = [...t.maintenanceChecklist];
        list[itemIdx] = { ...list[itemIdx], done: !list[itemIdx].done };
        return { ...t, maintenanceChecklist: list };
      }
      return t;
    });

    db.saveServiceRequests(updated);
    setTickets(updated);
  };

  // Complete maintenance
  const handleMarkCompleted = () => {
    if (!activeTicket) return;

    const updated = tickets.map(t => {
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
    toast.success(`Ticket #${activeTicket.id} marked as completed. System offline status cleared.`);
  };

  // Download PDF Report
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

  const myActiveTickets = tickets.filter(t => t.technician === user?.name && t.status === 'In Progress');

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
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${ticket.priority === 'High' ? 'bg-destructive/10 text-destructive' : ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted text-muted-foreground'}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
                <p className="text-xs font-semibold text-primary">{ticket.type} · {ticket.location}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ticket.notes}</p>
                {ticket.technician && <p className="text-[10px] text-accent font-semibold">Assigned Tech: {ticket.technician}</p>}
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 justify-between sm:justify-end flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-secondary/10 text-secondary' : ticket.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600' : 'bg-accent/10 text-accent'}`}>
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
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="px-4 py-2 bg-muted border border-border hover:bg-muted/80 rounded-xl text-xs font-semibold flex items-center gap-1.5"
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
                <span className={`text-xs font-semibold ${task.done ? 'line-through text-muted-foreground' : ''}`}>{task.label}</span>
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
                    <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5"><Check className="w-3 h-3" /> Uploaded</span>
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
    <div className="space-y-4 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-1">Contractor Warranty Index</h2>
        <p className="text-xs text-muted-foreground">Monitor client equipment warranties in your coverage territory.</p>
      </div>

      <div className="space-y-3">
        {[
          { customer: 'Paul Turner', component: 'SunPower SPR-X22 Modules (24)', expiry: 'Dec 15, 2047', daysLeft: 8221, status: 'Active' },
          { customer: 'Lisa Monroe', component: 'SolarEdge SE7600H Inverter', expiry: 'Mar 22, 2037', daysLeft: 4302, status: 'Active' },
          { customer: 'Tom Walsh', component: 'LG RESU10H Battery Storage', expiry: 'Aug 5, 2035', daysLeft: 3707, status: 'Active' },
          { customer: 'Jenny Liu', component: 'Enphase IQ8 Microinverters (20)', expiry: 'Feb 28, 2035', daysLeft: 3548, status: 'Expiring Soon' },
        ].map((w, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex justify-between items-center gap-4">
            <div>
              <p className="font-bold text-sm text-foreground">{w.customer}</p>
              <p className="text-xs font-semibold text-primary mt-0.5">{w.component}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5">Expires: {w.expiry} ({w.daysLeft.toLocaleString()} days remaining)</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${w.status === 'Active' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'}`}>
              {w.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // 6. DEFAULT VIEW: OVERVIEW
  return (
    <div className="space-y-6">
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
    </div>
  );
}
