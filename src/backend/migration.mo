import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldUserRole = { #owner; #worker };

  type OldUserProfile = {
    principal : Principal;
    displayName : Text;
    role : OldUserRole;
    ratingSum : Nat;
    ratingCount : Nat;
  };

  type OldJob = {
    id : Nat;
    ownerPrincipal : Principal;
    title : Text;
    description : Text;
    payType : { #hourly; #daily };
    amount : Nat;
    location : Text;
    status : { #open; #assigned; #completed };
    createdAt : Int;
    assignedWorker : ?Principal;
    completedAt : ?Int;
  };

  type OldChatMessage = {
    from : Principal;
    to : Principal;
    text : Text;
    timestamp : Int;
  };

  type OldPayout = {
    jobId : Nat;
    worker : Principal;
    amount : Nat;
    status : { #paid; #unpaid };
  };

  type OldJobApplication = {
    jobId : Nat;
    worker : Principal;
    appliedAt : Int;
  };

  type OldActor = {
    nextJobId : Nat;
    jobs : Map.Map<Nat, OldJob>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    chatMessages : Map.Map<Nat, List.List<OldChatMessage>>;
    payouts : Map.Map<Nat, OldPayout>;
    jobApplicationsMap : Map.Map<Nat, List.List<OldJobApplication>>;
  };

  type NewUserProfile = {
    principal : Principal;
    displayName : Text;
    phoneNumber : Text;
    role : OldUserRole;
    ratingSum : Nat;
    ratingCount : Nat;
  };

  type NewJob = {
    id : Nat;
    ownerPrincipal : Principal;
    title : Text;
    description : Text;
    payType : { #hourly; #daily };
    amount : Nat;
    workersNeeded : Nat;
    location : Text;
    status : { #open; #assigned; #completed };
    createdAt : Int;
    assignedWorker : ?Principal;
    completedAt : ?Int;
  };

  type NewActor = {
    nextJobId : Nat;
    jobs : Map.Map<Nat, NewJob>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    chatMessages : Map.Map<Nat, List.List<OldChatMessage>>;
    payouts : Map.Map<Nat, OldPayout>;
    jobApplicationsMap : Map.Map<Nat, List.List<OldJobApplication>>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        { oldProfile with phoneNumber = "" };
      }
    );

    let newJobs = old.jobs.map<Nat, OldJob, NewJob>(
      func(_id, oldJob) {
        { oldJob with workersNeeded = 1 };
      }
    );

    {
      nextJobId = old.nextJobId;
      jobs = newJobs;
      userProfiles = newUserProfiles;
      chatMessages = old.chatMessages;
      payouts = old.payouts;
      jobApplicationsMap = old.jobApplicationsMap;
    };
  };
};
