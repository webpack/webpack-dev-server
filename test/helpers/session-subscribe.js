"use strict";

module.exports = async function sessionSubscribe(session) {
  session.on("sessionattached", (attachedSession) => {
    sessionSubscribe(attachedSession);
  });
  session.send("Network.enable");
  session.send("Runtime.runIfWaitingForDebugger");
};
