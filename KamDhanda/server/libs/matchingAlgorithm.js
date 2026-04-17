/**
 * Evaluates the match score between a Seeker profile and a Project's requirements.
 * Score is normalized between 0 and 100.
 *
 * Weights:
 * - Skills Match: 60%
 * - Budget Match: 20%
 * - Experience Match: 20%
 */

// Helper to calculate Jaccard-like similarity for skills
const calculateSkillScore = (userSkills, projectSkills) => {
    if (!projectSkills || projectSkills.length === 0) return 100; // If project needs no specific skills
    if (!userSkills || userSkills.length === 0) return 0; // If user has no skills but project needs them

    // Normalize strings for comparison (lowercase, trim)
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
    const normalizedProjectSkills = projectSkills.map(s => s.toLowerCase().trim());

    let matchCount = 0;
    normalizedProjectSkills.forEach(reqSkill => {
        if (normalizedUserSkills.includes(reqSkill)) {
            matchCount++;
        }
    });

    return (matchCount / projectSkills.length) * 100;
};

// Helper to evaluate if budget is in range
// We assume Seekers might not have a strong budget indicator in the current schema
// but if they bid/have expected rates, we evaluate.
// For now, if we don't have seeker expectations, we give full budget match (they are open to the project's budget).
const calculateBudgetScore = (seekerExpectedRate, projectMinBudget, projectMaxBudget) => {
    if (!seekerExpectedRate) return 0; // Don't give "free" points if not specified

    if (seekerExpectedRate >= projectMinBudget && seekerExpectedRate <= projectMaxBudget) {
        return 100;
    }

    // Partial score if they are slightly outside the range (e.g. 10% diff)
    const diff = Math.abs(seekerExpectedRate - projectMaxBudget);
    const range = projectMaxBudget - projectMinBudget || 1;

    if (seekerExpectedRate > projectMaxBudget) {
        let penalty = (diff / projectMaxBudget) * 100;
        return Math.max(0, 100 - (penalty * 2)); // Drops quickly
    }

    return 100; // If they are cheaper than the minimum, they're a good match for the budget
};

// Helper to match text-based experience
const calculateExperienceScore = (userExp, projectExpRequired) => {
    if (!projectExpRequired || !userExp) return 0; // Don't give "free" points if not specified

    const uExp = userExp.toLowerCase();
    const pExp = projectExpRequired.toLowerCase();

    // Exact Match
    if (uExp === pExp) return 100;

    // Simple heuristic for generic levels
    const levels = { "beginner": 1, "intermediate": 2, "expert": 3 };

    // If both are recognizable levels
    if (levels[uExp] && levels[pExp]) {
        // If user is overqualified or exact match
        if (levels[uExp] >= levels[pExp]) return 100;

        // Underqualified
        if (levels[pExp] - levels[uExp] === 1) return 50; // Ex: Intermediate applying for Expert
        return 0; // Ex: Beginner applying for Expert
    }

    // Default partial match for unmatched strings to keep the algorithm forgiving
    return 50;
};

/**
 * calculateMatchScore
 * @param {Object} user - Seeker document
 * @param {Object} project - Project document
 * @returns {Number} 0-100 Match Score
 */
const calculateMatchScore = (user, project) => {
    const skillScore = calculateSkillScore(user.skills, project.skills);

    // The user wants the match score to be exactly the skill match ratio.
    // Example: 2 matching skills out of 4 required = 50% match.
    return Math.round(skillScore);
};

module.exports = {
    calculateMatchScore,
    calculateSkillScore
};
