import { useState, useCallback } from "react";
let uid = 0;
export default function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type="info", duration=4000) => {
    const id = ++uid;
    setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>{
      setToasts(p=>p.map(t=>t.id===id?{...t,exiting:true}:t));
      setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),380);
    },duration);
  },[]);
  const dismiss = useCallback((id)=>{
    setToasts(p=>p.map(t=>t.id===id?{...t,exiting:true}:t));
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),380);
  },[]);
  return { toasts, show, dismiss,
    success:(m,d)=>show(m,"success",d),
    error:  (m,d)=>show(m,"error",d),
    info:   (m,d)=>show(m,"info",d),
    ai:     (m,d)=>show(m,"ai",d),
  };
}
