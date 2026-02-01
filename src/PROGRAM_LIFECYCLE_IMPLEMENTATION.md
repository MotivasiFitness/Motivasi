# Program Lifecycle Implementation Guide

## Overview
This document outlines the complete program lifecycle implementation for trainers and clients, including draft creation, publishing, assignment, and client visibility.

## Program Status Flow

### Status Values (from `/src/lib/program-status.ts`)
- **DRAFT**: Program created but not yet published. Not visible to clients.
- **TEMPLATE**: Program published without client assignment. Can be reused for multiple clients.
- **ASSIGNED**: Program published and assigned to a specific client. Visible to that client.
- **ACTIVE**: Program is currently active (same as ASSIGNED in current implementation).
- **COMPLETED**: Program has been completed by the client.
- **PAUSED**: Program is temporarily paused.
- **ARCHIVED**: Program has been archived.

## Trainer Features

### 1. Creating Programs

**Location**: `/trainer/programs` → "Create with AI" button

**Process**:
1. Trainer fills in program details:
   - Program Name (required)
   - Description (optional, can be AI-generated)
   - Duration (required)
   - Focus Area (required)
   - Client Selection (optional)

2. **Save Options**:
   - **Save as Draft**: Program is created with status `DRAFT`
     - Not visible to any client
     - Can be edited later
     - Can be published when ready
   
   - **Publish Now**: Program is created with status based on client selection
     - If client selected: status = `ASSIGNED` (visible to that client)
     - If no client selected: status = `TEMPLATE` (reusable template)

### 2. Managing Programs

**Location**: `/trainer/programs-created`

**Program Cards Display**:
- Status badge showing current state
- Program name, description, duration, focus area
- Client assignment (if applicable)
- Action buttons based on status:

#### Draft Programs
- **Publish Button**: Opens assignment modal to select client or publish as template
- **Edit Button**: Edit program details
- **Delete Button**: Remove program

#### Assigned Programs
- **Edit Button**: Edit program details (exercises, etc.)
- **Delete Button**: Remove program

#### Template Programs
- **Assign Button**: Assign template to a specific client
- **Edit Button**: Edit template details
- **Delete Button**: Remove template

### 3. Publishing Draft Programs

**Process**:
1. Trainer clicks "Publish" on a draft program
2. Assignment modal opens with two options:
   - Select a client to assign the program
   - Leave blank to publish as template
3. Upon confirmation:
   - Program status changes to `ASSIGNED` or `TEMPLATE`
   - If assigned to client:
     - Program becomes visible in client's portal
     - Placeholder exercise entry created in `clientprograms`
     - Client can see "Program created - exercises to be added"

### 4. Editing Programs

**Location**: Click "Edit" on any program card

**Capabilities**:
- Edit program name, description, duration, focus area
- Add/modify exercises
- Update exercise details (sets, reps, weight, tempo, rest time)
- Add exercise videos and notes
- Modify coaching cues and progressions

**Important**: Changes to assigned programs are immediately reflected in the client portal.

## Client Features

### 1. Viewing Assigned Programs

**Location**: `/portal/program`

**Display**:
- List of all assigned programs
- Program status (Active, Completed, etc.)
- Program overview and details
- Exercise list with sets, reps, and instructions

**Visibility Rules**:
- Clients can ONLY see programs with status `ASSIGNED` or `ACTIVE`
- Clients CANNOT see:
  - Draft programs
  - Template programs
  - Other clients' programs

### 2. Starting a Program

**Process**:
1. Client views assigned program
2. Clicks "Start Program" or "Begin Workout"
3. Program transitions to active state
4. Client can begin logging exercises

### 3. Tracking Progress

**Features**:
- Log completed exercises
- Track sets and reps
- Record weight used
- Submit workout reflections
- View weekly summaries
- Track overall program completion

### 4. Program Completion

**Process**:
1. Client completes all weeks in program
2. Program status changes to `COMPLETED`
3. Program moves to "Completed Programs" section
4. Client can view completion summary and achievements

## Database Collections

### Programs Collection
```typescript
{
  _id: string;
  programName: string;
  description: string;
  duration: string;
  focusArea: string;
  trainerId: string;
  clientId?: string;
  status: 'draft' | 'template' | 'assigned' | 'active' | 'completed' | 'paused' | 'archived';
}
```

### ProgramDrafts Collection
```typescript
{
  _id: string;
  programId: string;
  trainerId: string;
  clientId?: string;
  programJson: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ProgramAssignments Collection
```typescript
{
  _id: string;
  programId: string;
  clientId: string;
  trainerId: string;
  assignedAt: Date;
  status: 'active' | 'completed' | 'paused';
}
```

### ClientPrograms Collection
```typescript
{
  _id: string;
  programTitle: string;
  sessionTitle: string;
  workoutDay: string;
  weekNumber: number;
  exerciseName: string;
  sets: number;
  reps: number;
  weightOrResistance: string;
  tempo: string;
  restTimeSeconds: number;
  exerciseNotes: string;
  exerciseOrder: number;
  exerciseVideoUrl: string;
}
```

## Key Implementation Details

### 1. Draft to Published Flow

**CreateProgramPage.tsx**:
- New state: `saveAsDraft` (boolean)
- Radio buttons for "Save as Draft" vs "Publish Now"
- Form submission logic:
  - If `saveAsDraft = true`: status = `DRAFT`
  - If `saveAsDraft = false` and client selected: status = `ASSIGNED`
  - If `saveAsDraft = false` and no client: status = `TEMPLATE`

### 2. Publishing Modal

**ProgramAssignmentModal.tsx**:
- Enhanced to handle both "Assign" and "Publish & Assign"
- Accepts `programStatus` prop to determine modal title
- On assignment:
  - Creates ProgramAssignment record
  - Updates program status to `ASSIGNED`
  - Creates placeholder in clientprograms

### 3. Program Cards

**ProgramsCreatedPage.tsx**:
- Status-based button rendering:
  - Draft: "Publish" + "Edit" + "Delete"
  - Assigned: "Edit" + "Delete"
  - Template: "Assign" + "Edit" + "Delete"
- Filter tabs: All, Drafts, Assigned, Templates
- Statistics summary showing counts by status

### 4. Client Visibility

**MyProgramPage.tsx**:
- Uses `getClientWorkouts()` for access-controlled fetching
- Only shows programs with status `ASSIGNED` or `ACTIVE`
- Filters by current week and completion status
- Prevents clients from seeing other clients' programs

## Security Considerations

1. **Access Control**: Programs are filtered by trainerId on trainer dashboard
2. **Client Privacy**: Clients only see their assigned programs
3. **Status Validation**: All status values normalized to lowercase
4. **Protected Service**: Uses ProtectedDataService for sensitive operations

## Testing Checklist

- [ ] Trainer can create draft program
- [ ] Draft program not visible to client
- [ ] Trainer can publish draft to template
- [ ] Trainer can publish draft to client
- [ ] Client sees assigned program immediately
- [ ] Client cannot see draft programs
- [ ] Client cannot see other clients' programs
- [ ] Trainer can edit assigned program
- [ ] Changes to assigned program visible to client
- [ ] Program status badges display correctly
- [ ] Filter tabs work correctly
- [ ] Statistics summary accurate

## Future Enhancements

1. Bulk program assignment
2. Program templates library
3. Program cloning
4. Advanced scheduling
5. Program versioning
6. A/B testing programs
7. Program analytics and insights
