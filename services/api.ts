import { User, UserRole, Department, Doctor, Appointment, TestRequest, TestType, Prescription, Bill, NurseTask, TriageInfo, DischargeSummary, AttendanceRecord, MedicationStock, ICUBed, RoomFacility, RoomBooking, InsuranceDetails } from '../types';
import * as mockApi from './mockApi';

// Initialize mock data on app startup
mockApi.initializeMockData();

// Re-export types to be used by components
export * from '../types';

// --- API Type Definitions ---
export type LoginCredentials = { abhaId?: string; password?: string; staffId?: string };
export type RegisterUserData = Omit<User, 'id' | 'role'> & { password: string };
export type AddStaffData = { name: string; role: UserRole; department?: string; password: string };
export type InsuranceSubmitData = Omit<InsuranceDetails, 'id' | 'patientId'>;


// --- API Implementations (pointing to mock API) ---

// Auth
export const login = mockApi.login;
export const register = mockApi.register;

// General Data
export const getDepartments = mockApi.getDepartments;
export const getDoctorsByDepartment = mockApi.getDoctorsByDepartment;

// Patient APIs
export const getPatientAppointments = mockApi.getPatientAppointments;
export const getPatientTests = mockApi.getPatientTests;
export const getPatientPrescriptions = mockApi.getPatientPrescriptions;
export const getPatientBills = mockApi.getPatientBills;
export const getPatientInsuranceDetails = mockApi.getPatientInsuranceDetails;
export const getPatientDischargeSummaries = mockApi.getPatientDischargeSummaries;
export const bookAppointment = mockApi.bookAppointment;
export const submitInsuranceDetails = mockApi.submitInsuranceDetails;
export const bookRoom = mockApi.bookRoom;


// Doctor APIs
export const getDoctorAppointments = mockApi.getDoctorAppointments;
export const orderTests = mockApi.orderTests;
export const addPrescription = mockApi.addPrescription;
export const updateAppointment = mockApi.updateAppointment;
export const getPatientMedicalHistory = mockApi.getPatientMedicalHistory;

// Nurse APIs
export const getNurseTasks = mockApi.getNurseTasks;
export const getTriageQueue = mockApi.getTriageQueue;
export const submitTriage = mockApi.submitTriage;

// Lab & Radiology APIs
export const getPendingTests = mockApi.getPendingTests;
export const updateTestResult = mockApi.updateTestResult;

// Pharmacy APIs
export const getPendingPrescriptions = mockApi.getPendingPrescriptions;
export const dispensePrescription = mockApi.dispensePrescription;


// Admin & Management APIs
export const addStaff = mockApi.addStaff;
export const getDashboardStats = mockApi.getDashboardStats;
export const getAllStaff = mockApi.getAllStaff;
export const getAllPatients = mockApi.getAllPatients;
export const generateAndSaveDischargeSummary = mockApi.generateAndSaveDischargeSummary;
export const getAllDischargeSummaries = mockApi.getAllDischargeSummaries;
export const approveDischargeSummary = mockApi.approveDischargeSummary;
export const getAllPatientQueries = mockApi.getAllPatientQueries;
export const respondToQuery = mockApi.respondToQuery;


// HR API
export const getAttendance = mockApi.getAttendance;
export const clockIn = mockApi.clockIn;
export const clockOut = mockApi.clockOut;

// Finance API
export const getFinancialData = mockApi.getFinancialData;

// Manager API
export const getDoctorWorkload = mockApi.getDoctorWorkload;

// Aiding Portals API
export const getICUBeds = mockApi.getICUBeds;
export const getMedicationStock = mockApi.getMedicationStock;

// Patient Portal Additions
export const getRoomFacilities = mockApi.getRoomFacilities;
export const getPatientQueries = mockApi.getPatientQueries;
export const submitPatientQuery = mockApi.submitPatientQuery;