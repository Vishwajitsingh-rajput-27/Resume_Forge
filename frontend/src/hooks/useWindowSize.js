import { useState, useEffect } from "react";
export default function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(()=>{
    let t; const h=()=>{ clearTimeout(t); t=setTimeout(()=>setSize({w:window.innerWidth,h:window.innerHeight}),150); };
    window.addEventListener("resize",h);
    return ()=>{ window.removeEventListener("resize",h); clearTimeout(t); };
  },[]);
  return { ...size, isMobile:size.w<768, isTablet:size.w>=768&&size.w<1024, isDesktop:size.w>=1024 };
}
