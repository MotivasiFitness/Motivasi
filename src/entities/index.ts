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
  /** @wixFieldType image */
  featuredImage?: string;
  /** @wixFieldType text */
  excerpt?: string;
  /** @wixFieldType text */
  content?: string;
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
  /** @wixFieldType image */
  transformationImage?: string;
  /** @wixFieldType text */
  clientAgeRange?: string;
  /** @wixFieldType text */
  keyAchievement?: string;
  /** @wixFieldType boolean */
  featuredOnHomepage?: boolean;
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
  /** @wixFieldType image */
  certificateImage?: string;
  /** @wixFieldType text */
  relevance?: string;
}
