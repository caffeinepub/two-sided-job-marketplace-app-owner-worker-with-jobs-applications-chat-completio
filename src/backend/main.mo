import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type UserProfile = {
    principal : Principal;
    displayName : Text;
    phoneNumber : Text;
    role : UserRole;
    ratingSum : Nat;
    ratingCount : Nat;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.displayName, profile2.displayName);
    };
  };

  public type UserRole = {
    #owner;
    #worker;
  };

  public type Job = {
    id : Nat;
    ownerPrincipal : Principal;
    title : Text;
    description : Text;
    payType : PayType;
    amount : Nat;
    workersNeeded : Nat;
    location : Text;
    status : JobStatus;
    createdAt : Time.Time;
    assignedWorker : ?Principal;
    completedAt : ?Time.Time;
  };

  module Job {
    public func compare(job1 : Job, job2 : Job) : Order.Order {
      Nat.compare(job1.id, job2.id);
    };
  };

  public type PayType = {
    #hourly;
    #daily;
  };

  public type JobStatus = {
    #open;
    #assigned;
    #completed;
  };

  public type ChatMessage = {
    from : Principal;
    to : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  public type PayoutStatus = {
    #paid;
    #unpaid;
  };

  public type Payout = {
    jobId : Nat;
    worker : Principal;
    amount : Nat;
    status : PayoutStatus;
  };

  public type JobApplication = {
    jobId : Nat;
    worker : Principal;
    appliedAt : Time.Time;
  };

  var nextJobId = 0;
  let jobs = Map.empty<Nat, Job>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let chatMessages = Map.empty<Nat, List.List<ChatMessage>>();
  let payouts = Map.empty<Nat, Payout>();
  let jobApplicationsMap = Map.empty<Nat, List.List<JobApplication>>();
  let accessControlState = AccessControl.initState();

  // Add access control to actor
  include MixinAuthorization(accessControlState);

  // Helper function to check if user has a profile with specific role
  private func hasRole(caller : Principal, requiredRole : UserRole) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role, requiredRole) {
          case (#owner, #owner) { true };
          case (#worker, #worker) { true };
          case (_, _) { false };
        };
      };
      case (null) { false };
    };
  };

  // Helper function to check if user is participant in job chat
  private func isJobParticipant(caller : Principal, job : Job) : Bool {
    if (caller == job.ownerPrincipal) {
      return true;
    };
    switch (job.assignedWorker) {
      case (?worker) { caller == worker };
      case (null) {
        // Check if caller has applied to this job
        switch (jobApplicationsMap.get(job.id)) {
          case (?applications) {
            let appsArray = applications.toArray();
            for (app in appsArray.values()) {
              if (app.worker == caller) { return true };
            };
            false;
          };
          case (null) { false };
        };
      };
    };
  };

  // Helper function to check if worker worked on a completed job with owner
  private func hasWorkedWithOwner(worker : Principal, owner : Principal) : Bool {
    for (job in jobs.values()) {
      if (
        job.ownerPrincipal == owner and job.status == #completed and (
          switch (job.assignedWorker) {
            case (?w) { w == worker };
            case (null) { false };
          }
        )
      ) { return true };
    };
    false;
  };

  // User Profile Functions
  public shared ({ caller }) func saveCallerUserProfile(displayName : Text, role : UserRole, phoneNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    if (displayName.isEmpty()) {
      Runtime.trap("Display name cannot be empty");
    };

    if (phoneNumber.isEmpty()) {
      Runtime.trap("Phone number cannot be empty");
    };

    let profile : UserProfile = {
      principal = caller;
      displayName;
      phoneNumber;
      role;
      ratingSum = 0;
      ratingCount = 0;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(user);
  };

  // Job Functions
  public shared ({ caller }) func createJob(
    title : Text,
    description : Text,
    payType : PayType,
    amount : Nat,
    workersNeeded : Nat,
    location : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create jobs");
    };

    if (not hasRole(caller, #owner)) {
      Runtime.trap("Unauthorized: Only owners can create jobs");
    };

    if (title.isEmpty() or description.isEmpty()) {
      Runtime.trap("Title and description cannot be empty");
    };

    let job : Job = {
      id = nextJobId;
      ownerPrincipal = caller;
      title;
      description;
      payType;
      amount;
      workersNeeded;
      location;
      status = #open;
      createdAt = Time.now();
      assignedWorker = null;
      completedAt = null;
    };

    jobs.add(nextJobId, job);
    jobApplicationsMap.add(nextJobId, List.empty<JobApplication>());
    nextJobId += 1;
    job.id;
  };

  public query ({ caller }) func getAllJobs() : async [Job] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view jobs");
    };
    jobs.values().toArray().sort();
  };

  public query ({ caller }) func getJobById(id : Nat) : async Job {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view jobs");
    };
    switch (jobs.get(id)) {
      case (?job) { job };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  public shared ({ caller }) func applyToJob(jobId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can apply to jobs");
    };

    if (not hasRole(caller, #worker)) {
      Runtime.trap("Unauthorized: Only workers can apply to jobs");
    };

    switch (jobs.get(jobId)) {
      case (?job) {
        if (job.status != #open) {
          Runtime.trap("Cannot apply to non-open job");
        };

        if (caller == job.ownerPrincipal) {
          Runtime.trap("Job owner cannot apply to their own job");
        };

        let existingApplications = switch (jobApplicationsMap.get(jobId)) {
          case (?apps) { apps };
          case (null) { List.empty<JobApplication>() };
        };

        // Check if already applied
        var alreadyApplied = false;
        let appsArray = existingApplications.toArray();
        for (app in appsArray.values()) {
          if (app.worker == caller) {
            alreadyApplied := true;
          };
        };

        if (alreadyApplied) {
          Runtime.trap("Already applied to this job");
        };

        let application : JobApplication = {
          jobId;
          worker = caller;
          appliedAt = Time.now();
        };

        existingApplications.add(application);
        jobApplicationsMap.add(jobId, existingApplications);
      };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  public query ({ caller }) func getJobApplications(jobId : Nat) : async [JobApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view applications");
    };

    switch (jobs.get(jobId)) {
      case (?job) {
        if (caller != job.ownerPrincipal) {
          Runtime.trap("Unauthorized: Only job owner can view applications");
        };

        switch (jobApplicationsMap.get(jobId)) {
          case (?apps) { apps.toArray() };
          case (null) { [] };
        };
      };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  public shared ({ caller }) func assignWorkerToJob(jobId : Nat, worker : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can assign workers");
    };

    switch (jobs.get(jobId)) {
      case (?job) {
        if (caller != job.ownerPrincipal) {
          Runtime.trap("Unauthorized: Only job owner can assign worker");
        };

        if (job.status != #open) {
          Runtime.trap("Job must be open to assign worker");
        };

        // Verify worker has applied
        var hasApplied = false;
        switch (jobApplicationsMap.get(jobId)) {
          case (?apps) {
            let appsArray = apps.toArray();
            for (app in appsArray.values()) {
              if (app.worker == worker) {
                hasApplied := true;
              };
            };
          };
          case (null) { hasApplied := false };
        };

        if (not hasApplied) {
          Runtime.trap("Worker must have applied to the job");
        };

        let updatedJob : Job = {
          id = job.id;
          ownerPrincipal = job.ownerPrincipal;
          title = job.title;
          description = job.description;
          payType = job.payType;
          amount = job.amount;
          workersNeeded = job.workersNeeded;
          location = job.location;
          status = #assigned;
          createdAt = job.createdAt;
          assignedWorker = ?worker;
          completedAt = null;
        };
        jobs.add(jobId, updatedJob);
      };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  public shared ({ caller }) func completeJob(jobId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can complete jobs");
    };

    switch (jobs.get(jobId)) {
      case (?job) {
        if (caller != job.ownerPrincipal) {
          Runtime.trap("Unauthorized: Only job owner can complete job");
        };

        if (job.status != #assigned) {
          Runtime.trap("Job must be assigned to complete");
        };

        let updatedJob : Job = {
          id = job.id;
          ownerPrincipal = job.ownerPrincipal;
          title = job.title;
          description = job.description;
          payType = job.payType;
          amount = job.amount;
          workersNeeded = job.workersNeeded;
          location = job.location;
          status = #completed;
          createdAt = job.createdAt;
          assignedWorker = job.assignedWorker;
          completedAt = ?Time.now();
        };
        jobs.add(jobId, updatedJob);

        // Create payout
        switch (job.assignedWorker) {
          case (?worker) {
            let payout : Payout = {
              jobId = job.id;
              worker;
              amount = job.amount;
              status = #unpaid;
            };
            payouts.add(job.id, payout);
          };
          case (null) { Runtime.trap("Job must have assigned worker") };
        };
      };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  // Chat Functions
  public shared ({ caller }) func sendMessage(jobId : Nat, to : Principal, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    if (text.isEmpty()) {
      Runtime.trap("Message text cannot be empty");
    };

    switch (jobs.get(jobId)) {
      case (?job) {
        // Verify caller is a participant (owner, assigned worker, or applicant)
        if (not isJobParticipant(caller, job)) {
          Runtime.trap("Unauthorized: Only job participants can send messages");
        };

        // Verify recipient is a participant
        if (not isJobParticipant(to, job)) {
          Runtime.trap("Unauthorized: Can only send messages to job participants");
        };

        let message : ChatMessage = {
          from = caller;
          to;
          text;
          timestamp = Time.now();
        };

        let existingMessages = switch (chatMessages.get(jobId)) {
          case (?messages) { messages };
          case (null) { List.empty<ChatMessage>() };
        };

        existingMessages.add(message);
        chatMessages.add(jobId, existingMessages);
      };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  public query ({ caller }) func getChatMessages(jobId : Nat) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view messages");
    };

    switch (jobs.get(jobId)) {
      case (?job) {
        // Verify caller is a participant
        if (not isJobParticipant(caller, job)) {
          Runtime.trap("Unauthorized: Only job participants can view messages");
        };

        switch (chatMessages.get(jobId)) {
          case (?messages) { messages.toArray() };
          case (null) { [] };
        };
      };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  // Payout Functions
  public query ({ caller }) func getPayoutsForWorker(worker : Principal) : async [Payout] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view payouts");
    };

    // Workers can only view their own payouts, admins can view any
    if (caller != worker and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own payouts");
    };

    let filtered = List.empty<Payout>();

    payouts.values().forEach(
      func(p) {
        if (p.worker == worker) {
          filtered.add(p);
        };
      }
    );

    filtered.toArray();
  };

  public shared ({ caller }) func markPayoutAsPaid(jobId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark payouts");
    };

    switch (payouts.get(jobId)) {
      case (?payout) {
        switch (jobs.get(jobId)) {
          case (?job) {
            if (caller != job.ownerPrincipal) {
              Runtime.trap("Unauthorized: Only job owner can mark payout as paid");
            };

            if (job.status != #completed) {
              Runtime.trap("Job must be completed to mark payout as paid");
            };

            let updatedPayout : Payout = {
              jobId = payout.jobId;
              worker = payout.worker;
              amount = payout.amount;
              status = #paid;
            };
            payouts.add(jobId, updatedPayout);
          };
          case (null) { Runtime.trap("Job not found") };
        };
      };
      case (null) { Runtime.trap("Payout not found") };
    };
  };

  // Rating Functions
  public shared ({ caller }) func rateOwner(owner : Principal, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can rate owners");
    };

    if (not hasRole(caller, #worker)) {
      Runtime.trap("Unauthorized: Only workers can rate owners");
    };

    if (rating > 5 or rating == 0) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    // Verify worker has completed a job with this owner
    if (not hasWorkedWithOwner(caller, owner)) {
      Runtime.trap("Unauthorized: Can only rate owners you have worked with on completed jobs");
    };

    switch (userProfiles.get(owner)) {
      case (?profile) {
        if (profile.role != #owner) {
          Runtime.trap("Can only rate users with owner role");
        };

        let updatedProfile : UserProfile = {
          principal = profile.principal;
          displayName = profile.displayName;
          phoneNumber = profile.phoneNumber;
          role = profile.role;
          ratingSum = profile.ratingSum + rating;
          ratingCount = profile.ratingCount + 1;
        };
        userProfiles.add(owner, updatedProfile);
      };
      case (null) { Runtime.trap("Owner not found") };
    };
  };

  public query ({ caller }) func getOwnerRating(owner : Principal) : async ?Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view ratings");
    };

    switch (userProfiles.get(owner)) {
      case (?profile) {
        if (profile.ratingCount == 0) { return null };
        ?(profile.ratingSum.toFloat() / profile.ratingCount.toFloat());
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view all profiles");
    };
    userProfiles.values().toArray().sort();
  };
};
