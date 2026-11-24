async function recommend(request,env){
 if(request.method!=='POST')return error('请提交个人资料。',405);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return error('请求格式错误。',415);
 let profile;
 try{if(Number(request.headers.get('Content-Length'))>2048)return error('资料过长。',413);const body=await request.text();if(body.length>2048)return error('资料过长。',413);profile=JSON.parse(body)}catch{return error('无法读取资料。',400)}
 if(!profile||typeof profile!=='object')return error('请填写个人资料。',400);
 const {age,height,hours,goal}=profile;
 if(![age,height,hours].every(Number.isFinite)||!Number.isInteger(age)||age<1||age>120||height<50||height>250||hours<=0||hours>24||!Object.hasOwn(goals,goal))return error('请检查年龄、身高、使用时长和优先目标。',400);
 const result=choose([age,height,hours],goal);
 const plan=trialPlan(result,goal);
 let ai=null,status='实验数据试调建议';
 if(env.ZHIPU_API_KEY){
 // The advice depends only on the selected goal and angle, never on personal details.
 const cache=globalThis.caches?.default;
 const cacheKey=new Request(new URL('/trial-advice/v1/'+goal+'/'+result.angle,request.url));
 const saved=cache?await cache.match(cacheKey).catch(()=>null):null;
 if(saved){
  ai=await saved.text();
  status='智谱 '+saved.headers.get('X-Advice-Model')+' · 复用同目标、同档位的建议';
 }else{
 const question=JSON.stringify({goal:result.goal,start:result.angle,comparison:plan.next,whenToCompare:plan.cue,reason:plan.reason});
 const upstream=await chat(new Request(request.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:question}]})}),env,true);
 const response=await upstream.json();
 const candidate=response.answer?.trim();
 const angles=Array.from((candidate||'').matchAll(/(\d+(?:\.\d+)?)\s*(?:°|度)/g),match=>Number(match[1]));
 if(candidate && angles.includes(result.angle) && angles.includes(plan.next) && angles.every(a=>a===result.angle||a===plan.next))ai=candidate;
 status=ai?'智谱 '+response.model+' · 本次生成':'实验数据试调建议 · 本次未取得可用的云端建议';
 if(ai && cache)await cache.put(cacheKey,new Response(ai,{headers:{'Cache-Control':'public, max-age=86400','X-Advice-Model':response.model}})).catch(()=>{});
 }
 }
 return json({...result,ai,status,advice:ai||('先把支架调到 '+result.angle+'°。'+plan.compare),reason:plan.reason});
}
