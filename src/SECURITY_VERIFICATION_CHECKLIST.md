# Security Access Control Verification Checklist

## Critical Security Fix: Client Workout Data Access Control

This checklist must be completed before deploying the security fixes to production.

---

## 🔴 CRITICAL: Pre-Deployment Testing

### Test 1: Client A Cannot Retrieve Client B's Assignments

**Objective**: Verify that Client A cannot access Client B's workout data through any means.

#### Steps:
1. [ ] Create two test client accounts (Client A and Client B)
2. [ ] Assign workouts to both clients with different data
3. [ ] Log in as Client A
4. [ ] Open browser DevTools → Network tab
5. [ ] Navigate to `/portal/program` (My Program page)
6. [ ] Inspect network response for workout data
7. [ ] Verify response contains ONLY Client A's workouts
8. [ ] Navigate to `/portal` (Dashboard page)
9. [ ] Inspect network response for workout data
10. [ ] Verify response contains ONLY Client A's workouts
11. [ ] Navigate to `/portal/history` (Workout History page)
12. [ ] Inspect network response for workout data
13. [ ] Verify response contains ONLY Client A's workouts

#### Expected Results:
- ✅ All network responses contain ONLY Client A's workout data
- ✅ Zero instances of Client B's `clientId` in any response
- ✅ HTTP 200 OK status for all requests
- ✅ No error messages or warnings in console

#### Failure Criteria:
- ❌ Any network response contains Client B's workout data
- ❌ Any response contains workouts with `clientId !== Client A's memberId`
- ❌ 403 Forbidden or other error responses

---

### Test 2: Network Responses Never Include Other Clients' Records

**Objective**: Comprehensive network traffic inspection to ensure no data leakage.

#### Steps:
1. [ ] Log in as Client A
2. [ ] Open DevTools → Network tab
3. [ ] Clear network log
4. [ ] Navigate through ALL client portal pages:
   - [ ] Dashboard (`/portal`)
   - [ ] My Program (`/portal/program`)
   - [ ] Workout History (`/portal/history`)
   - [ ] Nutrition (`/portal/nutrition`)
   - [ ] Progress (`/portal/progress`)
   - [ ] Profile (`/portal/profile`)
5. [ ] For EACH page, inspect ALL network requests
6. [ ] Search responses for any `clientId` values
7. [ ] Verify ALL `clientId` values match Client A's `memberId`

#### Expected Results:
- ✅ Zero instances of other clients' `clientId` in any response
- ✅ All workout data belongs to Client A
- ✅ All check-in data belongs to Client A
- ✅ All summary data belongs to Client A

#### Failure Criteria:
- ❌ Any response contains `clientId` not matching Client A
- ❌ Any response contains workout data for other clients
- ❌ Any response contains aggregated data from multiple clients

---

### Test 3: Trainer Access Restricted to Managed Clients Only

**Objective**: Verify trainers can only access data for their assigned clients.

#### Steps:
1. [ ] Create Trainer X and Trainer Y accounts
2. [ ] Create Client A and Client B accounts
3. [ ] Assign Client A to Trainer X (active assignment)
4. [ ] Assign Client B to Trainer Y (active assignment)
5. [ ] Log in as Trainer X
6. [ ] Navigate to `/trainer/workout-feedback` (Completed Workouts page)
7. [ ] Verify page shows ONLY Client A's workouts
8. [ ] Open DevTools → Network tab
9. [ ] Inspect network responses
10. [ ] Verify responses contain ONLY Client A's data
11. [ ] Attempt to manually call `getClientWorkouts(clientBId, trainerXId, 'trainer')` in console
12. [ ] Verify error: "Unauthorized: Trainer is not assigned to this client"

#### Expected Results:
- ✅ Trainer X sees ONLY Client A's workout data
- ✅ Network responses contain ONLY Client A's data
- ✅ Attempting to access Client B's data throws authorization error
- ✅ No silent failures or empty results

#### Failure Criteria:
- ❌ Trainer X can see Client B's workout data
- ❌ Network responses contain Client B's data
- ❌ No error thrown when attempting unauthorized access
- ❌ Silent failure (empty result instead of error)

---

### Test 4: Direct API Manipulation Attempts Fail

**Objective**: Verify that attempting to bypass access control fails securely.

#### Steps:
1. [ ] Log in as Client A
2. [ ] Open browser console
3. [ ] Get Client B's `memberId` (from test data)
4. [ ] Attempt: `getClientWorkouts(clientBId, clientAId, 'client')`
5. [ ] Verify error thrown
6. [ ] Attempt: `getAuthorizedClientWorkouts({ memberId: clientBId, role: 'client' })`
7. [ ] Verify error or empty result
8. [ ] Log in as Trainer X (not assigned to Client C)
9. [ ] Attempt: `getClientWorkouts(clientCId, trainerXId, 'trainer')`
10. [ ] Verify error: "Unauthorized: Trainer is not assigned to this client"

#### Expected Results:
- ✅ All unauthorized access attempts throw errors
- ✅ Error messages are clear and specific
- ✅ No data returned for unauthorized requests
- ✅ Console shows error messages (not silent failures)

#### Failure Criteria:
- ❌ Any unauthorized request returns data
- ❌ Silent failures (no error thrown)
- ❌ Generic error messages that don't indicate authorization failure
- ❌ Partial data returned

---

### Test 5: Status Filtering After Secure Server-Side Fetch

**Objective**: Verify that status filtering works correctly after secure data fetch.

#### Steps:
1. [ ] Log in as Client A
2. [ ] Ensure Client A has workouts in multiple states:
   - [ ] Active workouts (status: 'active')
   - [ ] Pending workouts (status: 'pending')
   - [ ] Completed workouts (status: 'completed')
3. [ ] Navigate to My Program page (`/portal/program`)
4. [ ] Verify page shows ONLY active/pending workouts
5. [ ] Open DevTools → Network tab
6. [ ] Verify network response contains active/pending workouts
7. [ ] Navigate to Workout History page (`/portal/history`)
8. [ ] Verify page shows ONLY completed workouts
9. [ ] Verify network response contains completed workouts
10. [ ] Verify NO cross-client data in either response

#### Expected Results:
- ✅ My Program page shows active/pending workouts only
- ✅ Workout History page shows completed workouts only
- ✅ Status filtering works correctly
- ✅ All workouts belong to Client A
- ✅ No cross-client data leakage

#### Failure Criteria:
- ❌ Wrong status workouts displayed on pages
- ❌ Status filtering not working
- ❌ Cross-client data visible
- ❌ Network responses contain wrong status workouts

---

## 🟡 IMPORTANT: Code Review Checklist

### Access Control Implementation

- [ ] `client-workout-access-control.ts` implements server-side filtering
- [ ] All `getClientWorkouts()` calls filter by `clientId` BEFORE returning data
- [ ] All `getAuthorizedClientWorkouts()` calls enforce role-based access
- [ ] Trainer access verifies active `trainerclientassignments` relationship
- [ ] Client access verifies `clientId === requestingMemberId`
- [ ] Unauthorized access throws errors (not silent failures)

### Client Portal Pages

- [ ] `MyProgramPage.tsx` uses `getClientWorkouts()` instead of `BaseCrudService.getAll()`
- [ ] `DashboardPage.tsx` uses `getClientWorkouts()` instead of `BaseCrudService.getAll()`
- [ ] `WorkoutHistoryPage.tsx` uses `getClientWorkouts()` instead of `BaseCrudService.getAll()`
- [ ] No client-side filtering by `clientId` after fetch
- [ ] Status filtering happens AFTER secure server-side fetch

### Trainer Dashboard Pages

- [ ] `CompletedWorkoutsFeedbackPage.tsx` uses `getAuthorizedClientWorkouts()`
- [ ] Trainer pages verify trainer-client assignments
- [ ] No direct `BaseCrudService.getAll()` calls for workout data

### Security Principles

- [ ] No client-side trust in security decisions
- [ ] All access control logic is server-side
- [ ] Filtering by `clientId` happens before data leaves server
- [ ] Role-based access control enforced
- [ ] Trainer-client relationships verified
- [ ] Errors thrown for unauthorized access (not silent)

---

## 🟢 OPTIONAL: Additional Security Measures

### Performance Testing

- [ ] Measure response time for `getClientWorkouts()`
- [ ] Verify no significant performance degradation
- [ ] Consider caching trainer-client assignments if needed

### Audit Logging (Future Enhancement)

- [ ] Log all access attempts (authorized and unauthorized)
- [ ] Log unauthorized access attempts with details
- [ ] Set up monitoring for repeated unauthorized attempts

### Additional Collections to Secure (Future Work)

- [ ] Review `clientprofiles` access control
- [ ] Review `weeklycheckins` access control
- [ ] Review `weeklycoachesnotes` access control
- [ ] Review `weeklysummaries` access control
- [ ] Review `progresscheckins` access control

---

## 📋 Sign-Off

### Development Team

- [ ] Code implementation complete
- [ ] All client portal pages updated
- [ ] Access control service implemented
- [ ] Unit tests written (if applicable)
- [ ] Code review completed
- [ ] Documentation updated

**Developer Name**: ________________  
**Date**: ________________  
**Signature**: ________________

---

### QA Team

- [ ] Test 1 passed: Client A cannot access Client B's data
- [ ] Test 2 passed: Network responses contain no cross-client data
- [ ] Test 3 passed: Trainer access restricted to managed clients
- [ ] Test 4 passed: Direct API manipulation attempts fail
- [ ] Test 5 passed: Status filtering works after secure fetch
- [ ] All network traffic inspected
- [ ] No security vulnerabilities found

**QA Engineer Name**: ________________  
**Date**: ________________  
**Signature**: ________________

---

### Security Team

- [ ] Security review completed
- [ ] Access control implementation verified
- [ ] Server-side filtering confirmed
- [ ] No client-side trust in security
- [ ] Authorization errors properly thrown
- [ ] No data leakage identified

**Security Reviewer Name**: ________________  
**Date**: ________________  
**Signature**: ________________

---

### Product Owner

- [ ] All acceptance criteria met
- [ ] Security requirements satisfied
- [ ] User experience not negatively impacted
- [ ] Ready for production deployment

**Product Owner Name**: ________________  
**Date**: ________________  
**Signature**: ________________

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passed
- [ ] All sign-offs obtained
- [ ] Backup plan prepared
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured

### Deployment

- [ ] Deploy to staging environment
- [ ] Run full test suite on staging
- [ ] Verify no regressions
- [ ] Deploy to production
- [ ] Monitor for errors

### Post-Deployment

- [ ] Verify production deployment successful
- [ ] Run smoke tests on production
- [ ] Monitor error logs for 24 hours
- [ ] Verify no unauthorized access attempts
- [ ] Confirm no performance degradation

---

## 📊 Test Results Summary

| Test | Status | Notes | Tester | Date |
|------|--------|-------|--------|------|
| Test 1: Client A cannot access Client B | ⬜ Pass / ⬜ Fail | | | |
| Test 2: Network responses clean | ⬜ Pass / ⬜ Fail | | | |
| Test 3: Trainer access restricted | ⬜ Pass / ⬜ Fail | | | |
| Test 4: API manipulation fails | ⬜ Pass / ⬜ Fail | | | |
| Test 5: Status filtering works | ⬜ Pass / ⬜ Fail | | | |

---

## 🔴 CRITICAL ISSUES LOG

If any test fails, document here:

| Issue # | Description | Severity | Status | Resolution | Date |
|---------|-------------|----------|--------|------------|------|
| | | | | | |

---

## ✅ FINAL APPROVAL

**All tests passed**: ⬜ YES / ⬜ NO

**Ready for production**: ⬜ YES / ⬜ NO

**Approved by**: ________________  
**Date**: ________________  
**Signature**: ________________

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-17  
**Next Review Date**: ________________
