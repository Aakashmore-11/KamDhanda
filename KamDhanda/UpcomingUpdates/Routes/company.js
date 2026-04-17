const { Router } = require('express');
const router = Router();
const Company = require('../models/company_model');
const upload = require('../../server/config/cloudinayConfig');
const checkAuthentication = require('../../server/middlewares/auth');

router.post('/createCompany', checkAuthentication, upload.single('companyLogo'), async (req, res) => {
    try {
        const { companyName, companyWebsiteUrl, industry, location, departments, companyDescription } = req.body;
        const parsedDepartment = JSON.parse(departments);

        await Company.create({ companyName, companyLogo: req?.file?.path, companyWebsiteUrl, companyDescription, industry, departments: parsedDepartment, location, createdBy: req.user._id })
        res.status(201).json({ message: "Company Profile Created Successfully!" });
    } catch (err) {

        res.status(500).json({ message: err })
    }
})

router.get('/getCompany', checkAuthentication, async (req, res) => {
    try {
        const company = await Company.findOne({ createdBy: req.user._id })
        res.status(201).json(company);
    } catch (err) {

        res.status(500).json({ message: err })
    }
})

router.get('/getCompanies', async (req, res) => {
    try {
        const companies = await Company.find({})
        res.status(201).json(companies);
    } catch (err) {

        res.status(500).json({ message: err })
    }
})

router.patch('/add-recruiter', async (req, res) => {
    try {
        const { companyId, recruiterId } = req.body;

        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ message: "Company not found" });

        // Add recruiter if not already in the array
        if (!company.recruiters.includes(recruiterId)) {
            company.recruiters.push(recruiterId);
            await company.save();
        }

        res.status(200).json(company);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


module.exports = router;