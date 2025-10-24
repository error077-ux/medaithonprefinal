import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { ICONS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Appointment, TestRequest, Prescription, Bill, InsuranceDetails, Department, Doctor, DischargeSummary, RoomFacility, PatientQuery } from '../types';
import * as api from '../services/api';

const PatientPortal: React.FC = () => {
    const navItems = [
        { to: '/patient', label: 'Dashboard', icon: ICONS.dashboard },
        { to: '/patient/appointments', label: 'Appointments', icon: ICONS.appointment },
        { to: '/patient/history', label: 'Medical History', icon: ICONS.records },
        { to: '/patient/billing', label: 'Billing', icon: ICONS.billing },
        { to: '/patient/insurance', label: 'Insurance', icon: ICONS.insurance },
        { to: '/patient/queries', label: 'Queries & Complaints', icon: ICONS.query },
    ];

    return (
        <div className="flex bg-neutral-100 min-h-screen">
            <Sidebar navItems={navItems} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-8 flex-1 text-neutral-800">
                    <Routes>
                        <Route index element={<PatientDashboard />} />
                        <Route path="appointments" element={<PatientAppointments />} />
                        <Route path="history" element={<PatientHistory />} />
                        <Route path="billing" element={<PatientBilling />} />
                        <Route path="insurance" element={<PatientInsurance />} />
                        <Route path="queries" element={<PatientQueriesAndComplaints />} />
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
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-neutral-900">Welcome, {user?.name}!</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200/50 lg:col-span-3">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">Demographic Information</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 text-sm">
                        <div><strong className="block text-neutral-500 font-medium">Full Name</strong>{user?.name}</div>
                        <div><strong className="block text-neutral-500 font-medium">ABHA ID</strong>{user?.abhaId}</div>
                        <div><strong className="block text-neutral-500 font-medium">Aadhaar No.</strong>{user?.aadhaar}</div>
                        <div><strong className="block text-neutral-500 font-medium">Gender</strong>{user?.gender}</div>
                        <div><strong className="block text-neutral-500 font-medium">Date of Birth</strong>{user?.dob}</div>
                        <div><strong className="block text-neutral-500 font-medium">Blood Group</strong>{user?.bloodGroup}</div>
                        <div><strong className="block text-neutral-500 font-medium">Marital Status</strong>{user?.maritalStatus}</div>
                        <div><strong className="block text-neutral-500 font-medium">Contact No.</strong>{user?.contactNumber}</div>
                        <div className="col-span-2"><strong className="block text-neutral-500 font-medium">Email</strong>{user?.email}</div>
                        <div className="col-span-2"><strong className="block text-neutral-500 font-medium">Address</strong>
                            {user?.address ? `${user.address.line1}, ${user.address.city}, ${user.address.state} - ${user.address.pincode}` : 'N/A'}
                        </div>
                        <div className="col-span-2"><strong className="block text-neutral-500 font-medium">Emergency Contact</strong>
                           {user?.emergencyContact ? `${user.emergencyContact.name} (${user.emergencyContact.phone})` : 'N/A'}
                        </div>
                    </div>
                </div>
                 {upcomingAppointment ? (
                    <div className="bg-primary-light border border-primary/50 p-6 rounded-xl shadow-soft lg:col-span-2">
                        <h2 className="text-xl font-semibold text-primary-dark mb-2">Upcoming Appointment</h2>
                        <p className="text-neutral-700"><strong>With:</strong> {upcomingAppointment.doctorName || 'To be assigned'}</p>
                        <p className="text-neutral-700"><strong>Department:</strong> {upcomingAppointment.departmentName}</p>
                        <p className="text-neutral-700"><strong>Date:</strong> {upcomingAppointment.date} at {upcomingAppointment.time}</p>
                        <p className="text-neutral-700"><strong>Status:</strong> <span className="font-semibold">{upcomingAppointment.status}</span></p>
                    </div>
                ) : (
                    <div className="bg-success-light border border-success/50 p-6 rounded-xl shadow-soft lg:col-span-2">
                        <h2 className="text-xl font-semibold text-success-dark mb-2">No Upcoming Appointments</h2>
                        <p className="text-neutral-700">You are all clear! You can book a new appointment if needed.</p>
                    </div>
                )}
                <Link to="/patient/appointments" className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200/50 hover:shadow-lifted transition-shadow text-center flex flex-col justify-center items-center hover:-translate-y-1 transform duration-300">
                    <span className="text-primary">{React.cloneElement(ICONS.appointment, { className: 'w-10 h-10' })}</span>
                    <h3 className="text-lg font-semibold mt-2 text-neutral-900">Book Appointment</h3>
                    <p className="text-sm text-neutral-500">Schedule a new visit</p>
                </Link>
            </div>
        </div>
    );
};


const PatientAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchAppointments = useCallback(() => {
    if (user) {
      api.getPatientAppointments(user.id).then(setAppointments).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  
  const getStatusChip = (status: Appointment['status']) => {
    switch(status) {
        case 'Scheduled': return 'bg-warning-light text-warning-dark';
        case 'Completed': return 'bg-success-light text-success-dark';
        case 'Cancelled': return 'bg-danger-light text-danger-dark';
        case 'Pending Triage': return 'bg-primary-light text-primary-dark';
        default: return 'bg-neutral-200 text-neutral-800';
    }
  }

  const handleBooked = () => {
      fetchAppointments();
      alert("Appointment requested successfully! If you booked a room, a corresponding bill has been added to your account.");
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">My Appointments</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-dark font-semibold shadow-soft hover:shadow-lg transition-all">
          {ICONS.add}
          <span>Book New Appointment</span>
        </button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
        <table className="w-full text-left">
          <thead className="bg-neutral-100">
            <tr className="border-b-2 border-neutral-200">
              <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Doctor</th>
              <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Department</th>
              <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Date & Time</th>
              <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-neutral-500">No appointments found.</td></tr>}
            {appointments.map(app => (
              <tr key={app.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                <td className="p-3 text-neutral-800 font-medium">{app.doctorName || 'To be assigned'}</td>
                <td className="p-3 text-neutral-600">{app.departmentName}</td>
                <td className="p-3 text-neutral-600">{app.date} at {app.time}</td>
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
      {showModal && <AppointmentModal onClose={() => setShowModal(false)} onBooked={handleBooked} />}
    </>
  );
};

const AppointmentModal: React.FC<{onClose: () => void; onBooked: () => void}> = ({onClose, onBooked}) => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [rooms, setRooms] = useState<RoomFacility[]>([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [requireRoom, setRequireRoom] = useState(false);
    const [roomBooking, setRoomBooking] = useState({ type: '', checkIn: '', checkOut: '' });
    
    useEffect(() => {
        api.getDepartments().then(setDepartments).catch(console.error);
        api.getRoomFacilities().then(setRooms).catch(console.error);
    }, []);

    useEffect(() => {
        setRoomBooking(prev => ({ ...prev, checkIn: date }));
    }, [date]);

    const calculateRoomCost = () => {
        if (requireRoom && roomBooking.type && roomBooking.checkIn && roomBooking.checkOut) {
            const roomInfo = rooms.find(r => r.type === roomBooking.type);
            if (!roomInfo) return 0;
            const nights = (new Date(roomBooking.checkOut).getTime() - new Date(roomBooking.checkIn).getTime()) / (1000 * 3600 * 24);
            return nights > 0 ? nights * roomInfo.pricePerNight : 0;
        }
        return 0;
    };
    const totalRoomCost = calculateRoomCost();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user || !selectedDept || !date || !time) return;
        if(requireRoom && totalRoomCost <= 0) {
            alert("Please select a valid room type and check-in/check-out dates.");
            return;
        }

        setIsLoading(true);
        const department = departments.find(d => d.id === selectedDept);

        if(department) {
            try {
                await api.bookAppointment(
                    {
                        patientId: user.id,
                        patientName: user.name,
                        departmentName: department.name,
                        date,
                        time,
                    },
                    requireRoom ? {
                        roomType: roomBooking.type as RoomFacility['type'],
                        checkIn: roomBooking.checkIn,
                        checkOut: roomBooking.checkOut,
                    } : undefined
                );
                onBooked();
                onClose();
            } catch (error) {
                console.error("Failed to book appointment", error);
                alert("Could not book appointment. Please try again.");
            }
        }
        setIsLoading(false);
    };
    
    const inputClass = "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lifted w-full max-w-lg max-h-full flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-900">Book Appointment</h2>
                    <button onClick={onClose} className="text-2xl text-neutral-500 hover:text-danger-dark">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <h3 className="font-semibold text-neutral-700 mb-2">Appointment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} required className={`${inputClass} md:col-span-2`}>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={inputClass} min={new Date().toISOString().split("T")[0]}/>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} required className={inputClass} />
                        </div>
                    </div>
                    
                    <div className="border-t pt-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" checked={requireRoom} onChange={e => setRequireRoom(e.target.checked)} className="h-5 w-5 rounded text-primary focus:ring-primary"/>
                            <span className="font-semibold text-neutral-700">Require room booking for this appointment?</span>
                        </label>
                        {requireRoom && (
                            <div className="mt-4 space-y-4 border p-4 rounded-md bg-neutral-50">
                                <h3 className="font-semibold text-neutral-700">Room Booking Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <select value={roomBooking.type} onChange={e => setRoomBooking({...roomBooking, type: e.target.value})} required className={inputClass}>
                                        <option value="">Select Room Type</option>
                                        {rooms.map(r => <option key={r.id} value={r.type}>{r.type} (${r.pricePerNight}/night)</option>)}
                                    </select>
                                    <input type="date" value={roomBooking.checkIn} onChange={e => setRoomBooking({...roomBooking, checkIn: e.target.value})} required className={inputClass} min={date || new Date().toISOString().split("T")[0]}/>
                                    <input type="date" value={roomBooking.checkOut} onChange={e => setRoomBooking({...roomBooking, checkOut: e.target.value})} required className={inputClass} min={roomBooking.checkIn || new Date().toISOString().split("T")[0]}/>
                                </div>
                                {totalRoomCost > 0 && (
                                    <p className="font-semibold text-lg text-right text-neutral-800">Room Cost: <span className="text-primary">${totalRoomCost.toFixed(2)}</span></p>
                                )}
                            </div>
                        )}
                    </div>
                </form>
                <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold transition-colors">Cancel</button>
                    <button type="submit" form="appointment-form" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold disabled:bg-neutral-400 transition-colors">
                      {isLoading ? "Requesting..." : "Request Appointment"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const PatientHistory: React.FC = () => {
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
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-6">My Medical History</h1>
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                    <h2 className="text-xl font-semibold mb-2 p-2">Test Results</h2>
                     <table className="w-full text-left">
                        <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200">
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Test</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Type</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Date</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Status</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Result</th>
                        </tr></thead>
                        <tbody>
                            {tests.map(t => <tr key={t.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                <td className="p-3 text-neutral-800 font-medium">{t.testName}</td>
                                <td className="p-3 text-neutral-600">{t.type}</td>
                                <td className="p-3 text-neutral-600">{t.requestDate}</td>
                                <td className="p-3 text-neutral-600">{t.status}</td>
                                <td className="p-3 text-neutral-600">
                                    {t.result || 'N/A'}
                                    {t.imageUrl && (
                                        <a href={t.imageUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline text-sm font-semibold">[View Image]</a>
                                    )}
                                </td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                    <h2 className="text-xl font-semibold mb-2 p-2">Prescriptions</h2>
                    <table className="w-full text-left">
                        <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200">
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Date</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Medication</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Dosage</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Doctor</th>
                        </tr></thead>
                        <tbody>
                            {prescriptions.map(p => <tr key={p.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                <td className="p-3 text-neutral-600">{p.date}</td>
                                <td className="p-3 text-neutral-800 font-medium">{p.medication}</td>
                                <td className="p-3 text-neutral-600">{p.dosage}</td>
                                <td className="p-3 text-neutral-600">{p.doctorName}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                    <h2 className="text-xl font-semibold mb-2 p-2">Discharge Summaries</h2>
                    <table className="w-full text-left">
                        <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200">
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Generated On</th>
                            <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Action</th>
                        </tr></thead>
                        <tbody>
                            {summaries.map(s => <tr key={s.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                                <td className="p-3 text-neutral-600">{new Date(s.generationDate).toLocaleString()}</td>
                                <td className="p-3">
                                    <button onClick={() => downloadSummary(s)} className="font-semibold text-primary hover:underline">Download Summary</button>
                                </td>
                            </tr>)}
                            {summaries.length === 0 && (
                                <tr><td colSpan={2} className="p-4 text-center text-neutral-500">No summaries available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
const PaymentModal: React.FC<{bill: Bill, onClose: () => void, onPaymentSuccess: () => void}> = ({ bill, onClose, onPaymentSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');

    const handlePay = async () => {
        setIsLoading(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
            await api.payBill(bill.id);
            alert("Payment Successful!");
            onPaymentSuccess();
        } catch (error) {
            console.error("Payment failed", error);
            alert("Payment failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lifted w-full max-w-md">
                <div className="p-5 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-900">Complete Your Payment</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-neutral-50 p-4 rounded-md border">
                        <p className="text-neutral-600"><strong>Details:</strong> {bill.details}</p>
                        <p className="text-2xl font-bold mt-2 text-neutral-900">Amount: ${bill.amount.toFixed(2)}</p>
                    </div>
                    <div className="space-y-2">
                        <label className="font-semibold text-neutral-700">Select Payment Method:</label>
                        <div className="flex flex-col space-y-2">
                            {['Credit Card', 'Debit Card', 'UPI'].map(method => (
                                <label key={method} className="flex items-center p-3 border rounded-lg has-[:checked]:bg-primary-light has-[:checked]:border-primary transition-colors cursor-pointer">
                                    <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mr-3 h-4 w-4 text-primary focus:ring-primary"/>
                                    <span className="font-medium">{method}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 p-5 bg-neutral-100 border-t border-neutral-200 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold">Cancel</button>
                    <button onClick={handlePay} disabled={isLoading} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark font-semibold disabled:bg-neutral-400">
                        {isLoading ? "Processing..." : `Pay $${bill.amount.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PatientBilling: React.FC = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [billToPay, setBillToPay] = useState<Bill | null>(null);

    const fetchBills = useCallback(() => {
        if(user) api.getPatientBills(user.id).then(setBills).catch(console.error);
    }, [user]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);
    
    const handlePaymentSuccess = () => {
        setBillToPay(null);
        fetchBills();
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-6">Billing & Payments</h1>
            <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200/50">
                <table className="w-full text-left">
                    <thead className="bg-neutral-100"><tr className="border-b-2 border-neutral-200">
                        <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Date</th>
                        <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Details</th>
                        <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Amount</th>
                        <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Status</th>
                        <th className="p-3 font-semibold text-neutral-500 uppercase tracking-wider text-sm">Action</th>
                    </tr></thead>
                    <tbody>
                        {bills.map(b => <tr key={b.id} className="border-b border-neutral-200 hover:bg-primary-light/30">
                            <td className="p-3 text-neutral-600">{b.date}</td>
                            <td className="p-3 text-neutral-800 font-medium">{b.details}</td>
                            <td className="p-3 text-neutral-800 font-medium">${b.amount.toFixed(2)}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${b.status === 'Paid' ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'}`}>
                                    {b.status}
                                </span>
                            </td>
                            <td className="p-3">
                                {b.status === 'Unpaid' && (
                                    <button onClick={() => setBillToPay(b)} className="bg-secondary text-white px-3 py-1 text-xs rounded-md hover:bg-secondary-dark font-semibold">
                                        Pay Now
                                    </button>
                                )}
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
            {billToPay && <PaymentModal bill={billToPay} onClose={() => setBillToPay(null)} onPaymentSuccess={handlePaymentSuccess} />}
        </div>
    )
};

const PatientInsurance: React.FC = () => {
    const { user } = useAuth();
    const [details, setDetails] = useState<InsuranceDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDetails = useCallback(() => {
        if (user) {
            setIsLoading(true);
            api.getPatientInsuranceDetails(user.id)
                .then(setDetails)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsLoading(true);

        if (!('BarcodeDetector' in window)) {
            alert("QR code scanning is not supported by your browser. Please use a modern browser like Chrome or Edge.");
            setIsLoading(false);
            return;
        }

        try {
            // @ts-ignore - BarcodeDetector is not in all TS DOM libs yet
            const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const imageBitmap = await createImageBitmap(file);
            const barcodes = await barcodeDetector.detect(imageBitmap);

            if (barcodes.length === 0) {
                throw new Error("No QR code found in the image. Please try again with a clearer image.");
            }

            const qrData = barcodes[0].rawValue;
            let parsedData;

            try {
                parsedData = JSON.parse(qrData);
            } catch (e) {
                throw new Error("The QR code contains invalid data. It should be in a valid JSON format.");
            }

            if (!parsedData.provider || !parsedData.policyNumber || !parsedData.coverage || !parsedData.expiryDate) {
                throw new Error("The QR code is missing required insurance information (provider, policyNumber, coverage, expiryDate).");
            }

            const insuranceData: api.InsuranceSubmitData = {
                provider: parsedData.provider,
                policyNumber: parsedData.policyNumber,
                nominee: parsedData.nominee || 'N/A',
                coverage: Number(parsedData.coverage),
                expiryDate: parsedData.expiryDate,
            };

            const newDetails = await api.submitInsuranceDetails(user.id, insuranceData);
            setDetails(newDetails);
            alert("Insurance details extracted and saved successfully!");

        } catch (error: any) {
            console.error("Failed to process QR code:", error);
            alert(`Error processing QR code: ${error.message}`);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-6">Insurance Details</h1>
            <div className="bg-white p-6 rounded-lg shadow-soft border border-neutral-200/50">
                {isLoading && <p>Loading details...</p>}

                {!isLoading && details && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-neutral-800">Your Insurance Policy</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                            <div><strong className="block text-neutral-500">Provider</strong>{details.provider}</div>
                            <div><strong className="block text-neutral-500">Policy Number</strong>{details.policyNumber}</div>
                            <div><strong className="block text-neutral-500">Nominee</strong>{details.nominee}</div>
                            <div><strong className="block text-neutral-500">Coverage</strong>${details.coverage.toLocaleString()}</div>
                            <div><strong className="block text-neutral-500">Expires On</strong>{details.expiryDate}</div>
                        </div>
                    </div>
                )}

                {!isLoading && !details && (
                     <p className="text-center text-neutral-500 mb-4">No insurance details found. Please upload your insurance QR code.</p>
                )}

                <div className="text-center border-t border-neutral-200 pt-6">
                     <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        id="qr-upload"
                    />
                    <label
                        htmlFor="qr-upload"
                        className={`cursor-pointer inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold shadow-soft ${isLoading ? 'bg-neutral-400 cursor-not-allowed' : ''}`}
                    >
                        {ICONS.upload}
                        <span>{details ? 'Update Insurance QR Code' : 'Upload Insurance QR Code'}</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

const PatientQueriesAndComplaints: React.FC = () => {
    const { user } = useAuth();
    const [queries, setQueries] = useState<PatientQuery[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchQueries = useCallback(() => {
        if (user) {
            api.getPatientQueries(user.id).then(setQueries).catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        fetchQueries();
    }, [fetchQueries]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !subject.trim() || !message.trim()) return;

        setIsLoading(true);
        try {
            await api.submitPatientQuery({
                patientId: user.id,
                patientName: user.name,
                subject,
                message,
            });
            setSubject('');
            setMessage('');
            fetchQueries();
        } catch (error) {
            console.error("Failed to submit query:", error);
            alert("Could not submit your query. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const getStatusChip = (status: PatientQuery['status']) => {
        switch(status) {
            case 'Submitted': return 'bg-primary-light text-primary-dark';
            case 'In Review': return 'bg-warning-light text-warning-dark';
            case 'Resolved': return 'bg-success-light text-success-dark';
            default: return 'bg-neutral-200 text-neutral-800';
        }
    };
    
    const inputClass = "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow";

    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-6">Queries & Complaints</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-soft border border-neutral-200/50">
                    <h2 className="text-xl font-semibold mb-4">Submit a New Query</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-neutral-700">Subject</label>
                            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className={`mt-1 ${inputClass}`}/>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-neutral-700">Message</label>
                            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={5} className={`mt-1 ${inputClass}`}></textarea>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-primary font-semibold text-white py-2.5 rounded-lg hover:bg-primary-dark disabled:bg-neutral-400 transition-colors">
                            {isLoading ? "Submitting..." : "Submit"}
                        </button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-soft border border-neutral-200/50">
                    <h2 className="text-xl font-semibold mb-4">Your Past Queries</h2>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {queries.length === 0 ? (
                            <p className="text-neutral-500">You haven't submitted any queries yet.</p>
                        ) : (
                            queries.slice().reverse().map(q => (
                                <div key={q.id} className="border border-neutral-200 p-4 rounded-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-neutral-800">{q.subject}</p>
                                            <p className="text-xs text-neutral-500">Submitted on: {q.submissionDate}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(q.status)}`}>{q.status}</span>
                                    </div>
                                    <p className="text-sm mt-2 text-neutral-700 whitespace-pre-wrap">{q.message}</p>
                                    {q.response && (
                                        <div className="mt-3 pt-3 border-t border-neutral-200 bg-neutral-50 p-3 rounded-md">
                                            <p className="font-semibold text-sm text-neutral-800">Hospital Response:</p>
                                            <p className="text-sm text-neutral-600 whitespace-pre-wrap">{q.response}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default PatientPortal;