import {pipeline,env} from './vendor/transformers.min.js';
env.allowLocalModels=false;
env.useBrowserCache=true;
env.backends.onnx.wasm.wasmPaths=new URL('./vendor/',import.meta.url).href;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
// The multilingual base model is small enough for mobile WASM. Never pass a target
// word as a prompt: that would bias recognition toward a false success.
let model, busy=false;
self.onmessage=async ({data})=>{
  if(busy)return;
  busy=true;
  try{
    model??=await pipeline('automatic-speech-recognition','onnx-community/whisper-base',{
      device:'wasm',dtype:'q8',revision:'1846881b6b3a3024392c1eea3ad983695bc23925',
      progress_callback:p=>self.postMessage({type:'progress',file:p.file,status:p.status,loaded:p.loaded,total:p.total})
    });
    if(data.type==='load')self.postMessage({type:'ready'});
    if(data.type==='transcribe'){
      const output=await model(data.audio,{language:'thai',task:'transcribe',max_new_tokens:24});
      data.audio.fill(0);
      self.postMessage({type:'result',id:data.id,text:output.text});
    }
  }catch(error){self.postMessage({type:'error',id:data.id,diagnostic:error.message})}
  finally{busy=false}
};

