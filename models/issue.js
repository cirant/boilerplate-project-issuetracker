const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Types: { ObjectId } } = Schema;

const issueSchema = new Schema(
	{
		issue_title: {
			type: String,
			required: true
		},
		issue_text: {
			type: String,
			required: true
		},
		created_by: {
			type: String,
			required: true
		},
		assigned_to: String,
		status_text: String,
		open: {
			type: Boolean,
			default: true
		},
		projectId: {
			type: ObjectId,
			ref: 'project',
			required: true
		}
	},
	{
		timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' }
	});

issueSchema.methods.toJSON = function () {
	var obj = this.toObject()
	delete obj.projectId
	delete obj.__v
	return obj
}

module.exports = mongoose.model('issue', issueSchema);