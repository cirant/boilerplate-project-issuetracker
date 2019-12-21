const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Types: { ObjectId } } = Schema;

const projectSchema = new Schema({
	name: String,
	issues: [
		{
			type: ObjectId,
			ref: 'issue'
		}]
});


projectSchema.statics.findOrCreate = function findOrCreate(match, cb) {
	const self = this;
	self.findOne(match, (err, result) => {
		return result ? cb(err, result) : self.create(match, (err, result) => { return cb(err, result) })
	})
};

module.exports = mongoose.model('project', projectSchema);