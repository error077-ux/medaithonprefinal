import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { ICONS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { UserRole, Appointment, TestRequest, TestType, User, Prescription, Department, Doctor, TriageInfo, DischargeSummary, ICUBed, AttendanceRecord, Bill, MedicationStock, PatientQuery } from '../types';
import * as api from '../services/api';
import Card from '../components/Card';

const HospitalPortal: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="flex items-center justify-center h-screen"><p>Loading user data...</p></div>;
    }

    const ADMINISTRATION_ROLES = [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.FINANCE];
    const AIDING_ROLES = [UserRole.LAB_TECHNICIAN, UserRole.RADIOLOGIST, UserRole.PHARMACIST];
    const MEDICAL_ROLES = [UserRole.DOCTOR, UserRole.NURSE];

    if (ADMINISTRATION_ROLES.includes(user.role)) {
        return <AdministrationPortal />;
    }
    if (AIDING_ROLES.includes(user.role)) {
        return <AidingPortal />;
    }
    if (MEDICAL_ROLES.includes(user.role)) {
        return <MedicalPortal />;
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Portal not available for your role.</p>
        </div>
    );
};

// --- PORTAL COMPONENTS ---

const AdministrationPortal: React.FC = () => {
    const { user } = useAuth();
    const basePath = '/hospital';
    let navItems: { to: string; label: string; icon: React.ReactNode }[] = [];

    if (user) {
         switch (user.role) {
            case UserRole.ADMIN:
                navItems = [
                    { to: basePath, label: 'Admin Dashboard', icon: ICONS.dashboard },
                    { to: `${basePath}/staff`, label: 'Manage Staff', icon: ICONS.users },
                    { to: `${basePath}/manager`, label: 'Manager View', icon: ICONS.dashboard },
                    { to: `${basePath}/hr`, label: 'HR View', icon: ICONS.users },
                ];
                break;
            case UserRole.MANAGER:
                navItems = [
                    { to: basePath, label: 'Manager Dashboard', icon: ICONS.dashboard },
                    { to: `${basePath}/finance`, label: 'Finance', icon: ICONS.finance },
                    { to: `${basePath}/hr`, label: 'HR', icon: ICONS.users },
                ];
                break;
            case UserRole.HR:
                navItems = [{ to: basePath, label: 'HR Dashboard', icon: ICONS.users }];
                break;
            case UserRole.FINANCE:
                navItems = [{ to: basePath, label: 'Finance Dashboard', icon: ICONS.finance }];
                break;
        }
    }
    
    return (
        <div className="flex bg-neutral-100 min-h-screen">
            <Sidebar navItems={navItems} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-8 flex-1">
                    <Routes>
                        {user?.role === UserRole.ADMIN && (
                            <>
                                <Route index element={<AdminDashboard />} />
                                <Route path="staff" element={<ManageStaff />} />
                                <Route path="manager" element={<ManagerDashboard />} />
                                <Route path="hr" element={<HRDashboard />} />
                            </>
                        )}
                        {user?.role === UserRole.MANAGER && (
                            <>
                                <Route index element={<ManagerDashboard />} />
                                <Route path="finance" element={<FinanceDashboard />} />
                                <Route path="hr" element={<HRDashboard />} />
                            </>
                        )}
                         {user?.role === UserRole.HR && <Route index element={<HRDashboard />} />}
                         {user?.role === UserRole.FINANCE && <Route index element={<FinanceDashboard />} />}
                         <Route path="*" element={<Navigate to={basePath} replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const AidingPortal: React.FC = () => {
    const { user } = useAuth();
    const basePath = '/hospital';
    let navItems: { to: string; label: string; icon: React.ReactNode }[] = [];

     if (user) {
        switch(user.role) {
            case UserRole.LAB_TECHNICIAN:
                navItems = [{ to: basePath, label: 'Lab Requests', icon: ICONS.lab }];
                break;
            case UserRole.RADIOLOGIST:
                navItems = [{ to: basePath, label: 'Radiology Queue', icon: ICONS.radiology }];
                break;
            case UserRole.PHARMACIST:
                navItems = [{ to: basePath, label: 'Pharmacy', icon: ICONS.pharmacy }];
                break;
        }
    }

    return (
        <div className="flex bg-neutral-100 min-h-screen">
            <Sidebar navItems={navItems} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-8 flex-1">
                     <Routes>
                         {user?.role === UserRole.LAB_TECHNICIAN && <Route index element={<LabDashboard />} />}
                         {user?.role === UserRole.RADIOLOGIST && <Route index element={<RadiologyDashboard />} />}
                         {user?.role === UserRole.PHARMACIST && <Route index element={<PharmacyDashboard />} />}
                         <Route path="*" element={<Navigate to={basePath} replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const MedicalPortal: React.FC = () => {
    const { user } = useAuth();
    const basePath = '/hospital';
    let navItems: { to: string; label: string; icon: React.ReactNode }[] = [];

    if (user) {
        switch (user.role) {
            case UserRole.DOCTOR:
                navItems = [
                    { to: basePath, label: 'Dashboard', icon: ICONS.dashboard },
                    { to: `${basePath}/appointments`, label: 'Appointments', icon: ICONS.appointment },
                ];
                break;
            case UserRole.NURSE:
                navItems = [
                    { to: basePath, label: 'Dashboard', icon: ICONS.dashboard },
                    { to: `${basePath}/triage`, label: 'Triage Queue', icon: ICONS.tasks },
                    { to: `${basePath}/icu`, label: 'ICU Status', icon: ICONS.icu },
                ];
                break;
        }
    }

    return (
        <div className="flex bg-neutral-100 min-h-screen">
            <Sidebar navItems={navItems} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-8 flex-1">
                    <Routes>
                        {user?.role === UserRole.DOCTOR && (
                            <>
                                <Route index element={<DoctorDashboard />} />
                                <Route path="appointments" element={<DoctorAppointments />} />
                            </>
                        )}
                        {user?.role === UserRole.NURSE && (
                            <>
                                <Route index element={<NurseDashboard />} />
                                <Route path="triage" element={<NurseTriageQueue />} />
                                <Route path="icu" element={<ICUDashboard />} />
                            </>
                        )}
                        <Route path="*" element={<Navigate to={basePath} replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};


// --- ADMIN COMPONENTS ---
const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ totalAppointments: 0, totalTests: 0, completedBills: 0 });
    const [patients, setPatients] = useState<User[]>([]);
    const [summaries, setSummaries] = useState<DischargeSummary[]>([]);
    const [generatingPatientId, setGeneratingPatientId] = useState<string | null>(null);
    const [queries, setQueries] = useState<PatientQuery[]>([]);
    const [selectedQuery, setSelectedQuery] = useState<PatientQuery | null>(null);

    const fetchAdminData = useCallback(() => {
        api.getDashboardStats().then(setStats).catch(console.error);
        api.getAllPatients().then(setPatients).catch(console.error);
        api.getAllDischargeSummaries().then(setSummaries).catch(console.error);
        api.getAllPatientQueries().then(setQueries).catch(console.error);
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);
    
    const generatePdfContent = (summary: DischargeSummary) => {
        const patient = summary.patientInfo;
        const appointments = summary.appointments;
        const tests = summary.tests;
        const prescriptions = summary.prescriptions;

        return `
            <html>
                <head><title>Discharge Summary: ${patient?.name}</title>
                <style>
                    body { font-family: Inter, sans-serif; margin: 2em; color: #334155 }
                    h1, h2, h3 { color: #0F172A; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
                    th, td { border: 1px solid #E2E8F0; padding: 8px; text-align: left; }
                    th { background-color: #F1F5F9; }
                    .section { margin-bottom: 2em; }
                </style>
                </head>
                <body>
                    <h1>Discharge Summary</h1>
                    <div class="section">
                        <h2>Patient Information</h2>
                        <p><strong>Name:</strong> ${patient?.name}</p>
                        <p><strong>ABHA ID:</strong> ${patient?.abhaId}</p>
                        <p><strong>Report Generated:</strong> ${new Date(summary.generationDate).toLocaleString()}</p>
                    </div>

                    <div class="section">
                        <h3>Appointments</h3>
                        <table>
                            <thead><tr><th>Date</th><th>Doctor</th><th>Department</th><th>Status</th><th>Notes</th></tr></thead>
                            <tbody>
                                ${appointments.map(a => `<tr><td>${a.date} at ${a.time}</td><td>${a.doctorName || 'N/A'}</td><td>${a.departmentName}</td><td>${a.status}</td><td>${a.notes || 'N/A'}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>

                     <div class="section">
                        <h3>Test Results</h3>
                        <table>
                            <thead><tr><th>Date</th><th>Test</th><th>Status</th><th>Result</th></tr></thead>
                            <tbody>
                                ${tests.map(t => `<tr><td>${t.requestDate}</td><td>${t.testName}</td><td>${t.status}</td><td>${t.result || 'N/A'}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>

                     <div class="section">
                        <h3>Prescriptions</h3>
                        <table>
                            <thead><tr><th>Date</th><th>Medication</th><th>Dosage</th><th>Instructions</th><th>Doctor</th></tr></thead>
                            <tbody>
                                ${prescriptions.map(p => `<tr><td>${p.date}</td><td>${p.medication}</td><td>${p.dosage}</td><td>${p.instructions}</td><td>${p.doctorName}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </body>
            </html>
        `;
    };

    const handleDownload = (summary: DischargeSummary, format: 'json' | 'pdf') => {
        if (format === 'json') {
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(summary, null, 2))}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `discharge-summary-${summary.patientInfo?.name?.replace(' ', '_')}.json`;
            link.click();
        } else {
             const pdfContent = generatePdfContent(summary);
             const newWindow = window.open();
             newWindow?.document.write(pdfContent);
             newWindow?.document.close();
        }
    };

    const handleGenerateSummary = async (patientId: string) => {
        setGeneratingPatientId(patientId);
        try {
            await api.generateAndSaveDischargeSummary(patientId);
            fetchAdminData();
        } catch (error) {
            console.error('Failed to generate summary:', error);
            alert('Could not generate discharge summary.');
        } finally {
            setGeneratingPatientId(null);
        }
    };
    
    const handleApprove = async (summaryId: string) => {
        try {
            await api.approveDischargeSummary(summaryId);
            fetchAdminData();
        } catch (error) {
            console.error('Failed to approve summary:', error);
            alert('Could not approve summary.');
        }
    };


    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Total Appointments" value={stats.totalAppointments} icon={ICONS.appointment} color="bg-primary-light text-primary-dark" />
                <Card title="Total Lab/Radiology Tests" value={stats.totalTests} icon={ICONS.lab} color="bg-warning-light text-warning-dark" />
                <Card title="Paid Bills" value={stats.completedBills} icon={ICONS.billing} color="bg-success-light text-success-dark" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <h2 className="text-xl font-semibold mb-4 text-neutral-800 p-2">Patient Queries & Complaints</h2>
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                         <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200"><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Date</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Patient</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Subject</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Status</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Action</th></tr></thead>
                        <tbody>
                            {queries.slice().reverse().map(q => <tr key={q.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                <td className="p-3">{q.submissionDate}</td>
                                <td className="p-3">{q.patientName}</td>
                                <td className="p-3">{q.subject}</td>
                                <td className="p-3">{q.status}</td>
                                <td className="p-3"><button disabled={q.status === 'Resolved'} onClick={() => setSelectedQuery(q)} className="font-semibold text-primary hover:underline disabled:text-neutral-400 disabled:no-underline">Respond</button></td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <h2 className="text-xl font-semibold mb-4 text-neutral-800 p-2">Discharge Summary Management</h2>
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-100">
                            <tr className="border-b-2 border-neutral-200">
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Patient</th>
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Generated On</th>
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Status</th>
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaries.length === 0 && <tr><td colSpan={4} className="p-3 text-center text-neutral-500">No summaries generated yet.</td></tr>}
                            {summaries.map(s => (
                                <tr key={s.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                    <td className="p-3">{s.patientName}</td>
                                    <td className="p-3">{new Date(s.generationDate).toLocaleString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.status === 'Approved' ? 'bg-success-light text-success-dark' : 'bg-warning-light text-warning-dark'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="p-3 space-x-2">
                                        {s.status === 'Pending Approval' && (
                                            <button onClick={() => handleApprove(s.id)} className="text-sm bg-success-light text-success-dark font-semibold px-3 py-1 rounded-md hover:bg-green-200">Approve</button>
                                        )}
                                        <button onClick={() => handleDownload(s, 'json')} className="text-sm bg-primary-light text-primary-dark font-semibold px-3 py-1 rounded-md hover:bg-blue-200">JSON</button>
                                        <button onClick={() => handleDownload(s, 'pdf')} className="text-sm bg-red-100 text-danger-dark font-semibold px-3 py-1 rounded-md hover:bg-red-200">PDF</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                 <h2 className="text-xl font-semibold mb-4 text-neutral-800 p-2">Generate Patient Summaries</h2>
                <table className="w-full text-left">
                    <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200"><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Patient ID</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Name</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">ABHA ID</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Actions</th></tr></thead>
                    <tbody>
                        {patients.map(p => <tr key={p.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                            <td className="p-3">{p.id}</td><td className="p-3">{p.name}</td><td className="p-3">{p.abhaId}</td>
                            <td className="p-3 space-x-2">
                                <button onClick={() => handleGenerateSummary(p.id)} disabled={generatingPatientId === p.id} className="text-sm bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark disabled:bg-neutral-400 font-semibold">
                                    {generatingPatientId === p.id ? 'Generating...' : 'Generate Summary'}
                                </button>
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
            {selectedQuery && <QueryResponseModal query={selectedQuery} onClose={() => setSelectedQuery(null)} onResponded={fetchAdminData} />}
        </div>
    );
}

const QueryResponseModal: React.FC<{query: PatientQuery, onClose: () => void, onResponded: () => void}> = ({ query, onClose, onResponded }) => {
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!response.trim()) return;
        setIsLoading(true);
        try {
            await api.respondToQuery(query.id, response);
            onResponded();
            onClose();
        } catch (error) {
            console.error("Failed to submit response", error);
            alert("Could not submit response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lifted w-full max-w-lg max-h-full flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-900">Respond to Query</h2>
                    <button onClick={onClose} className="text-2xl text-neutral-500 hover:text-danger-dark">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 space-y-2">
                            <p><strong>Patient:</strong> {query.patientName}</p>
                            <p><strong>Subject:</strong> {query.subject}</p>
                            <p className="whitespace-pre-wrap"><strong>Message:</strong> {query.message}</p>
                        </div>
                        <textarea value={response} onChange={e => setResponse(e.target.value)} required rows={5} className="w-full p-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary/50" placeholder="Type your response here..."></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold disabled:bg-neutral-400">
                            {isLoading ? "Submitting..." : "Submit Response"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const ManageStaff: React.FC = () => {
    const [staff, setStaff] = useState<User[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [updatingStaffId, setUpdatingStaffId] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        api.getAllStaff().then(setStaff).catch(console.error);
        api.getAttendance().then(allAttendance => {
            const today = new Date().toISOString().split('T')[0];
            setAttendance(allAttendance.filter(a => a.date === today));
        }).catch(console.error);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleClockIn = async (staffId: string) => {
        setUpdatingStaffId(staffId);
        try {
            await api.clockIn(staffId);
            fetchData();
        } catch (error) {
            console.error("Failed to clock in staff", error);
            alert("Clock in failed.");
        } finally {
            setUpdatingStaffId(null);
        }
    };
    
    const handleClockOut = async (staffId: string) => {
        setUpdatingStaffId(staffId);
        try {
            await api.clockOut(staffId);
            fetchData();
        } catch (error) {
            console.error("Failed to clock out staff", error);
            alert("Clock out failed.");
        } finally {
            setUpdatingStaffId(null);
        }
    };


    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-neutral-900">Manage Staff</h1>
                 <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-dark font-semibold shadow-soft hover:shadow-lg transition-all">
                    {ICONS.add}
                    <span>Add New Staff</span>
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <table className="w-full text-left">
                    <thead className="bg-neutral-100">
                        <tr className="border-b-2 border-neutral-200">
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Staff ID</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Name</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Role</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Department</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Status</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Clock In</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Clock Out</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map(s => {
                            const record = attendance.find(a => a.staffId === s.id);
                            let status = <span className="text-neutral-500">Absent</span>;
                            if (record) {
                                if (record.outTime) {
                                    status = <span className="text-success-dark">Off Duty</span>;
                                } else if (record.inTime) {
                                    status = <span className="text-primary-dark">On Duty</span>;
                                }
                            }
                            const isUpdating = updatingStaffId === s.id;

                            return (
                                <tr key={s.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                    <td className="p-3">{s.id}</td>
                                    <td className="p-3">{s.name}</td>
                                    <td className="p-3">{s.role}</td>
                                    <td className="p-3">{s.department || 'N/A'}</td>
                                    <td className="p-3 font-semibold">{status}</td>
                                    <td className="p-3">{record?.inTime || '--:--'}</td>
                                    <td className="p-3">{record?.outTime || '--:--'}</td>
                                    <td className="p-3">
                                        {!record?.inTime && (
                                            <button 
                                                onClick={() => handleClockIn(s.id)} 
                                                disabled={isUpdating}
                                                className="text-sm bg-secondary text-white px-3 py-1 rounded-md hover:bg-secondary-dark disabled:bg-neutral-400 font-semibold"
                                            >
                                                {isUpdating ? '...' : 'Clock In'}
                                            </button>
                                        )}
                                        {record?.inTime && !record.outTime && (
                                            <button 
                                                onClick={() => handleClockOut(s.id)} 
                                                disabled={isUpdating}
                                                className="text-sm bg-danger-light text-danger-dark font-semibold px-3 py-1 rounded-md hover:bg-danger-dark hover:text-white disabled:bg-neutral-400"
                                            >
                                                {isUpdating ? '...' : 'Clock Out'}
                                            </button>
                                        )}
                                        {record?.inTime && record.outTime && (
                                            <span className="text-sm text-neutral-500">Done</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {showModal && <AddStaffModal onClose={() => setShowModal(false)} onAdded={fetchData} />}
        </div>
    )
};

const AddStaffModal: React.FC<{onClose: () => void; onAdded: () => void}> = ({onClose, onAdded}) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole | ''>('');
    const [department, setDepartment] = useState('');
    const [password, setPassword] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.getDepartments().then(setDepartments).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !role || !password) return;
        setIsLoading(true);
        try {
            await api.addStaff({ name, role, department, password });
            onAdded();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to add staff.");
        } finally {
            setIsLoading(false);
        }
    };

    const staffRoles = Object.values(UserRole).filter(r => r !== UserRole.PATIENT);
    const showDepartment = role === UserRole.DOCTOR || role === UserRole.NURSE;
    const inputClass = "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow";

    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lifted w-full max-w-md">
                 <div className="flex justify-between items-center p-5 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-900">Add New Staff Member</h2>
                    <button onClick={onClose} className="text-2xl text-neutral-500 hover:text-danger-dark">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className={inputClass}/>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} required className={inputClass}>
                            <option value="">Select Role</option>
                            {staffRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {showDepartment && (
                            <select value={department} onChange={e => setDepartment(e.target.value)} required className={inputClass}>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                        )}
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass}/>
                    </div>
                    <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold disabled:bg-neutral-400">
                            {isLoading ? "Adding..." : "Add Staff"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


// --- DOCTOR COMPONENTS ---
const DoctorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    
    useEffect(() => {
        if(user) api.getDoctorAppointments(user.id).then(setAppointments).catch(console.error);
    }, [user]);
    
    const todaysAppointments = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]);

    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <h1 className="text-3xl font-bold text-neutral-900">Doctor's Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-soft border border-neutral-200/50">
                <h2 className="text-xl font-semibold mb-4 text-neutral-800">Today's Appointments ({todaysAppointments.length})</h2>
                 <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white">
                            <tr className="border-b-2 border-neutral-200">
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Patient</th>
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Time</th>
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todaysAppointments.length > 0 ? todaysAppointments.map(a => 
                            <tr key={a.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                <td className="p-3 text-neutral-800">{a.patientName}</td>
                                <td className="p-3 text-neutral-800">{a.time}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${a.status === 'Scheduled' ? 'bg-warning-light text-warning-dark' : a.status === 'Completed' ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'}`}>{a.status}</span></td>
                            </tr>) : 
                            <tr><td colSpan={3} className="p-4 text-center text-neutral-500">No appointments scheduled for today.</td></tr>
                            }
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
}

const DoctorAppointments: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const fetchAppointments = useCallback(() => {
         if(user) api.getDoctorAppointments(user.id).then(setAppointments).catch(console.error);
    }, [user]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <h1 className="text-3xl font-bold text-neutral-900">All Appointments</h1>
            <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <table className="w-full text-left">
                     <thead className="bg-neutral-100">
                        <tr className="border-b-2 border-neutral-200">
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Patient</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Date</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Time</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Status</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Action</th>
                        </tr>
                    </thead>
                     <tbody>
                        {appointments.map(app => (
                            <tr key={app.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                <td className="p-3 text-neutral-800">{app.patientName}</td>
                                <td className="p-3 text-neutral-800">{app.date}</td>
                                <td className="p-3 text-neutral-800">{app.time}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === 'Scheduled' ? 'bg-warning-light text-warning-dark' : app.status === 'Completed' ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'}`}>{app.status}</span></td>
                                <td className="p-3"><button onClick={() => setSelectedAppointment(app)} className="font-semibold text-primary hover:underline">View Record</button></td>
                            </tr>
                        ))}
                     </tbody>
                </table>
            </div>
            {selectedAppointment && <PatientRecordModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onUpdate={fetchAppointments} />}
        </div>
    );
};

interface MedicalHistory {
    patientInfo: {id: string; name: string; abhaId?: string} | null;
    appointments: Appointment[];
    tests: TestRequest[];
    prescriptions: Prescription[];
}

const TriageInfoDisplay: React.FC<{triageData: TriageInfo}> = ({ triageData }) => (
    <div className="border-2 border-primary/50 bg-primary-light p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2 text-primary-dark">Triage Information (from Nurse)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
                <h4 className="font-semibold text-neutral-800">Vitals</h4>
                <p className="text-neutral-700"><strong>BP:</strong> {triageData.vitals.bloodPressure}</p>
                <p className="text-neutral-700"><strong>Temp:</strong> {triageData.vitals.temperature}</p>
                <p className="text-neutral-700"><strong>Heart Rate:</strong> {triageData.vitals.heartRate}</p>
                <p className="text-neutral-700"><strong>Resp. Rate:</strong> {triageData.vitals.respiratoryRate}</p>
            </div>
            <div>
                <h4 className="font-semibold text-neutral-800">Allergies</h4>
                <p className="text-neutral-700"><strong>Food:</strong> {triageData.allergies.food || 'None reported'}</p>
                <p className="text-neutral-700"><strong>Medication:</strong> {triageData.allergies.medication || 'None reported'}</p>
            </div>
            <div className="md:col-span-2">
                 <h4 className="font-semibold text-neutral-800">Current Medications</h4>
                 <p className="text-neutral-700">{triageData.currentMedications || 'None reported'}</p>
            </div>
             <div className="md:col-span-2">
                 <h4 className="font-semibold text-neutral-800">Triage Notes</h4>
                 <p className="whitespace-pre-wrap text-neutral-700">{triageData.triageNotes || 'N/A'}</p>
            </div>
        </div>
    </div>
);

const PatientRecordModal: React.FC<{appointment: Appointment; onClose: () => void; onUpdate: () => void;}> = ({ appointment, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<MedicalHistory | null>(null);
    const [notes, setNotes] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    
    const [labTestOrder, setLabTestOrder] = useState('');
    const [radioTestOrder, setRadioTestOrder] = useState('');
    const [isOrderingTests, setIsOrderingTests] = useState(false);
    
    const [newPrescription, setNewPrescription] = useState({ medication: '', dosage: '', instructions: '', quantity: '' });
    const [isPrescribing, setIsPrescribing] = useState(false);


    const fetchHistory = useCallback(() => {
        api.getPatientMedicalHistory(appointment.patientId).then(setHistory).catch(console.error);
    }, [appointment.patientId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleUpdate = async (status?: 'Completed' | 'Cancelled') => {
        setIsUpdating(true);
        try {
            await api.updateAppointment(appointment.id, { status, notes });
            onUpdate();
            if(status) onClose();
            else setNotes('');
        } catch (error) {
            console.error(error);
            alert("Failed to update appointment.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOrderTests = async (type: TestType) => {
        if (!user) return;
        const orderString = type === TestType.LAB ? labTestOrder : radioTestOrder;
        if (!orderString.trim()) return;

        setIsOrderingTests(true);
        try {
            await api.orderTests(user.id, appointment.patientId, appointment.patientName, orderString, type);
            if (type === TestType.LAB) setLabTestOrder('');
            else setRadioTestOrder('');
            fetchHistory();
        } catch (error) {
            console.error(error);
            alert(`Failed to order ${type.toLowerCase()} tests.`);
        } finally {
            setIsOrderingTests(false);
        }
    };

    const handleAddPrescription = async () => {
        if (!user || !newPrescription.medication.trim() || !newPrescription.quantity.trim()) return;
        setIsPrescribing(true);
        try {
            await api.addPrescription({
                medication: newPrescription.medication,
                dosage: newPrescription.dosage,
                instructions: newPrescription.instructions,
                quantity: parseInt(newPrescription.quantity, 10),
                patientId: appointment.patientId,
                doctorId: user.id,
                doctorName: user.name,
                date: new Date().toISOString().split('T')[0],
            });
            setNewPrescription({ medication: '', dosage: '', instructions: '', quantity: '' });
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error(error);
            alert("Failed to add prescription.");
        } finally {
            setIsPrescribing(false);
        }
    }


    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lifted w-full max-w-4xl max-h-full flex flex-col">
                 <div className="flex justify-between items-start p-5 border-b border-neutral-200">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Patient Record: {history?.patientInfo?.name}</h2>
                        <p className="text-neutral-500">ABHA ID: {history?.patientInfo?.abhaId}</p>
                        <p className="text-neutral-500">Current Appointment: {appointment.date} at {appointment.time}</p>
                    </div>
                     <button type="button" onClick={onClose} className="text-2xl text-neutral-500 hover:text-danger-dark">&times;</button>
                </div>
               
                <div className="p-6 space-y-6 overflow-y-auto">
                {history ? (
                    <div className="space-y-6">
                        {appointment.triageData && <TriageInfoDisplay triageData={appointment.triageData} />}
                        
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-neutral-800">Current Appointment Notes</h3>
                            <p className="text-sm text-neutral-600 whitespace-pre-wrap mb-2">{appointment.notes || "No notes for this appointment yet."}</p>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 border border-neutral-300 rounded focus:ring-primary/50 focus:border-primary" placeholder="Add new notes..."></textarea>
                        </div>
                        
                        <div className="border p-4 rounded-lg space-y-4">
                            <h3 className="font-bold text-lg text-neutral-800">Orders</h3>
                             <div>
                                <label className="font-semibold text-neutral-700 block mb-1">Order Lab Tests</label>
                                <div className="flex space-x-2">
                                    <input type="text" value={labTestOrder} onChange={e => setLabTestOrder(e.target.value)} className="flex-1 p-2 border rounded border-neutral-300" placeholder="e.g., CBC, Lipid Panel..."/>
                                    <button onClick={() => handleOrderTests(TestType.LAB)} disabled={isOrderingTests || !labTestOrder.trim()} className="px-4 py-2 bg-accent text-white rounded-lg font-semibold disabled:bg-neutral-400">Order Lab</button>
                                </div>
                            </div>
                             <div>
                                <label className="font-semibold text-neutral-700 block mb-1">Order Radiology/Scans</label>
                                <div className="flex space-x-2">
                                    <input type="text" value={radioTestOrder} onChange={e => setRadioTestOrder(e.target.value)} className="flex-1 p-2 border rounded border-neutral-300" placeholder="e.g., Chest X-Ray, MRI Brain..."/>
                                    <button onClick={() => handleOrderTests(TestType.RADIOLOGY)} disabled={isOrderingTests || !radioTestOrder.trim()} className="px-4 py-2 bg-accent text-white rounded-lg font-semibold disabled:bg-neutral-400">Order Scan</button>
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-neutral-700 block mb-1">Add Prescription</label>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input type="text" value={newPrescription.medication} onChange={e => setNewPrescription({...newPrescription, medication: e.target.value})} className="p-2 border rounded border-neutral-300" placeholder="Medication"/>
                                    <input type="number" value={newPrescription.quantity} onChange={e => setNewPrescription({...newPrescription, quantity: e.target.value})} className="p-2 border rounded border-neutral-300" placeholder="Quantity"/>
                                    <input type="text" value={newPrescription.dosage} onChange={e => setNewPrescription({...newPrescription, dosage: e.target.value})} className="p-2 border rounded border-neutral-300" placeholder="Dosage"/>
                                    <input type="text" value={newPrescription.instructions} onChange={e => setNewPrescription({...newPrescription, instructions: e.target.value})} className="p-2 border rounded border-neutral-300" placeholder="Instructions"/>
                                </div>
                                <button onClick={handleAddPrescription} disabled={isPrescribing || !newPrescription.medication.trim()} className="px-4 py-2 mt-2 bg-secondary text-white rounded-lg font-semibold disabled:bg-neutral-400">Add Prescription</button>
                            </div>
                        </div>

                        <div className="border p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-neutral-800">Medical History</h3>
                             <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                <h4 className="font-semibold text-md mt-2 text-neutral-800">Past Appointments</h4>
                                {history.appointments.map(a => <div key={a.id} className="text-sm p-2 bg-neutral-100 rounded text-neutral-700"><strong>{a.date}:</strong> {a.doctorName} ({a.status}) - Notes: {a.notes || 'N/A'}</div>)}
                                <h4 className="font-semibold text-md mt-2 text-neutral-800">Test Results</h4>
                                {history.tests.map(t => <div key={t.id} className="text-sm p-2 bg-neutral-100 rounded text-neutral-700">
                                    <strong>{t.requestDate}:</strong> {t.testName} ({t.status}) - Result: {t.result || 'N/A'}
                                    {t.imageUrl && <a href={t.imageUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline font-semibold">[View Image]</a>}
                                    </div>)}
                                <h4 className="font-semibold text-md mt-2 text-neutral-800">Prescriptions</h4>
                                {history.prescriptions.map(p => <div key={p.id} className="text-sm p-2 bg-neutral-100 rounded text-neutral-700"><strong>{p.date}:</strong> {p.medication} (x{p.quantity}) ({p.dosage}) - Dr. {p.doctorName}</div>)}
                            </div>
                        </div>
                    </div>
                ) : <p>Loading medical history...</p>}
                </div>

                <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                    <button onClick={() => handleUpdate()} disabled={isUpdating || !notes} className="px-4 py-2 bg-primary text-white rounded-lg font-semibold disabled:bg-neutral-400">Save Notes</button>
                    {appointment.status === 'Scheduled' && (
                         <button onClick={() => handleUpdate('Completed')} disabled={isUpdating} className="px-4 py-2 bg-secondary text-white rounded-lg font-semibold disabled:bg-neutral-400">Mark as Completed</button>
                    )}
                </div>
            </div>
        </div>
    )
}


// --- NURSE COMPONENTS ---
const NurseDashboard: React.FC = () => {
    const [triageCount, setTriageCount] = useState(0);

    useEffect(() => {
        api.getTriageQueue().then(queue => setTriageCount(queue.length)).catch(console.error);
    }, []);

    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <h1 className="text-3xl font-bold text-neutral-900">Nurse Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Patients Awaiting Triage" value={triageCount} icon={ICONS.tasks} color="bg-primary-light text-primary-dark" />
            </div>
        </div>
    );
};

const NurseTriageQueue: React.FC = () => {
    const [queue, setQueue] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const fetchQueue = useCallback(() => {
        api.getTriageQueue().then(setQueue).catch(console.error);
    }, []);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <h1 className="text-3xl font-bold text-neutral-900">Triage Queue</h1>
            <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <table className="w-full text-left">
                    <thead className="bg-neutral-100">
                        <tr className="border-b-2 border-neutral-200">
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Patient</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Department</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Requested Time</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queue.length > 0 ? queue.map(app => (
                            <tr key={app.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                <td className="p-3 text-neutral-800 font-medium">{app.patientName}</td>
                                <td className="p-3 text-neutral-800">{app.departmentName}</td>
                                <td className="p-3 text-neutral-800">{app.date} at {app.time}</td>
                                <td className="p-3"><button onClick={() => setSelectedAppointment(app)} className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark font-semibold">Start Triage</button></td>
                            </tr>
                        )) : <tr><td colSpan={4} className="p-4 text-center text-neutral-500">The triage queue is empty.</td></tr>}
                    </tbody>
                </table>
            </div>
            {selectedAppointment && <TriageModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onComplete={fetchQueue} />}
        </div>
    )
}

const TriageModal: React.FC<{appointment: Appointment, onClose: () => void, onComplete: () => void}> = ({appointment, onClose, onComplete}) => {
    const [vitals, setVitals] = useState({ bloodPressure: '', temperature: '', heartRate: '', respiratoryRate: '' });
    const [allergies, setAllergies] = useState({ food: '', medication: '' });
    const [currentMedications, setCurrentMedications] = useState('');
    const [triageNotes, setTriageNotes] = useState('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.getDepartments().then(setDepartments);
    }, []);

    useEffect(() => {
        const department = departments.find(d => d.name === appointment.departmentName);
        if (department) {
            api.getDoctorsByDepartment(department.id).then(setDoctors);
        }
    }, [appointment.departmentName, departments]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctor) {
            alert("Please assign a doctor.");
            return;
        }
        setIsLoading(true);
        const doctor = doctors.find(d => d.id === selectedDoctor);
        if (!doctor) {
            setIsLoading(false);
            return;
        }
        
        try {
            await api.submitTriage(appointment.id, doctor.id, doctor.name, { vitals, allergies, currentMedications, triageNotes });
            onComplete();
            onClose();
        } catch (error) {
            alert("Failed to submit triage.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClass = "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lifted w-full max-w-2xl max-h-full flex flex-col">
                <div className="flex justify-between items-start p-5 border-b border-neutral-200">
                    <h2 className="text-2xl font-bold text-neutral-900">Triage: {appointment.patientName}</h2>
                    <button type="button" onClick={onClose} className="text-2xl text-neutral-500 hover:text-danger-dark">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="font-semibold px-2 text-neutral-700">Vitals</legend>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Blood Pressure (e.g., 120/80 mmHg)" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} className={inputClass} />
                            <input type="text" placeholder="Temperature (e.g., 98.6°F)" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} className={inputClass} />
                            <input type="text" placeholder="Heart Rate (e.g., 70 bpm)" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} className={inputClass} />
                            <input type="text" placeholder="Respiratory Rate (e.g., 16 breaths/min)" value={vitals.respiratoryRate} onChange={e => setVitals({...vitals, respiratoryRate: e.target.value})} className={inputClass} />
                        </div>
                    </fieldset>
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="font-semibold px-2 text-neutral-700">Allergies</legend>
                        <div className="grid grid-cols-2 gap-4">
                             <input type="text" placeholder="Food Allergies" value={allergies.food} onChange={e => setAllergies({...allergies, food: e.target.value})} className={inputClass} />
                             <input type="text" placeholder="Medication Allergies" value={allergies.medication} onChange={e => setAllergies({...allergies, medication: e.target.value})} className={inputClass} />
                        </div>
                    </fieldset>
                    <textarea placeholder="List current medications..." rows={3} value={currentMedications} onChange={e => setCurrentMedications(e.target.value)} className={inputClass} />
                    <textarea placeholder="Additional triage notes..." rows={3} value={triageNotes} onChange={e => setTriageNotes(e.target.value)} className={inputClass} />
                    <div className="flex items-center space-x-4">
                        <span className="font-semibold text-neutral-700">Assign to Doctor:</span>
                        <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} required className={`flex-1 ${inputClass}`}>
                            <option value="">Select Doctor from {appointment.departmentName}</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </form>
                <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold">Cancel</button>
                    <button type="submit" form="triage-form" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold disabled:bg-neutral-400">
                      {isLoading ? "Submitting..." : "Submit Triage & Assign"}
                    </button>
                </div>
            </div>
        </div>
    )
}


// --- LAB & RADIOLOGY & AIDING COMPONENTS ---
const LabDashboard: React.FC = () => <TestDashboard type={TestType.LAB} title="Laboratory Requests" />;
const RadiologyDashboard: React.FC = () => <TestDashboard type={TestType.RADIOLOGY} title="Radiology Queue" />;

const TestDashboard: React.FC<{type: TestType; title: string}> = ({ type, title }) => {
    const [requests, setRequests] = useState<TestRequest[]>([]);
    const [selectedTest, setSelectedTest] = useState<TestRequest | null>(null);

    const fetchRequests = useCallback(() => api.getPendingTests(type).then(setRequests).catch(console.error), [type]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const handleUpdate = async (result: string, imageUrl?: string) => {
        if(selectedTest) {
            try {
                await api.updateTestResult(selectedTest.id, result, imageUrl);
                fetchRequests();
                setSelectedTest(null);
            } catch (error) {
                console.error("Failed to update test result", error);
                alert("Update failed. Please try again.");
            }
        }
    };

    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
            <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <table className="w-full text-left">
                    <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200"><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Patient</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Test Name</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Request Date</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Action</th></tr></thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                <td className="p-3">{req.patientName}</td>
                                <td className="p-3">{req.testName}</td>
                                <td className="p-3">{req.requestDate}</td>
                                <td className="p-3"><button onClick={() => setSelectedTest(req)} className="font-semibold text-primary hover:underline">Update Result</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedTest && (type === TestType.LAB ?
                <UpdateResultModal test={selectedTest} onClose={() => setSelectedTest(null)} onUpdate={(res) => handleUpdate(res)} /> :
                <UpdateRadiologyResultModal test={selectedTest} onClose={() => setSelectedTest(null)} onUpdate={handleUpdate} />
            )}
        </div>
    );
};

const UpdateResultModal: React.FC<{test: TestRequest; onClose: () => void; onUpdate: (result: string) => void}> = ({ test, onClose, onUpdate }) => {
    const [result, setResult] = useState('');
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lifted w-full max-w-md">
                <div className="p-5 border-b border-neutral-200">
                  <h2 className="text-xl font-bold text-neutral-900">Update Result for {test.testName}</h2>
                  <p className="text-sm text-neutral-500">Patient: {test.patientName}</p>
                </div>
                <div className="p-6">
                  <textarea value={result} onChange={e => setResult(e.target.value)} rows={4} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="Enter test result..."></textarea>
                </div>
                <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold">Cancel</button>
                    <button onClick={() => onUpdate(result)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold">Save Result</button>
                </div>
            </div>
        </div>
    );
}

const UpdateRadiologyResultModal: React.FC<{test: TestRequest; onClose: () => void; onUpdate: (result: string, imageUrl?: string) => void}> = ({ test, onClose, onUpdate }) => {
    const [result, setResult] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
    }

    const handleSave = () => {
        setIsUploading(true);
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => {
                onUpdate(result, reader.result as string);
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert("Failed to read file.");
                setIsUploading(false);
            }
        } else {
            onUpdate(result);
            setIsUploading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-lg shadow-lifted w-full max-w-md">
                <div className="p-5 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-900">Update Radiology Result</h2>
                    <p className="text-sm text-neutral-500">Patient: {test.patientName} | Test: {test.testName}</p>
                </div>
                <div className="p-6 space-y-4">
                    <textarea value={result} onChange={e => setResult(e.target.value)} rows={4} className="w-full p-2 border rounded border-neutral-300" placeholder="Enter findings..."></textarea>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-neutral-700">Upload Image (X-Ray, Scan, etc.)</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/20"/>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold">Cancel</button>
                    <button onClick={handleSave} disabled={isUploading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold disabled:bg-neutral-400">{isUploading ? 'Saving...' : 'Save Result'}</button>
                </div>
            </div>
        </div>
    );
}

const ICUDashboard: React.FC = () => {
    const [beds, setBeds] = useState<ICUBed[]>([]);
    useEffect(() => { api.getICUBeds().then(setBeds); }, []);
    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <h1 className="text-3xl font-bold text-neutral-900">ICU Bed Status</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {beds.map(bed => (
                    <div key={bed.id} className={`p-4 rounded-lg shadow-soft text-center border ${bed.isOccupied ? 'bg-danger-light border-danger-dark/20' : 'bg-success-light border-success-dark/20'}`}>
                        <p className="font-bold text-lg text-neutral-900">{bed.roomNumber}</p>
                        <p className="text-sm text-neutral-600">{bed.roomType}</p>
                        <p className={`mt-2 font-semibold text-sm ${bed.isOccupied ? 'text-danger-dark' : 'text-success-dark'}`}>{bed.isOccupied ? `Occupied: ${bed.patientName}` : 'Available'}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

const DispenseModal: React.FC<{prescription: Prescription, onClose: () => void, onDispensed: () => void}> = ({ prescription, onClose, onDispensed }) => {
    const [price, setPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            alert("Please enter a valid, non-negative price.");
            return;
        }
        setIsLoading(true);
        try {
            await api.dispensePrescription(prescription.id, parseFloat(price));
            onDispensed();
            onClose();
        } catch (error) {
            console.error("Failed to dispense", error);
            alert("Failed to dispense medication.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lifted w-full max-w-lg">
                <div className="p-5 border-b border-neutral-200">
                  <h2 className="text-xl font-bold text-neutral-900">Dispense Medication</h2>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="p-6">
                    <div className="space-y-2 text-sm text-neutral-700 bg-neutral-50 p-4 rounded-md mb-4 border">
                        <p><strong>Patient:</strong> {prescription.patientName} ({prescription.patientAbhaId})</p>
                        <p><strong>Medication:</strong> {prescription.medication}</p>
                        <p><strong>Quantity:</strong> {prescription.quantity}</p>
                        <p><strong>Dosage:</strong> {prescription.dosage}</p>
                        <p><strong>Instructions:</strong> {prescription.instructions}</p>
                        <p><strong>Prescribed by:</strong> {prescription.doctorName} on {prescription.date}</p>
                    </div>
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-1">
                            Total Price
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                            placeholder="Enter total price"
                            required
                        />
                    </div>
                  </div>
                    <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold disabled:bg-neutral-400">
                            {isLoading ? "Processing..." : "Dispense & Bill"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const PharmacyDashboard: React.FC = () => {
    const [stock, setStock] = useState<MedicationStock[]>([]);
    const [pending, setPending] = useState<Prescription[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

    const fetchData = useCallback(() => {
        api.getMedicationStock().then(setStock);
        api.getPendingPrescriptions().then(setPending);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
         <div className="space-y-8">
            <AttendanceTracker />
            <h1 className="text-3xl font-bold text-neutral-900">Pharmacy Dashboard</h1>
             <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <h2 className="text-xl font-semibold mb-2 p-2">Pending Prescriptions</h2>
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200 text-sm">
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider">Patient</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider">ABHA ID</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider">Medication</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider">Qty</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider">Doctor</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider">Action</th>
                        </tr></thead>
                        <tbody>
                            {pending.length === 0 && (
                                <tr><td colSpan={6} className="text-center p-4 text-neutral-500">No pending prescriptions.</td></tr>
                            )}
                            {pending.map(p => <tr key={p.id} className="border-b border-neutral-200 hover:bg-primary-light/30 text-sm">
                                <td className="p-3">{p.patientName}</td>
                                <td className="p-3">{p.patientAbhaId}</td>
                                <td className="p-3">{p.medication}</td>
                                <td className="p-3">{p.quantity}</td>
                                <td className="p-3">{p.doctorName}</td>
                                <td className="p-3">
                                    <button onClick={() => setSelectedPrescription(p)} className="bg-primary text-white px-3 py-1 text-xs rounded-md hover:bg-primary-dark font-semibold">Dispense</button>
                                </td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                 <h2 className="text-xl font-semibold mb-2 p-2">Inventory</h2>
                 <table className="w-full text-left">
                    <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200">
                        <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Medication</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Quantity</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Cost Price</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Selling Price</th>
                    </tr></thead>
                    <tbody>
                        {stock.map(med => <tr key={med.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                            <td className="p-3">{med.name}</td><td className="p-3">{med.quantity}</td>
                            <td className="p-3">${med.costPrice.toFixed(2)}</td><td className="p-3">${med.sellingPrice.toFixed(2)}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
            {selectedPrescription && <DispenseModal prescription={selectedPrescription} onClose={() => setSelectedPrescription(null)} onDispensed={fetchData} />}
        </div>
    );
}

// --- MANAGEMENT & FINANCE & HR COMPONENTS ---

const HRDashboard: React.FC = () => {
    const [staff, setStaff] = useState<User[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const today = new Date().toISOString().split('T')[0];
    
    const fetchData = useCallback(() => {
        api.getAllStaff().then(setStaff);
        api.getAttendance().then(att => setAttendance(att.filter(a => a.date === today)));
    }, [today]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const calculateWorkHours = (inTime?: string, outTime?: string) => {
        if (!inTime || !outTime) return 'N/A';
        const [inH, inM] = inTime.split(':').map(Number);
        const [outH, outM] = outTime.split(':').map(Number);
        const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
        if (diffMinutes < 0) return 'Error';
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <h1 className="text-3xl font-bold text-neutral-900">HR Dashboard: Staff Attendance ({today})</h1>
             <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                 <table className="w-full text-left">
                    <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200">
                        <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Staff Name</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Role</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Clock In</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Clock Out</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Work Hours</th>
                    </tr></thead>
                    <tbody>
                        {staff.map(s => {
                            const record = attendance.find(a => a.staffId === s.id);
                            return (<tr key={s.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                <td className="p-3">{s.name}</td><td className="p-3">{s.role}</td>
                                <td className="p-3">{record?.inTime || 'N/A'}</td>
                                <td className="p-3">{record?.outTime || 'N/A'}</td>
                                <td className="p-3">{calculateWorkHours(record?.inTime, record?.outTime)}</td>
                            </tr>);
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const AddBillModal: React.FC<{onClose: () => void, onAdded: () => void}> = ({ onClose, onAdded }) => {
    const [patients, setPatients] = useState<User[]>([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [details, setDetails] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.getAllPatients().then(setPatients).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!selectedPatient || !details.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
            alert("Please fill out all fields with valid data.");
            return;
        }
        setIsLoading(true);
        try {
            await api.addBill({ patientId: selectedPatient, details, amount: parsedAmount });
            onAdded();
            onClose();
        } catch (error) {
            console.error("Failed to add bill:", error);
            alert("Could not add the bill. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClass = "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lifted w-full max-w-lg">
                 <div className="p-5 border-b border-neutral-200">
                  <h2 className="text-xl font-bold text-neutral-900">Add New Patient Bill</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required className={inputClass}>
                            <option value="">Select a Patient</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.abhaId})</option>)}
                        </select>
                        <input type="text" placeholder="Bill Details (e.g., Consultation Fee)" value={details} onChange={e => setDetails(e.target.value)} required className={inputClass}/>
                        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className={inputClass}/>
                    </div>
                    <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold disabled:bg-neutral-400">
                            {isLoading ? "Adding..." : "Add Bill"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PatientBillDetailsModal: React.FC<{patient: { id: string, name: string }, onClose: () => void, allBills: Bill[]}> = ({ patient, onClose, allBills }) => {
    const patientBills = allBills.filter(b => b.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const totalBilled = patientBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalDue = patientBills.filter(b => b.status === 'Unpaid').reduce((sum, bill) => sum + bill.amount, 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lifted w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b bg-neutral-50 rounded-t-xl flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Billing Statement</h2>
                        <p className="text-neutral-600">For Patient: <span className="font-semibold">{patient.name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-3xl text-neutral-400 hover:text-danger-dark transition-colors">&times;</button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    {patientBills.length > 0 ? (
                        <table className="w-full text-left table-auto">
                            <thead className="sticky top-0 bg-white">
                                <tr className="border-b-2 border-neutral-200">
                                    <th className="p-3 text-sm font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                                    <th className="p-3 text-sm font-bold text-neutral-500 uppercase tracking-wider">Service Description</th>
                                    <th className="p-3 text-sm font-bold text-neutral-500 uppercase tracking-wider text-right">Amount</th>
                                    <th className="p-3 text-sm font-bold text-neutral-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientBills.map(b => (
                                    <tr key={b.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                        <td className="p-3 text-neutral-600 whitespace-nowrap">{b.date}</td>
                                        <td className="p-3 text-neutral-800">{b.details}</td>
                                        <td className="p-3 text-neutral-900 font-mono text-right">${b.amount.toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${b.status === 'Paid' ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'}`}>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center text-neutral-500 py-12">
                            <div className="text-5xl mb-2 mx-auto w-16 h-16">{ICONS.billing}</div>
                            <p className="font-semibold">No billing history found for this patient.</p>
                        </div>
                    )}
                </div>

                {patientBills.length > 0 && (
                    <div className="p-5 border-t bg-neutral-50 rounded-b-xl text-right space-y-1">
                        <p className="text-lg">Total Billed: <span className="font-bold text-neutral-900 w-32 inline-block text-right">${totalBilled.toFixed(2)}</span></p>
                        <p className="text-xl">Amount Due: <span className="font-bold text-danger-dark bg-danger-light px-2 py-1 rounded w-32 inline-block text-right">${totalDue.toFixed(2)}</span></p>
                    </div>
                )}
            </div>
        </div>
    );
};


const FinanceDashboard: React.FC = () => {
    const [financeData, setFinanceData] = useState<any>(null);
    const [showAddBillModal, setShowAddBillModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);

    const fetchData = useCallback(() => {
        api.getFinancialData().then(setFinanceData);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const summary = financeData ? financeData.medicationProfit.reduce((acc: any, curr: any) => {
        acc.totalRevenue += curr.sellingPrice;
        acc.totalCost += curr.costPrice;
        return acc;
    }, { totalRevenue: 0, totalCost: 0 }) : { totalRevenue: 0, totalCost: 0 };
    summary.totalProfit = summary.totalRevenue - summary.totalCost;

    const patientBillSummary = financeData ? financeData.patientPayments.reduce((acc: any, bill: Bill) => {
        if (!acc[bill.patientId]) {
            acc[bill.patientId] = {
                patientId: bill.patientId,
                patientName: bill.patientName,
                totalBilled: 0,
                totalDue: 0,
            };
        }
        acc[bill.patientId].totalBilled += bill.amount;
        if (bill.status === 'Unpaid') {
            acc[bill.patientId].totalDue += bill.amount;
        }
        return acc;
    }, {}) : {};
    const patientSummaries = Object.values(patientBillSummary);

    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-neutral-900">Finance Dashboard</h1>
                <button onClick={() => setShowAddBillModal(true)} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary-dark font-semibold">
                    {ICONS.add}
                    <span>Add Patient Bill</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card title="Medication Revenue" value={`$${summary.totalRevenue.toFixed(2)}`} icon={ICONS.billing} color="bg-success-light text-success-dark" />
                 <Card title="Medication Cost" value={`$${summary.totalCost.toFixed(2)}`} icon={ICONS.billing} color="bg-warning-light text-warning-dark" />
                 <Card title="Medication Profit" value={`$${summary.totalProfit.toFixed(2)}`} icon={ICONS.billing} color="bg-primary-light text-primary-dark" />
            </div>
             <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <h2 className="text-xl font-semibold mb-2 p-2">Patient Billing Summary</h2>
                 <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-100">
                            <tr className="border-b-2 border-neutral-200">
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Patient Name</th>
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm text-right">Total Billed</th>
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm text-right">Amount Due</th>
                                <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientSummaries.map((s: any) => (
                                <tr key={s.patientId} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                    <td className="p-3 font-medium">{s.patientName}</td>
                                    <td className="p-3 text-right">${s.totalBilled.toFixed(2)}</td>
                                    <td className="p-3 font-extrabold text-danger-dark text-right">${s.totalDue.toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => setSelectedPatient({ id: s.patientId, name: s.patientName })} 
                                            className="text-sm bg-primary-light text-primary-dark font-semibold px-3 py-1 rounded-md hover:bg-blue-200 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <h2 className="text-xl font-semibold mb-2 p-2">Medication Profit & Loss</h2>
                 <table className="w-full text-left">
                    <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200"><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Medication</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Patient</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Date</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Cost</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Revenue</th><th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Profit</th></tr></thead>
                    <tbody>
                        {financeData?.medicationProfit.map((item: any) => <tr key={item.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                            <td className="p-3">{item.medication}</td>
                            <td className="p-3">{item.patientName}</td>
                            <td className="p-3">{item.date}</td>
                            <td className="p-3">${item.costPrice.toFixed(2)}</td>
                            <td className="p-3">${item.sellingPrice.toFixed(2)}</td>
                            <td className={`p-3 font-bold ${item.profit > 0 ? 'text-success-dark' : 'text-danger-dark'}`}>${item.profit.toFixed(2)}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
            {showAddBillModal && <AddBillModal onClose={() => setShowAddBillModal(false)} onAdded={fetchData} />}
            {selectedPatient && <PatientBillDetailsModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} allBills={financeData?.patientPayments || []} />}
        </div>
    );
}

const ManagerDashboard: React.FC = () => {
    const [workload, setWorkload] = useState<any[]>([]);
    const [financeData, setFinanceData] = useState<any>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    
    useEffect(() => {
        api.getDoctorWorkload().then(setWorkload);
        api.getFinancialData().then(setFinanceData);
        api.getAttendance().then(att => setAttendance(att.filter(a => a.date === new Date().toISOString().split('T')[0])));
    }, []);

    const summary = financeData ? financeData.medicationProfit.reduce((acc: any, curr: any) => {
        acc.totalRevenue += curr.sellingPrice;
        acc.totalCost += curr.costPrice;
        return acc;
    }, { totalRevenue: 0, totalCost: 0 }) : { totalRevenue: 0, totalCost: 0 };
    summary.totalProfit = summary.totalRevenue - summary.totalCost;

    const downloadFinancials = () => {
        if (!financeData) return;
        const data = {
            financialSummary: summary,
            patientPayments: financeData.patientPayments,
            medicationProfitDetails: financeData.medicationProfit
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `financial_report_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const onDutyStaff = attendance.filter(a => a.inTime && !a.outTime);

    return (
        <div className="space-y-8">
            <AttendanceTracker />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-neutral-900">Manager's Overview</h1>
                <button onClick={downloadFinancials} disabled={!financeData} className="bg-primary text-white px-4 py-2 rounded-lg disabled:bg-neutral-400 font-semibold">Download Financial Report</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card title="Medication Revenue" value={`$${summary.totalRevenue.toFixed(2)}`} icon={ICONS.billing} color="bg-success-light text-success-dark" />
                 <Card title="Medication Profit" value={`$${summary.totalProfit.toFixed(2)}`} icon={ICONS.billing} color="bg-primary-light text-primary-dark" />
                 <Card title="Staff on Duty" value={onDutyStaff.length} icon={ICONS.users} color="bg-warning-light text-warning-dark" />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                    <h2 className="text-xl font-semibold mb-2 p-2">Doctor Workload (Active Patients)</h2>
                    <ul>{workload.map(w => <li key={w.doctorId} className="flex justify-between p-2 border-b"><span>{w.doctorName}</span><span className="font-bold">{w.patientCount} patients</span></li>)}</ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                    <h2 className="text-xl font-semibold mb-2 p-2">Staff on Duty Today</h2>
                    <ul>
                        {onDutyStaff.length > 0 ? (
                            onDutyStaff.map(a => <li key={a.id} className="p-2 border-b">{a.staffName} - Clocked in at {a.inTime}</li>)
                        ) : (
                            <li className="p-2 text-center text-neutral-500">No staff currently on duty.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const AttendanceTracker: React.FC = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAttendance = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const record = await api.getTodaysAttendance(user.id);
            setAttendance(record);
        } catch (error) {
            console.error("Failed to fetch attendance", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleClockIn = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const newRecord = await api.clockIn(user.id);
            setAttendance(newRecord);
        } catch (error) {
            console.error("Failed to clock in", error);
            alert("Clock in failed.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClockOut = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const updatedRecord = await api.clockOut(user.id);
            setAttendance(updatedRecord);
        } catch (error) {
            console.error("Failed to clock out", error);
            alert("Clock out failed.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading && !attendance) {
        return <div className="p-4 bg-white shadow-soft rounded-lg text-center h-24 animate-pulse"></div>
    }

    const hasClockedIn = attendance && attendance.inTime;
    const hasClockedOut = attendance && attendance.outTime;

    return (
        <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold text-neutral-800">Today's Attendance</h2>
                <p className="text-sm text-neutral-500">
                    {hasClockedIn ? `Checked In at: ${attendance.inTime}` : 'You have not checked in today.'}
                    {hasClockedOut && ` | Checked Out at: ${attendance.outTime}`}
                </p>
            </div>
            <div>
                {!hasClockedIn && (
                    <button onClick={handleClockIn} disabled={isLoading} className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark font-semibold">Check In</button>
                )}
                {hasClockedIn && !hasClockedOut && (
                    <button onClick={handleClockOut} disabled={isLoading} className="bg-danger-light text-danger-dark px-4 py-2 rounded-lg hover:bg-danger-dark hover:text-white font-semibold">Check Out</button>
                )}
                {hasClockedIn && hasClockedOut && (
                    <span className="text-success-dark font-semibold">Completed for today</span>
                )}
            </div>
        </div>
    )
}

export default HospitalPortal;