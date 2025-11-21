import Company from './Company.js';
import Job from './Job.js';

export async function initDemoData() {
  try {
    // Initialize demo companies if none exist
    const companyCount = await Company.countDocuments();
    if (companyCount === 0) {
      const demoCompanies = [
        { name: 'Acme Corp', about: 'Building reliable products for everyone.' },
        { name: 'Bright Future Labs', about: 'Research-driven innovation.' },
        { name: 'GreenTech', about: 'Sustainable energy solutions.' },
      ];

      const inserted = await Company.insertMany(demoCompanies);
      console.log('✅ Demo companies initialized');

      // Seed a few demo jobs for the newly created companies
      const demoJobs = [
        {
          companyId: inserted[0]._id.toString(),
          title: 'Frontend Engineer',
          location: 'Remote',
          type: 'Full-time',
          description: 'Work on modern React apps and component libraries.'
        },
        {
          companyId: inserted[1]._id.toString(),
          title: 'Research Intern',
          location: 'New York',
          type: 'Internship',
          description: 'Assist with applied research and prototypes.'
        },
        {
          companyId: inserted[2]._id.toString(),
          title: 'Sustainability Engineer',
          location: 'San Francisco',
          type: 'Full-time',
          description: 'Build tools to monitor and optimize energy usage.'
        },
      ];

      await Job.insertMany(demoJobs);
      console.log('✅ Demo jobs initialized');
    } else {
      // If companies exist but jobs are missing, ensure some jobs exist
      const jobCount = await Job.countDocuments();
      if (jobCount === 0) {
        const companies = await Company.find().limit(3);
        if (companies.length > 0) {
          const demoJobs = companies.map((c, i) => ({
            companyId: c._id.toString(),
            title: ['Frontend Engineer', 'Research Intern', 'Sustainability Engineer'][i % 3],
            location: ['Remote', 'New York', 'San Francisco'][i % 3],
            type: ['Full-time', 'Internship', 'Full-time'][i % 3],
            description: 'Demo job seeded by initDemoData.'
          }));
          await Job.insertMany(demoJobs);
          console.log('✅ Demo jobs initialized for existing companies');
        }
      }
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}

