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
        <div className="flex bg-brand-gray-light min-h-screen">
            <Sidebar navItems={navItems} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-6 flex-1 text-gray-800">
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
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.name}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow-md md:col-span-3">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Demographic Information</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 text-sm">
                        <div><strong className="block text-gray-500">Full Name</strong>{user?.name}</div>
                        <div><strong className="block text-gray-500">ABHA ID</strong>{user?.abhaId}</div>
                        <div><strong className="block text-gray-500">Aadhaar No.</strong>{user?.aadhaar}</div>
                        <div><strong className="block text-gray-500">Gender</strong>{user?.gender}</div>
                        <div><strong className="block text-gray-500">Date of Birth</strong>{user?.dob}</div>
                        <div><strong className="block text-gray-500">Blood Group</strong>{user?.bloodGroup}</div>
                        <div><strong className="block text-gray-500">Marital Status</strong>{user?.maritalStatus}</div>
                        <div><strong className="block text-gray-500">Contact No.</strong>{user?.contactNumber}</div>
                        <div className="col-span-2"><strong className="block text-gray-500">Email</strong>{user?.email}</div>
                        <div className="col-span-2"><strong className="block text-gray-500">Address</strong>
                            {user?.address ? `${user.address.line1}, ${user.address.city}, ${user.address.state} - ${user.address.pincode}` : 'N/A'}
                        </div>
                        <div className="col-span-2"><strong className="block text-gray-500">Emergency Contact</strong>
                           {user?.emergencyContact ? `${user.emergencyContact.name} (${user.emergencyContact.phone})` : 'N/A'}
                        </div>
                    </div>
                </div>
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
        case 'Scheduled': return 'bg-yellow-200 text-yellow-800';
        case 'Completed': return 'bg-green-200 text-green-800';
        case 'Cancelled': return 'bg-red-200 text-red-800';
        case 'Pending Triage': return 'bg-blue-200 text-blue-800';
        default: return 'bg-gray-200 text-gray-800';
    }
  }

  const handleBooked = () => {
      fetchAppointments();
      alert("Appointment requested successfully! If you booked a room, a corresponding bill has been added to your account.");
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
        // When appointment date changes, default check-in to that date
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Appointment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} required className="w-full p-2 border rounded md:col-span-3">
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border rounded" min={new Date().toISOString().split("T")[0]}/>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full p-2 border rounded" />
                        </div>
                    </div>
                    
                    <div className="border-t pt-4">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={requireRoom} onChange={e => setRequireRoom(e.target.checked)} className="h-4 w-4"/>
                            <span>Require room booking for this appointment?</span>
                        </label>
                        {requireRoom && (
                            <div className="mt-4 space-y-4 border p-4 rounded-md bg-gray-50">
                                <h3 className="font-semibold text-gray-700">Room Booking Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <select value={roomBooking.type} onChange={e => setRoomBooking({...roomBooking, type: e.target.value})} required className="w-full p-2 border rounded">
                                        <option value="">Select Room Type</option>
                                        {rooms.map(r => <option key={r.id} value={r.type}>{r.type} (${r.pricePerNight}/night)</option>)}
                                    </select>
                                    <input type="date" value={roomBooking.checkIn} onChange={e => setRoomBooking({...roomBooking, checkIn: e.target.value})} required className="w-full p-2 border rounded" min={date || new Date().toISOString().split("T")[0]}/>
                                    <input type="date" value={roomBooking.checkOut} onChange={e => setRoomBooking({...roomBooking, checkOut: e.target.value})} required className="w-full p-2 border rounded" min={roomBooking.checkIn || new Date().toISOString().split("T")[0]}/>
                                </div>
                                {totalRoomCost > 0 && (
                                    <p className="font-semibold text-lg text-right">Room Cost: ${totalRoomCost.toFixed(2)}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded disabled:bg-gray-400">{isLoading ? "Requesting..." : "Request Appointment"}</button>
                    </div>
                </form>
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
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Medical History</h1>
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
                                <td className="p-2 text-gray-600">
                                    {t.result || 'N/A'}
                                    {t.imageUrl && (
                                        <a href={t.imageUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand-blue hover:underline text-sm">[View Image]</a>
                                    )}
                                </td>
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
const PaymentModal: React.FC<{bill: Bill, onClose: () => void, onPaymentSuccess: () => void}> = ({ bill, onClose, onPaymentSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');

    const handlePay = async () => {
        setIsLoading(true);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <p><strong>Details:</strong> {bill.details}</p>
                    <p className="text-2xl font-bold mt-2">Amount: ${bill.amount.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                    <label className="font-semibold">Select Payment Method:</label>
                    <div className="flex flex-col space-y-1">
                        {['Credit Card', 'Debit Card', 'UPI'].map(method => (
                            <label key={method} className="flex items-center p-2 border rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-brand-blue">
                                <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mr-2"/>
                                {method}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handlePay} disabled={isLoading} className="px-4 py-2 bg-brand-green text-white rounded-lg disabled:bg-gray-400">
                        {isLoading ? "Processing..." : "Confirm Payment"}
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Billing & Payments</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead><tr className="border-b">
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Date</th>
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Details</th>
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Amount</th>
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Status</th>
                        <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Action</th>
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
                            <td className="p-3">
                                {b.status === 'Unpaid' && (
                                    <button onClick={() => setBillToPay(b)} className="bg-brand-green text-white px-3 py-1 text-xs rounded hover:bg-brand-green-dark">
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Insurance Details</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {isLoading && <p>Loading details...</p>}

                {!isLoading && details && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Your Insurance Policy</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                            <div><strong className="block text-gray-500">Provider</strong>{details.provider}</div>
                            <div><strong className="block text-gray-500">Policy Number</strong>{details.policyNumber}</div>
                            <div><strong className="block text-gray-500">Nominee</strong>{details.nominee}</div>
                            <div><strong className="block text-gray-500">Coverage</strong>${details.coverage.toLocaleString()}</div>
                            <div><strong className="block text-gray-500">Expires On</strong>{details.expiryDate}</div>
                        </div>
                    </div>
                )}

                {!isLoading && !details && (
                     <p className="text-center text-gray-500 mb-4">No insurance details found. Please upload your insurance QR code.</p>
                )}

                <div className="text-center border-t pt-6">
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
                        className={`cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : ''}`}
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
            case 'Submitted': return 'bg-blue-200 text-blue-800';
            case 'In Review': return 'bg-yellow-200 text-yellow-800';
            case 'Resolved': return 'bg-green-200 text-green-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Queries & Complaints</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Submit a New Query</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="mt-1 w-full p-2 border rounded-md"></textarea>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-brand-blue text-white py-2 rounded-lg hover:bg-brand-blue-dark disabled:bg-gray-400">
                            {isLoading ? "Submitting..." : "Submit"}
                        </button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Your Past Queries</h2>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {queries.length === 0 ? (
                            <p className="text-gray-500">You haven't submitted any queries yet.</p>
                        ) : (
                            queries.slice().reverse().map(q => (
                                <div key={q.id} className="border p-4 rounded-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{q.subject}</p>
                                            <p className="text-xs text-gray-500">Submitted on: {q.submissionDate}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(q.status)}`}>{q.status}</span>
                                    </div>
                                    <p className="text-sm mt-2 text-gray-700 whitespace-pre-wrap">{q.message}</p>
                                    {q.response && (
                                        <div className="mt-3 pt-3 border-t bg-gray-50 p-3 rounded-md">
                                            <p className="font-semibold text-sm">Hospital Response:</p>
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{q.response}</p>
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