const mongoose = require('mongoose');
const Freelancer = require('./models/freelance_project_model');

async function check() {
    await mongoose.connect("mongodb://localhost:27017/KamDhanda");
    const count = await Freelancer.countDocuments();
    const projects = await Freelancer.find({ status: 'Open' }).limit(5);
    console.log('Total projects:', count);
    console.log('Open projects:', projects.length);
    projects.forEach(p => console.log(`- ${p.title} (${p.category})`));
    process.exit(0);
}

check();
