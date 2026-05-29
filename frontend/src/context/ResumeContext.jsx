import { createContext, useContext, useReducer, useCallback } from "react";
import { resumeAPI } from "../utils/api";

const newId = () => crypto.randomUUID();

export const EMPTY = {
  _id:null, title:"Untitled Resume", template:"minimal", atsScore:0,
  data:{
    personal:{ name:"",title:"",email:"",phone:"",location:"",website:"",linkedin:"",github:"",summary:"",avatar:null },
    experience:[    { id:newId(),role:"",company:"",duration:"",location:"",desc:"" }],
    education:[     { id:newId(),degree:"",institution:"",year:"",gpa:"",desc:"" }],
    skills:[],
    projects:[      { id:newId(),name:"",tech:"",url:"",desc:"" }],
    certifications:[ { id:newId(),name:"",issuer:"",year:"" }],
    achievements:[  { id:newId(),text:"" }],
    languages:[     { id:newId(),lang:"",level:"Intermediate" }],
  },
};

const BLANK_ENTRY = {
  experience:    ()=>({ id:newId(),role:"",company:"",duration:"",location:"",desc:"" }),
  education:     ()=>({ id:newId(),degree:"",institution:"",year:"",gpa:"",desc:"" }),
  projects:      ()=>({ id:newId(),name:"",tech:"",url:"",desc:"" }),
  certifications:()=>({ id:newId(),name:"",issuer:"",year:"" }),
  achievements:  ()=>({ id:newId(),text:"" }),
  languages:     ()=>({ id:newId(),lang:"",level:"Intermediate" }),
};

function reducer(state,action){
  const {resume}=state;
  switch(action.type){
    case "SET_TAB":      return {...state,activeTab:action.tab};
    case "SET_PREVIEW":  return {...state,preview:action.val};
    case "LOAD":         return {...state,resume:action.resume,dirty:false};
    case "NEW":          return {...state,resume:{...JSON.parse(JSON.stringify(EMPTY))},dirty:false,activeTab:"personal"};
    case "SET_TITLE":    return {...state,dirty:true,resume:{...resume,title:action.v}};
    case "SET_TEMPLATE": return {...state,dirty:true,resume:{...resume,template:action.v}};
    case "SET_ATS":      return {...state,resume:{...resume,atsScore:action.v}};
    case "SET_SAVING":   return {...state,saving:action.v};
    case "SET_RESUMES":  return {...state,all:action.resumes};
    case "PERSONAL":
      return {...state,dirty:true,resume:{...resume,data:{...resume.data,personal:{...resume.data.personal,[action.f]:action.v}}}};
    case "ADD":
      return {...state,dirty:true,resume:{...resume,data:{...resume.data,[action.s]:[...resume.data[action.s],BLANK_ENTRY[action.s]()]}}};
    case "REMOVE":
      return {...state,dirty:true,resume:{...resume,data:{...resume.data,[action.s]:resume.data[action.s].filter(e=>e.id!==action.id)}}};
    case "UPDATE":
      return {...state,dirty:true,resume:{...resume,data:{...resume.data,[action.s]:resume.data[action.s].map(e=>e.id===action.id?{...e,[action.f]:action.v}:e)}}};
    case "SET_SKILLS":
      return {...state,dirty:true,resume:{...resume,data:{...resume.data,skills:action.skills}}};
    case "REORDER":
      return {...state,dirty:true,resume:{...resume,data:{...resume.data,[action.s]:action.entries}}};
    default: return state;
  }
}

const Ctx = createContext(null);

export function ResumeProvider({ children }) {
  const [state,dispatch] = useReducer(reducer,{
    resume: JSON.parse(JSON.stringify(EMPTY)),
    all:[], activeTab:"personal", preview:false,
    dirty:false, saving:false,
  });

  const updatePersonal  = (f,v)  => dispatch({type:"PERSONAL",f,v});
  const addEntry        = (s)    => dispatch({type:"ADD",s});
  const removeEntry     = (s,id) => dispatch({type:"REMOVE",s,id});
  const updateEntry     = (s,id,f,v) => dispatch({type:"UPDATE",s,id,f,v});
  const setSkills       = (skills)   => dispatch({type:"SET_SKILLS",skills});
  const setTemplate     = (v)    => dispatch({type:"SET_TEMPLATE",v});
  const setTitle        = (v)    => dispatch({type:"SET_TITLE",v});
  const setActiveTab    = (tab)  => dispatch({type:"SET_TAB",tab});
  const setPreview      = (val)  => dispatch({type:"SET_PREVIEW",val});
  const setATSScore     = (v)    => dispatch({type:"SET_ATS",v});
  const newResume       = ()     => dispatch({type:"NEW"});
  const reorderEntries  = (s,entries) => dispatch({type:"REORDER",s,entries});

  const fetchAll = useCallback(async()=>{
    try{ const d=await resumeAPI.getAll(); dispatch({type:"SET_RESUMES",resumes:d.resumes}); }catch{}
  },[]);

  const loadResume = useCallback(async(id)=>{
    const d = await resumeAPI.getOne(id);
    dispatch({type:"LOAD",resume:d.resume});
  },[]);

  const saveResume = useCallback(async()=>{
    dispatch({type:"SET_SAVING",v:true});
    try{
      const {_id,title,template,data,atsScore}=state.resume;
      const payload={title,template,data,atsScore};
      const d = _id ? await resumeAPI.update(_id,payload) : await resumeAPI.create(payload);
      dispatch({type:"LOAD",resume:d.resume});
      return true;
    }catch(e){ console.error(e); return false; }
    finally{ dispatch({type:"SET_SAVING",v:false}); }
  },[state.resume]);

  const deleteResume = useCallback(async(id)=>{
    await resumeAPI.delete(id);
    dispatch({type:"SET_RESUMES",resumes:state.all.filter(r=>r._id!==id)});
  },[state.all]);

  const value={
    ...state,
    updatePersonal, addEntry, removeEntry, updateEntry, setSkills,
    setTemplate, setTitle, setActiveTab, setPreview, setATSScore,
    newResume, reorderEntries, fetchAll, loadResume, saveResume, deleteResume,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useResume=()=>{ const c=useContext(Ctx); if(!c) throw new Error("useResume outside ResumeProvider"); return c; };
