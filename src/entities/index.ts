/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

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
 * Collection ID: clientprograms
 * Interface for ClientPrograms
 */
export interface ClientPrograms {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  programTitle?: string;
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
