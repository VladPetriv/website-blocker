const disciplineMessages = [
  "Discipline is doing what you know you should, even when you don’t feel like it.",
  "Your future self is watching—make them proud, not disappointed.",
  "Changing settings mid-session won’t change your habits. Stay strong.",
  "Discomfort is temporary. Discipline lasts forever.",
  "Right now, resisting temptation is the real progress.",
  "If you quit every time it gets hard, you’ll stay where you are.",
  "The whole point of this session is to fight your impulses. Don’t give in.",
  "Every time you push through, you prove to yourself that you can.",
  "Your growth lives outside of shortcuts.",
  "Breaking discipline now only makes it harder next time. Hold the line.",
  "This isn’t about rules—it’s about proving to yourself you can stick to them.",
  "One moment of weakness can undo hours of strength. Don’t let it.",
  "Discipline is the bridge between goals and achievement. Don’t burn it.",
  "If you override now, you’re only cheating yourself.",
  "You installed this for a reason. Trust that reason more than your impulses.",
  "This site is blocked for a reason—your focus matters more than this moment of distraction.",
  "Every time you resist opening a blocked site, you’re building stronger habits.",
  "Opening this now undoes the progress your current session is meant to create.",
  "Your brain is trained by what you allow. Don’t give in to temptation.",
  "Blocked sites are distractions disguised as urgent tasks. Stay focused.",
  "Remember why you set this block—your future self will thank you for it.",
  "Override now, and you’ll feel regret later. Hold the line instead.",
  "Every blocked session you complete strengthens your self-control muscle.",
  "Your goals deserve uninterrupted time. Don’t let a click steal it.",
  "Discomfort from resisting is temporary. The habit you build is permanent.",
  "Every time you try to bypass, you reinforce the wrong behavior. Stay disciplined.",
  "Blocked doesn’t mean forbidden forever. It means focus now, reward later.",
  "The impulse to open this site is short-lived. Your progress lasts longer.",
  "Temptation is easy. Commitment is hard. Choose commitment.",
  "This session is your training ground. Each site you avoid is a victory.",
  "Every click you avoid adds minutes of focused work to your life.",
  "Your productivity is a chain—don’t break it with one weak link.",
  "Discipline isn’t about avoiding pleasure; it’s about protecting your focus.",
  "Your future self designed these blocks—respect them, respect yourself.",
  "This isn’t about restriction, it’s about building freedom through focus.",
];

const getRandomDisciplineMessage = () => {
  const i = Math.floor(Math.random() * disciplineMessages.length);
  return disciplineMessages[i];
};

export { getRandomDisciplineMessage };
