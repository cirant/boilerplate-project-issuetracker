var ObjectId = require('mongodb').ObjectID;
const Project = require('../models/project');
const Issue = require('../models/issue');

exports.create = async (req, res, next) => {
	try {
		var projectName = req.params.project;
		const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

		[issue_title, issue_text, created_by].forEach((el) => {
			if (el === undefined || el === null || el.trim() === '')
				throw new Error(`issue_title, issue_text and created_by are required`)
		});

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
		return res.status(400).send(error.message)
	}
}

exports.update = async (req, res, next) => {
	const { body } = req;
	try {
		const keys = Object.keys(body);

		if (!body._id) {
			throw new Error('body == null');
		} else if (keys.length === 1) {
			return res.status(200).send('no updated field sent');
		}

		const update = keys.reduce((acc, name) => {
			if (body[name]) { acc[name] = body[name]; }
			return acc;
		}, {});

		await Issue.findOneAndUpdate(
			{ _id: ObjectId(body._id) },
			{ $set: update }
		);

		return res.status(200).send('successfully updated');

	} catch (error) {
		console.log('update method error: ', error);
		return res.status(400).send('could not update ' + body._id);
	}
}

exports.delete = async (req, res, next) => {
	const { body: { _id } } = req;
	try {

		if (!_id) {
			throw new Error('body == null');
		}

		const { deletedCount } = await Issue.deleteOne(
			{ _id: ObjectId(_id) }
		);

		const message = deletedCount === 1 ? `deleted ${_id}` : `could not delete ${_id}`;
		return res.status(200).send(message);

	} catch (error) {
		console.log('update method error: ', error);
		return res.status(400).send('_id error');
	}
}

exports.index = async (req, res, next) => {
	try {
		const { query } = req;
		const match = req.params.project;
		const project = await Project.findOne({ name: match }).populate({
			path: 'issues',
			match: query
		});
		return res.status(200).json(project.issues);
	} catch (error) {
		return res.status(200).send(error);
	}
}