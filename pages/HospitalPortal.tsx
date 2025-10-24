import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { ICONS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { UserRole, Appointment, TestRequest, TestType, User, NurseTask, Prescription, Department, Doctor, TriageInfo, DischargeSummary } from '../types';
import * as api from '../services/api';
import Card from '../components/Card';

const HospitalPortal: React.FC = () => {
    const { user } = useAuth();
    
    let navItems: { to: string; label: string; icon: React.ReactNode }[] = [];
    const basePath = '/hospital';

    if (user) {
        switch (user.role) {
            case UserRole.ADMIN:
                navItems = [
                    { to: basePath, label: 'Dashboard', icon: ICONS.dashboard },
                    { to: `${basePath}/staff`, label: 'Manage Staff', icon: ICONS.users },
                ];
                break;
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
                ];
                break;
            case UserRole.LAB_TECHNICIAN:
                 navItems = [ { to: basePath, label: 'Lab Requests', icon: ICONS.lab } ];
                 break;
            case UserRole.RADIOLOGIST:
                navItems = [ { to: basePath, label: 'Radiology Queue', icon: ICONS.radiology } ];
                break;
        }
    }
    
    const renderRoutes = () => {
        if (!user) return <p>Loading...</p>;
        switch (user.role) {
            case UserRole.ADMIN:
                return (
                    <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="staff" element={<ManageStaff />} />
                    </Routes>
                );
            case UserRole.DOCTOR:
                 return (
                    <Routes>
                        <Route index element={<DoctorDashboard />} />
                        <Route path="appointments" element={<DoctorAppointments />} />
                    </Routes>
                );
            case UserRole.NURSE:
                 return (
                    <Routes>
                        <Route index element={<NurseDashboard />} />
                        <Route path="triage" element={<NurseTriageQueue />} />
                    </Routes>
                );
            case UserRole.LAB_TECHNICIAN:
                 return <Routes><Route index element={<LabDashboard />} /></Routes>;
            case UserRole.RADIOLOGIST:
                return <Routes><Route index element={<RadiologyDashboard />} /></Routes>;
            default:
                return <p>Dashboard not available for your role.</p>;
        }
    };


    return (
        <div className="flex bg-brand-gray-light min-h-screen">
            <Sidebar navItems={navItems} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-6 flex-1">
                   {renderRoutes()}
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

    const fetchSummaries = useCallback(() => {
        api.getAllDischargeSummaries().then(setSummaries).catch(console.error);
    }, []);

    useEffect(() => {
        api.getDashboardStats().then(setStats).catch(console.error);
        api.getAllPatients().then(setPatients).catch(console.error);
        fetchSummaries();
    }, [fetchSummaries]);
    
    const generatePdfContent = (summary: DischargeSummary) => {
        const patient = summary.patientInfo;
        const appointments = summary.appointments;
        const tests = summary.tests;
        const prescriptions = summary.prescriptions;

        return `
            <html>
                <head><title>Discharge Summary: ${patient?.name}</title>
                <style>
                    body { font-family: sans-serif; margin: 2em; }
                    h1, h2, h3 { color: #1E3A8A; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background-color: #E8F0FE; }
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
            fetchSummaries();
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
            fetchSummaries();
        } catch (error) {
            console.error('Failed to approve summary:', error);
            alert('Could not approve summary.');
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card title="Total Appointments" value={stats.totalAppointments} icon={ICONS.appointment} color="bg-blue-100 text-blue-600" />
                <Card title="Total Lab/Radiology Tests" value={stats.totalTests} icon={ICONS.lab} color="bg-yellow-100 text-yellow-600" />
                <Card title="Paid Bills" value={stats.completedBills} icon={ICONS.billing} color="bg-green-100 text-green-600" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Discharge Summary Management</h2>
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Patient</th>
                                <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Generated On</th>
                                <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Status</th>
                                <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaries.length === 0 && <tr><td colSpan={4} className="p-3 text-center text-gray-500">No summaries generated yet.</td></tr>}
                            {summaries.map(s => (
                                <tr key={s.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{s.patientName}</td>
                                    <td className="p-3">{new Date(s.generationDate).toLocaleString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.status === 'Approved' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="p-3 space-x-2">
                                        {s.status === 'Pending Approval' && (
                                            <button onClick={() => handleApprove(s.id)} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">Approve</button>
                                        )}
                                        <button onClick={() => handleDownload(s, 'json')} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">JSON</button>
                                        <button onClick={() => handleDownload(s, 'pdf')} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">PDF</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md mt-8">
                 <h2 className="text-xl font-semibold mb-4 text-gray-800">Generate Patient Summaries</h2>
                <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="p-3">Patient ID</th><th className="p-3">Name</th><th className="p-3">ABHA ID</th><th className="p-3">Actions</th></tr></thead>
                    <tbody>
                        {patients.map(p => <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{p.id}</td><td className="p-3">{p.name}</td><td className="p-3">{p.abhaId}</td>
                            <td className="p-3 space-x-2">
                                <button onClick={() => handleGenerateSummary(p.id)} disabled={generatingPatientId === p.id} className="text-sm bg-brand-blue text-white px-3 py-1 rounded hover:bg-brand-blue-dark disabled:bg-gray-400">
                                    {generatingPatientId === p.id ? 'Generating...' : 'Generate Summary'}
                                </button>
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const ManageStaff: React.FC = () => {
    const [staff, setStaff] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);

    const fetchStaff = useCallback(() => {
        api.getAllStaff().then(setStaff).catch(console.error);
    }, []);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Staff</h1>
                 <button onClick={() => setShowModal(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-brand-blue-dark">
                    {ICONS.add}
                    <span>Add New Staff</span>
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="p-3">Staff ID</th><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Department</th></tr></thead>
                    <tbody>
                        {staff.map(s => <tr key={s.id} className="border-b hover:bg-gray-50"><td className="p-3">{s.id}</td><td className="p-3">{s.name}</td><td className="p-3">{s.role}</td><td className="p-3">{s.department || 'N/A'}</td></tr>)}
                    </tbody>
                </table>
            </div>
            {showModal && <AddStaffModal onClose={() => setShowModal(false)} onAdded={fetchStaff} />}
        </>
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

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add New Staff Member</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded"/>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} required className="w-full p-2 border rounded">
                        <option value="">Select Role</option>
                        {staffRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {showDepartment && (
                        <select value={department} onChange={e => setDepartment(e.target.value)} required className="w-full p-2 border rounded">
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                    )}
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border rounded"/>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded disabled:bg-gray-400">{isLoading ? "Adding..." : "Add Staff"}</button>
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
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor's Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Today's Appointments ({todaysAppointments.length})</h2>
                 <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white">
                            <tr className="border-b">
                                <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm" style={{color: 'black'}}>Patient</th>
                                <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm" style={{color: 'black'}}>Time</th>
                                <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm" style={{color: 'black'}}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todaysAppointments.length > 0 ? todaysAppointments.map(a => 
                            <tr key={a.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-black">{a.patientName}</td>
                                <td className="p-3 text-black">{a.time}</td>
                                <td className="p-3"> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${a.status === 'Scheduled' ? 'bg-yellow-200 text-yellow-800' : a.status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{a.status}</span></td>
                            </tr>) : 
                            <tr><td colSpan={3} className="p-3 text-center text-gray-500">No appointments scheduled for today.</td></tr>
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
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">All Appointments</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full text-left">
                     <thead>
                        <tr className="border-b">
                            <th className="p-3 font-semibold uppercase tracking-wider text-sm" style={{color: 'black'}}>Patient</th>
                            <th className="p-3 font-semibold uppercase tracking-wider text-sm" style={{color: 'black'}}>Date</th>
                            <th className="p-3 font-semibold uppercase tracking-wider text-sm" style={{color: 'black'}}>Time</th>
                            <th className="p-3 font-semibold uppercase tracking-wider text-sm" style={{color: 'black'}}>Status</th>
                            <th className="p-3 font-semibold uppercase tracking-wider text-sm" style={{color: 'black'}}>Action</th>
                        </tr>
                    </thead>
                     <tbody>
                        {appointments.map(app => (
                            <tr key={app.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-black">{app.patientName}</td>
                                <td className="p-3 text-black">{app.date}</td>
                                <td className="p-3 text-black">{app.time}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === 'Scheduled' ? 'bg-yellow-200 text-yellow-800' : app.status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{app.status}</span></td>
                                <td className="p-3"><button onClick={() => setSelectedAppointment(app)} className="text-brand-blue hover:underline">View Record</button></td>
                            </tr>
                        ))}
                     </tbody>
                </table>
            </div>
            {selectedAppointment && <PatientRecordModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onUpdate={fetchAppointments} />}
        </>
    );
};

interface MedicalHistory {
    patientInfo: {id: string; name: string; abhaId?: string} | null;
    appointments: Appointment[];
    tests: TestRequest[];
    prescriptions: Prescription[];
}

const TriageInfoDisplay: React.FC<{triageData: TriageInfo}> = ({ triageData }) => (
    <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2 text-blue-800">Triage Information (from Nurse)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
                <h4 className="font-semibold text-black">Vitals</h4>
                <p className="text-black"><strong>BP:</strong> {triageData.vitals.bloodPressure}</p>
                <p className="text-black"><strong>Temp:</strong> {triageData.vitals.temperature}</p>
                <p className="text-black"><strong>Heart Rate:</strong> {triageData.vitals.heartRate}</p>
                <p className="text-black"><strong>Resp. Rate:</strong> {triageData.vitals.respiratoryRate}</p>
            </div>
            <div>
                <h4 className="font-semibold text-black">Allergies</h4>
                <p className="text-black"><strong>Food:</strong> {triageData.allergies.food || 'None reported'}</p>
                <p className="text-black"><strong>Medication:</strong> {triageData.allergies.medication || 'None reported'}</p>
            </div>
            <div className="md:col-span-2">
                 <h4 className="font-semibold text-black">Current Medications</h4>
                 <p className="text-black">{triageData.currentMedications || 'None reported'}</p>
            </div>
             <div className="md:col-span-2">
                 <h4 className="font-semibold text-black">Triage Notes</h4>
                 <p className="whitespace-pre-wrap text-black">{triageData.triageNotes || 'N/A'}</p>
            </div>
        </div>
    </div>
);

const PatientRecordModal: React.FC<{appointment: Appointment; onClose: () => void; onUpdate: () => void;}> = ({ appointment, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<MedicalHistory | null>(null);
    const [notes, setNotes] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    
    const [testOrder, setTestOrder] = useState('');
    const [isOrderingTests, setIsOrderingTests] = useState(false);
    
    const [newPrescription, setNewPrescription] = useState({ medication: '', dosage: '', instructions: '' });
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
            if(status) onClose(); // Only close if status is changed
            else setNotes(''); // Clear notes input on save
        } catch (error) {
            console.error(error);
            alert("Failed to update appointment.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOrderTests = async () => {
        if (!user || !testOrder.trim()) return;
        setIsOrderingTests(true);
        try {
            await api.orderTests(user.id, appointment.patientId, appointment.patientName, testOrder);
            setTestOrder('');
            fetchHistory(); // Refresh history to show new pending tests
        } catch (error) {
            console.error(error);
            alert("Failed to order lab tests.");
        } finally {
            setIsOrderingTests(false);
        }
    };

    const handleAddPrescription = async () => {
        if (!user || !newPrescription.medication.trim()) return;
        setIsPrescribing(true);
        try {
            await api.addPrescription({
                ...newPrescription,
                patientId: appointment.patientId,
                doctorId: user.id,
                doctorName: user.name,
                date: new Date().toISOString().split('T')[0],
            });
            setNewPrescription({ medication: '', dosage: '', instructions: '' });
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error(error);
            alert("Failed to add prescription.");
        } finally {
            setIsPrescribing(false);
        }
    }


    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-black">Patient Record: {history?.patientInfo?.name}</h2>
                        <p className="text-black">ABHA ID: {history?.patientInfo?.abhaId}</p>
                        <p className="text-black">Current Appointment: {appointment.date} at {appointment.time}</p>
                    </div>
                     <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
               
                {history ? (
                    <div className="space-y-6">
                        {appointment.triageData && <TriageInfoDisplay triageData={appointment.triageData} />}
                        
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-black">Current Appointment Notes</h3>
                            <p className="text-sm text-black whitespace-pre-wrap mb-2">{appointment.notes || "No notes for this appointment yet."}</p>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 border rounded" placeholder="Add new notes..."></textarea>
                        </div>
                        
                        <div className="border p-4 rounded-lg space-y-4">
                            <h3 className="font-bold text-lg text-black">Lab & Prescriptions</h3>
                             <div>
                                <label className="font-semibold text-black block mb-1">Order Lab Tests</label>
                                <div className="flex space-x-2">
                                    <input type="text" value={testOrder} onChange={e => setTestOrder(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Enter test names, separated by commas..."/>
                                    <button onClick={handleOrderTests} disabled={isOrderingTests || !testOrder.trim()} className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400">Order</button>
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-black block mb-1">Add Prescription</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <input type="text" value={newPrescription.medication} onChange={e => setNewPrescription({...newPrescription, medication: e.target.value})} className="p-2 border rounded" placeholder="Medication"/>
                                    <input type="text" value={newPrescription.dosage} onChange={e => setNewPrescription({...newPrescription, dosage: e.target.value})} className="p-2 border rounded" placeholder="Dosage"/>
                                    <input type="text" value={newPrescription.instructions} onChange={e => setNewPrescription({...newPrescription, instructions: e.target.value})} className="p-2 border rounded" placeholder="Instructions"/>
                                </div>
                                <button onClick={handleAddPrescription} disabled={isPrescribing || !newPrescription.medication.trim()} className="px-4 py-2 mt-2 bg-green-600 text-white rounded disabled:bg-gray-400">Add Prescription</button>
                            </div>
                        </div>

                        <div className="border p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-black">Medical History</h3>
                             <div className="space-y-2 max-h-64 overflow-y-auto">
                                <h4 className="font-semibold text-md mt-2 text-black">Past Appointments</h4>
                                {history.appointments.map(a => <div key={a.id} className="text-sm p-2 bg-gray-50 rounded text-black"><strong>{a.date}:</strong> {a.doctorName} ({a.status}) - Notes: {a.notes || 'N/A'}</div>)}
                                <h4 className="font-semibold text-md mt-2 text-black">Test Results</h4>
                                {history.tests.map(t => <div key={t.id} className="text-sm p-2 bg-gray-50 rounded text-black"><strong>{t.requestDate}:</strong> {t.testName} ({t.status}) - Result: {t.result || 'N/A'}</div>)}
                                <h4 className="font-semibold text-md mt-2 text-black">Prescriptions</h4>
                                {history.prescriptions.map(p => <div key={p.id} className="text-sm p-2 bg-gray-50 rounded text-black"><strong>{p.date}:</strong> {p.medication} ({p.dosage}) - Dr. {p.doctorName}</div>)}
                            </div>
                        </div>
                    </div>
                ) : <p>Loading medical history...</p>}

                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                    <button onClick={() => handleUpdate()} disabled={isUpdating || !notes} className="px-4 py-2 bg-brand-blue text-white rounded disabled:bg-gray-400">Save Notes</button>
                    {appointment.status === 'Scheduled' && (
                         <button onClick={() => handleUpdate('Completed')} disabled={isUpdating} className="px-4 py-2 bg-brand-green text-white rounded disabled:bg-gray-400">Mark as Completed</button>
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
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Nurse Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card title="Patients Awaiting Triage" value={triageCount} icon={ICONS.tasks} color="bg-blue-100 text-blue-600" />
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
        <>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Triage Queue</h1>
        <div className="bg-white p-4 rounded-lg shadow-md">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="p-3 font-semibold uppercase tracking-wider text-sm" style={{color: 'black'}}>Patient</th>
                        <th className="p-3 font-semibold uppercase tracking-wider text-sm" style={{color: 'black'}}>Department</th>
                        <th className="p-3 font-semibold uppercase tracking-wider text-sm" style={{color: 'black'}}>Requested Time</th>
                        <th className="p-3 font-semibold uppercase tracking-wider text-sm" style={{color: 'black'}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {queue.length > 0 ? queue.map(app => (
                        <tr key={app.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-black font-medium">{app.patientName}</td>
                            <td className="p-3 text-black">{app.departmentName}</td>
                            <td className="p-3 text-black">{app.date} at {app.time}</td>
                            <td className="p-3"><button onClick={() => setSelectedAppointment(app)} className="bg-brand-blue text-white px-3 py-1 rounded hover:bg-brand-blue-dark">Start Triage</button></td>
                        </tr>
                    )) : <tr><td colSpan={4} className="p-3 text-center text-gray-500">The triage queue is empty.</td></tr>}
                </tbody>
            </table>
        </div>
        {selectedAppointment && <TriageModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onComplete={fetchQueue} />}
        </>
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
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-full overflow-y-auto space-y-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold">Triage: {appointment.patientName}</h2>
                    <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>

                {/* Vitals Section */}
                <fieldset className="border p-4 rounded-lg">
                    <legend className="font-semibold px-2">Vitals</legend>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Blood Pressure (e.g., 120/80 mmHg)" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} className="w-full p-2 border rounded" />
                        <input type="text" placeholder="Temperature (e.g., 98.6°F)" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} className="w-full p-2 border rounded" />
                        <input type="text" placeholder="Heart Rate (e.g., 70 bpm)" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} className="w-full p-2 border rounded" />
                        <input type="text" placeholder="Respiratory Rate (e.g., 16 breaths/min)" value={vitals.respiratoryRate} onChange={e => setVitals({...vitals, respiratoryRate: e.target.value})} className="w-full p-2 border rounded" />
                    </div>
                </fieldset>
                
                 {/* Allergies Section */}
                <fieldset className="border p-4 rounded-lg">
                    <legend className="font-semibold px-2">Allergies</legend>
                    <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="Food Allergies" value={allergies.food} onChange={e => setAllergies({...allergies, food: e.target.value})} className="w-full p-2 border rounded" />
                         <input type="text" placeholder="Medication Allergies" value={allergies.medication} onChange={e => setAllergies({...allergies, medication: e.target.value})} className="w-full p-2 border rounded" />
                    </div>
                </fieldset>
                
                <textarea placeholder="List current medications..." rows={3} value={currentMedications} onChange={e => setCurrentMedications(e.target.value)} className="w-full p-2 border rounded" />
                <textarea placeholder="Additional triage notes..." rows={3} value={triageNotes} onChange={e => setTriageNotes(e.target.value)} className="w-full p-2 border rounded" />

                <div className="flex items-center space-x-4">
                    <span className="font-semibold">Assign to Doctor:</span>
                    <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} required className="flex-1 p-2 border rounded">
                        <option value="">Select Doctor from {appointment.departmentName}</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded disabled:bg-gray-400">{isLoading ? "Submitting..." : "Submit Triage & Assign"}</button>
                </div>
            </form>
        </div>
    )
}


// --- LAB & RADIOLOGY COMPONENTS ---
const LabDashboard: React.FC = () => <TestDashboard type={TestType.LAB} title="Laboratory Requests" />;
const RadiologyDashboard: React.FC = () => <TestDashboard type={TestType.RADIOLOGY} title="Radiology Queue" />;

const TestDashboard: React.FC<{type: TestType; title: string}> = ({ type, title }) => {
    const [requests, setRequests] = useState<TestRequest[]>([]);
    const [selectedTest, setSelectedTest] = useState<TestRequest | null>(null);

    const fetchRequests = useCallback(() => api.getPendingTests(type).then(setRequests).catch(console.error), [type]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleUpdate = async (result: string) => {
        if(selectedTest) {
            try {
                await api.updateTestResult(selectedTest.id, result);
                fetchRequests();
                setSelectedTest(null);
            } catch (error) {
                console.error("Failed to update test result", error);
                alert("Update failed. Please try again.");
            }
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="p-2">Patient</th><th className="p-2">Test Name</th><th className="p-2">Request Date</th><th className="p-2">Action</th></tr></thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id} className="border-b">
                                <td className="p-2">{req.patientName}</td>
                                <td className="p-2">{req.testName}</td>
                                <td className="p-2">{req.requestDate}</td>
                                <td className="p-2">
                                    <button onClick={() => setSelectedTest(req)} className="text-brand-blue hover:underline">Update Result</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedTest && <UpdateResultModal test={selectedTest} onClose={() => setSelectedTest(null)} onUpdate={handleUpdate} />}
        </div>
    );
};

const UpdateResultModal: React.FC<{test: TestRequest; onClose: () => void; onUpdate: (result: string) => void}> = ({ test, onClose, onUpdate }) => {
    const [result, setResult] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Update Result for {test.testName}</h2>
                <p className="mb-4">Patient: {test.patientName}</p>
                <textarea value={result} onChange={e => setResult(e.target.value)} rows={4} className="w-full p-2 border rounded" placeholder="Enter test result..."></textarea>
                <div className="flex justify-end space-x-2 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button onClick={() => onUpdate(result)} className="px-4 py-2 bg-brand-blue text-white rounded">Save Result</button>
                </div>
            </div>
        </div>
    );
}

export default HospitalPortal;