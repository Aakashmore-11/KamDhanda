const mongoose = require('mongoose');

const freelancerProjectSchema = new mongoose.Schema({}, { strict: false });
const Freelancer = mongoose.model('FreelancerProject', freelancerProjectSchema, 'freelancerprojects');

async function checkAll() {
    try {
        await mongoose.connect("mongodb://localhost:27017/KamDhanda");
        console.log("Connected to MongoDB");
        
        const allProjects = await Freelancer.find();
        console.log(`Total projects found: ${allProjects.length}`);
        
        const categories = [...new Set(allProjects.map(p => p.category))];
        console.log("Categories present in DB:", categories);
        
        allProjects.forEach((p, i) => {
            console.log(`[${i+1}] Title: ${p.title} | Category: "${p.category}" | Status: ${p.status}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkAll();
