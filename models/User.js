const mongoose  = require('mongoose')
const {Schema} = mongoose;

const UserSchema = new Schema ({
    email: {type: String, unique: true},
    firstname: {type: String, require: true},
    lastname: String,
    age: {type: Number, min: 0}
});

const User = mongoose.model('User', UserSchema);

module.exports = User;