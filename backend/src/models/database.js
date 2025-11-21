import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'database.json');

// Initialize database structure
const defaultData = {
  users: [],
  companies: [],
  jobs: [],
  applications: [],
  followRequests: []
};

// Load database
function loadDB() {
  if (!existsSync(dbPath)) {
    writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf8');
    return { ...defaultData };
  }
  try {
    const data = readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading database:', error);
    return { ...defaultData };
  }
}

// Save database
function saveDB(data) {
  try {
    writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving database:', error);
    throw error;
  }
}

// Database operations
class Database {
  constructor() {
    this.data = loadDB();
    this.initializeDemoData();
  }

  initializeDemoData() {
    // Initialize demo companies if none exist
    if (this.data.companies.length === 0) {
      this.data.companies = [
        {
          id: 'comp_1',
          name: 'Acme Corp',
          about: 'Building reliable products for everyone.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp_2',
          name: 'Bright Future Labs',
          about: 'Research-driven innovation.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp_3',
          name: 'GreenTech',
          about: 'Sustainable energy solutions.',
          createdAt: new Date().toISOString()
        }
      ];
      this.save();
      console.log('✅ Demo companies initialized');
    }
  }

  save() {
    saveDB(this.data);
  }

  // Users
  findUser(query) {
    return this.data.users.find(u => {
      if (query.id) return u.id === query.id;
      if (query.name && query.role) return u.name === query.name && u.role === query.role;
      return false;
    });
  }

  createUser(user) {
    const newUser = {
      id: user.id,
      name: user.name,
      email: user.email || null,
      password: user.password || null,
      role: user.role,
      companyId: user.companyId || null,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
      this.save();
      return user;
    }
    return null;
  }

  // Companies
  getAllCompanies() {
    return [...this.data.companies];
  }

  getCompanyById(id) {
    return this.data.companies.find(c => c.id === id);
  }

  createCompany(company) {
    const newCompany = {
      id: company.id,
      name: company.name,
      about: company.about,
      createdAt: new Date().toISOString()
    };
    this.data.companies.push(newCompany);
    this.save();
    return newCompany;
  }

  updateCompany(id, updates) {
    const company = this.data.companies.find(c => c.id === id);
    if (company) {
      Object.assign(company, updates);
      this.save();
      return company;
    }
    return null;
  }

  deleteCompany(id) {
    const index = this.data.companies.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.companies.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Jobs
  getAllJobs(companyId) {
    if (companyId) {
      return this.data.jobs.filter(j => j.companyId === companyId);
    }
    return [...this.data.jobs];
  }

  getJobById(id) {
    return this.data.jobs.find(j => j.id === id);
  }

  createJob(job) {
    const newJob = {
      id: job.id,
      companyId: job.companyId,
      title: job.title,
      location: job.location,
      type: job.type,
      description: job.description,
      createdAt: new Date().toISOString()
    };
    this.data.jobs.push(newJob);
    this.save();
    return newJob;
  }

  updateJob(id, updates) {
    const job = this.data.jobs.find(j => j.id === id);
    if (job) {
      Object.assign(job, updates);
      this.save();
      return job;
    }
    return null;
  }

  deleteJob(id) {
    const index = this.data.jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      this.data.jobs.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Applications
  getAllApplications(student, jobId) {
    let applications = [...this.data.applications];
    if (student) {
      applications = applications.filter(a => a.student === student);
    }
    if (jobId) {
      applications = applications.filter(a => a.jobId === jobId);
    }
    return applications;
  }

  getApplicationById(id) {
    return this.data.applications.find(a => a.id === id);
  }

  createApplication(application) {
    // Check if already exists
    const exists = this.data.applications.find(
      a => a.jobId === application.jobId && a.student === application.student
    );
    if (exists) {
      return null; // Already exists
    }

    const newApplication = {
      id: application.id,
      jobId: application.jobId,
      student: application.student,
      status: 'submitted',
      createdAt: new Date().toISOString()
    };
    this.data.applications.push(newApplication);
    this.save();
    return newApplication;
  }

  updateApplication(id, updates) {
    const application = this.data.applications.find(a => a.id === id);
    if (application) {
      Object.assign(application, updates);
      this.save();
      return application;
    }
    return null;
  }

  deleteApplication(id) {
    const index = this.data.applications.findIndex(a => a.id === id);
    if (index !== -1) {
      this.data.applications.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Follow Requests
  getAllFollowRequests(student, companyId) {
    let requests = [...this.data.followRequests];
    if (student) {
      requests = requests.filter(r => r.student === student);
    }
    if (companyId) {
      requests = requests.filter(r => r.companyId === companyId);
    }
    return requests;
  }

  getFollowRequestById(id) {
    return this.data.followRequests.find(r => r.id === id);
  }

  createFollowRequest(request) {
    // Check if already exists
    const exists = this.data.followRequests.find(
      r => r.student === request.student && r.companyId === request.companyId
    );
    if (exists) {
      return null; // Already exists
    }

    const newRequest = {
      id: request.id,
      student: request.student,
      companyId: request.companyId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.followRequests.push(newRequest);
    this.save();
    return newRequest;
  }

  updateFollowRequest(id, updates) {
    const request = this.data.followRequests.find(r => r.id === id);
    if (request) {
      Object.assign(request, updates);
      this.save();
      return request;
    }
    return null;
  }

  deleteFollowRequest(id) {
    const index = this.data.followRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.followRequests.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }
}

// Create singleton instance
const db = new Database();
export default db;
