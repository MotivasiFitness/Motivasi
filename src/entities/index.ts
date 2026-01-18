/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: ParqSubmissions
 * Interface for ParqSubmissions
 */
export interface ParqSubmissions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  clientName?: string;
  /** @wixFieldType date */
  dateOfBirth?: Date | string;
  /** @wixFieldType boolean */
  hasHeartCondition?: boolean;
  /** @wixFieldType boolean */
  currentlyTakingMedication?: boolean;
  /** @wixFieldType text */
  firstName?: string;
  /** @wixFieldType text */
  lastName?: string;
  /** @wixFieldType email */
  email?: string;
}


/**
 * Collection ID: blogposts
 * Interface for BlogPosts
 */
export interface BlogPosts {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  slug?: string;
  /** @wixFieldType date */
  publishDate?: Date | string;
  /** @wixFieldType text */
  author?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  featuredImage?: string;
  /** @wixFieldType text */
  excerpt?: string;
  /** @wixFieldType text */
  content?: string;
}


/**
 * Collection ID: clientassignedworkouts
 * Interface for ClientAssignedWorkouts
 */
export interface ClientAssignedWorkouts {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  modification1Description?: string;
  /** @wixFieldType text */
  modification3Description?: string;
  /** @wixFieldType text */
  modification3Title?: string;
  /** @wixFieldType text */
  modification2Description?: string;
  /** @wixFieldType text */
  modification2Title?: string;
  /** @wixFieldType text */
  modification1Title?: string;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType datetime */
  reflectionSubmittedAt?: Date | string;
  /** @wixFieldType text */
  clientReflectionNotes?: string;
  /** @wixFieldType text */
  difficultyRating?: string;
  /** @wixFieldType text */
  trainerCommentBy?: string;
  /** @wixFieldType datetime */
  trainerCommentDate?: Date | string;
  /** @wixFieldType text */
  trainerComment?: string;
  /** @wixFieldType number */
  weekNumber?: number;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType date */
  weekStartDate?: Date | string;
  /** @wixFieldType number */
  workoutSlot?: number;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  exerciseName?: string;
  /** @wixFieldType number */
  sets?: number;
  /** @wixFieldType number */
  reps?: number;
  /** @wixFieldType text */
  weightOrResistance?: string;
  /** @wixFieldType text */
  tempo?: string;
  /** @wixFieldType number */
  restTimeSeconds?: number;
  /** @wixFieldType text */
  exerciseNotes?: string;
  /** @wixFieldType url */
  exerciseVideoUrl?: string;
}


/**
 * Collection ID: clientbookings
 * Interface for ClientBookings
 */
export interface ClientBookings {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  clientName?: string;
  /** @wixFieldType text */
  serviceType?: string;
  /** @wixFieldType date */
  appointmentDate?: Date | string;
  /** @wixFieldType time */
  appointmentTime?: any;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType url */
  videoCallLink?: string;
  /** @wixFieldType text */
  trainerNotes?: string;
}


/**
 * Collection ID: clientmessages
 * Interface for ClientMessages
 */
export interface ClientMessages {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  conversationId?: string;
  /** @wixFieldType text */
  senderIdentifier?: string;
  /** @wixFieldType text */
  recipientIdentifier?: string;
  /** @wixFieldType text */
  messageContent?: string;
  /** @wixFieldType datetime */
  sentAt?: Date | string;
  /** @wixFieldType boolean */
  isRead?: boolean;
}


/**
 * Collection ID: clientprofiles
 * Interface for ClientProfiles
 */
export interface ClientProfiles {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  trainingExperience?: string;
  /** @wixFieldType text */
  fitnessGoalsCategory?: string;
  /** @wixFieldType date */
  dateOfBirth?: Date | string;
  /** @wixFieldType text */
  memberId?: string;
  /** @wixFieldType text */
  firstName?: string;
  /** @wixFieldType text */
  lastName?: string;
  /** @wixFieldType text */
  phoneNumber?: string;
  /** @wixFieldType text */
  emergencyContact?: string;
  /** @wixFieldType text */
  fitnessGoals?: string;
  /** @wixFieldType text */
  medicalNotes?: string;
}


/**
 * Collection ID: clientprograms
 * Interface for ClientPrograms
 */
export interface ClientPrograms {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  modification1Description?: string;
  /** @wixFieldType text */
  modification3Description?: string;
  /** @wixFieldType text */
  modification3Title?: string;
  /** @wixFieldType text */
  modification2Description?: string;
  /** @wixFieldType text */
  modification2Title?: string;
  /** @wixFieldType text */
  modification1Title?: string;
  /** @wixFieldType text */
  programTitle?: string;
  /** @wixFieldType number */
  weekNumber?: number;
  /** @wixFieldType text */
  sessionTitle?: string;
  /** @wixFieldType text */
  workoutDay?: string;
  /** @wixFieldType text */
  exerciseName?: string;
  /** @wixFieldType number */
  sets?: number;
  /** @wixFieldType number */
  reps?: number;
  /** @wixFieldType text */
  weightOrResistance?: string;
  /** @wixFieldType text */
  tempo?: string;
  /** @wixFieldType number */
  restTimeSeconds?: number;
  /** @wixFieldType text */
  exerciseNotes?: string;
  /** @wixFieldType number */
  exerciseOrder?: number;
  /** @wixFieldType url */
  exerciseVideoUrl?: string;
}


/**
 * Collection ID: clienttestimonials
 * Interface for ClientTestimonials
 */
export interface ClientTestimonials {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  clientName?: string;
  /** @wixFieldType text */
  testimonialText?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  transformationImage?: string;
  /** @wixFieldType text */
  clientAgeRange?: string;
  /** @wixFieldType text */
  keyAchievement?: string;
  /** @wixFieldType boolean */
  featuredOnHomepage?: boolean;
}


/**
 * Collection ID: contactformsubmissions
 * Interface for ContactFormSubmissions
 */
export interface ContactFormSubmissions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  fullName?: string;
  /** @wixFieldType text */
  email?: string;
  /** @wixFieldType text */
  message?: string;
  /** @wixFieldType boolean */
  healthDataConsent?: boolean;
  /** @wixFieldType boolean */
  marketingConsent?: boolean;
  /** @wixFieldType datetime */
  submittedAt?: Date | string;
  /** @wixFieldType text */
  source?: string;
}


/**
 * Collection ID: exercisemodificationrequests
 * Interface for ExerciseModificationRequests
 */
export interface ExerciseModificationRequests {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType text */
  exerciseName?: string;
  /** @wixFieldType text */
  workoutId?: string;
  /** @wixFieldType number */
  weekNumber?: number;
  /** @wixFieldType text */
  reason?: string;
  /** @wixFieldType text */
  notes?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType datetime */
  requestedAt?: Date | string;
  /** @wixFieldType datetime */
  reviewedAt?: Date | string;
  /** @wixFieldType datetime */
  resolvedAt?: Date | string;
  /** @wixFieldType text */
  trainerResponse?: string;
}


/**
 * Collection ID: memberroles
 * Interface for MemberRoles
 */
export interface MemberRoles {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  memberId?: string;
  /** @wixFieldType text */
  role?: string;
  /** @wixFieldType datetime */
  assignmentDate?: Date | string;
  /** @wixFieldType text */
  status?: string;
}


/**
 * Collection ID: nutritionguidance
 * Interface for NutritionGuidance
 */
export interface NutritionGuidance {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  guidanceTitle?: string;
  /** @wixFieldType text */
  overview?: string;
  /** @wixFieldType text */
  mealPlanDetails?: string;
  /** @wixFieldType text */
  dietaryNotes?: string;
  /** @wixFieldType date */
  dateIssued?: Date | string;
  /** @wixFieldType url */
  supportingDocument?: string;
}


/**
 * Collection ID: privatevideolibrary
 * Interface for PrivateVideoLibrary
 */
export interface PrivateVideoLibrary {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType boolean */
  isPublic?: boolean;
  /** @wixFieldType text */
  videoTitle?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType url */
  videoUrl?: string;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  accessTags?: string;
}


/**
 * Collection ID: programassignments
 * Interface for ProgramAssignments
 */
export interface ProgramAssignments {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  programId?: string;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType datetime */
  assignedAt?: Date | string;
  /** @wixFieldType text */
  status?: string;
}


/**
 * Collection ID: programcycles
 * Interface for ProgramCycles
 */
export interface ProgramCycles {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  cycleNumber?: number;
  /** @wixFieldType date */
  cycleStartDate?: Date | string;
  /** @wixFieldType datetime */
  cycleCompletedAt?: Date | string;
  /** @wixFieldType number */
  currentWeek?: number;
  /** @wixFieldType number */
  weeksCompleted?: number;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  programTitle?: string;
}


/**
 * Collection ID: programdrafts
 * Interface for ProgramDrafts
 */
export interface ProgramDrafts {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  programId?: string;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType text */
  programJson?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType datetime */
  createdAt?: Date | string;
  /** @wixFieldType datetime */
  updatedAt?: Date | string;
}


/**
 * Collection ID: programs
 * Interface for FitnessPrograms
 */
export interface FitnessPrograms {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  programName?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  duration?: string;
  /** @wixFieldType text */
  focusArea?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType text */
  clientId?: string;
}


/**
 * Collection ID: progresscheckins
 * Interface for ProgressCheckins
 */
export interface ProgressCheckins {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType datetime */
  checkinDate?: Date | string;
  /** @wixFieldType text */
  clientNotes?: string;
  /** @wixFieldType number */
  currentWeight?: number;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  progressPhotoFront?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  progressPhotoSide?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  progressPhotoBack?: string;
  /** @wixFieldType text */
  bodyMeasurements?: string;
  /** @wixFieldType number */
  energyLevel?: number;
}


/**
 * Collection ID: trainerclientassignments
 * Interface for TrainerClientAssignments
 */
export interface TrainerClientAssignments {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType date */
  assignmentDate?: Date | string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  notes?: string;
}


/**
 * Collection ID: trainerclientmessages
 * Interface for TrainerClientMessages
 */
export interface TrainerClientMessages {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  conversationId?: string;
  /** @wixFieldType text */
  senderId?: string;
  /** @wixFieldType text */
  recipientId?: string;
  /** @wixFieldType text */
  content?: string;
  /** @wixFieldType datetime */
  sentAt?: Date | string;
  /** @wixFieldType boolean */
  isRead?: boolean;
}


/**
 * Collection ID: trainerclientnotes
 * Interface for TrainerClientNotes
 */
export interface TrainerClientNotes {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType text */
  notes?: string;
  /** @wixFieldType text */
  flags?: string;
  /** @wixFieldType datetime */
  updatedAt?: Date | string;
}


/**
 * Collection ID: trainernotificationpreferences
 * Interface for TrainerNotificationPreferences
 */
export interface TrainerNotificationPreferences {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType boolean */
  workoutCompletedEnabled?: boolean;
  /** @wixFieldType boolean */
  weekCompletedEnabled?: boolean;
  /** @wixFieldType boolean */
  reflectionSubmittedEnabled?: boolean;
  /** @wixFieldType datetime */
  lastUpdatedDate?: Date | string;
}


/**
 * Collection ID: trainernotifications
 * Interface for TrainerNotifications
 */
export interface TrainerNotifications {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType text */
  notificationType?: string;
  /** @wixFieldType text */
  message?: string;
  /** @wixFieldType url */
  linkUrl?: string;
  /** @wixFieldType boolean */
  isRead?: boolean;
  /** @wixFieldType boolean */
  isDismissed?: boolean;
  /** @wixFieldType datetime */
  createdAt?: Date | string;
  /** @wixFieldType text */
  relatedWorkoutId?: string;
  /** @wixFieldType number */
  relatedWeekNumber?: number;
}


/**
 * Collection ID: trainerprofiles
 * Interface for TrainerProfiles
 */
export interface TrainerProfiles {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  profilePhoto?: string;
  /** @wixFieldType text */
  displayName?: string;
  /** @wixFieldType text */
  bio?: string;
  /** @wixFieldType text */
  specialisms?: string;
  /** @wixFieldType text */
  certifications?: string;
  /** @wixFieldType text */
  timeZone?: string;
  /** @wixFieldType text */
  contactEmail?: string;
  /** @wixFieldType text */
  memberId?: string;
}


/**
 * Collection ID: trainerqualifications
 * Interface for TrainerQualifications
 */
export interface TrainerQualifications {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  qualificationName?: string;
  /** @wixFieldType text */
  issuingBody?: string;
  /** @wixFieldType date */
  dateObtained?: Date | string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  certificateImage?: string;
  /** @wixFieldType text */
  relevance?: string;
}


/**
 * Collection ID: weeklycheckins
 * Interface for WeeklyCheckins
 */
export interface WeeklyCheckins {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType text */
  programCycleId?: string;
  /** @wixFieldType number */
  weekNumber?: number;
  /** @wixFieldType date */
  weekStartDate?: Date | string;
  /** @wixFieldType text */
  difficultyRating?: string;
  /** @wixFieldType text */
  energyRating?: string;
  /** @wixFieldType text */
  sorenessRating?: string;
  /** @wixFieldType text */
  sorenessNotes?: string;
  /** @wixFieldType text */
  clientNotes?: string;
  /** @wixFieldType datetime */
  createdAt?: Date | string;
}


/**
 * Collection ID: weeklycoachesnotes
 * Interface for WeeklyCoachesNotes
 */
export interface WeeklyCoachesNotes {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType date */
  weekStartDate?: Date | string;
  /** @wixFieldType text */
  noteContent?: string;
  /** @wixFieldType datetime */
  lastUpdated?: Date | string;
  /** @wixFieldType boolean */
  isPublished?: boolean;
}


/**
 * Collection ID: weeklysummaries
 * Interface for WeeklySummaries
 */
export interface WeeklySummaries {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  clientId?: string;
  /** @wixFieldType text */
  trainerId?: string;
  /** @wixFieldType number */
  weekNumber?: number;
  /** @wixFieldType date */
  startDate?: Date | string;
  /** @wixFieldType text */
  programTitle?: string;
  /** @wixFieldType number */
  workoutsAssigned?: number;
  /** @wixFieldType number */
  workoutsCompleted?: number;
  /** @wixFieldType text */
  completionStatus?: string;
  /** @wixFieldType datetime */
  completedAt?: Date | string;
  /** @wixFieldType text */
  encouragingMessage?: string;
}
