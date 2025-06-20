import mongoose, {Schema} from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate"

const groups = new Schema({
    title: {type: String, required: true},
    schoolId: {type: Schema.Types.ObjectId, required: true, ref: "School"},
    events: [{
        type: Schema.Types.ObjectId, ref: "Event",
        autopopulate: true,
        default: [],
    }],
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    users: [{type: Schema.Types.ObjectId, ref: "User"}],
    chatId: { // Новое поле для хранения ID чата группы
        type: Schema.Types.ObjectId,
        ref: "Room",
        default: null,
    },
});

const Group = mongoose.model('Group', groups);
mongooseAutoPopulate(groups)

export default Group;