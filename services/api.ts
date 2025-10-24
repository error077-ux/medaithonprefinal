import { User, UserRole, Department, Doctor, Appointment, TestRequest, TestType, Prescription, Bill, InsuranceDoc, NurseTask, TriageInfo, DischargeSummary } from '../types';

// --- IN-BROWSER BACKEND SIMULATION ---

// Helper to simulate network delay
const apiCall = <T,>(data: T, delay = 300): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

const failCall = (message: string, delay = 300): Promise<any> => {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));
}

// Data Initialization from Session Storage or Defaults
const initializeData = <T>(key: string, defaultValue: T[]): T[] => {
    try {
        const stored = sessionStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error(`Could not parse ${key} from sessionStorage`, e);
    }
    return defaultValue;
};

// Data Persistence
const saveData = <T>(key: string, data: T[]) => {
    sessionStorage.setItem(key, JSON.stringify(data));
};

// --- MOCK DATABASE ---

let mockUsers: (User & { password?: string })[] = initializeData('hms_users', [
  { id: 'p001', name: 'John Doe', role: UserRole.PATIENT, abhaId: '1234-5678-9012', aadhaar: '111122223333', password: 'password123' },
  { id: 'p002', name: 'Jane Smith', role: UserRole.PATIENT, abhaId: '9876-5432-1098', aadhaar: '444455556666', password: 'password123' },
  { id: 'd001', name: 'Dr. Alice Smith', role: UserRole.DOCTOR, department: 'Cardiology', password: 'password' },
  { id: 'd002', name: 'Dr. Bob Johnson', role: UserRole.DOCTOR, department: 'Neurology', password: 'password' },
  { id: 'n001', name: 'Nurse Jane Roe', role: UserRole.NURSE, department: 'Cardiology', password: 'password' },
  { id: 'a001', name: 'Admin Director', role: UserRole.ADMIN, password: 'password' },
  { id: 'l001', name: 'Lab Tech Mike', role: UserRole.LAB_TECHNICIAN, department: 'Laboratory', password: 'password' },
  { id: 'r001', name: 'Radiologist Sara', role: UserRole.RADIOLOGIST, department: 'Radiology', password: 'password' },
]);

let mockDepartments: Department[] = initializeData('hms_departments', [
  { id: 'dep01', name: 'Cardiology' },
  { id: 'dep02', name: 'Neurology' },
  { id: 'dep03', name: 'Orthopedics' },
  { id: 'dep04', name: 'Laboratory' },
  { id: 'dep05', name: 'Radiology' },
]);

let mockDoctors: Doctor[] = initializeData('hms_doctors', [
  { id: 'd001', name: 'Dr. Alice Smith', departmentId: 'dep01', specialty: 'Cardiology' },
  { id: 'd002', name: 'Dr. Bob Johnson', departmentId: 'dep02', specialty: 'Neurology' },
  { id: 'd003', name: 'Dr. Carol White', departmentId: 'dep03', specialty: 'Orthopedics' },
  { id: 'd004', name: 'Dr. David Green', departmentId: 'dep01', specialty: 'Cardiology' },
]);

let mockAppointments: Appointment[] = initializeData('hms_appointments', [
  { id: 'app01', patientId: 'p001', patientName: 'John Doe', doctorId: 'd001', doctorName: 'Dr. Alice Smith', departmentName: 'Cardiology', date: '2024-08-10', time: '10:00 AM', status: 'Scheduled' },
  { id: 'app02', patientId: 'p001', patientName: 'John Doe', doctorId: 'd002', doctorName: 'Dr. Bob Johnson', departmentName: 'Neurology', date: '2024-07-25', time: '02:00 PM', status: 'Completed', notes: 'Patient shows improvement.' },
  { id: 'app03', patientId: 'p002', patientName: 'Jane Smith', doctorId: 'd001', doctorName: 'Dr. Alice Smith', departmentName: 'Cardiology', date: new Date().toISOString().split('T')[0], time: '11:30 AM', status: 'Scheduled' },
]);

let mockTestRequests: TestRequest[] = initializeData('hms_tests', [
  { id: 'test01', patientId: 'p001', patientName: 'John Doe', doctorId: 'd001', testName: 'Blood Panel', type: TestType.LAB, status: 'Completed', result: 'All values within normal range.', resultDate: '2024-07-26', requestDate: '2024-07-25' },
  { id: 'test02', patientId: 'p001', patientName: 'John Doe', doctorId: 'd001', testName: 'Chest X-Ray', type: TestType.RADIOLOGY, status: 'Pending', requestDate: '2024-08-10' },
]);

let mockPrescriptions: Prescription[] = initializeData('hms_prescriptions', [
  { id: 'presc01', patientId: 'p001', doctorId: 'd001', doctorName: 'Dr. Alice Smith', date: '2024-07-25', medication: 'Aspirin', dosage: '81mg', instructions: 'Once daily' },
]);

let mockBills: Bill[] = initializeData('hms_bills', [
  { id: 'bill01', patientId: 'p001', date: '2024-07-25', amount: 150.00, details: 'Consultation with Dr. Johnson', status: 'Paid' },
  { id: 'bill02', patientId: 'p001', date: '2024-08-10', amount: 250.00, details: 'Consultation & ECG', status: 'Unpaid' },
]);

let mockInsuranceDocs: InsuranceDoc[] = initializeData('hms_insurance', [
  { id: 'ins01', patientId: 'p001', fileName: 'insurance_card.pdf', uploadDate: '2024-07-20', fileUrl: '#' },
]);

let mockNurseTasks: NurseTask[] = initializeData('hms_tasks', [
  { id: 'task01', nurseId: 'n001', patientId: 'p001', patientName: 'John Doe', task: 'Record vitals (BP, Temp)', dueTime: '10:30 AM', status: 'Pending' },
  { id: 'task02', nurseId: 'n001', patientId: 'p002', patientName: 'Jane Smith', task: 'Administer medication', dueTime: '11:00 AM', status: 'Pending' },
  { id: 'task03', nurseId: 'n001', patientId: 'p001', patientName: 'John Doe', task: 'Check IV drip', dueTime: '12:00 PM', status: 'Pending' },
]);

let mockDischargeSummaries: DischargeSummary[] = initializeData('hms_summaries', []);


// --- API IMPLEMENTATIONS ---

// Auth
export type LoginCredentials = { abhaId?: string; password?: string; staffId?: string };
export type RegisterUserData = { name: string; abhaId: string; aadhaar: string; password: string };

export const login = (credentials: LoginCredentials, portal: 'patient' | 'hospital') => {
    let user: (User & { password?: string }) | undefined;

    if (portal === 'patient') {
        user = mockUsers.find(u => u.role === UserRole.PATIENT && u.abhaId === credentials.abhaId && u.password === credentials.password);
    } else {
        user = mockUsers.find(u => u.role !== UserRole.PATIENT && u.id === credentials.staffId && u.password === credentials.password);
    }

    if (user) {
        const { password, ...userToReturn } = user;
        return apiCall({ user: userToReturn, token: `mock-token-for-${user.id}` });
    }
    
    return failCall('Invalid credentials.');
};

export const register = (userData: RegisterUserData) => {
    const existingUser = mockUsers.find(u => u.abhaId === userData.abhaId || u.aadhaar === userData.aadhaar);
    if (existingUser) {
        return failCall('User with this ABHA ID or Aadhaar already exists.');
    }

    const newUser: User & { password?: string } = {
        id: `p${Date.now()}`,
        name: userData.name,
        role: UserRole.PATIENT,
        abhaId: userData.abhaId,
        aadhaar: userData.aadhaar,
        password: userData.password
    };
    
    mockUsers.push(newUser);
    saveData('hms_users', mockUsers);

    const { password, ...userToReturn } = newUser;
    return apiCall({ user: userToReturn });
};


// Data Fetching and Mutations
export const getDepartments = () => apiCall(mockDepartments.filter(d => d.name !== 'Laboratory' && d.name !== 'Radiology'));
export const getDoctorsByDepartment = (depId: string) => apiCall(mockDoctors.filter(d => d.departmentId === depId));

export const bookAppointment = (appointmentData: Omit<Appointment, 'id' | 'status' | 'doctorId' | 'doctorName'>) => {
    const newAppointment: Appointment = {
        ...appointmentData,
        id: `app${Date.now()}`,
        status: 'Pending Triage',
    };
    mockAppointments.push(newAppointment);
    saveData('hms_appointments', mockAppointments);
    return apiCall(newAppointment);
}

// Patient APIs
export const getPatientAppointments = (patientId: string) => apiCall(mockAppointments.filter(a => a.patientId === patientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
export const getPatientTests = (patientId: string) => apiCall(mockTestRequests.filter(t => t.patientId === patientId));
export const getPatientPrescriptions = (patientId: string) => apiCall(mockPrescriptions.filter(p => p.patientId === patientId));
export const getPatientBills = (patientId: string) => apiCall(mockBills.filter(b => b.patientId === patientId));
export const getPatientInsuranceDocs = (patientId: string) => apiCall(mockInsuranceDocs.filter(d => d.patientId === patientId));
export const getPatientDischargeSummaries = (patientId: string) => apiCall(
    mockDischargeSummaries.filter(s => s.patientId === patientId && s.status === 'Approved')
);

export const uploadInsuranceDoc = (patientId: string, formData: FormData) => {
    const file = formData.get('document') as File;
    if (!file) return failCall("No file provided");
    const newDoc: InsuranceDoc = {
        id: `ins${Date.now()}`,
        patientId,
        fileName: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        fileUrl: '#'
    };
    mockInsuranceDocs.push(newDoc);
    saveData('hms_insurance', mockInsuranceDocs);
    return apiCall(newDoc);
}

// Doctor APIs
export const getDoctorAppointments = (doctorId: string) => apiCall(mockAppointments.filter(a => a.doctorId === doctorId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

export const orderTests = (doctorId: string, patientId: string, patientName: string, testNamesStr: string) => {
    const testNames = testNamesStr.split(',').map(name => name.trim()).filter(Boolean);
    const newTests: TestRequest[] = [];
    testNames.forEach(testName => {
        const newTest: TestRequest = {
            id: `test${Date.now()}${Math.random()}`,
            patientId,
            patientName,
            doctorId,
            testName,
            type: TestType.LAB, // Assuming LAB for now as per prompt
            status: 'Pending',
            requestDate: new Date().toISOString().split('T')[0],
        };
        mockTestRequests.push(newTest);
        newTests.push(newTest);
    });
    saveData('hms_tests', mockTestRequests);
    return apiCall(newTests);
}

export const addPrescription = (prescriptionData: Omit<Prescription, 'id'>) => {
    const newPrescription: Prescription = {
        ...prescriptionData,
        id: `presc${Date.now()}`,
    };
    mockPrescriptions.push(newPrescription);
    saveData('hms_prescriptions', mockPrescriptions);
    return apiCall(newPrescription);
}

export const updateAppointment = (appointmentId: string, updates: { status?: 'Completed' | 'Cancelled'; notes?: string }) => {
    const appointment = mockAppointments.find(a => a.id === appointmentId);
    if (appointment) {
        if (updates.status) appointment.status = updates.status;
        if (updates.notes) appointment.notes = (appointment.notes ? appointment.notes + '\n' : '') + `[${new Date().toLocaleTimeString()}] ${updates.notes}`;
        saveData('hms_appointments', mockAppointments);
        return apiCall(appointment);
    }
    return failCall('Appointment not found.');
}

export const getPatientMedicalHistory = (patientId: string) => {
    const appointments = mockAppointments.filter(a => a.patientId === patientId);
    const tests = mockTestRequests.filter(t => t.patientId === patientId);
    const prescriptions = mockPrescriptions.filter(p => p.patientId === patientId);
    const patientInfo = mockUsers.find(u => u.id === patientId);
    return apiCall({
        patientInfo: patientInfo ? { id: patientInfo.id, name: patientInfo.name, abhaId: patientInfo.abhaId } : null,
        appointments,
        tests,
        prescriptions
    });
}

// Nurse APIs
export const getNurseTasks = (nurseId: string) => apiCall(mockNurseTasks.filter(t => t.nurseId === nurseId && t.status === 'Pending'));
export const completeNurseTask = (taskId: string) => {
    const task = mockNurseTasks.find(t => t.id === taskId);
    if (task) {
        task.status = 'Completed';
        saveData('hms_tasks', mockNurseTasks);
        return apiCall(task);
    }
    return failCall("Task not found");
}

export const getTriageQueue = () => apiCall(mockAppointments.filter(a => a.status === 'Pending Triage').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
export const submitTriage = (appointmentId: string, doctorId: string, doctorName: string, triageData: TriageInfo) => {
    const appointment = mockAppointments.find(a => a.id === appointmentId);
    if (appointment) {
        appointment.status = 'Scheduled';
        appointment.doctorId = doctorId;
        appointment.doctorName = doctorName;
        appointment.triageData = triageData;
        saveData('hms_appointments', mockAppointments);
        return apiCall(appointment);
    }
    return failCall("Appointment not found");
}


// Lab & Radiology APIs
export const getPendingTests = (type: TestType) => apiCall(mockTestRequests.filter(t => t.type === type && t.status === 'Pending'));
export const updateTestResult = (testId: string, result: string) => {
    const test = mockTestRequests.find(t => t.id === testId);
    if (test) {
        test.status = 'Completed';
        test.result = result;
        test.resultDate = new Date().toISOString().split('T')[0];
        saveData('hms_tests', mockTestRequests);
        return apiCall(test);
    }
    return failCall("Test not found");
}

// Admin APIs
export type AddStaffData = { name: string; role: UserRole; department?: string; password: string };

export const addStaff = (staffData: AddStaffData) => {
    const newId = `${staffData.role.charAt(0).toLowerCase()}${Date.now()}`;
    const newStaff: User & { password?: string } = {
        id: newId,
        name: staffData.name,
        role: staffData.role,
        department: staffData.department,
        password: staffData.password,
    };
    mockUsers.push(newStaff);
    saveData('hms_users', mockUsers);
    const { password, ...staffToReturn } = newStaff;
    return apiCall(staffToReturn);
}

export const getDashboardStats = () => {
    const totalAppointments = mockAppointments.length;
    const totalTests = mockTestRequests.length;
    const completedBills = mockBills.filter(b => b.status === 'Paid').length;
    return apiCall({ totalAppointments, totalTests, completedBills });
}
export const getAllStaff = () => apiCall(mockUsers.filter(u => u.role !== UserRole.PATIENT));
export const getAllPatients = () => apiCall(mockUsers.filter(u => u.role === UserRole.PATIENT));

export const generateAndSaveDischargeSummary = async (patientId: string): Promise<DischargeSummary> => {
    const history = await getPatientMedicalHistory(patientId);
    if (!history.patientInfo) {
        return failCall("Patient not found for summary generation.");
    }
    const summary: DischargeSummary = {
        id: `summary-${patientId}-${Date.now()}`,
        patientId,
        patientName: history.patientInfo.name,
        generationDate: new Date().toISOString(),
        status: 'Pending Approval',
        ...history,
    };
    mockDischargeSummaries.push(summary);
    saveData('hms_summaries', mockDischargeSummaries);
    return apiCall(summary);
};

export const getAllDischargeSummaries = () => apiCall(
    mockDischargeSummaries.sort((a, b) => new Date(b.generationDate).getTime() - new Date(a.generationDate).getTime())
);

export const approveDischargeSummary = (summaryId: string) => {
    const summary = mockDischargeSummaries.find(s => s.id === summaryId);
    if (summary) {
        summary.status = 'Approved';
        saveData('hms_summaries', mockDischargeSummaries);
        return apiCall(summary);
    }
    return failCall("Summary not found.");
};