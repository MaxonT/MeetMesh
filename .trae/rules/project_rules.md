前端一定要避免的错误：
1. 按钮点不动（Click Unresponsive）
   
   - 真凶 ： CSS 层级塌陷（Stacking Context Collapse） 。
   - 证据 ： page.tsx 中 BackgroundEffects 使用了 fixed 定位，而主内容区 EventContent 是默认的 static 定位。在浏览器的渲染合成层中，背景层意外“浮”在了内容层之上，拦截了点击事件（尽管有 pointer-events-none ，但在某些混合模式或特效下会失效）。
   - 修复 ：必须强制提升内容区的 z-index ，建立新的堆叠上下文。
2. Save 按钮像死机（No Feedback）
   
   - 真凶 ： Props 传递断裂（Missing Prop） 。
   - 证据 ：在 EventContent.tsx 中获取了 isSaving 状态，但在调用 <TimeGrid /> 时 根本没有传进去 ！导致 TimeGrid 里的按钮永远不知道自己正在保存，自然无法显示 "Saving..."，用户就会觉得“点了没反应”。
3. 创建活动慢（Create Slow）
   - 真凶 ： 交互反馈缺失 。纯粹是 UI 层面少了 Loading 状态。

   