import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { ICONS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Appointment, TestRequest, Prescription, Bill, InsuranceDoc, Department, Doctor, DischargeSummary } from '../types';
import * as api from '../services/api';

const PatientPortal: React.FC = () => {
    const navItems = [
        { to: '/patient', label: 'Dashboard', icon: ICONS.dashboard },
        { to: '/patient/appointments', label: 'Appointments', icon: ICONS.appointment },
        { to: '/patient/records', label: 'My Records', icon: ICONS.records },
        { to: '/patient/billing', label: 'Billing', icon: ICONS.billing },
        { to: '/patient/insurance', label: 'Insurance', icon: ICONS.insurance },
    ];

    return (
        <div className="flex bg-brand-gray-light min-h-screen">
            <Sidebar navItems={navItems} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-6 flex-1 text-gray-800">
                    <Routes>
                        <Route index element={<PatientDashboard />} />
                        <Route path="appointments" element={<PatientAppointments />} />
                        <Route path="records" element={<PatientRecords />} />
                        <Route path="billing" element={<PatientBilling />} />
                        <Route path="insurance" element={<PatientInsurance />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const PatientDashboard: React.FC = () => {
    const { user } = useAuth();
    const [upcomingAppointment, setUpcoming] = useState<Appointment | null>(null);

    useEffect(() => {
        if(user) {
            api.getPatientAppointments(user.id).then(apps => {
                const upcoming = apps.filter(a => new Date(a.date) >= new Date() && (a.status === 'Scheduled' || a.status === 'Pending Triage')).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setUpcoming(upcoming[0] || null);
            }).catch(console.error);
        }
    }, [user]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.name}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {upcomingAppointment ? (
                    <div className="bg-brand-blue-light p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
                        <h2 className="text-xl font-semibold text-brand-blue-dark mb-2">Upcoming Appointment</h2>
                        <p><strong>With:</strong> {upcomingAppointment.doctorName || 'To be assigned'}</p>
                        <p><strong>Department:</strong> {upcomingAppointment.departmentName}</p>
                        <p><strong>Date:</strong> {upcomingAppointment.date} at {upcomingAppointment.time}</p>
                        <p><strong>Status:</strong> {upcomingAppointment.status}</p>
                    </div>
                ) : (
                    <div className="bg-brand-green-light p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
                        <h2 className="text-xl font-semibold text-brand-green-dark mb-2">No Upcoming Appointments</h2>
                        <p>You are all clear! You can book a new appointment if needed.</p>
                    </div>
                )}
                <Link to="/patient/appointments" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center flex flex-col justify-center items-center">
                    <span className="text-brand-blue">{ICONS.appointment}</span>
                    <h3 className="text-lg font-semibold mt-2">Book Appointment</h3>
                    <p className="text-sm text-gray-500">Schedule a new visit</p>
                </Link>
            </div>
        </div>
    );
};


const PatientAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchAppointments = () => {
    if (user) {
      api.getPatientAppointments(user.id).then(setAppointments).catch(console.error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const getStatusChip = (status: Appointment['status']) => {
    switch(status) {
        case 'Scheduled': return 'bg-yellow-200 text-yellow-800';
        case 'Completed': return 'bg-green-200 text-green-800';
        case 'Cancelled': return 'bg-red-200 text-red-800';
        case 'Pending Triage': return 'bg-blue-200 text-blue-800';
        default: return 'bg-gray-200 text-gray-800';
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
        <button onClick={() => setShowModal(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-brand-blue-dark">
          {ICONS.add}
          <span>Book New Appointment</span>
        </button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Doctor</th>
              <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Department</th>
              <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Date & Time</th>
              <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(app => (
              <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-800 font-medium">{app.doctorName || 'To be assigned'}</td>
                <td className="p-3 text-gray-600">{app.departmentName}</td>
                <td className="p-3 text-gray-600">{app.date} at {app.time}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(app.status)}`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && <AppointmentModal onClose={() => setShowModal(false)} onBooked={fetchAppointments} />}
    </>
  );
};

const AppointmentModal: React.FC<{onClose: () => void; onBooked: () => void}> = ({onClose, onBooked}) => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.getDepartments().then(setDepartments).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user || !selectedDept || !date || !time) return;
        setIsLoading(true);
        
        const department = departments.find(d => d.id === selectedDept);

        if(department) {
            try {
                await api.bookAppointment({
                    patientId: user.id,
                    patientName: user.name,
                    departmentName: department.name,
                    date,
                    time,
                });
                onBooked();
                onClose();
            } catch (error) {
                console.error("Failed to book appointment", error);
                alert("Could not book appointment. Please try again.");
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} required className="w-full p-2 border rounded">
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border rounded" min={new Date().toISOString().split("T")[0]}/>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full p-2 border rounded" />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded disabled:bg-gray-400">{isLoading ? "Requesting..." : "Request Appointment"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const PatientRecords: React.FC = () => {
    const { user } = useAuth();
    const [tests, setTests] = useState<TestRequest[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [summaries, setSummaries] = useState<DischargeSummary[]>([]);

    useEffect(() => {
        if(user) {
            api.getPatientTests(user.id).then(setTests).catch(console.error);
            api.getPatientPrescriptions(user.id).then(setPrescriptions).catch(console.error);
            api.getPatientDischargeSummaries(user.id).then(setSummaries).catch(console.error);
        }
    }, [user]);

    const downloadSummary = (summary: DischargeSummary) => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(summary, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `discharge-summary-${summary.patientInfo?.name?.replace(' ', '_')}-${new Date(summary.generationDate).toLocaleDateString()}.json`;
        link.click();
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Medical Records</h1>
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Test Results</h2>
                     <table className="w-full text-left">
                        <thead><tr className="border-b">
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Test</th>
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Type</th>
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Date</th>
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Status</th>
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Result</th>
                        </tr></thead>
                        <tbody>
                            {tests.map(t => <tr key={t.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 text-gray-800 font-medium">{t.testName}</td>
                                <td className="p-2 text-gray-600">{t.type}</td>
                                <td className="p-2 text-gray-600">{t.requestDate}</td>
                                <td className="p-2 text-gray-600">{t.status}</td>
                                <td className="p-2 text-gray-600">{t.result || 'N/A'}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Prescriptions</h2>
                    <table className="w-full text-left">
                        <thead><tr className="border-b">
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Date</th>
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Medication</th>
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Dosage</th>
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Doctor</th>
                        </tr></thead>
                        <tbody>
                            {prescriptions.map(p => <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 text-gray-600">{p.date}</td>
                                <td className="p-2 text-gray-800 font-medium">{p.medication}</td>
                                <td className="p-2 text-gray-600">{p.dosage}</td>
                                <td className="p-2 text-gray-600">{p.doctorName}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Discharge Summaries</h2>
                    <table className="w-full text-left">
                        <thead><tr className="border-b">
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Generated On</th>
                            <th className="p-2 font-semibold text-gray-500 uppercase tracking-wider text-sm">Action</th>
                        </tr></thead>
                        <tbody>
                            {summaries.map(s => <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 text-gray-600">{new Date(s.generationDate).toLocaleString()}</td>
                                <td className="p-2">
                                    <button onClick={() => downloadSummary(s)} className="text-brand-blue hover:underline">Download Summary</button>
                                </td>
                            </tr>)}
                            {summaries.length === 0 && (
                                <tr><td colSpan={2} className="p-2 text-center text-gray-500">No summaries available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
const PatientBilling: React.FC = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    useEffect(() => {
        if(user) api.getPatientBills(user.id).then(setBills).catch(console.error);
    }, [user]);
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Billing & Payments</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead><tr className="border-b">
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Date</th>
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Details</th>
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Amount</th>
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Status</th>
                    </tr></thead>
                    <tbody>
                        {bills.map(b => <tr key={b.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-gray-600">{b.date}</td>
                            <td className="p-3 text-gray-800 font-medium">{b.details}</td>
                            <td className="p-3 text-gray-800 font-medium">${b.amount.toFixed(2)}</td>
                        <td className="p-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${b.status === 'Paid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {b.status}
                            </span>
                        </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
};
const PatientInsurance: React.FC = () => {
    const { user } = useAuth();
    const [docs, setDocs] = useState<InsuranceDoc[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchDocs = () => {
        if (user) api.getPatientInsuranceDocs(user.id).then(setDocs).catch(console.error);
    };

    useEffect(() => {
        fetchDocs();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleUpload = async () => {
        if (user && file) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('document', file);
            try {
                await api.uploadInsuranceDoc(user.id, formData);
                setFile(null);
                fetchDocs();
            } catch (error) {
                console.error("Upload failed", error);
                alert("File upload failed.");
            } finally {
                setIsUploading(false);
            }
        }
    };
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Insurance Documents</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
                <div className="flex items-center space-x-4">
                    <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="flex-1 p-2 border rounded" />
                    <button onClick={handleUpload} disabled={!file || isUploading} className="bg-brand-blue text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-brand-blue-dark disabled:bg-gray-400">
                        {ICONS.upload}
                        <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    </button>
                </div>
            </div>
             <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead><tr className="border-b">
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">File Name</th>
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Upload Date</th>
                    </tr></thead>
                    <tbody>
                        {docs.map(d => <tr key={d.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-gray-800 font-medium">{d.fileName}</td>
                            <td className="p-3 text-gray-600">{d.uploadDate}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default PatientPortal;