const mongoose = require("mongoose");

const personalSchema = new mongoose.Schema({
  name:"",title:"",email:"",phone:"",location:"",website:"",
  linkedin:"",github:"",summary:"",avatar:{ type:String,default:null },
}, { _id:false });

const experienceSchema = new mongoose.Schema({
  role:"",company:"",duration:"",location:"",desc:"",isCurrent:{ type:Boolean,default:false },
});
const educationSchema = new mongoose.Schema({
  degree:"",institution:"",year:"",gpa:"",desc:"",
});
const projectSchema = new mongoose.Schema({
  name:"",tech:"",url:"",desc:"",
});
const certSchema = new mongoose.Schema({ name:"",issuer:"",year:"" });
const achSchema  = new mongoose.Schema({ text:"" });
const langSchema = new mongoose.Schema({
  lang:"", level:{ type:String,enum:["Native","Fluent","Advanced","Intermediate","Basic"],default:"Intermediate" },
});
const atsHistSchema = new mongoose.Schema({ score:Number, date:{ type:Date,default:Date.now } }, { _id:false });

const resumeSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true, index:true },
  title:    { type: String, default:"Untitled Resume", maxlength:100 },
  template: { type: String, enum:["minimal","dark","creative","cyber"], default:"minimal" },
  isPublic: { type: Boolean, default:false },
  atsScore: { type: Number, default:0, min:0, max:100 },
  atsScoreHistory: [atsHistSchema],
  data: {
    personal:       { type: personalSchema,    default:() => ({}) },
    experience:     { type: [experienceSchema], default:[] },
    education:      { type: [educationSchema],  default:[] },
    skills:         { type: [String],           default:[] },
    projects:       { type: [projectSchema],    default:[] },
    certifications: { type: [certSchema],       default:[] },
    achievements:   { type: [achSchema],        default:[] },
    languages:      { type: [langSchema],       default:[] },
  },
  meta: {
    views:     { type:Number,default:0 },
    downloads: { type:Number,default:0 },
  },
}, { timestamps:true });

resumeSchema.index({ userId:1, updatedAt:-1 });

// Limit free users to 3 resumes
resumeSchema.pre("save", async function(next) {
  if (!this.isNew) return next();
  const User   = mongoose.model("User");
  const user   = await User.findById(this.userId);
  if (user?.plan === "Free") {
    const count = await mongoose.model("Resume").countDocuments({ userId: this.userId });
    if (count >= 3) return next(new Error("Free plan is limited to 3 resumes. Upgrade to Pro for unlimited."));
  }
  next();
});

module.exports = mongoose.model("Resume", resumeSchema);
