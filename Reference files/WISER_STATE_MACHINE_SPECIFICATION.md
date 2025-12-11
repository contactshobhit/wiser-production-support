# WISeR Packet State Machine - Complete Technical Specification
## Definitive State Transition Logic for Development

**Document Version:** 1.0  
**Date:** December 7, 2025  
**Scope:** New Jersey (Novitas MAC) - Single State Implementation  
**Purpose:** Define complete state machine for packet workflow to ensure correct implementation

---

## TABLE OF CONTENTS

1. [State Machine Overview](#state-machine-overview)
2. [Complete State Definitions](#complete-state-definitions)
3. [State Transition Matrix](#state-transition-matrix)
4. [State Transition Rules](#state-transition-rules)
5. [Triggers and Actions](#triggers-and-actions)
6. [Validation Rules](#validation-rules)
7. [Side Effects and Notifications](#side-effects-and-notifications)
8. [Error Handling](#error-handling)
9. [Concurrent State Management](#concurrent-state-management)
10. [State Audit Trail](#state-audit-trail)
11. [Database Schema](#database-schema)
12. [API Specifications](#api-specifications)

---

## STATE MACHINE OVERVIEW

### Purpose
The WISeR state machine governs the complete lifecycle of a prior authorization packet from submission through final determination and delivery.

### Key Principles
1. **Single Source of Truth:** Packet status is the authoritative state
2. **Immutable History:** All state transitions are logged permanently
3. **Validation First:** All transitions validated before execution
4. **Atomic Operations:** State changes are transactional
5. **Side Effects Managed:** Notifications/letters triggered automatically
6. **Role-Based Transitions:** Only authorized actors can trigger specific transitions

### State Categories

```
INTAKE PHASE (4 states)
├── Submitted
├── Validating
├── Manual Review
└── Intake Processing

CLINICAL PHASE (3 states)
├── Clinical Review
├── MD Review
└── Letter Generation

DELIVERY PHASE (2 states)
├── Delivery In Progress
└── Closed - Delivered

TERMINAL STATES (2 states)
├── Closed - Dismissed
└── Closed - Withdrawn
```

---

## COMPLETE STATE DEFINITIONS

### 1. **SUBMITTED**
- **Description:** Packet received from provider via esMD or portal
- **Entry Condition:** Valid packet JSON posted to intake endpoint
- **System Owner:** Intake System
- **Duration:** Milliseconds to seconds (automatic transition)
- **SLA:** N/A (immediate processing)
- **User Visible:** No (transient state)

**What Happens:**
- Packet assigned unique ID (PKT-YYYY-NNNNNN)
- Basic structure validation
- Timestamp recorded
- Immediate transition to Validating

**Exit Criteria:**
- Structure validation passes → Validating
- Structure validation fails → Dismissed

---

### 2. **VALIDATING**
- **Description:** Automated validation checks in progress
- **Entry Condition:** From Submitted state
- **System Owner:** Validation Engine
- **Duration:** 30 seconds to 5 minutes
- **SLA:** 10 minutes
- **User Visible:** Yes (provider can see in portal)

**What Happens:**
- OCR extraction from documents
- Beneficiary eligibility check (HETS)
- Provider validation (PECOS)
- Service line mapping
- NPI verification
- Prior authorization rules check

**Exit Criteria:**
- All validations pass → Intake Processing
- Field corrections needed → Manual Review
- Eligibility failure → Dismissed
- Provider invalid → Dismissed

**Validation Checks Performed:**

| Check | System | Pass Criteria | Fail Action |
|-------|--------|---------------|-------------|
| Beneficiary Eligibility | HETS | Active Medicare Part B | Dismiss |
| MA Enrollment | HETS | Not in Medicare Advantage | Dismiss |
| Provider NPI | PECOS | Valid and enrolled | Dismiss |
| Service Line | Rules Engine | Matches 16 covered services | Dismiss |
| Document Completeness | OCR | All required fields present | Manual Review |
| Prior Auth Required | LCD/NCD | Service requires PA | Dismiss (N/A) |

---

### 3. **MANUAL REVIEW**
- **Description:** Human ops team member reviewing/correcting packet
- **Entry Condition:** From Validating (validation issues detected)
- **System Owner:** Ops Team
- **Duration:** 2-8 hours
- **SLA:** 24 hours from entry
- **User Visible:** Yes (status shows "Under Review")

**What Happens:**
- Packet assigned to ops team member
- Human corrects OCR errors, missing fields
- Document classification verified
- Eligibility exceptions researched
- Provider validation issues resolved

**Sub-States:**
- Assigned (to specific ops member)
- In Progress (actively being worked)
- Waiting (on external information)

**Exit Criteria:**
- Issues resolved → Intake Processing
- Cannot resolve (ineligible) → Dismissed
- Provider withdraws → Withdrawn

**Required Data for Exit:**
- All mandatory fields populated
- Documents classified
- Eligibility confirmed or exception documented

---

### 4. **INTAKE PROCESSING**
- **Description:** Final intake checks and preparation for clinical review
- **Entry Condition:** From Validating or Manual Review (all validations pass)
- **System Owner:** Intake System
- **Duration:** 5-15 minutes
- **SLA:** 1 hour
- **User Visible:** Yes

**What Happens:**
- Create clinical review packet
- Extract relevant clinical information
- Prepare DTR questionnaire (if applicable)
- Route to appropriate clinical reviewer
- Assign priority based on procedure and medical necessity

**Exit Criteria:**
- Clinical packet created → Clinical Review
- System error → Manual Review (escalation)

---

### 5. **CLINICAL REVIEW**
- **Description:** Clinical team member (RN/PA) reviewing medical necessity
- **Entry Condition:** From Intake Processing
- **System Owner:** Clinical Team
- **Duration:** 4-24 hours
- **SLA:** 7 calendar days from submission (CMS requirement)
- **User Visible:** Yes (status shows "Clinical Review")

**What Happens:**
- Clinical reviewer assigned
- Medical records reviewed against LCD/NCD criteria
- DTR questionnaire reviewed (if submitted)
- Medical necessity determination made
- Reviewer recommendation: Approve, Deny, or Need More Info

**Sub-States:**
- Assigned (to clinical reviewer)
- In Progress (actively reviewing)
- Waiting (provider needs to submit additional info)

**Exit Criteria:**
- Clear determination → MD Review (if required) or Letter Generation
- Need more info → Waiting (remain in Clinical Review)
- Provider non-responsive → Dismissed

**Decision Points:**
- Medical necessity met → Recommend Approval
- Medical necessity not met → Recommend Denial
- Insufficient information → Request Additional Info
- Service not covered → Dismiss (Not PA Required)

---

### 6. **MD REVIEW**
- **Description:** Physician review for final determination
- **Entry Condition:** From Clinical Review (complex cases or denials)
- **System Owner:** Medical Director
- **Duration:** 4-48 hours
- **SLA:** 7 calendar days from submission (CMS requirement)
- **User Visible:** Yes (status shows "Physician Review")

**What Happens:**
- MD reviews clinical reviewer recommendation
- MD reviews medical records
- Final determination made: Approve or Deny
- If deny, denial rationale documented per CMS requirements

**MD Review Required When:**
- Clinical reviewer recommends denial
- Complex medical case (per protocol)
- Experimental/investigational procedure
- Off-label use
- Appeal or reconsideration

**Exit Criteria:**
- Determination made → Letter Generation

**Required Documentation:**
- Final determination (Approve/Deny)
- Clinical rationale
- LCD/NCD citations
- Peer review notes (for denials)

---

### 7. **LETTER GENERATION**
- **Description:** Automated generation of determination letter
- **Entry Condition:** From Clinical Review or MD Review (determination made)
- **System Owner:** Letter Generation System
- **Duration:** 5-30 minutes
- **SLA:** 4 hours
- **User Visible:** Yes (status shows "Generating Letter")

**What Happens:**
- Select appropriate letter template
  - Approval Letter
  - Denial Letter (with appeal rights)
  - Partial Approval Letter
- Populate letter with packet details
- Include clinical rationale (for denials)
- Include appeal rights and process
- Generate PDF
- Prepare for delivery

**Letter Content Requirements (CMS):**

**For Approvals:**
- Beneficiary name and Medicare ID
- Provider name and NPI
- Approved service(s) and CPT/HCPCS codes
- Approval effective dates
- Any limitations or conditions

**For Denials:**
- Beneficiary name and Medicare ID
- Provider name and NPI
- Denied service(s) and CPT/HCPCS codes
- Clinical rationale for denial
- LCD/NCD citations
- Appeal rights and process (60 days)
- How to request reconsideration
- Contact information

**Exit Criteria:**
- Letter PDF generated → Delivery In Progress

---

### 8. **DELIVERY IN PROGRESS**
- **Description:** Letter being delivered to provider via fax/mail/portal
- **Entry Condition:** From Letter Generation
- **System Owner:** Outbound Communication System
- **Duration:** Minutes to days (depending on method)
- **SLA:** 24 hours for electronic, 7 days for mail
- **User Visible:** Yes (status shows "Delivering Determination")

**What Happens:**
- Attempt delivery via preferred method (fax, portal, mail)
- Track delivery status
- Retry failed deliveries (up to 3 attempts for fax)
- Log all delivery attempts
- Notify provider of availability

**Delivery Methods (Priority Order):**
1. Provider Portal (instant)
2. Fax (primary - 15-30 minutes)
3. Secure Email (if authorized)
4. USPS Mail (backup - 3-7 days)

**Sub-States:**
- Sending (delivery in progress)
- Retrying (after failed attempt)
- Awaiting Pickup (posted to portal)

**Exit Criteria:**
- Delivery confirmed → Closed - Delivered
- All delivery methods failed → Escalate to ops team

**Delivery Confirmation:**
- Fax: Transmission receipt
- Portal: Provider login and view
- Email: Read receipt (if available)
- Mail: Delivery tracking (certified mail)

---

### 9. **CLOSED - DELIVERED**
- **Description:** Determination letter successfully delivered to provider
- **Entry Condition:** From Delivery In Progress (delivery confirmed)
- **System Owner:** System (automatic)
- **Duration:** Terminal state (permanent)
- **SLA:** N/A
- **User Visible:** Yes (status shows "Completed - Delivered")

**What Happens:**
- Packet marked as complete
- Final timestamp recorded
- Performance metrics calculated
- Provider notified (if not already)
- Beneficiary notification sent (per CMS requirements)

**Record Retention:**
- Packet data: 10 years (CMS requirement)
- Audit trail: 10 years
- Letters: 10 years
- Appeal window: 60 days monitored

**Potential Exit:** 
- Provider requests appeal → Reopen for Appeal Process (future enhancement)

---

### 10. **CLOSED - DISMISSED**
- **Description:** Packet dismissed due to ineligibility or invalid submission
- **Entry Condition:** From Validating, Manual Review, or Clinical Review
- **System Owner:** System or Ops Team
- **Duration:** Terminal state (permanent)
- **SLA:** N/A
- **User Visible:** Yes (status shows "Dismissed" with reason)

**What Happens:**
- Packet marked as dismissed
- Dismissal reason recorded and categorized
- Provider notified with explanation
- No determination letter generated (not a denial)

**Dismissal Reasons:**

| Reason Code | Description | Entry Point | Letter Type |
|-------------|-------------|-------------|-------------|
| INELIG_MA | Beneficiary enrolled in MA | Validating | Dismissal Notice |
| INELIG_PARTB | No active Part B | Validating | Dismissal Notice |
| INVALID_PROV | Provider not valid/enrolled | Validating | Dismissal Notice |
| NOT_PA_SVC | Service does not require PA | Validating | Informational |
| INCOMPLETE | Cannot obtain required info | Manual Review | Dismissal Notice |
| DUPLICATE | Duplicate submission | Validating | Informational |
| OUT_OF_STATE | Not in NJ service area | Validating | Dismissal Notice |
| WRONG_MAC | Should go to different MAC | Validating | Dismissal Notice |

**Dismissal vs Denial:**
- **Dismissal:** Administrative rejection, not a clinical determination, no appeal rights
- **Denial:** Clinical determination that service is not medically necessary, has appeal rights

**Provider Notification:**
- Dismissal notice sent within 24 hours
- Explains reason for dismissal
- Provides corrective action (if applicable)
- Does NOT include appeal rights (not a determination)

---

### 11. **CLOSED - WITHDRAWN**
- **Description:** Provider voluntarily withdrew the request
- **Entry Condition:** From any non-closed state
- **System Owner:** Provider action
- **Duration:** Terminal state (permanent)
- **SLA:** N/A
- **User Visible:** Yes (status shows "Withdrawn by Provider")

**What Happens:**
- Provider submits withdrawal request
- Packet immediately marked withdrawn
- All pending activities stopped
- Confirmation sent to provider
- No determination made or letter generated

**Withdrawal Reasons (optional tracking):**
- Service no longer needed
- Beneficiary declined service
- Provider error in submission
- Service performed urgently without PA
- Other

**Record Keeping:**
- Maintain full audit trail
- Record withdrawal timestamp
- Record reason (if provided)
- No impact on provider performance metrics

---

## STATE TRANSITION MATRIX

### Valid State Transitions

```
FROM STATE              → TO STATE(S)                      TRIGGER
─────────────────────────────────────────────────────────────────────────
Submitted               → Validating                       Automatic
                        → Dismissed                        Validation failure

Validating              → Intake Processing                All validations pass
                        → Manual Review                    Field corrections needed
                        → Dismissed                        Ineligibility detected
                        → Withdrawn                        Provider withdrawal

Manual Review           → Intake Processing                Issues resolved
                        → Dismissed                        Cannot resolve
                        → Withdrawn                        Provider withdrawal

Intake Processing       → Clinical Review                  Packet prepared
                        → Manual Review                    System error
                        → Withdrawn                        Provider withdrawal

Clinical Review         → MD Review                        Complex case/denial
                        → Letter Generation                Simple approval
                        → Dismissed                        Not PA required
                        → Withdrawn                        Provider withdrawal

MD Review               → Letter Generation                Determination made
                        → Withdrawn                        Provider withdrawal

Letter Generation       → Delivery In Progress             Letter generated
                        → Manual Review                    Generation error

Delivery In Progress    → Closed - Delivered               Delivery confirmed
                        → Manual Review                    Delivery failed (escalate)

Closed - Delivered      → (Terminal - no exits)
Closed - Dismissed      → (Terminal - no exits)
Closed - Withdrawn      → (Terminal - no exits)

ANY STATE              → Withdrawn                        Provider can withdraw anytime
```

### Forbidden Transitions (MUST PREVENT)

```
❌ Closed states → Any other state (except appeal process - future)
❌ Delivered → Dismissed
❌ Dismissed → Delivered
❌ Any state → Submitted (no "reset" allowed)
❌ Letter Generation → Clinical Review (backwards)
❌ MD Review → Clinical Review (backwards)
❌ Delivery → Validating (backwards)
```

---

## STATE TRANSITION RULES

### Rule 1: Forward Progress Only
- States generally move forward through the pipeline
- Backwards transitions only for error correction (e.g., Letter Gen → Manual Review)
- No skipping required states (e.g., cannot go Validating → MD Review)

### Rule 2: Terminal States are Final
- Once Closed (any variant), no further transitions
- Exception: Appeal process (future enhancement)
- Must create new packet if resubmission needed

### Rule 3: Withdrawal Allowed Anytime
- Provider can withdraw from any non-closed state
- Immediate transition, no approval needed
- All pending work stops immediately

### Rule 4: Dismissal is Administrative
- Dismissal is not a clinical determination
- Can only occur before or during clinical review
- Once determination made, must be Delivered (not Dismissed)

### Rule 5: One Active State Only
- Packet is in exactly one state at any time
- State transitions are atomic (transactional)
- Sub-states (like Assigned, In Progress) are metadata, not separate states

### Rule 6: State Change Requires Authorization
- Each transition has authorized actors
- System enforces role-based access control
- Audit trail captures who triggered transition

### Rule 7: Validation Before Transition
- All business rules validated before state change
- Invalid transitions rejected with error message
- State remains unchanged if validation fails

### Rule 8: Side Effects Execute After State Change
- State change committed first
- Then notifications/letters generated
- Failure of side effect does NOT rollback state

---

## TRIGGERS AND ACTIONS

### Automatic Triggers (System)

| Trigger | From State | To State | Condition |
|---------|-----------|----------|-----------|
| Packet Received | N/A | Submitted | POST to /api/packets |
| Structure Valid | Submitted | Validating | JSON schema validates |
| All Validations Pass | Validating | Intake Processing | HETS + PECOS + Rules pass |
| Validation Fails | Validating | Manual Review | Correctable issues |
| Ineligible | Validating | Dismissed | MA enrolled or invalid provider |
| Clinical Packet Ready | Intake Processing | Clinical Review | Packet created successfully |
| Determination Made (Simple) | Clinical Review | Letter Generation | Approval, no MD needed |
| Determination Made (Complex) | Clinical Review | MD Review | Denial or complex case |
| MD Decision Made | MD Review | Letter Generation | Final determination |
| Letter Generated | Letter Generation | Delivery In Progress | PDF created |
| Delivery Confirmed | Delivery In Progress | Closed - Delivered | Receipt confirmed |

### Manual Triggers (Human Actors)

| Trigger | Actor | From State | To State | Action Required |
|---------|-------|-----------|----------|-----------------|
| Issues Resolved | Ops Team | Manual Review | Intake Processing | All fields corrected |
| Cannot Resolve | Ops Team | Manual Review | Dismissed | Document reason |
| Clinical Review Complete | RN/PA | Clinical Review | MD Review or Letter Gen | Enter determination |
| MD Review Complete | MD | MD Review | Letter Generation | Enter final decision |
| Escalate Delivery Failure | Ops Team | Delivery In Progress | Manual Review | Document failure |
| Provider Withdraws | Provider | Any non-closed | Withdrawn | Submit withdrawal request |

### Time-Based Triggers (Scheduled Jobs)

| Trigger | Frequency | Action |
|---------|-----------|--------|
| SLA Warning | Every 15 min | Flag packets approaching SLA breach |
| Auto-Dismiss Stale | Daily | Dismiss packets waiting >30 days on provider |
| Retry Failed Delivery | Every 2 hours | Retry fax delivery (max 3 attempts) |
| Performance Metrics | Daily | Calculate and store metrics |

---

## VALIDATION RULES

### Pre-Transition Validation Checklist

Before allowing state transition, system MUST validate:

#### Transition: Any → Withdrawn
```javascript
✓ Request from valid provider account
✓ Packet in non-closed state
✓ Withdrawal reason provided (optional but recommended)
```

#### Transition: Validating → Intake Processing
```javascript
✓ Beneficiary active in Part B
✓ Beneficiary NOT in Medicare Advantage
✓ Provider NPI valid and enrolled in PECOS
✓ Service line in approved list (16 services)
✓ All required documents present
✓ All mandatory fields populated
```

#### Transition: Manual Review → Intake Processing
```javascript
✓ Ops team member assigned
✓ All validation errors resolved
✓ Resolution notes documented
✓ All mandatory fields populated
✓ Manual review approval given
```

#### Transition: Clinical Review → Letter Generation
```javascript
✓ Clinical reviewer assigned
✓ Determination made (Approve/Deny)
✓ Clinical rationale documented
✓ LCD/NCD citations provided (if applicable)
✓ Does NOT require MD review (simple approval only)
```

#### Transition: Clinical Review → MD Review
```javascript
✓ Determination is DENY, OR
✓ Complex case flag set, OR
✓ Experimental/investigational procedure
✓ Clinical reviewer recommendation documented
```

#### Transition: MD Review → Letter Generation
```javascript
✓ MD assigned to case
✓ Final determination made (Approve/Deny)
✓ MD signature captured
✓ Clinical rationale complete
✓ Peer review notes (for denials)
```

#### Transition: Letter Generation → Delivery In Progress
```javascript
✓ Letter template selected
✓ PDF generated successfully
✓ All required content present
✓ CMS compliance verified
✓ Provider contact info available
```

#### Transition: Delivery In Progress → Closed - Delivered
```javascript
✓ At least one delivery method succeeded
✓ Delivery confirmation received
✓ Timestamp recorded
✓ Provider notified
```

---

## SIDE EFFECTS AND NOTIFICATIONS

### State Change Side Effects

When state changes occur, these side effects trigger automatically:

#### On Enter: Validating
```
→ Send confirmation to provider: "Request received, validating"
→ Log packet ID in provider portal
→ Start SLA timer (7-day countdown)
```

#### On Enter: Manual Review
```
→ Assign to ops team member (auto-assignment or manual)
→ Send notification to assigned ops member
→ Log assignment in audit trail
→ Increment manual review counter (performance metric)
```

#### On Enter: Clinical Review
```
→ Assign to clinical reviewer (based on specialty/workload)
→ Send notification to clinical reviewer
→ Flag in clinical dashboard
→ Send update to provider: "Under clinical review"
```

#### On Enter: MD Review
```
→ Assign to MD based on specialty
→ Send notification to MD
→ Flag as priority in MD dashboard
→ Log escalation to MD (performance metric)
```

#### On Enter: Letter Generation
```
→ Select letter template based on determination
→ Generate PDF with packet details
→ Store letter in document repository
→ Link letter to packet record
```

#### On Enter: Delivery In Progress
```
→ Attempt delivery via preferred method (fax, then mail)
→ Log delivery attempt
→ Send portal notification to provider
→ Schedule retry if fax fails (2hr, 4hr, 8hr)
```

#### On Enter: Closed - Delivered
```
→ Send final notification to provider
→ Send notification to beneficiary (CMS requirement)
→ Calculate performance metrics (turnaround time, etc.)
→ Close SLA timer
→ Archive clinical documentation
→ Update provider performance dashboard
```

#### On Enter: Closed - Dismissed
```
→ Send dismissal notice to provider with reason
→ Log dismissal reason for reporting
→ Close SLA timer
→ Update dismissal statistics
→ No performance impact on provider metrics
```

#### On Enter: Closed - Withdrawn
```
→ Send withdrawal confirmation to provider
→ Log withdrawal reason
→ Close SLA timer
→ Mark as "no performance impact"
```

---

## ERROR HANDLING

### Error Scenarios and Recovery

#### Scenario 1: Validation System Timeout
```
Current State: Validating
Error: HETS or PECOS timeout (>30 seconds)

Recovery:
1. Retry validation 3 times (exponential backoff)
2. If still fails → Manual Review
3. Log system error
4. Alert ops team
```

#### Scenario 2: Clinical Reviewer Unavailable
```
Current State: Intake Processing → Clinical Review
Error: No clinical reviewers available

Recovery:
1. Remain in Intake Processing
2. Queue for next available reviewer
3. Alert supervisor if wait >4 hours
4. Emergency escalation if wait >24 hours
```

#### Scenario 3: Letter Generation Failure
```
Current State: Letter Generation
Error: PDF generation fails

Recovery:
1. Retry generation 3 times
2. If fails → Manual Review (escalate to ops)
3. Log generation error
4. Ops team manually generates and uploads letter
5. Once uploaded → Delivery In Progress
```

#### Scenario 4: All Delivery Methods Fail
```
Current State: Delivery In Progress
Error: Fax failed 3x, mail undeliverable, no portal access

Recovery:
1. Escalate to ops team (Manual Review state)
2. Ops team contacts provider directly
3. Obtain alternate contact info
4. Retry delivery
5. Document all attempts
```

#### Scenario 5: Invalid State Transition Attempt
```
Any State
Error: Invalid transition requested

Recovery:
1. Reject transition
2. Return error to caller
3. Log invalid attempt
4. State remains unchanged
5. Alert if repeated attempts (possible attack)
```

#### Scenario 6: Data Corruption Detected
```
Any State
Error: Packet data fails integrity check

Recovery:
1. Lock packet (prevent further changes)
2. Alert tech team immediately
3. Restore from audit trail if possible
4. Manual review of packet required
5. Document incident
```

---

## CONCURRENT STATE MANAGEMENT

### Race Condition Prevention

**Problem:** Multiple actors attempt state change simultaneously

**Solution:** Database-level locking

```sql
-- Before state change, acquire row lock
BEGIN TRANSACTION;

SELECT status 
FROM packets 
WHERE packet_id = 'PKT-2025-001234' 
FOR UPDATE;

-- Verify current state is valid for transition
IF current_status IN valid_from_states THEN
    UPDATE packets 
    SET status = new_status,
        status_updated_at = NOW(),
        status_updated_by = actor_id
    WHERE packet_id = 'PKT-2025-001234';
    
    -- Log transition
    INSERT INTO status_history ...
    
    COMMIT;
ELSE
    ROLLBACK;
    RETURN error;
END IF;
```

### Multiple Simultaneous Requests

**Scenario:** Provider withdraws while clinical review completes

```
Actor 1: Provider → Request Withdrawal
Actor 2: Clinical Reviewer → Submit Determination

Resolution:
1. First request to acquire lock wins
2. Second request sees changed state
3. Second request fails with "State changed" error
4. User gets clear message: "Packet already withdrawn"
```

### Background Job Conflicts

**Scenario:** Auto-retry delivery while ops manually escalates

```
Job: Scheduled delivery retry
Actor: Ops team manually escalating

Resolution:
1. Both attempt to acquire lock
2. Ops team wins (human action priority)
3. Scheduled job sees state change
4. Scheduled job skips retry (state no longer Delivery In Progress)
```

---

## STATE AUDIT TRAIL

### Required Audit Data

Every state transition MUST log:

```javascript
{
  "audit_id": "AUD-2025-123456",
  "packet_id": "PKT-2025-001234",
  "from_state": "Clinical Review",
  "to_state": "MD Review",
  "transitioned_at": "2025-12-07T14:23:45.123Z",
  "triggered_by": "system" | "user_id",
  "trigger_type": "automatic" | "manual",
  "actor_name": "Jane Smith, RN",
  "actor_role": "clinical_reviewer",
  "reason": "Denial requires MD review per protocol",
  "metadata": {
    "determination": "deny",
    "clinical_rationale": "Medical necessity not met per LCD",
    "lcd_citation": "L34567"
  },
  "ip_address": "10.0.1.45",
  "user_agent": "Mozilla/5.0...",
  "validation_results": {
    "all_checks_passed": true
  }
}
```

### Audit Trail Queries

System must support these audit queries:

```sql
-- 1. Get complete history for a packet
SELECT * FROM status_history 
WHERE packet_id = 'PKT-2025-001234' 
ORDER BY transitioned_at;

-- 2. Find packets changed by specific user
SELECT * FROM status_history 
WHERE triggered_by = 'user_12345' 
AND transitioned_at > NOW() - INTERVAL '7 days';

-- 3. Find all dismissals in date range
SELECT * FROM status_history 
WHERE to_state = 'Closed - Dismissed'
AND transitioned_at BETWEEN '2025-01-01' AND '2025-01-31';

-- 4. Performance: Average time in each state
SELECT 
  to_state,
  AVG(EXTRACT(EPOCH FROM (next_transition - transitioned_at))) as avg_seconds
FROM status_history 
WHERE transitioned_at > NOW() - INTERVAL '30 days'
GROUP BY to_state;

-- 5. Find state changes outside business hours (audit flag)
SELECT * FROM status_history 
WHERE trigger_type = 'manual'
AND (
  EXTRACT(HOUR FROM transitioned_at) < 7 
  OR EXTRACT(HOUR FROM transitioned_at) > 19
);
```

---

## DATABASE SCHEMA

### Core Tables

#### Table: packets
```sql
CREATE TABLE packets (
    -- Primary Key
    packet_id VARCHAR(20) PRIMARY KEY,  -- PKT-YYYY-NNNNNN
    
    -- Current State (CRITICAL)
    status VARCHAR(50) NOT NULL,
    status_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status_updated_by VARCHAR(50),
    
    -- Submission Info
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    submitted_via VARCHAR(20),  -- 'esmd', 'portal', 'fax'
    
    -- Provider Info
    provider_npi VARCHAR(10) NOT NULL,
    provider_name VARCHAR(200),
    provider_tin VARCHAR(10),
    provider_contact_fax VARCHAR(20),
    provider_contact_email VARCHAR(100),
    
    -- Beneficiary Info
    beneficiary_id VARCHAR(20) NOT NULL,  -- Medicare ID (MBI)
    beneficiary_name VARCHAR(200),
    beneficiary_dob DATE,
    
    -- Service Info
    service_line VARCHAR(50),  -- Which of 16 services
    procedure_codes TEXT,  -- CPT/HCPCS codes (JSON array)
    diagnosis_codes TEXT,  -- ICD-10 codes (JSON array)
    requested_service_date DATE,
    
    -- Clinical Data
    medical_necessity_summary TEXT,
    clinical_notes TEXT,
    
    -- Assignment
    assigned_to VARCHAR(50),  -- Current owner (ops/clinical/md)
    assigned_at TIMESTAMP,
    assignment_type VARCHAR(20),  -- 'manual_review', 'clinical', 'md'
    
    -- Determination
    determination VARCHAR(20),  -- 'approved', 'denied', null
    determination_made_by VARCHAR(50),
    determination_made_at TIMESTAMP,
    determination_rationale TEXT,
    lcd_ncd_citations TEXT,
    
    -- Letter & Delivery
    letter_id VARCHAR(50),
    letter_generated_at TIMESTAMP,
    delivery_method VARCHAR(20),  -- 'fax', 'portal', 'mail'
    delivery_confirmed_at TIMESTAMP,
    delivery_attempts INT DEFAULT 0,
    
    -- Dismissal/Withdrawal
    dismissal_reason VARCHAR(100),
    withdrawal_reason TEXT,
    closed_at TIMESTAMP,
    
    -- SLA Tracking
    sla_due_date TIMESTAMP,  -- 7 days from submission
    sla_breached BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    version INT DEFAULT 1,  -- For optimistic locking
    
    -- Indexes for performance
    INDEX idx_status (status),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_provider_npi (provider_npi),
    INDEX idx_beneficiary_id (beneficiary_id),
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_sla_due_date (sla_due_date),
    INDEX idx_status_updated_at (status_updated_at)
);
```

#### Table: status_history (Audit Trail)
```sql
CREATE TABLE status_history (
    -- Primary Key
    history_id SERIAL PRIMARY KEY,
    
    -- Link to packet
    packet_id VARCHAR(20) NOT NULL,
    
    -- State Transition
    from_state VARCHAR(50),
    to_state VARCHAR(50) NOT NULL,
    transitioned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Actor Info
    triggered_by VARCHAR(50),  -- user_id or 'system'
    trigger_type VARCHAR(20),  -- 'automatic', 'manual'
    actor_name VARCHAR(200),
    actor_role VARCHAR(50),
    
    -- Context
    reason TEXT,
    metadata JSONB,  -- Flexible additional data
    
    -- Audit Trail
    ip_address INET,
    user_agent TEXT,
    
    -- Performance
    duration_in_from_state INTERVAL,  -- How long was in previous state
    
    -- Indexes
    INDEX idx_packet_id (packet_id),
    INDEX idx_transitioned_at (transitioned_at),
    INDEX idx_to_state (to_state),
    INDEX idx_triggered_by (triggered_by),
    
    FOREIGN KEY (packet_id) REFERENCES packets(packet_id)
);
```

#### Table: state_transitions (Configuration)
```sql
CREATE TABLE state_transitions (
    transition_id SERIAL PRIMARY KEY,
    
    -- Transition Definition
    from_state VARCHAR(50),  -- NULL means "any state"
    to_state VARCHAR(50) NOT NULL,
    
    -- Authorization
    allowed_roles TEXT[],  -- Array of roles that can trigger
    requires_manual_approval BOOLEAN DEFAULT FALSE,
    
    -- Validation
    validation_rules JSONB,  -- Rules that must pass
    
    -- Side Effects
    side_effects JSONB,  -- Notifications, etc.
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(from_state, to_state)
);
```

#### Table: validation_results
```sql
CREATE TABLE validation_results (
    result_id SERIAL PRIMARY KEY,
    
    packet_id VARCHAR(20) NOT NULL,
    validation_type VARCHAR(50),  -- 'eligibility', 'provider', 'rules'
    
    validation_passed BOOLEAN,
    validation_message TEXT,
    validation_details JSONB,
    
    validated_at TIMESTAMP DEFAULT NOW(),
    validated_by VARCHAR(50),  -- System or user
    
    INDEX idx_packet_id (packet_id),
    INDEX idx_validation_type (validation_type),
    
    FOREIGN KEY (packet_id) REFERENCES packets(packet_id)
);
```

#### Table: notifications
```sql
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    
    packet_id VARCHAR(20) NOT NULL,
    
    notification_type VARCHAR(50),  -- 'provider', 'beneficiary', 'internal'
    recipient VARCHAR(200),
    recipient_type VARCHAR(20),  -- 'provider', 'beneficiary', 'user'
    
    method VARCHAR(20),  -- 'email', 'fax', 'portal', 'sms'
    status VARCHAR(20),  -- 'pending', 'sent', 'failed', 'delivered'
    
    subject VARCHAR(500),
    body TEXT,
    
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    attempts INT DEFAULT 0,
    last_error TEXT,
    
    INDEX idx_packet_id (packet_id),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    
    FOREIGN KEY (packet_id) REFERENCES packets(packet_id)
);
```

---

## API SPECIFICATIONS

### State Transition Endpoint

#### POST /api/packets/{packet_id}/transition

**Purpose:** Trigger state transition for a packet

**Request:**
```json
{
  "to_state": "Clinical Review",
  "reason": "All validations passed, ready for clinical review",
  "triggered_by": "user_12345",
  "metadata": {
    "assignment_method": "automatic",
    "assigned_to": "clinician_456"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "packet_id": "PKT-2025-001234",
  "from_state": "Intake Processing",
  "to_state": "Clinical Review",
  "transitioned_at": "2025-12-07T14:23:45.123Z",
  "audit_id": "AUD-2025-123456"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error_code": "INVALID_TRANSITION",
  "error_message": "Cannot transition from 'Closed - Delivered' to 'Clinical Review'",
  "current_state": "Closed - Delivered",
  "requested_state": "Clinical Review",
  "valid_transitions": []
}
```

**Error Codes:**
- `INVALID_TRANSITION` - Requested transition not allowed
- `VALIDATION_FAILED` - Pre-transition validation failed
- `UNAUTHORIZED` - User not authorized for this transition
- `PACKET_LOCKED` - Packet currently locked by another transaction
- `PACKET_NOT_FOUND` - Packet ID does not exist

---

### Get Current State

#### GET /api/packets/{packet_id}/state

**Response:**
```json
{
  "packet_id": "PKT-2025-001234",
  "current_state": "Clinical Review",
  "entered_state_at": "2025-12-07T14:23:45.123Z",
  "time_in_state_hours": 2.5,
  "assigned_to": "clinician_456",
  "assigned_to_name": "Jane Smith, RN",
  "sla_due_at": "2025-12-14T09:00:00.000Z",
  "sla_remaining_hours": 156.5,
  "valid_transitions": [
    {
      "to_state": "MD Review",
      "requires_manual": true,
      "allowed_roles": ["clinical_reviewer"]
    },
    {
      "to_state": "Letter Generation",
      "requires_manual": true,
      "allowed_roles": ["clinical_reviewer"]
    },
    {
      "to_state": "Withdrawn",
      "requires_manual": true,
      "allowed_roles": ["provider", "admin"]
    }
  ]
}
```

---

### Get State History

#### GET /api/packets/{packet_id}/history

**Response:**
```json
{
  "packet_id": "PKT-2025-001234",
  "total_transitions": 5,
  "current_state": "Clinical Review",
  "history": [
    {
      "from_state": null,
      "to_state": "Submitted",
      "transitioned_at": "2025-12-07T09:00:00.000Z",
      "triggered_by": "system",
      "actor_name": "System",
      "duration_in_state": null
    },
    {
      "from_state": "Submitted",
      "to_state": "Validating",
      "transitioned_at": "2025-12-07T09:00:01.234Z",
      "triggered_by": "system",
      "actor_name": "System",
      "duration_in_state": "00:00:01"
    },
    {
      "from_state": "Validating",
      "to_state": "Manual Review",
      "transitioned_at": "2025-12-07T09:03:15.456Z",
      "triggered_by": "system",
      "actor_name": "System",
      "reason": "OCR confidence <70%, manual verification needed",
      "duration_in_state": "00:03:14"
    },
    {
      "from_state": "Manual Review",
      "to_state": "Intake Processing",
      "transitioned_at": "2025-12-07T11:30:22.789Z",
      "triggered_by": "user_789",
      "actor_name": "John Doe (Ops)",
      "reason": "All fields corrected and verified",
      "duration_in_state": "02:27:07"
    },
    {
      "from_state": "Intake Processing",
      "to_state": "Clinical Review",
      "transitioned_at": "2025-12-07T14:23:45.123Z",
      "triggered_by": "system",
      "actor_name": "System",
      "reason": "Clinical packet prepared, assigned to clinician_456",
      "duration_in_state": "02:53:22"
    }
  ],
  "total_time_elapsed": "05:23:45",
  "sla_status": "on_track"
}
```

---

### Validate Transition (Dry Run)

#### POST /api/packets/{packet_id}/validate-transition

**Purpose:** Check if transition would be valid WITHOUT executing it

**Request:**
```json
{
  "to_state": "MD Review",
  "triggered_by": "user_12345"
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "from_state": "Clinical Review",
  "to_state": "MD Review",
  "warnings": [],
  "required_data": [
    "Clinical determination must be 'deny' or complex flag must be set"
  ]
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "from_state": "Closed - Delivered",
  "to_state": "MD Review",
  "errors": [
    "Cannot transition from terminal state",
    "Packet already has final determination"
  ],
  "valid_transitions_from_current_state": []
}
```

---

### Bulk State Check

#### POST /api/packets/bulk-state-check

**Purpose:** Check state of multiple packets efficiently

**Request:**
```json
{
  "packet_ids": [
    "PKT-2025-001234",
    "PKT-2025-001235",
    "PKT-2025-001236"
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "packet_id": "PKT-2025-001234",
      "current_state": "Clinical Review",
      "time_in_state_hours": 2.5,
      "sla_status": "on_track"
    },
    {
      "packet_id": "PKT-2025-001235",
      "current_state": "Validating",
      "time_in_state_hours": 0.1,
      "sla_status": "on_track"
    },
    {
      "packet_id": "PKT-2025-001236",
      "current_state": "Manual Review",
      "time_in_state_hours": 18.5,
      "sla_status": "warning"
    }
  ]
}
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Core State Machine (Week 1-2)
- [ ] Create database tables (packets, status_history, state_transitions)
- [ ] Implement state transition function with validation
- [ ] Implement row-level locking for concurrency
- [ ] Create audit trail logging
- [ ] Build state transition API endpoint
- [ ] Write unit tests for all valid transitions
- [ ] Write unit tests for all invalid transitions
- [ ] Test concurrent transition attempts

### Phase 2: Business Rules (Week 3-4)
- [ ] Implement all validation rules for each transition
- [ ] Configure state_transitions table with allowed transitions
- [ ] Implement role-based authorization
- [ ] Add pre-transition validation checks
- [ ] Test all validation rules
- [ ] Document validation failures

### Phase 3: Side Effects (Week 5-6)
- [ ] Implement notification system
- [ ] Configure notifications for each state entry
- [ ] Implement letter generation triggers
- [ ] Test delivery workflow
- [ ] Test notification delivery
- [ ] Add retry logic for failed notifications

### Phase 4: Error Handling (Week 7-8)
- [ ] Implement error recovery for each scenario
- [ ] Add automatic retries for transient failures
- [ ] Implement escalation logic
- [ ] Test all error scenarios
- [ ] Document error handling procedures
- [ ] Create ops runbook for manual interventions

### Phase 5: Monitoring & Reporting (Week 9-10)
- [ ] Build state transition dashboard
- [ ] Create SLA monitoring alerts
- [ ] Implement performance metrics calculation
- [ ] Build audit trail query interface
- [ ] Create reporting endpoints
- [ ] Test all monitoring and alerts

### Phase 6: Integration Testing (Week 11-12)
- [ ] End-to-end test: Submitted → Delivered
- [ ] End-to-end test: Submitted → Dismissed
- [ ] End-to-end test: Provider withdrawal at each stage
- [ ] Load testing: 100 concurrent transitions
- [ ] Stress testing: System failure scenarios
- [ ] Security testing: Unauthorized transition attempts

---

## CRITICAL SUCCESS FACTORS

### Must-Have Features for Launch:
1. ✅ All 11 states defined and implemented
2. ✅ All valid transitions working correctly
3. ✅ All invalid transitions blocked
4. ✅ Complete audit trail for compliance
5. ✅ Row-level locking for data integrity
6. ✅ Role-based access control
7. ✅ SLA tracking and alerts
8. ✅ Provider notifications working
9. ✅ Error recovery mechanisms
10. ✅ Performance metrics tracking

### Can-Wait-for-V2:
- Advanced analytics and reporting
- Predictive SLA breach warnings
- Automated workload balancing
- Appeal/reconsideration workflow
- Provider performance dashboards
- Machine learning for auto-assignment

---

**DOCUMENT STATUS: READY FOR DEVELOPMENT**

This specification provides the complete state machine design for WISeR implementation.
All transitions, validations, and business rules are documented.
Development team can proceed with implementation.

---
