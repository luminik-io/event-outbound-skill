export type EventContext = {
  name: string;
  dates: string;
  startDate?: string; // YYYY-MM-DD, used for date-aware cadence planning.
  endDate?: string; // YYYY-MM-DD.
  location: string;
  agendaTitles: string[];
  speakers: string[];
  exhibitorList: string[];
};

export type CompanyICP = {
  industry: string;
  sizeRange: string;
  website?: string;
  productSummary?: string;
  proofPoints?: string[];
  availableAssets?: string[];
  personas: AttendeePersona[];
};

export type AttendeePersona = {
  personaId: string; // Unique ID for this persona, deterministically generated.
  role: string;
  seniority:
    | 'junior'
    | 'mid-level'
    | 'senior'
    | 'lead'
    | 'executive'
    | 'manager'
    | 'other'
    | 'unknown';
  company?: string;
  buyerJob?: string;
  currentWorkaround?: string;
  hiddenRisk?: string;
  objections?: string[];
  proofPoints?: string[];
  availableAssets?: string[];
  priorities: string[];
  painPoints: string[];
  exampleTitles: string[];
};

export type PainAngle = {
  label: string;
  sourcePain?: string;
  mechanism?: string;
  costOfInaction?: string;
  illuminationQuestion?: string;
};

export const CTA_TYPES = [
  'make_offer',
  'ask_for_interest',
  'ask_for_problem',
  'ask_for_meeting',
  'none',
] as const;

export type CTAType = (typeof CTA_TYPES)[number];

export type ValidationError = {
  rule: string;
  message: string;
  offendingValue?: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

export type TimelineTouchpoint = {
  offset_days: number;
  channel: 'email' | 'linkedin';
  touch_slot: number;
};

export type OutreachTouch = {
  send_at_offset_days: number;
  channel: 'email' | 'linkedin';
  touch_type: string;
  subject: string;
  body: string;
  pain_angle?: PainAngle;
  word_count: number;
  cta_type: CTAType;
  checks: {
    subjectWordCount: number;
    allLowercase: boolean;
    bodyWordCount: number;
    bodyCharCount: number;
    bodySentenceCount: number;
    bannedWordsFound: string[];
    youVsWeRatio: number;
    hasIlluminationQuestion: boolean;
    hasLeadingQuestion: boolean;
    hasEmDash: boolean;
    hasExclamation: boolean;
    hasEmoji: boolean;
    specificityHits: number;
    canonicalTouchType?: string;
    linkedinSubject?: string;
    permissionToSendHits?: string[];
    forcedEventPhrasingHits?: string[];
    missingMergeFields?: string[];
    assetPromiseHits?: string[];
    proofClaimHits?: string[];
    previewSellerHits?: string[];
    previewEventHits?: string[];
    clearCtaHits?: string[];
    missingClearCta?: boolean;
    commaSplicedCtaHits?: string[];
    painAngleLabel?: string;
    reusedPainAngleHits?: string[];
    painAngleBodyOverlap?: number;
  };
  validation_errors?: ValidationError[];
  quality_flag?: 'rules_violated';
};

export type OutreachSequence = {
  personaId: string;
  touches: OutreachTouch[];
  leadTimeWeeks: number;
  channels: ('email' | 'linkedin')[];
  touchCount?: number;
  minGapDays?: number;
  today?: string;
};

export type SequencerOutput = {
  sequencesByPersona: { [personaId: string]: OutreachSequence };
};

export type SequenceParams = {
  leadTimeWeeks: number; // 1-8, default 4
  channels: ('email' | 'linkedin')[];
  touchCount?: number;
  minGapDays?: number; // Default 4. Adjacent steps should not be closer.
  today?: string; // YYYY-MM-DD. Defaults to the active session date in skill usage.
  includeDayOf?: boolean;
  includePostEvent?: boolean;
  preEventOnly?: boolean;
  sendingIdentity: {
    name: string;
    title: string;
    company: string;
    voiceSample?: string;
  };
};

export type RawEventContext = { html_content: string };
export type RawCompanyICP = { company_url: string };
