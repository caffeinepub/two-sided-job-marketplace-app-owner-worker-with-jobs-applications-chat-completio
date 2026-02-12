# Specification

## Summary
**Goal:** Add phone number support to user registration/profile, and add a workers-needed field to job creation and job display.

**Planned changes:**
- Backend: Extend the user profile data model to include a phone number, store it per authenticated Principal, and return it in profile queries.
- Frontend: Add a required Phone Number input to the registration/profile creation (Role Select) flow with validation, and include it when saving the profile.
- Frontend: Display the saved phone number on the Profile page and allow editing/saving it using the existing profile save flow.
- Backend: Extend the Job data model to include `workersNeeded`, accept it in job creation, validate it is at least 1, and return it in job queries.
- Frontend: Add a required “Workers Needed” numeric input (min 1) to job creation, submit it to the backend, and display it on Job Details (and in job summaries where feasible).

**User-visible outcome:** Users can enter and save a phone number during registration and later edit it in their profile; owners can specify how many workers are needed when creating a job, and that number is shown on job details (and possibly in job lists).
