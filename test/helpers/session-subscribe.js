export default async function sessionSubscribe(session) {
  session.on("sessionattached", (attachedSession) => {
    sessionSubscribe(attachedSession);
  });
  await session.send("Network.enable");
  await session.send("Runtime.runIfWaitingForDebugger");
}
