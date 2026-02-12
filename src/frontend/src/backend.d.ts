import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Job {
    id: bigint;
    status: JobStatus;
    completedAt?: Time;
    title: string;
    ownerPrincipal: Principal;
    createdAt: Time;
    assignedWorker?: Principal;
    description: string;
    workersNeeded: bigint;
    amount: bigint;
    payType: PayType;
    location: string;
}
export type Time = bigint;
export interface Payout {
    status: PayoutStatus;
    jobId: bigint;
    worker: Principal;
    amount: bigint;
}
export interface JobApplication {
    appliedAt: Time;
    jobId: bigint;
    worker: Principal;
}
export interface ChatMessage {
    to: Principal;
    from: Principal;
    text: string;
    timestamp: Time;
}
export interface UserProfile {
    ratingSum: bigint;
    principal: Principal;
    displayName: string;
    ratingCount: bigint;
    role: UserRole;
    phoneNumber: string;
}
export enum JobStatus {
    assigned = "assigned",
    open = "open",
    completed = "completed"
}
export enum PayType {
    hourly = "hourly",
    daily = "daily"
}
export enum PayoutStatus {
    paid = "paid",
    unpaid = "unpaid"
}
export enum UserRole {
    owner = "owner",
    worker = "worker"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    applyToJob(jobId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignWorkerToJob(jobId: bigint, worker: Principal): Promise<void>;
    completeJob(jobId: bigint): Promise<void>;
    createJob(title: string, description: string, payType: PayType, amount: bigint, workersNeeded: bigint, location: string): Promise<bigint>;
    getAllJobs(): Promise<Array<Job>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getChatMessages(jobId: bigint): Promise<Array<ChatMessage>>;
    getJobApplications(jobId: bigint): Promise<Array<JobApplication>>;
    getJobById(id: bigint): Promise<Job>;
    getOwnerRating(owner: Principal): Promise<number | null>;
    getPayoutsForWorker(worker: Principal): Promise<Array<Payout>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markPayoutAsPaid(jobId: bigint): Promise<void>;
    rateOwner(owner: Principal, rating: bigint, comment: string): Promise<void>;
    saveCallerUserProfile(displayName: string, role: UserRole, phoneNumber: string): Promise<void>;
    sendMessage(jobId: bigint, to: Principal, text: string): Promise<void>;
}
