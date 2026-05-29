import { useState, useCallback } from "react";
export default function useLocalStorage(key, initial) {
  const [val, setVal] = useState(()=>{
    try{ const i=localStorage.getItem(key); return i?JSON.parse(i):initial; }catch{ return initial; }
  });
  const set = useCallback((v)=>{
    const store = v instanceof Function?v(val):v;
    setVal(store);
    try{ localStorage.setItem(key,JSON.stringify(store)); }catch{}
  },[key,val]);
  return [val, set];
}
