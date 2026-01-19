export const updatePenalty = async (solveId, newPenalty, isGuest, sessionId) => {
  if (!isGuest) {
    const response = await api.patch(`/solves/${solveId}/`, { 
      penalty: newPenalty 
    });
    return response.data;
  } else {
    const sessions = JSON.parse(localStorage.getItem('guest_sessions') || '[]');
    
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
         const updatedSolves = session.solves.map(solve => {
           if (solve.id === solveId) {
             return { ...solve, penalty: newPenalty };
           }
           return solve;
         });
         return { ...session, solves: updatedSolves };
      }
      return session;
    });

    localStorage.setItem('guest_sessions', JSON.stringify(updatedSessions));
    return { id: solveId, penalty: newPenalty };
  }
};