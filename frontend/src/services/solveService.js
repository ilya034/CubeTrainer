import api from './api';
import { generateScramble } from '../utils/scramble';

const GUEST_STORAGE_KEY = 'cubetrainer_guest_data';

const getLocalData = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY)) || { sessions: [] };
  } catch {
    return { sessions: [] };
  }
};

const setLocalData = (data) => {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
};

export const solveService = {
  getDisciplines: async () => {
    try {
      const response = await api.get('/disciplines/');
      return response.data;
    } catch (error) {
      console.warn("API недоступен, используем оффлайн список");
      return [
        { id: 1, name: '3x3 Cube', slug: '333', scrambler_type: '333' },
        { id: 2, name: '2x2 Cube', slug: '222', scrambler_type: '222' },
        { id: 3, name: '4x4 Cube', slug: '444', scrambler_type: '444' },
        { id: 4, name: '3x3 OH', slug: '333oh', scrambler_type: '333' },
      ];
    }
  },

  getSession: async (disciplineSlug, user) => {
    if (user) {
      const response = await api.get(`/sessions/current/${disciplineSlug}/`);
      return response.data; 
    } else {
      const data = getLocalData();
      let session = data.sessions.find(s => s.discipline_slug === disciplineSlug);
      
      if (!session) {
        session = {
          id: `local_${Date.now()}`,
          name: 'General',
          discipline_slug: disciplineSlug,
          solves: []
        };
        data.sessions.push(session);
        setLocalData(data);
      }
      return session;
    }
  },

  saveSolve: async (solveData, user, sessionId) => {
   
    if (user) {
      const response = await api.post('/solves/', {
        ...solveData,
        session_id: sessionId
      });
      return response.data;
    } else {
      const data = getLocalData();
      const sessionIndex = data.sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) throw new Error("Session not found locally");

      const newSolve = {
        id: Date.now(),
        ...solveData,
        penalty: '0',
        created_at: new Date().toISOString()
      };

      data.sessions[sessionIndex].solves.unshift(newSolve);
      setLocalData(data);
      
      return newSolve;
    }
  },

  updatePenalty: async (solveId, penalty, user, sessionId) => {    
    if (user) {
      const response = await api.patch(`/solves/${solveId}/`, { penalty });
      return response.data;
    } else {
      const data = getLocalData();
      const session = data.sessions.find(s => s.id === sessionId);
      if (session) {
        const solve = session.solves.find(s => s.id === solveId);
        if (solve) {
          solve.penalty = penalty;
          setLocalData(data);
          return solve;
        }
      }
      return null;
    }
  },

  deleteSolve: async (solveId, user, sessionId) => {
    if (user) {
      await api.delete(`/solves/${solveId}/`);
    } else {
      const data = getLocalData();
      const session = data.sessions.find(s => s.id === sessionId);
      if (session) {
        session.solves = session.solves.filter(s => s.id !== solveId);
        setLocalData(data);
      }
    }
  },

  syncGuestData: async () => {
    const data = getLocalData();
    if (data.sessions.length === 0) return;

    try {
      await api.post('/sync/', data);
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch (error) {
      console.error("Sync failed", error);
    }
  }
};