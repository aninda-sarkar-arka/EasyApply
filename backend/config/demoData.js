const demoUsers = [
  {
    id: 'demo-user-1',
    name: 'Aninda Sarkar',
    email: 'aninda.sarkar11@gmail.com',
    password: '1234567a@',
    profile: {
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      preferredRoles: ['Frontend Developer', 'Full Stack Developer'],
      jobLocations: ['Remote', 'Kolkata', 'Bangalore'],
      education: [{ degree: 'B.Tech', institution: 'Demo Institute', year: 2025 }],
      experience: [
        {
          title: 'Intern Developer',
          company: 'DemoTech',
          duration: '6 months',
          description: 'Built internal dashboard components.',
        },
      ],
    },
  },
  {
    id: 'demo-user-2',
    name: 'Aninda Sarkar',
    email: 'aninda.sarkar12@gmail.com',
    password: '1234567b@',
    profile: {
      skills: ['Python', 'Data Analysis', 'SQL'],
      preferredRoles: ['Backend Developer', 'Data Analyst'],
      jobLocations: ['Remote', 'Hyderabad'],
      education: [{ degree: 'B.Sc', institution: 'Demo University', year: 2024 }],
      experience: [],
    },
  },
];

const demoApplicationsByUser = {
  'demo-user-1': [
    {
      _id: 'demo-app-1',
      user: 'demo-user-1',
      company: 'Google',
      role: 'Frontend Engineer',
      status: 'interview',
      appliedDate: '2026-04-10T00:00:00.000Z',
      deadline: '2026-05-05T23:59:59.000Z',
      interviewDate: '2026-05-06T14:00:00.000Z',
      notes: 'Completed first round interview.',
      jobLink: 'https://careers.google.com',
      interviewNotes: [
        {
          _id: 'demo-note-1',
          question: 'Describe a time you improved performance in a React app.',
          answer: 'Lazy-loaded routes and memoized heavy lists; reduced LCP by ~30%.',
          feedback: 'Strong — interviewer asked a follow-up on measurement.',
          date: '2026-04-28T16:00:00.000Z',
        },
      ],
      activityLog: [
        { action: 'Application created with status: applied', timestamp: '2026-04-10T09:00:00.000Z' },
        { action: 'Status changed from applied to interview', timestamp: '2026-04-12T11:00:00.000Z' },
        {
          action: 'Interview scheduled for 5/6/2026, 2:00:00 PM',
          timestamp: '2026-04-14T10:00:00.000Z',
        },
        {
          action: 'Interview note added: Describe a time you improved performance in a React app.',
          timestamp: '2026-04-28T16:05:00.000Z',
        },
      ],
    },
    {
      _id: 'demo-app-2',
      user: 'demo-user-1',
      company: 'Atlassian',
      role: 'Software Engineer',
      status: 'offer',
      appliedDate: '2026-04-05T00:00:00.000Z',
      deadline: '2026-05-01T00:00:00.000Z',
      interviewDate: '2026-04-20T10:30:00.000Z',
      notes: 'Offer received, evaluating compensation.',
      interviewNotes: [],
      activityLog: [
        { action: 'Application created with status: applied', timestamp: '2026-04-05T08:00:00.000Z' },
        { action: 'Status changed from applied to interview', timestamp: '2026-04-08T09:00:00.000Z' },
        { action: 'Status changed from interview to offer', timestamp: '2026-04-22T15:00:00.000Z' },
      ],
    },
    {
      _id: 'demo-app-3',
      user: 'demo-user-1',
      company: 'Stripe',
      role: 'Frontend Developer',
      status: 'applied',
      appliedDate: '2026-04-16T00:00:00.000Z',
      deadline: '2026-05-12T23:59:59.000Z',
      notes: 'Waiting for recruiter response.',
      interviewNotes: [],
      activityLog: [
        { action: 'Application created with status: applied', timestamp: '2026-04-16T08:00:00.000Z' },
        {
          action: 'Application deadline set to 5/12/2026, 11:59:59 PM',
          timestamp: '2026-04-16T08:01:00.000Z',
        },
      ],
    },
  ],
  'demo-user-2': [
    {
      _id: 'demo-app-4',
      user: 'demo-user-2',
      company: 'Amazon',
      role: 'Backend Developer',
      status: 'interview',
      appliedDate: '2026-04-12T00:00:00.000Z',
      interviewDate: '2026-05-08T15:00:00.000Z',
      notes: 'Submitted through referral.',
      interviewNotes: [
        {
          _id: 'demo-note-2',
          question: 'Design a rate limiter.',
          answer: 'Token bucket with Redis; discussed edge cases.',
          feedback: '',
          date: '2026-04-25T12:00:00.000Z',
        },
      ],
      activityLog: [
        { action: 'Application created with status: applied', timestamp: '2026-04-12T07:00:00.000Z' },
        { action: 'Status changed from applied to interview', timestamp: '2026-04-18T09:00:00.000Z' },
      ],
    },
    {
      _id: 'demo-app-5',
      user: 'demo-user-2',
      company: 'Microsoft',
      role: 'Data Analyst',
      status: 'rejected',
      appliedDate: '2026-03-30T00:00:00.000Z',
      deadline: '2026-04-15T00:00:00.000Z',
      notes: 'Rejected after assignment round.',
      interviewNotes: [],
      activityLog: [
        { action: 'Application created with status: applied', timestamp: '2026-03-30T08:00:00.000Z' },
        { action: 'Status changed from applied to rejected', timestamp: '2026-04-10T14:00:00.000Z' },
      ],
    },
  ],
};

const isDemoUserId = (id) => typeof id === 'string' && id.startsWith('demo-user-');

const findDemoUserByEmail = (email) => demoUsers.find((user) => user.email === email);
const findDemoUserById = (id) => demoUsers.find((user) => user.id === id);

const getDemoApplications = (userId) => {
  const apps = demoApplicationsByUser[userId] || [];
  return [...apps].sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
};

const getDemoApplicationById = (userId, appId) => {
  const apps = demoApplicationsByUser[userId] || [];
  return apps.find((app) => app._id === appId);
};

module.exports = {
  demoUsers,
  isDemoUserId,
  findDemoUserByEmail,
  findDemoUserById,
  getDemoApplications,
  getDemoApplicationById,
};
