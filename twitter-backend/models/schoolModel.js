import mongoose, {Schema} from 'mongoose';

const schools = new Schema({
    email: {
        type: String,
        required: true
    },
    inn: {type: Number, required: true},
    title: {type: String, required: true, unique: true},
    teachers: [{type: Schema.Types.ObjectId, required: true}],
    groups: [{type: Schema.Types.ObjectId, required: true}]
});

const School = mongoose.model("School", schools)
export default School;