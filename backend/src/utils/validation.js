const PROGRAM_DEPARTMENT_MAP = {
    'B.Tech': ['CSE', 'ECE', 'ME', 'CE'],
    'M.Tech': ['CSE', 'ECE', 'ME', 'CE'],
    'BCA': ['Computer Applications'],
    'MCA': ['Computer Applications'],
    'BBA': ['Management'],
    'MBA': ['Management'],
    'PhD': ['CSE', 'ECE', 'ME', 'CE', 'Management', 'Computer Applications', 'Basic Sciences']
};

/**
 * Validates if the given department is allowed for the given program.
 * @param {string} program 
 * @param {string} department 
 * @returns {boolean}
 */
const validateProgramDepartment = (program, department) => {
    if (!program || !department) return false;
    const allowedDepts = PROGRAM_DEPARTMENT_MAP[program];
    return allowedDepts && allowedDepts.includes(department);
};

module.exports = { PROGRAM_DEPARTMENT_MAP, validateProgramDepartment };
