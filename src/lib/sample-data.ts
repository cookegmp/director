import { useClientsStore } from '@/stores/clients'
import { useEngagementsStore } from '@/stores/engagements'
import { useDiscoveryStore } from '@/stores/discovery'
import { useScaffoldingStore } from '@/stores/scaffolding'
import { useOcaiStore } from '@/stores/ocai'
import { useTerminologyStore } from '@/stores/terminology'
import type {
  Client,
  Engagement,
  DiscoverySession,
  ScaffoldingPackage,
  OCAIAssessment,
  TerminologyEntry,
} from '@/types'

// ─── Clients ───────────────────────────────────────────────

const clients: Client[] = [
  {
    id: 'client-precision',
    name: 'Precision Dynamics',
    industry: 'Manufacturing',
    size_range: 'mid',
    status: 'scaffolding',
    primary_contact: 'Sarah Chen, VP of Operations',
    notes: 'Mid-size manufacturer, 180 employees. Specializes in precision-machined automotive components. Three production facilities in Ohio. Currently running SAP ECC for ERP with extensive customizations. Looking to modernize workflow management and reduce manual data entry across shop floor operations.',
    created_at: '2026-01-05T09:00:00.000Z',
    updated_at: '2026-03-15T14:30:00.000Z',
  },
  {
    id: 'client-midwest',
    name: 'Midwest Distribution Co',
    industry: 'Distribution',
    size_range: 'small',
    status: 'discovery',
    primary_contact: 'Tom Ramirez, General Manager',
    notes: 'Regional distributor, 95 employees. Handles industrial fasteners, electrical components, and MRO supplies across a 5-state territory. Uses QuickBooks Enterprise and a custom Access database for inventory tracking. Paper-based pick/pack process. High error rate on order fulfillment.',
    created_at: '2026-02-01T10:00:00.000Z',
    updated_at: '2026-03-10T11:00:00.000Z',
  },
]

// ─── Engagements ───────────────────────────────────────────

const engagements: Engagement[] = [
  {
    id: 'eng-precision-1',
    client_id: 'client-precision',
    phase: 'scaffolding',
    start_date: '2026-01-15',
    target_end_date: '2026-04-30',
    actual_end_date: null,
    status: 'active',
  },
  {
    id: 'eng-midwest-1',
    client_id: 'client-midwest',
    phase: 'discovery',
    start_date: '2026-02-10',
    target_end_date: '2026-05-15',
    actual_end_date: null,
    status: 'active',
  },
]

// ─── Discovery Sessions ────────────────────────────────────

const sessions: DiscoverySession[] = [
  // Precision Dynamics — 3 completed sessions
  {
    id: 'session-pd-1',
    engagement_id: 'eng-precision-1',
    session_type: 'stakeholder_interview',
    title: 'Executive Leadership Interview',
    participants: ['Sarah Chen (VP Ops)', 'Mark Donnelly (Plant Manager)', 'Lisa Park (IT Director)'],
    transcript: 'Q: What are the top three operational challenges you face today?\nA (Sarah): Our biggest challenge is visibility. We have data in SAP, data in spreadsheets, data in people\'s heads. When a customer calls asking about an order status, it can take 20 minutes to piece together where things stand. Second is our quoting process — it\'s entirely manual, relies on tribal knowledge, and our best estimator is retiring in 18 months. Third is quality traceability. We\'re ISO 9001 certified but our documentation process is painful.\n\nQ: How do these challenges impact the business financially?\nA (Mark): The visibility issue alone costs us. We have two full-time people whose job is essentially chasing status updates. The quoting bottleneck means we turn away rush quotes — I\'d estimate we lose $200-300K annually in quotes we can\'t respond to fast enough.\n\nQ: What does success look like for this engagement?\nA (Lisa): Ideally, anyone in the organization can answer "where is job X?" in under 30 seconds. We want our quoting process captured in a system so it survives personnel changes. And we want quality records that practically write themselves.\n\nQ: What systems do you consider untouchable?\nA (Sarah): SAP stays. We\'ve invested too much to replace it. But everything around it is fair game.',
    extracted_data: {
      pain_points: ['Lack of operational visibility', 'Manual quoting process with tribal knowledge risk', 'Painful quality documentation'],
      financial_impact: '$200-300K annual lost revenue from slow quoting',
      success_metrics: ['Job status lookup < 30 seconds', 'Quoting process systematized', 'Automated quality records'],
      system_constraints: ['SAP ECC must remain', 'Surrounding systems open to replacement'],
      key_stakeholders: ['Sarah Chen (VP Ops)', 'Mark Donnelly (Plant Manager)', 'Lisa Park (IT Director)'],
    },
    scaffolding_sections_affected: ['tier1_process_workflow', 'tier1_data_systems', 'tier2_company_context'],
    status: 'complete',
    session_date: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'session-pd-2',
    engagement_id: 'eng-precision-1',
    session_type: 'system_walkthrough',
    title: 'SAP & Shop Floor Systems Walkthrough',
    participants: ['Lisa Park (IT Director)', 'Dave Kowalski (SAP Admin)', 'Maria Santos (Shop Floor Lead)'],
    transcript: 'Q: Walk us through the systems landscape — what touches what?\nA (Dave): SAP ECC 6.0 is the backbone. Production orders, BOM management, inventory, financials all live there. We have about 200 custom ABAP reports. On the shop floor, we have Mitutoyo CMMs connected to PC-DMIS for quality inspection. Machine monitoring is through a mix of MTConnect adapters on newer CNCs and manual entry for older equipment.\n\nQ: How does data flow from the shop floor to SAP?\nA (Maria): Honestly, a lot of it is manual. Operators fill out paper travelers, then someone in the office keys the completions into SAP at the end of the shift. Sometimes the next morning. There\'s a 4-8 hour lag on production data.\n\nQ: What integrations exist today?\nA (Lisa): SAP talks to our bank for AP/AR. We have an EDI connection to three major customers for PO receipt and ASN. Quality data stays in PC-DMIS — it doesn\'t feed SAP. Our quoting spreadsheets are standalone.\n\nQ: What are the biggest integration pain points?\nA (Dave): The lag between shop floor reality and SAP is the killer. We also can\'t easily get data out of SAP for dashboards — every report request turns into a 2-week ABAP development cycle.',
    extracted_data: {
      systems: ['SAP ECC 6.0 (core ERP)', 'PC-DMIS (quality inspection)', 'MTConnect (machine monitoring)', 'EDI (customer PO/ASN)'],
      integration_gaps: ['4-8 hour shop floor to SAP data lag', 'Quality data siloed in PC-DMIS', 'No real-time dashboards'],
      custom_code: '200+ custom ABAP reports',
      data_flow_issues: ['Paper travelers with manual keying', 'End-of-shift batch data entry'],
      technical_debt: ['ABAP report backlog', 'No API layer for SAP data access'],
    },
    scaffolding_sections_affected: ['tier1_data_systems', 'tier2_tech_preferences', 'tier2_security_patterns'],
    status: 'complete',
    session_date: '2026-01-25T13:00:00.000Z',
  },
  {
    id: 'session-pd-3',
    engagement_id: 'eng-precision-1',
    session_type: 'workflow_observation',
    title: 'Production Order Lifecycle Observation',
    participants: ['Maria Santos (Shop Floor Lead)', 'James (Consultant)'],
    transcript: 'Observation: Followed a production order from release to completion.\n\nStep 1: Production planner releases order in SAP. Prints paper traveler with routing steps, BOM, and quality checkpoints.\n\nStep 2: Traveler placed in the "To Do" rack at first work center. Operator picks it up when ready — no priority sequencing beyond the planner\'s verbal instructions that morning.\n\nStep 3: At each operation, operator stamps the traveler with completion time and initials. If an issue arises (tool break, material defect), they write it on the traveler and notify the lead verbally.\n\nStep 4: Quality inspection performed at designated checkpoints. Inspector uses CMM, records measurements in PC-DMIS, and stamps the traveler "QC PASS" or routes to MRB (Material Review Board).\n\nStep 5: Completed traveler goes to the office. Data entry clerk keys operation completions, labor hours, and scrap quantities into SAP. This typically happens 4-8 hours after actual completion.\n\nStep 6: Shipping pulls the finished parts, creates an ASN in SAP, and ships.\n\nKey observations: No real-time visibility into WIP. Priority conflicts at work centers. Quality data disconnected from production data. Significant rework when travelers are misread or lost.',
    extracted_data: {
      workflow_steps: ['Order release → Paper traveler', 'Queue at work center', 'Operator execution with manual tracking', 'Quality inspection (CMM)', 'Data entry (4-8hr lag)', 'Shipping and ASN'],
      bottlenecks: ['No priority sequencing at work centers', 'Paper-based tracking', '4-8 hour data lag', 'Disconnected quality data'],
      rework_causes: ['Misread travelers', 'Lost travelers', 'Verbal-only priority communication'],
      improvement_opportunities: ['Digital work orders with real-time tracking', 'Automated quality data capture', 'Priority queue at work centers', 'Mobile data capture for operators'],
    },
    scaffolding_sections_affected: ['tier1_process_workflow', 'tier1_culture_profile'],
    status: 'complete',
    session_date: '2026-02-03T08:00:00.000Z',
  },
  // Midwest Distribution — 2 sessions (1 complete, 1 in-progress)
  {
    id: 'session-mw-1',
    engagement_id: 'eng-midwest-1',
    session_type: 'stakeholder_interview',
    title: 'General Manager and Operations Interview',
    participants: ['Tom Ramirez (General Manager)', 'Karen White (Warehouse Manager)'],
    transcript: 'Q: Tell us about your biggest operational headaches.\nA (Tom): Order accuracy is killing us. We\'re running about 94% order accuracy, and in distribution that\'s terrible — our competitors are at 99%+. Every mis-ship costs us $150-200 in return shipping, restocking, and re-shipping. We process about 400 orders a day, so even a few percentage points matter.\n\nQ: What\'s causing the accuracy issues?\nA (Karen): Paper pick lists. Our pickers get a printed list, walk the warehouse, and check items off with a pen. No barcode scanning, no system validation. If they grab the wrong part — especially similar-looking fasteners — nobody catches it until the customer calls.\n\nQ: What systems support your operations today?\nA (Tom): QuickBooks Enterprise for accounting and basic inventory. A custom Access database that our previous IT person built for tracking bin locations and reorder points. Excel for everything else — pricing, customer lists, route planning.\n\nQ: What would make the biggest impact if we could solve it?\nA (Karen): If our pickers had a device that told them exactly where to go and confirmed they picked the right item, our accuracy would jump overnight. That and getting rid of the Access database — it crashes weekly and only one person understands it.',
    extracted_data: {
      pain_points: ['94% order accuracy (target 99%+)', 'Paper-based pick process', 'Fragile Access database', 'No barcode scanning'],
      financial_impact: '$150-200 per mis-ship, ~400 orders/day',
      systems: ['QuickBooks Enterprise', 'Custom Access DB', 'Excel for pricing/routing'],
      priority_solution: 'Mobile pick system with barcode validation',
      technical_risk: 'Access database is single-point-of-failure',
    },
    scaffolding_sections_affected: ['tier1_process_workflow', 'tier1_data_systems', 'tier2_company_context'],
    status: 'complete',
    session_date: '2026-02-15T10:00:00.000Z',
  },
  {
    id: 'session-mw-2',
    engagement_id: 'eng-midwest-1',
    session_type: 'brand_collection',
    title: 'Brand Identity and Communication Audit',
    participants: ['Tom Ramirez (General Manager)', 'Amy Liu (Marketing Coordinator)'],
    transcript: 'Q: How would you describe your company\'s brand personality?\nA (Tom): Reliable. We\'re the distributor that always has what you need and gets it there on time. We\'re not flashy — we\'re dependable.\n\n[Session in progress — additional questions pending on visual identity, competitor positioning, and tone guidelines]',
    extracted_data: {
      brand_adjectives: ['Reliable', 'Dependable', 'Practical'],
    },
    scaffolding_sections_affected: ['tier2_brand_standards'],
    status: 'in_progress',
    session_date: '2026-03-05T14:00:00.000Z',
  },
]

// ─── Scaffolding Packages ──────────────────────────────────

const scaffoldingPackages: ScaffoldingPackage[] = [
  {
    id: 'scaffolding-precision-1',
    engagement_id: 'eng-precision-1',
    version: '1.0.0',
    tier1_process_workflow: {
      critical_workflows: ['Production Order Lifecycle', 'Quoting & Estimation', 'Quality Inspection & Reporting', 'Customer Order Status Inquiry'],
      production_order_lifecycle: {
        steps: ['Order Release', 'Traveler Generation', 'Work Center Queue', 'Operator Execution', 'Quality Checkpoint', 'Data Entry', 'Shipping'],
        pain_points: ['Paper travelers', '4-8hr data lag', 'No priority sequencing', 'Lost travelers'],
        target_state: 'Digital work orders with real-time tracking, automated quality capture, and mobile operator interface',
      },
      quoting_process: {
        current_state: 'Manual spreadsheet-based, relies on senior estimator tribal knowledge',
        risk: 'Key person dependency — estimator retiring in 18 months',
        target_state: 'Systematized quoting with historical data lookup, material cost integration, and approval workflow',
      },
      decision_points: ['Rush order prioritization', 'MRB disposition', 'Capacity allocation'],
      handoff_points: ['Planner → Shop floor', 'Shop floor → Quality', 'Quality → Shipping', 'Office → Customer'],
    },
    tier1_culture_profile: {
      organizational_style: 'Hierarchical with strong floor-level autonomy',
      communication_patterns: 'Verbal for urgency, paper for documentation, email for cross-department',
      change_readiness: 'Moderate — leadership is bought in, shop floor is skeptical of technology replacing paper',
      training_preferences: 'Hands-on demonstration preferred over documentation-first',
      key_cultural_factors: ['Pride in craftsmanship', 'Resistance to "big brother" monitoring', 'Strong team loyalty within shifts', 'Generational divide on technology adoption'],
    },
    tier1_data_systems: {
      primary_erp: { name: 'SAP ECC 6.0', status: 'Staying — non-negotiable', customizations: '200+ ABAP reports' },
      quality_system: { name: 'PC-DMIS', status: 'Staying', integration: 'Currently siloed' },
      machine_monitoring: { name: 'MTConnect (partial)', status: 'Expanding', coverage: '60% of CNC machines' },
      integrations: ['EDI to 3 major customers', 'Bank AP/AR connection'],
      gaps: ['No real-time shop floor to ERP connection', 'No API layer for SAP', 'Quality data not linked to production orders', 'No dashboard capability without custom ABAP'],
      data_quality: 'Good in SAP core, poor in surrounding spreadsheets and paper records',
    },
    tier2_company_context: {
      company_name: 'Precision Dynamics',
      industry: 'Precision Manufacturing — Automotive Components',
      employees: 180,
      facilities: '3 production facilities in Ohio',
      annual_revenue_range: '$25M-$50M',
      founded: 1987,
      certifications: ['ISO 9001:2015', 'IATF 16949 (in progress)'],
      competitive_advantage: 'Tight tolerances, quick turnaround, long-standing customer relationships',
    },
    tier2_brand_standards: {
      primary_colors: ['#1B3A5C (Navy)', '#E8A317 (Gold)', '#FFFFFF (White)'],
      typography: 'Roboto for digital, Helvetica for print',
      tone: 'Professional, precise, confident',
      logo_notes: 'Precision gear icon with wordmark — must maintain clear space',
      internal_app_guidelines: 'Dark theme preferred by operators (reduces glare on shop floor), high contrast for readability',
    },
    tier2_tech_preferences: {
      preferred_stack: 'Web-based (no native apps), mobile-responsive for shop floor tablets',
      hosting: 'On-premise preferred, open to hybrid cloud for non-sensitive data',
      database: 'SQL Server (existing SAP infrastructure)',
      auth: 'Active Directory integration required',
      browsers: 'Chrome on shop floor tablets, Edge on office workstations',
      integration_approach: 'RFC/BAPI for SAP, REST APIs for new services',
    },
    tier2_quality_standards: {
      certifications: ['ISO 9001:2015'],
      upcoming: ['IATF 16949'],
      inspection_equipment: ['3x Mitutoyo CMMs', 'Keyence vision system', 'Various hand gauges'],
      documentation_requirements: 'Full traceability from raw material to shipped part',
      nonconformance_process: 'MRB with 3-tier disposition (use as-is, rework, scrap)',
      audit_frequency: 'Annual external, quarterly internal',
    },
    tier2_security_patterns: {
      network: 'Segmented — office VLAN, shop floor VLAN, guest VLAN',
      authentication: 'Active Directory with GPO enforcement',
      data_classification: 'Customer drawings are confidential, production data is internal',
      backup: 'Nightly SAP backup to tape, weekly offsite rotation',
      compliance: 'No specific regulatory requirements beyond ISO',
      remote_access: 'VPN for office staff, no remote shop floor access currently',
    },
    validation_status: 'validated',
    exported_at: null,
  },
  {
    id: 'scaffolding-midwest-1',
    engagement_id: 'eng-midwest-1',
    version: '0.1.0',
    tier1_process_workflow: {
      critical_workflows: ['Order Fulfillment (Pick/Pack/Ship)', 'Inventory Replenishment', 'Customer Quoting'],
      order_fulfillment: {
        current_state: 'Paper pick lists, manual checking, high error rate',
        target_state: 'To be determined — discovery in progress',
      },
    },
    tier1_culture_profile: {
      organizational_style: 'Flat, hands-on leadership',
      notes: 'Discovery in progress — further cultural assessment needed',
    },
    tier1_data_systems: {
      primary_system: 'QuickBooks Enterprise',
      secondary: 'Custom Access database (fragile, single point of failure)',
      gaps: ['No barcode scanning', 'No mobile capability', 'Access DB crashes weekly'],
    },
    tier2_company_context: {},
    tier2_brand_standards: {},
    tier2_tech_preferences: {},
    tier2_quality_standards: {},
    tier2_security_patterns: {},
    validation_status: 'draft',
    exported_at: null,
  },
]

// ─── OCAI Assessments ──────────────────────────────────────

const assessments: OCAIAssessment[] = [
  // Precision Dynamics L1 — fully analyzed
  {
    id: 'ocai-pd-l1',
    engagement_id: 'eng-precision-1',
    level: 'baseline_1',
    target_scope: 'Organization-wide',
    questions: [
      { id: 'q1', text: 'The organization is a very personal place. It is like an extended family. People seem to share a lot of themselves.', category: 'dominant_characteristics' },
      { id: 'q2', text: 'The leadership in the organization is generally considered to exemplify mentoring, facilitating, or nurturing.', category: 'organizational_leadership' },
      { id: 'q3', text: 'The management style in the organization is characterized by teamwork, consensus, and participation.', category: 'management_style' },
      { id: 'q4', text: 'The glue that holds the organization together is loyalty and mutual trust. Commitment to this organization runs high.', category: 'organization_glue' },
      { id: 'q5', text: 'The organization emphasizes human development. High trust, openness, and participation persist.', category: 'strategic_emphasis' },
      { id: 'q6', text: 'The organization defines success on the basis of development of human resources, teamwork, and concern for people.', category: 'criteria_of_success' },
      { id: 'q7', text: 'The organization is a very dynamic and entrepreneurial place. People are willing to stick their necks out and take risks.', category: 'dominant_characteristics' },
      { id: 'q8', text: 'The organization emphasizes acquiring new resources and creating new challenges. Trying new things and prospecting for opportunities are valued.', category: 'strategic_emphasis' },
      { id: 'q9', text: 'The organization is a very controlled and structured place. Formal procedures generally govern what people do.', category: 'dominant_characteristics' },
      { id: 'q10', text: 'The organization is a very results-oriented place. People are competitive and achievement-oriented.', category: 'dominant_characteristics' },
      { id: 'q11', text: 'The management style is characterized by hard-driving competitiveness, high demands, and achievement.', category: 'management_style' },
      { id: 'q12', text: 'The organization defines success on the basis of efficiency. Dependable delivery, smooth scheduling, and low-cost production are critical.', category: 'criteria_of_success' },
    ],
    responses: [
      { question_id: 'q1', respondent_group: 'leadership', score: 65 },
      { question_id: 'q2', respondent_group: 'leadership', score: 55 },
      { question_id: 'q3', respondent_group: 'leadership', score: 60 },
      { question_id: 'q4', respondent_group: 'leadership', score: 70 },
      { question_id: 'q5', respondent_group: 'leadership', score: 50 },
      { question_id: 'q6', respondent_group: 'leadership', score: 45 },
      { question_id: 'q7', respondent_group: 'leadership', score: 35 },
      { question_id: 'q8', respondent_group: 'leadership', score: 40 },
      { question_id: 'q9', respondent_group: 'leadership', score: 75 },
      { question_id: 'q10', respondent_group: 'leadership', score: 70 },
      { question_id: 'q11', respondent_group: 'leadership', score: 65 },
      { question_id: 'q12', respondent_group: 'leadership', score: 80 },
    ],
    analysis: {
      clan: 55,
      adhocracy: 30,
      hierarchy: 72,
      market: 68,
      gaps: [
        'High hierarchy score suggests rigid processes — may resist agile implementation approaches',
        'Low adhocracy indicates limited innovation culture — new tool adoption will need strong change management',
        'Clan score is moderate — team loyalty is an asset but cross-shift communication gaps exist',
        'Market orientation is strong — success metrics and ROI framing will resonate with leadership',
      ],
      summary: 'Precision Dynamics has a predominantly Hierarchy-Market culture. Process discipline and results orientation are strengths that align well with systematic digital transformation. However, the low Adhocracy score means innovation and experimentation will need to be introduced gradually with clear guardrails. Leverage the moderate Clan culture (team loyalty) to build internal champions for new tools.',
    },
    status: 'analyzed',
  },
  // Precision Dynamics L2 — collecting responses
  {
    id: 'ocai-pd-l2',
    engagement_id: 'eng-precision-1',
    level: 'workflow_2',
    target_scope: 'Production Order Lifecycle',
    questions: [
      { id: 'wq1', text: 'When a production order is released, the workflow for getting it to the shop floor is well-defined and consistently followed.', workflow: 'production_order_lifecycle' },
      { id: 'wq2', text: 'Operators have clear visibility into which jobs should be worked on next and in what priority order.', workflow: 'production_order_lifecycle' },
      { id: 'wq3', text: 'When a quality issue is found during production, the process for handling it is quick and well-understood by everyone.', workflow: 'production_order_lifecycle' },
      { id: 'wq4', text: 'The quoting process consistently produces accurate estimates regardless of which estimator handles the quote.', workflow: 'quoting' },
      { id: 'wq5', text: 'Historical job data is easily accessible and regularly used to improve future estimates.', workflow: 'quoting' },
      { id: 'wq6', text: 'Quality inspection results are immediately available to production teams and management.', workflow: 'quality_inspection' },
    ],
    responses: [],
    analysis: {},
    status: 'collecting',
  },
  // Midwest Distribution L1 — deployed but no responses yet
  {
    id: 'ocai-mw-l1',
    engagement_id: 'eng-midwest-1',
    level: 'baseline_1',
    target_scope: 'Organization-wide',
    questions: [
      { id: 'mq1', text: 'The organization is a very personal place. It is like an extended family.', category: 'dominant_characteristics' },
      { id: 'mq2', text: 'The leadership exemplifies mentoring, facilitating, or nurturing.', category: 'organizational_leadership' },
      { id: 'mq3', text: 'The management style is characterized by teamwork and participation.', category: 'management_style' },
      { id: 'mq4', text: 'The glue that holds the organization together is loyalty and trust.', category: 'organization_glue' },
      { id: 'mq5', text: 'The organization emphasizes human development and high trust.', category: 'strategic_emphasis' },
      { id: 'mq6', text: 'Success is defined by development of people and teamwork.', category: 'criteria_of_success' },
      { id: 'mq7', text: 'The organization is dynamic and entrepreneurial.', category: 'dominant_characteristics' },
      { id: 'mq8', text: 'New resources and challenges are emphasized.', category: 'strategic_emphasis' },
      { id: 'mq9', text: 'The organization is controlled and structured with formal procedures.', category: 'dominant_characteristics' },
      { id: 'mq10', text: 'The organization is results-oriented and competitive.', category: 'dominant_characteristics' },
    ],
    responses: [],
    analysis: {},
    status: 'deployed',
  },
]

// ─── Terminology Entries ───────────────────────────────────

const terminologyEntries: TerminologyEntry[] = [
  // ERP Terms (10)
  { id: 'term-1', scaffolding_id: 'scaffolding-precision-1', client_term: 'Production Order', universal_concept: 'Work Order / Job', context: 'SAP terminology for a manufacturing job that tracks materials, labor, and routing', source_session_id: 'session-pd-2' },
  { id: 'term-2', scaffolding_id: 'scaffolding-precision-1', client_term: 'BOM', universal_concept: 'Bill of Materials', context: 'List of raw materials and components needed to manufacture a part', source_session_id: 'session-pd-2' },
  { id: 'term-3', scaffolding_id: 'scaffolding-precision-1', client_term: 'Routing', universal_concept: 'Process Plan / Operation Sequence', context: 'Ordered list of manufacturing operations with work centers and standard times', source_session_id: 'session-pd-3' },
  { id: 'term-4', scaffolding_id: 'scaffolding-precision-1', client_term: 'Work Center', universal_concept: 'Machine / Station', context: 'A production resource (CNC machine, assembly station, inspection bay) in SAP', source_session_id: 'session-pd-3' },
  { id: 'term-5', scaffolding_id: 'scaffolding-precision-1', client_term: 'BAPI', universal_concept: 'Business API / Integration Endpoint', context: 'SAP Business Application Programming Interface for reading/writing data programmatically', source_session_id: 'session-pd-2' },
  { id: 'term-6', scaffolding_id: 'scaffolding-precision-1', client_term: 'RFC', universal_concept: 'Remote Function Call', context: 'SAP protocol for calling functions across system boundaries', source_session_id: 'session-pd-2' },
  { id: 'term-7', scaffolding_id: 'scaffolding-precision-1', client_term: 'ABAP Report', universal_concept: 'Custom Report / Query', context: 'Custom program written in SAP\'s ABAP language to extract or display data', source_session_id: 'session-pd-2' },
  { id: 'term-8', scaffolding_id: 'scaffolding-precision-1', client_term: 'ASN', universal_concept: 'Advanced Shipping Notice', context: 'Electronic notification sent to customer before shipment arrives, transmitted via EDI', source_session_id: 'session-pd-2' },
  { id: 'term-9', scaffolding_id: 'scaffolding-precision-1', client_term: 'EDI', universal_concept: 'Electronic Data Interchange', context: 'Standardized format for exchanging business documents between trading partners', source_session_id: 'session-pd-2' },
  { id: 'term-10', scaffolding_id: 'scaffolding-precision-1', client_term: 'Confirmation', universal_concept: 'Operation Completion / Time Entry', context: 'SAP transaction for recording that an operation on a production order has been completed', source_session_id: 'session-pd-3' },
  // Shop Floor Terms (10)
  { id: 'term-11', scaffolding_id: 'scaffolding-precision-1', client_term: 'Traveler', universal_concept: 'Job Packet / Route Sheet', context: 'Paper document that accompanies a job through the shop, containing routing, quality checkpoints, and sign-off areas', source_session_id: 'session-pd-3' },
  { id: 'term-12', scaffolding_id: 'scaffolding-precision-1', client_term: 'MRB', universal_concept: 'Material Review Board / Nonconformance Review', context: 'Committee that determines disposition of parts that fail quality inspection', source_session_id: 'session-pd-3' },
  { id: 'term-13', scaffolding_id: 'scaffolding-precision-1', client_term: 'First Article', universal_concept: 'First Piece Inspection', context: 'Comprehensive inspection of the first part produced in a new setup to validate dimensions', source_session_id: 'session-pd-3' },
  { id: 'term-14', scaffolding_id: 'scaffolding-precision-1', client_term: 'Setup Sheet', universal_concept: 'Machine Setup Instructions', context: 'Document specifying tooling, fixtures, offsets, and programs needed to set up a machine for a specific part', source_session_id: 'session-pd-3' },
  { id: 'term-15', scaffolding_id: 'scaffolding-precision-1', client_term: 'Hot Job', universal_concept: 'Rush / Priority Order', context: 'Production order that must be expedited — typically marked with a red tag on the shop floor', source_session_id: 'session-pd-1' },
  { id: 'term-16', scaffolding_id: 'scaffolding-precision-1', client_term: 'Rack', universal_concept: 'Queue / Work Queue', context: 'Physical rack at each work center where paper travelers are placed in priority order', source_session_id: 'session-pd-3' },
  { id: 'term-17', scaffolding_id: 'scaffolding-precision-1', client_term: 'Scrap Rate', universal_concept: 'Defect Rate / Yield Loss', context: 'Percentage of parts that fail inspection and must be scrapped rather than reworked', source_session_id: 'session-pd-3' },
  { id: 'term-18', scaffolding_id: 'scaffolding-precision-1', client_term: 'CMM', universal_concept: 'Coordinate Measuring Machine', context: 'Precision measurement device used for quality inspection of machined parts', source_session_id: 'session-pd-2' },
  { id: 'term-19', scaffolding_id: 'scaffolding-precision-1', client_term: 'PC-DMIS', universal_concept: 'CMM Software / Inspection Software', context: 'Software that runs the Mitutoyo CMMs and records measurement data', source_session_id: 'session-pd-2' },
  { id: 'term-20', scaffolding_id: 'scaffolding-precision-1', client_term: 'MTConnect', universal_concept: 'Machine Monitoring Protocol', context: 'Open standard for collecting real-time data from CNC machines (cycle time, status, alarms)', source_session_id: 'session-pd-2' },
  // Role/Organizational Terms (10)
  { id: 'term-21', scaffolding_id: 'scaffolding-precision-1', client_term: 'Planner', universal_concept: 'Production Scheduler', context: 'Person who sequences and releases production orders based on customer due dates and capacity', source_session_id: 'session-pd-1' },
  { id: 'term-22', scaffolding_id: 'scaffolding-precision-1', client_term: 'Estimator', universal_concept: 'Quoting Specialist', context: 'Senior person who creates cost estimates for new customer inquiries based on drawings and specifications', source_session_id: 'session-pd-1' },
  { id: 'term-23', scaffolding_id: 'scaffolding-precision-1', client_term: 'Shop Floor Lead', universal_concept: 'Production Supervisor / Shift Lead', context: 'Person responsible for coordinating operators on the floor during a shift', source_session_id: 'session-pd-3' },
  { id: 'term-24', scaffolding_id: 'scaffolding-precision-1', client_term: 'Data Entry Clerk', universal_concept: 'Production Admin / ERP Operator', context: 'Office person who keys completed traveler data into SAP after the fact', source_session_id: 'session-pd-3' },
  { id: 'term-25', scaffolding_id: 'scaffolding-precision-1', client_term: 'Quality Inspector', universal_concept: 'QC Technician', context: 'Person who operates CMMs and inspection equipment to verify part dimensions', source_session_id: 'session-pd-3' },
  { id: 'term-26', scaffolding_id: 'scaffolding-precision-1', client_term: 'SAP Admin', universal_concept: 'ERP Administrator', context: 'IT person responsible for SAP configuration, user management, and custom report development', source_session_id: 'session-pd-2' },
  { id: 'term-27', scaffolding_id: 'scaffolding-precision-1', client_term: 'Plant Manager', universal_concept: 'Operations Director', context: 'Senior leader responsible for all production operations across the facility', source_session_id: 'session-pd-1' },
  { id: 'term-28', scaffolding_id: 'scaffolding-precision-1', client_term: 'VP of Operations', universal_concept: 'Chief Operating Officer', context: 'Executive sponsor for the digital transformation initiative', source_session_id: 'session-pd-1' },
  { id: 'term-29', scaffolding_id: 'scaffolding-precision-1', client_term: 'IT Director', universal_concept: 'Head of Information Technology', context: 'Technical leader overseeing all systems, infrastructure, and integration decisions', source_session_id: 'session-pd-1' },
  { id: 'term-30', scaffolding_id: 'scaffolding-precision-1', client_term: 'Operator', universal_concept: 'Machine Operator / Production Worker', context: 'Person who runs CNC machines, assembly stations, or other production equipment', source_session_id: 'session-pd-3' },
  // A few extras
  { id: 'term-31', scaffolding_id: 'scaffolding-precision-1', client_term: 'GD&T', universal_concept: 'Geometric Dimensioning & Tolerancing', context: 'Engineering drawing standard for specifying part geometry and acceptable variation', source_session_id: null },
  { id: 'term-32', scaffolding_id: 'scaffolding-precision-1', client_term: 'IATF 16949', universal_concept: 'Automotive Quality Management Standard', context: 'Quality management system standard specific to the automotive supply chain — Precision Dynamics is pursuing certification', source_session_id: 'session-pd-1' },
]

// ─── Seed Function ─────────────────────────────────────────

export function seedSampleData(): void {
  useClientsStore.getState().setClients(clients)
  useEngagementsStore.getState().setEngagements(engagements)
  useDiscoveryStore.getState().setSessions(sessions)
  useScaffoldingStore.getState().setPackages(scaffoldingPackages)
  useOcaiStore.getState().setAssessments(assessments)
  useTerminologyStore.getState().setEntries(terminologyEntries)
}
