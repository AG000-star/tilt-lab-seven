const goals = {balance:'综合舒适',neck:'优先减轻颈部疲劳',wrist:'优先减轻腕部疲劳'};
function choose(values,goal){
 const group=MODEL.groups[goal];
 const outside=values.some((v,i)=>v<MODEL.bounds[0][i]||v>MODEL.bounds[1][i]);
 const personalized=!outside&&group.useProfile;
 const scores=group.base.map((mean,j)=>personalized?mean+values.reduce((sum,v,i)=>sum+(v-MODEL.mu[i])/MODEL.sd[i]*group.coef[i][j],0):mean);
 const best=scores.indexOf(Math.max(...scores)),angle=best*10;
 const [speed,err,neck,shoulder,wrist,comfort,rula]=MODEL.means[best];
 const reference=outside?'你的资料中有项目超出样本范围，本次采用同一目标的组平均结果。':personalized?'腕部优先模型使用年龄、身高、日均时长估算各档表现。在 20 人逐人留出检验中，它仅略优于组平均，结果用于试调。':'在逐人留出检验中，加入年龄、身高和日均时长未改善这个目标的推荐，本次采用组平均结果。';
 const tradeoff=goal==='neck'?'从 20° 调到 30°，颈部疲劳均值从 2.65 降至 2.40，腕部疲劳从 2.15 升至 3.15。':goal==='wrist'?'腕疲劳均值在 0° 为 1.90，在 20° 为 2.15，在 70° 达到 5.95。选档时也计入了整体舒适度和姿势评分。':'20° 的平均舒适度最高、RULA 总分最低。与 10°、30° 相比，这两项的配对差异均未达校正后的显著标准。';
 return {angle,goal:goals[goal],personalized,outside,reference,tradeoff,rula,comfort,neck,wrist,speed,err};
}
function trialPlan(result,goal){
 const {angle}=result;
 const lower=angle>0;
 const next=lower?angle-10:10;
 const cue=lower?'如果打字时手腕比平时更累':'如果手腕放松，但看屏幕时总想低头';
 const compare='用自带键盘敲同一小段文字。如果这档用着顺手，可以先保留。'+cue+'，再试 '+next+'°，比较两次的感受。';
 const reason=goal==='balance'?'你优先考虑整体舒适。20 人试打时，20° 的舒适度均值为 5.05/7，在八档中最高。该档的全表 RULA 均值也是八档中最低的。它适合作为比较其他档位的起点。':
 goal==='neck'?'你最在意颈部感受。在 30° 和 20°，组平均颈部疲劳分别为 2.40 和 2.65，腕部疲劳分别为 3.15 和 2.15。先试 30° 时，值得同时留意手腕。':
 '你最在意手腕。选档时，腕部疲劳的权重高于舒适度和姿势评分。'+angle+'° 的组平均腕部疲劳为 '+result.wrist.toFixed(2)+'/7，试打时可以用自己的手腕感受核对。';
 return {next,cue,compare,reason};
}

// Mean wrist-position scores from the RULA table, excluding example records 07–10.
const wristPositionMeans=[1.6875,1.6875,1.75,1.9375,2.25,2.4375,3.125,3.25];
function postureAdvice(goal,angle,next){
 if(goal==='balance'){
  return 'RULA（快速上肢评估法）把颈部、躯干和上肢的打字姿势合起来评分，分数越低，观察到的姿势负荷越小。剔除样例后的 16 人中，20° 的平均总分为 3.38，是八档中最低的。用 20° 作起点时，可以同时留意两件事：看屏幕是否总要低头，敲键盘时手背是否一直向上翘。';
 }
 if(goal==='neck'){
  return '先试 30° 的依据是这一档的颈部自评疲劳均值最低。RULA（快速上肢评估法）还会观察手腕弯曲：剔除样例后的 16 人中，从 20° 升到 30°，手腕姿势分项均值从 1.75 升到 1.94。比较这两档时，除了感受脖子是否轻松，也看看手背是否更容易向上翘。';
 }
 const here=wristPositionMeans[angle/10].toFixed(2),other=wristPositionMeans[next/10].toFixed(2);
 const comparison=here===other?'这两档的组均值相同，试打时按自己的手腕感受选。':'试打时留意哪一档更容易让手背与前臂自然成线。';
 return 'RULA（快速上肢评估法）会观察敲键时手腕偏离中立位的程度。剔除样例后的 16 人中，'+angle+'° 和 '+next+'° 的手腕姿势分项均值分别为 '+here+' 和 '+other+'，较低的分数表示观察到的姿势更接近中立位。'+comparison;
}
