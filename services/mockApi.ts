import { User, UserRole, Department, Doctor, Appointment, TestRequest, TestType, Prescription, Bill, NurseTask, TriageInfo, DischargeSummary, AttendanceRecord, MedicationStock, ICUBed, RoomFacility, PatientQuery, InsuranceDetails, RoomBooking } from '../types';
import { LoginCredentials, RegisterUserData, AddStaffData, InsuranceSubmitData } from './api';

const MOCK_USERS: User[] = [
    { 
        id: 'p001', name: 'John Doe', role: UserRole.PATIENT, 
        abhaId: '1234-5678-9012', aadhaar: '111122223333', 
        gender: 'Male', dob: '1985-05-20', bloodGroup: 'O+', maritalStatus: 'Married',
        contactNumber: '9876543210', email: 'john.doe@email.com',
        address: { line1: '123 Health St', city: 'Wellville', state: 'Careland', pincode: '12345' },
        emergencyContact: { name: 'Jane Doe', phone: '9876543211' }
    },
    { 
        id: 'p002', name: 'Jane Smith', role: UserRole.PATIENT, 
        abhaId: '9876-5432-1098', aadhaar: '444455556666',
        gender: 'Female', dob: '1990-09-15', bloodGroup: 'A-', maritalStatus: 'Single',
        contactNumber: '8765432109', email: 'jane.smith@email.com',
        address: { line1: '456 Cure Ave', city: 'Healburg', state: 'Careland', pincode: '54321' },
        emergencyContact: { name: 'John Smith', phone: '8765432100' }
    },
    { id: 'a001', name: 'Admin User', role: UserRole.ADMIN },
    { id: 'm001', name: 'Manager Mike', role: UserRole.MANAGER },
    { id: 'h001', name: 'HR Helen', role: UserRole.HR },
    { id: 'f001', name: 'Finance Frank', role: UserRole.FINANCE },
    { id: 'd001', name: 'Dr. Emily Carter', role: UserRole.DOCTOR, department: 'Cardiology' },
    { id: 'd002', name: 'Dr. Ben Hanson', role: UserRole.DOCTOR, department: 'Orthopedics' },
    { id: 'n001', name: 'Nurse Nancy', role: UserRole.NURSE, department: 'Cardiology' },
    { id: 'l001', name: 'Lab Larry', role: UserRole.LAB_TECHNICIAN },
    { id: 'r001', name: 'Radiology Ray', role: UserRole.RADIOLOGIST },
    { id: 'ph001', name: 'Pharmacist Phil', role: UserRole.PHARMACIST },
];

const MOCK_PASSWORDS: Record<string, string> = {
    '1234-5678-9012': 'password123', // John Doe
    '9876-5432-1098': 'password123', // Jane Smith
    'a001': 'password', // Admin
    'm001': 'password', // Manager
    'h001': 'password', // HR
    'f001': 'password', // Finance
    'd001': 'password', // Dr. Carter
    'd002': 'password', // Dr. Hanson
    'n001': 'password', // Nurse
    'l001': 'password', // Lab
    'r001': 'password', // Radiology
    'ph001': 'password', // Pharmacy
};

const MOCK_DEPARTMENTS: Department[] = [
    { id: 'dep01', name: 'Cardiology' },
    { id: 'dep02', name: 'Orthopedics' },
    { id: 'dep03', name: 'General Medicine' },
];

const MOCK_DOCTORS: Doctor[] = [
    { id: 'd001', name: 'Dr. Emily Carter', departmentId: 'dep01', specialty: 'Cardiology' },
    { id: 'd002', name: 'Dr. Ben Hanson', departmentId: 'dep02', specialty: 'Orthopedics' },
];

const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 'app01', patientId: 'p001', patientName: 'John Doe', doctorId: 'd001', doctorName: 'Dr. Emily Carter', departmentName: 'Cardiology', date: '2024-08-15', time: '10:00', status: 'Completed', notes: 'Patient recovering well. Follow up in 6 months.' },
    { id: 'app02', patientId: 'p002', patientName: 'Jane Smith', doctorId: 'd002', doctorName: 'Dr. Ben Hanson', departmentName: 'Orthopedics', date: new Date().toISOString().split('T')[0], time: '11:00', status: 'Scheduled' },
    { id: 'app03', patientId: 'p001', patientName: 'John Doe', departmentName: 'General Medicine', date: '2024-08-10', time: '09:00', status: 'Pending Triage' },
];

const MOCK_TESTS: TestRequest[] = [
    { id: 'test01', patientId: 'p001', patientName: 'John Doe', doctorId: 'd001', testName: 'ECG', type: TestType.RADIOLOGY, status: 'Completed', result: 'Normal sinus rhythm.', requestDate: '2024-08-15' },
    { id: 'test02', patientId: 'p002', patientName: 'Jane Smith', doctorId: 'd002', testName: 'X-Ray Left Knee', type: TestType.RADIOLOGY, status: 'Pending', requestDate: '2024-08-20' },
    { id: 'test03', patientId: 'p001', patientName: 'John Doe', doctorId: 'd001', testName: 'Lipid Panel', type: TestType.LAB, status: 'Pending', requestDate: '2024-08-21' },
];

const MOCK_PRESCRIPTIONS: Prescription[] = [
    { id: 'presc01', patientId: 'p001', patientName: 'John Doe', patientAbhaId: '1234-5678-9012', doctorId: 'd001', doctorName: 'Dr. Emily Carter', date: '2024-08-15', medication: 'Aspirin', dosage: '81mg daily', instructions: 'Take one tablet daily with food.', quantity: 30, status: 'Dispensed', price: 15.00 },
    { id: 'presc02', patientId: 'p002', patientName: 'Jane Smith', patientAbhaId: '9876-5432-1098', doctorId: 'd002', doctorName: 'Dr. Ben Hanson', date: new Date().toISOString().split('T')[0], medication: 'Ibuprofen', dosage: '200mg as needed for pain', instructions: 'Max 4 per day.', quantity: 20, status: 'Pending' },
];

const MOCK_BILLS: Bill[] = [
    { id: 'bill01', patientId: 'p001', patientName: 'John Doe', date: '2024-08-15', amount: 150.00, details: 'Cardiology Consultation', status: 'Paid' },
    { id: 'bill02', patientId: 'p002', patientName: 'Jane Smith', date: '2024-08-20', amount: 250.00, details: 'Orthopedics Visit & X-Ray', status: 'Unpaid' },
];

const MOCK_ICU_BEDS: ICUBed[] = [
    { id: 'icu01', roomNumber: '101-A', roomType: 'Private', isOccupied: true, patientId: 'p002', patientName: 'Jane Smith' },
    { id: 'icu02', roomNumber: '101-B', roomType: 'Private', isOccupied: false },
    { id: 'icu03', roomNumber: '102', roomType: 'Semi-Private', isOccupied: false },
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
    {id: 'att01', staffId: 'd001', staffName: 'Dr. Emily Carter', date: new Date().toISOString().split('T')[0], inTime: '08:55', outTime: '17:05' },
    {id: 'att02', staffId: 'n001', staffName: 'Nurse Nancy', date: new Date().toISOString().split('T')[0], inTime: '08:00' },
];

const MOCK_STOCK: MedicationStock[] = [
    { id: 'med01', name: 'Aspirin', costPrice: 0.10, sellingPrice: 0.50, quantity: 1000 },
    { id: 'med02', name: 'Ibuprofen', costPrice: 0.15, sellingPrice: 0.75, quantity: 800 },
];

const MOCK_ROOM_FACILITIES: RoomFacility[] = [
    { 
        id: 'room01', 
        type: 'Private', 
        description: 'A personal room for maximum comfort and privacy.',
        amenities: ['Private Bathroom', 'Television', 'Wi-Fi', 'Sofa for guests'],
        imageUrl: 'https://images.unsplash.com/photo-1596522354195-e84ae3c4b5b2?q=80&w=2070&auto=format&fit=crop',
        pricePerNight: 500,
    },
    { 
        id: 'room02', 
        type: 'Combined', 
        description: 'A shared room with modern amenities, suitable for two patients.',
        amenities: ['Shared Bathroom', 'Television per bed', 'Wi-Fi'],
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14aa?q=80&w=2070&auto=format&fit=crop',
        pricePerNight: 250,
    },
    { 
        id: 'room03', 
        type: 'Suite', 
        description: 'A luxurious suite with a separate area for family and guests.',
        amenities: ['Private Bathroom with Bathtub', 'Large Screen TV', 'High-speed Wi-Fi', 'Kitchenette', 'Living Area'],
        imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop',
        pricePerNight: 1200,
    },
];

const MOCK_DATA = {
    'hms_users': MOCK_USERS,
    'hms_passwords': MOCK_PASSWORDS,
    'hms_departments': MOCK_DEPARTMENTS,
    'hms_doctors': MOCK_DOCTORS,
    'hms_appointments': MOCK_APPOINTMENTS,
    'hms_tests': MOCK_TESTS,
    'hms_prescriptions': MOCK_PRESCRIPTIONS,
    'hms_bills': MOCK_BILLS,
    'hms_insurance_details': [],
    'hms_discharge_summaries': [],
    'hms_icu_beds': MOCK_ICU_BEDS,
    'hms_attendance': MOCK_ATTENDANCE,
    'hms_med_stock': MOCK_STOCK,
    'hms_room_facilities': MOCK_ROOM_FACILITIES,
    'hms_patient_queries': [],
    'hms_room_bookings': [],
};


// --- UTILITY FUNCTIONS ---
const getData = <T>(key: string): T => JSON.parse(sessionStorage.getItem(key) || 'null') as T;
const setData = <T>(key: string, data: T): void => sessionStorage.setItem(key, JSON.stringify(data));

// --- API IMPLEMENTATION ---

export const initializeMockData = () => {
    if (!sessionStorage.getItem('hms_initialized')) {
        Object.entries(MOCK_DATA).forEach(([key, value]) => {
            setData(key, value);
        });
        sessionStorage.setItem('hms_initialized', 'true');
    }
};

export const login = async (credentials: LoginCredentials, portal: 'patient' | 'hospital'): Promise<{ user: User; token: string }> => {
    const users = getData<User[]>('hms_users');
    const passwords = getData<Record<string, string>>('hms_passwords');
    
    let user: User | undefined;
    const loginId = portal === 'patient' ? credentials.abhaId : credentials.staffId;
    
    if (!loginId || !credentials.password) throw new Error("ID and password are required");

    if (portal === 'patient') {
        user = users.find(u => u.abhaId === loginId);
    } else {
        user = users.find(u => u.id === loginId && u.role !== UserRole.PATIENT);
    }
    
    if (user && passwords[loginId] === credentials.password) {
        return { user, token: `mock_token_for_${user.id}` };
    }
    
    throw new Error("Invalid credentials");
};

export const register = async (userData: RegisterUserData): Promise<{ user: User }> => {
    const users = getData<User[]>('hms_users');
    const passwords = getData<Record<string, string>>('hms_passwords');

    if (users.some(u => u.abhaId === userData.abhaId || u.aadhaar === userData.aadhaar)) {
        throw new Error("User with this ABHA ID or Aadhaar already exists.");
    }
    
    const newUser: User = {
        id: `p${String(users.length + 1).padStart(3, '0')}`,
        role: UserRole.PATIENT,
        name: userData.name,
        abhaId: userData.abhaId,
        aadhaar: userData.aadhaar,
        gender: userData.gender,
        dob: userData.dob,
        bloodGroup: userData.bloodGroup,
        maritalStatus: userData.maritalStatus,
        contactNumber: userData.contactNumber,
        email: userData.email,
        address: userData.address,
        emergencyContact: userData.emergencyContact
    };
    
    users.push(newUser);
    passwords[newUser.abhaId!] = userData.password;
    
    setData('hms_users', users);
    setData('hms_passwords', passwords);
    
    return { user: newUser };
};

// --- GENERAL DATA ---
export const getDepartments = async (): Promise<Department[]> => getData('hms_departments');
export const getDoctorsByDepartment = async (depId: string): Promise<Doctor[]> => getData<Doctor[]>('hms_doctors').filter(d => d.departmentId === depId);

// --- PATIENT PORTAL ---
export const getPatientAppointments = async (patientId: string): Promise<Appointment[]> => getData<Appointment[]>('hms_appointments').filter(a => a.patientId === patientId);
export const getPatientTests = async (patientId: string): Promise<TestRequest[]> => getData<TestRequest[]>('hms_tests').filter(t => t.patientId === patientId);
export const getPatientPrescriptions = async (patientId: string): Promise<Prescription[]> => getData<Prescription[]>('hms_prescriptions').filter(p => p.patientId === patientId);
export const getPatientBills = async (patientId: string): Promise<Bill[]> => getData<Bill[]>('hms_bills').filter(b => b.patientId === patientId);
export const getPatientInsuranceDetails = async (patientId: string): Promise<InsuranceDetails | null> => getData<InsuranceDetails[]>('hms_insurance_details').find(d => d.patientId === patientId) || null;
export const getPatientDischargeSummaries = async (patientId: string): Promise<DischargeSummary[]> => getData<DischargeSummary[]>('hms_discharge_summaries').filter(s => s.patientId === patientId);

export const bookAppointment = async (
    appData: Omit<Appointment, 'id' | 'status'>,
    roomBookingDetails?: { roomType: RoomFacility['type']; checkIn: string; checkOut: string; }
): Promise<Appointment> => {
    const appointments = getData<Appointment[]>('hms_appointments');
    const newAppointment: Appointment = {
        ...appData,
        id: `app${appointments.length + 1}`,
        status: 'Pending Triage',
    };
    appointments.push(newAppointment);
    setData('hms_appointments', appointments);

    if (roomBookingDetails) {
        const roomFacilities = getData<RoomFacility[]>('hms_room_facilities');
        const roomInfo = roomFacilities.find(r => r.type === roomBookingDetails.roomType);
        if (roomInfo) {
            const nights = (new Date(roomBookingDetails.checkOut).getTime() - new Date(roomBookingDetails.checkIn).getTime()) / (1000 * 3600 * 24);
            const totalCost = nights > 0 ? nights * roomInfo.pricePerNight : 0;
            
            if (totalCost > 0) {
                bookRoom({
                    patientId: appData.patientId,
                    roomType: roomBookingDetails.roomType,
                    checkIn: roomBookingDetails.checkIn,
                    checkOut: roomBookingDetails.checkOut,
                    totalCost,
                });
            }
        }
    }
    return newAppointment;
};

export const submitInsuranceDetails = async (patientId: string, details: InsuranceSubmitData): Promise<InsuranceDetails> => {
    const allDetails = getData<InsuranceDetails[]>('hms_insurance_details');
    const existingIndex = allDetails.findIndex(d => d.patientId === patientId);
    
    const newDetails: InsuranceDetails = {
        id: existingIndex !== -1 ? allDetails[existingIndex].id : `ins${allDetails.length + 1}`,
        patientId,
        ...details
    };

    if (existingIndex !== -1) {
        allDetails[existingIndex] = newDetails;
    } else {
        allDetails.push(newDetails);
    }
    setData('hms_insurance_details', allDetails);
    return newDetails;
};

// --- HOSPITAL STAFF ---
export const getAllStaff = async (): Promise<User[]> => getData<User[]>('hms_users').filter(u => u.role !== UserRole.PATIENT);
export const getAllPatients = async (): Promise<User[]> => getData<User[]>('hms_users').filter(u => u.role === UserRole.PATIENT);

export const addStaff = async (staffData: AddStaffData): Promise<User> => {
    const users = getData<User[]>('hms_users');
    const passwords = getData<Record<string, string>>('hms_passwords');
    const newId = `${staffData.role.charAt(0).toLowerCase()}${String(users.filter(u => u.role !== UserRole.PATIENT).length + 1).padStart(3, '0')}`;
    const newUser: User = {
        id: newId,
        name: staffData.name,
        role: staffData.role,
        department: staffData.department,
    };
    users.push(newUser);
    passwords[newId] = staffData.password;
    setData('hms_users', users);
    setData('hms_passwords', passwords);
    return newUser;
};

// --- DOCTOR ---
export const getDoctorAppointments = async (doctorId: string): Promise<Appointment[]> => getData<Appointment[]>('hms_appointments').filter(a => a.doctorId === doctorId);

export const updateAppointment = async (appId: string, updates: { status?: 'Completed' | 'Cancelled'; notes?: string }): Promise<Appointment> => {
    const appointments = getData<Appointment[]>('hms_appointments');
    const index = appointments.findIndex(a => a.id === appId);
    if (index === -1) throw new Error("Appointment not found");
    if (updates.status) appointments[index].status = updates.status;
    if (updates.notes) appointments[index].notes = `${appointments[index].notes ? appointments[index].notes + '\n' : ''}${new Date().toLocaleDateString()}: ${updates.notes}`;
    setData('hms_appointments', appointments);
    return appointments[index];
};

export const getPatientMedicalHistory = async (patientId: string) => {
    const users = getData<User[]>('hms_users');
    return {
        patientInfo: users.find(u => u.id === patientId) || null,
        appointments: await getPatientAppointments(patientId),
        tests: await getPatientTests(patientId),
        prescriptions: await getPatientPrescriptions(patientId),
    }
};

export const orderTests = async (doctorId: string, patientId: string, patientName: string, testNamesStr: string, type: TestType): Promise<TestRequest[]> => {
    const tests = getData<TestRequest[]>('hms_tests');
    const testNames = testNamesStr.split(',').map(t => t.trim()).filter(Boolean);
    const newTests: TestRequest[] = [];

    for (const testName of testNames) {
        const newTest: TestRequest = {
            id: `test${tests.length + newTests.length + 1}`,
            patientId,
            patientName,
            doctorId,
            testName,
            type,
            status: 'Pending',
            requestDate: new Date().toISOString().split('T')[0],
        };
        newTests.push(newTest);
    }
    setData('hms_tests', [...tests, ...newTests]);
    return newTests;
};

export const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'status' | 'price' | 'patientName' | 'patientAbhaId'>): Promise<Prescription> => {
    const prescriptions = getData<Prescription[]>('hms_prescriptions');
    const users = getData<User[]>('hms_users');
    const patient = users.find(u => u.id === prescriptionData.patientId);
    if (!patient) throw new Error("Patient not found");

    const newPrescription: Prescription = {
        ...prescriptionData,
        id: `presc${prescriptions.length + 1}`,
        patientName: patient.name,
        patientAbhaId: patient.abhaId!,
        status: 'Pending',
    };
    prescriptions.push(newPrescription);
    setData('hms_prescriptions', prescriptions);
    return newPrescription;
};

export const getPendingPrescriptions = async (): Promise<Prescription[]> => {
    return getData<Prescription[]>('hms_prescriptions').filter(p => p.status === 'Pending');
};

export const dispensePrescription = async (prescriptionId: string, price: number): Promise<Prescription> => {
    const prescriptions = getData<Prescription[]>('hms_prescriptions');
    const bills = getData<Bill[]>('hms_bills');
    const index = prescriptions.findIndex(p => p.id === prescriptionId);
    if (index === -1) throw new Error("Prescription not found");

    const p = prescriptions[index];
    p.status = 'Dispensed';
    p.price = price;

    const newBill: Bill = { 
        id: `bill${bills.length + 1}`, 
        patientId: p.patientId, 
        patientName: p.patientName, 
        date: new Date().toISOString().split('T')[0], 
        amount: price, 
        details: `Pharmacy: ${p.medication} (x${p.quantity})`, 
        status: 'Unpaid' 
    };
    bills.push(newBill);

    setData('hms_prescriptions', prescriptions);
    setData('hms_bills', bills);
    return p;
};


// --- NURSE ---
export const getTriageQueue = async (): Promise<Appointment[]> => getData<Appointment[]>('hms_appointments').filter(a => a.status === 'Pending Triage');
export const submitTriage = async (appId: string, doctorId: string, doctorName: string, triageData: TriageInfo): Promise<Appointment> => {
    const appointments = getData<Appointment[]>('hms_appointments');
    const index = appointments.findIndex(a => a.id === appId);
    if (index === -1) throw new Error("Appointment not found");
    appointments[index].status = 'Scheduled';
    appointments[index].doctorId = doctorId;
    appointments[index].doctorName = doctorName;
    appointments[index].triageData = triageData;
    setData('hms_appointments', appointments);
    return appointments[index];
};

// --- LAB / RADIOLOGY ---
export const getPendingTests = async (type: TestType): Promise<TestRequest[]> => getData<TestRequest[]>('hms_tests').filter(t => t.type === type && t.status === 'Pending');
export const updateTestResult = async (testId: string, result: string, imageUrl?: string): Promise<TestRequest> => {
    const tests = getData<TestRequest[]>('hms_tests');
    const index = tests.findIndex(t => t.id === testId);
    if (index === -1) throw new Error("Test not found");
    tests[index].status = 'Completed';
    tests[index].result = result;
    tests[index].resultDate = new Date().toISOString().split('T')[0];
    if (imageUrl) tests[index].imageUrl = imageUrl;
    setData('hms_tests', tests);
    return tests[index];
};

// --- ADMIN ---
export const getDashboardStats = async () => ({
    totalAppointments: getData<Appointment[]>('hms_appointments').length,
    totalTests: getData<TestRequest[]>('hms_tests').length,
    completedBills: getData<Bill[]>('hms_bills').filter(b => b.status === 'Paid').length
});

export const getAllDischargeSummaries = async (): Promise<DischargeSummary[]> => getData('hms_discharge_summaries');
export const approveDischargeSummary = async (summaryId: string): Promise<DischargeSummary> => {
    const summaries = getData<DischargeSummary[]>('hms_discharge_summaries');
    const index = summaries.findIndex(s => s.id === summaryId);
    if (index === -1) throw new Error("Summary not found");
    summaries[index].status = 'Approved';
    setData('hms_discharge_summaries', summaries);
    return summaries[index];
};

export const generateAndSaveDischargeSummary = async (patientId: string): Promise<DischargeSummary> => {
    const history = await getPatientMedicalHistory(patientId);
    const summaries = getData<DischargeSummary[]>('hms_discharge_summaries');
    const newSummary: DischargeSummary = {
        id: `sum${summaries.length + 1}`,
        patientId,
        patientName: history.patientInfo?.name || 'N/A',
        generationDate: new Date().toISOString(),
        status: 'Pending Approval',
        ...history
    };
    summaries.push(newSummary);
    setData('hms_discharge_summaries', summaries);
    return newSummary;
}

// --- HR / FINANCE / MANAGER ---
export const getAttendance = async (): Promise<AttendanceRecord[]> => getData('hms_attendance');
export const getICUBeds = async (): Promise<ICUBed[]> => getData('hms_icu_beds');
export const getMedicationStock = async (): Promise<MedicationStock[]> => getData('hms_med_stock');

export const getFinancialData = async () => {
    const prescriptions = getData<Prescription[]>('hms_prescriptions');
    const stock = getData<MedicationStock[]>('hms_med_stock');
    const users = getData<User[]>('hms_users');

    const medicationProfit = prescriptions.map(p => {
        const medInfo = stock.find(s => s.name.toLowerCase() === p.medication.toLowerCase());
        const patient = users.find(u => u.id === p.patientId);
        const costPrice = medInfo ? medInfo.costPrice : 0;
        const sellingPrice = medInfo ? medInfo.sellingPrice : 0;
        return {
            ...p,
            patientName: patient?.name,
            costPrice,
            sellingPrice,
            profit: sellingPrice - costPrice,
        }
    });

    return {
        patientPayments: getData<Bill[]>('hms_bills'),
        medicationProfit,
    };
};

export const getDoctorWorkload = async () => {
    const appointments = getData<Appointment[]>('hms_appointments');
    const doctors = getData<Doctor[]>('hms_doctors');
    const workload: Record<string, { doctorName: string, patientCount: number }> = {};

    appointments
        .filter(a => a.status === 'Scheduled' && a.doctorId)
        .forEach(a => {
            if (!workload[a.doctorId!]) {
                const doctor = doctors.find(d => d.id === a.doctorId);
                workload[a.doctorId!] = {
                    doctorName: doctor?.name || 'Unknown Doctor',
                    patientCount: 0,
                };
            }
            workload[a.doctorId!].patientCount++;
        });

    return Object.entries(workload).map(([doctorId, data]) => ({ doctorId, ...data }));
};

// --- PATIENT PORTAL ADDITIONS ---

export const getRoomFacilities = async (): Promise<RoomFacility[]> => getData('hms_room_facilities');

export const getPatientQueries = async (patientId: string): Promise<PatientQuery[]> => {
    return getData<PatientQuery[]>('hms_patient_queries').filter(q => q.patientId === patientId);
};

export const submitPatientQuery = async (queryData: { patientId: string; patientName: string; subject: string; message: string; }): Promise<PatientQuery> => {
    const queries = getData<PatientQuery[]>('hms_patient_queries');
    const newQuery: PatientQuery = {
        ...queryData,
        id: `q${queries.length + 1}`,
        submissionDate: new Date().toISOString().split('T')[0],
        status: 'Submitted',
    };
    queries.push(newQuery);
    setData('hms_patient_queries', queries);
    return newQuery;
};

// --- ADMIN QUERY MANAGEMENT ---
export const getAllPatientQueries = async (): Promise<PatientQuery[]> => {
    return getData('hms_patient_queries');
}

export const respondToQuery = async (queryId: string, response: string): Promise<PatientQuery> => {
    const queries = getData<PatientQuery[]>('hms_patient_queries');
    const index = queries.findIndex(q => q.id === queryId);
    if (index === -1) throw new Error("Query not found");
    queries[index].response = response;
    queries[index].status = 'Resolved';
    setData('hms_patient_queries', queries);
    return queries[index];
}

// --- ROOM BOOKING ---
export const bookRoom = async (bookingData: Omit<RoomBooking, 'id'>): Promise<RoomBooking> => {
    const bookings = getData<RoomBooking[]>('hms_room_bookings');
    const bills = getData<Bill[]>('hms_bills');
    const users = getData<User[]>('hms_users');

    const patient = users.find(u => u.id === bookingData.patientId);
    if (!patient) throw new Error("Patient not found");

    const newBooking: RoomBooking = {
        ...bookingData,
        id: `book${bookings.length + 1}`,
    };
    bookings.push(newBooking);
    
    const newBill: Bill = {
        id: `bill${bills.length + 1}`,
        patientId: bookingData.patientId,
        patientName: patient.name,
        date: new Date().toISOString().split('T')[0],
        amount: bookingData.totalCost,
        details: `Room Booking: ${bookingData.roomType} (${bookingData.checkIn} to ${bookingData.checkOut})`,
        status: 'Unpaid'
    };
    bills.push(newBill);

    setData('hms_room_bookings', bookings);
    setData('hms_bills', bills);
    return newBooking;
};

// --- ATTENDANCE ---
export const getTodaysAttendance = async (staffId: string): Promise<AttendanceRecord | null> => {
    const attendance = getData<AttendanceRecord[]>('hms_attendance');
    const today = new Date().toISOString().split('T')[0];
    return attendance.find(a => a.staffId === staffId && a.date === today) || null;
}

export const clockIn = async (staffId: string): Promise<AttendanceRecord> => {
    const attendance = getData<AttendanceRecord[]>('hms_attendance');
    const users = getData<User[]>('hms_users');
    const today = new Date().toISOString().split('T')[0];
    
    const existing = attendance.find(a => a.staffId === staffId && a.date === today);
    if (existing) {
        return existing; // Already clocked in
    }

    const staffMember = users.find(u => u.id === staffId);
    if (!staffMember) throw new Error("Staff member not found");

    const newRecord: AttendanceRecord = {
        id: `att${attendance.length + 1}`,
        staffId,
        staffName: staffMember.name,
        date: today,
        inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    };

    attendance.push(newRecord);
    setData('hms_attendance', attendance);
    return newRecord;
};

export const clockOut = async (staffId: string): Promise<AttendanceRecord> => {
    const attendance = getData<AttendanceRecord[]>('hms_attendance');
    const today = new Date().toISOString().split('T')[0];

    const recordIndex = attendance.findIndex(a => a.staffId === staffId && a.date === today);
    if (recordIndex === -1) {
        throw new Error("Cannot clock out. No clock-in record found for today.");
    }
    
    if (attendance[recordIndex].outTime) {
        return attendance[recordIndex]; // Already clocked out
    }

    attendance[recordIndex].outTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
    setData('hms_attendance', attendance);
    return attendance[recordIndex];
};


// --- BILLING ---
export const addBill = async (data: { patientId: string; details: string; amount: number }): Promise<Bill> => {
    const bills = getData<Bill[]>('hms_bills');
    const users = getData<User[]>('hms_users');
    const patient = users.find(u => u.id === data.patientId);
    if (!patient) throw new Error("Patient not found");

    const newBill: Bill = {
        id: `bill${bills.length + 1}`,
        patientId: data.patientId,
        patientName: patient.name,
        date: new Date().toISOString().split('T')[0],
        amount: data.amount,
        details: data.details,
        status: 'Unpaid',
    };
    bills.push(newBill);
    setData('hms_bills', bills);
    return newBill;
};

export const payBill = async (billId: string): Promise<Bill> => {
    const bills = getData<Bill[]>('hms_bills');
    const index = bills.findIndex(b => b.id === billId);
    if (index === -1) throw new Error("Bill not found");

    bills[index].status = 'Paid';
    setData('hms_bills', bills);
    return bills[index];
};


// Unused but defined in types
export const getNurseTasks = async (nurseId: string): Promise<NurseTask[]> => [];