const Project = require('../models/project');
const Issue = require('../models/issue');

exports.create = async (req, res, next) => {
	try {
		var projectName = req.params.project;
		const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

		Project.findOrCreate({ name: projectName }, (err, project) => {
			if (err) {
				next(new Error(err));
			}
			Issue.create({
				projectId: project._id,
				issue_title: issue_title,
				issue_text: issue_text,
				created_by: created_by,
				assigned_to: assigned_to,
				status_text: status_text,
			}).then((issue) => {
				project.issues.push(issue._id);
				project.save((err) => {
					if (err) {
						throw new Error(err);
					}
					res.status(200).json(issue)
				})
			});
		});
	} catch (error) {
		next(error);
	}
}