import dotenv from 'dotenv';

import adminModel from '../models/adminModel.js';
import {
  fetchCasinoTables,
  fetchCasinoResult as fetchCasinoResultApi,
  fetchCasinoDetailResult as fetchCasinoDetailResultApi,
} from '../services/matchApi/index.js';
import { getCasinoTable } from '../services/casinoTableCache.js';

dotenv.config();

export const isCasinoGame = (gameId, cid, gid, tabno) => {
  try {
    if (cid != null && Number(cid) === 4) return true;
    if (gid != null && Number(gid) === 35) return true;
    if (tabno != null && Number(tabno) === 6) return true;
    if (typeof gameId === 'string' && !/^\d+$/.test(gameId)) return true;
    return false;
  } catch (e) {
    return false;
  }
};

// The game list changes rarely, so one provider call is shared by all users.
const CASINO_LIST_TTL_MS = 60 * 1000;
let casinoListCache = { at: 0, data: null };
let casinoListInflight = null;

const loadCasinoList = async () => {
  const payload = await fetchCasinoTables();

  // Provider A returns the game list as a bare array, others wrap it in { success, data }
  if (Array.isArray(payload)) return payload;
  if (payload?.success) return payload.data || [];

  const error = new Error('Failed to fetch casino data from provider');
  error.provider = payload;
  throw error;
};

export const getCasinoData = async (req, res) => {
  if (
    casinoListCache.data &&
    Date.now() - casinoListCache.at < CASINO_LIST_TTL_MS
  ) {
    return res.status(200).json({ success: true, data: casinoListCache.data });
  }

  try {
    casinoListInflight ??= loadCasinoList().finally(() => {
      casinoListInflight = null;
    });
    const data = await casinoListInflight;

    casinoListCache = { at: Date.now(), data };
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getCasinoData error:', error?.message || error);

    // A stale list is better than an empty casino section
    if (casinoListCache.data) {
      return res
        .status(200)
        .json({ success: true, data: casinoListCache.data });
    }

    if (error.provider !== undefined) {
      return res.status(502).json({
        success: false,
        message: error.message,
        provider: error.provider,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error?.message });
  }
};

// Event names go straight into the provider URL path, so only plain slugs are accepted
const EVENT_NAME_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;

// Shared with bet validation and the WebSocket poller, so opening a table never
// costs more than one provider call per second no matter how many users do it.
const BETTING_DATA_MAX_AGE_MS = 1000;

export const getCasinoBettingData = async (req, res) => {
  const { eventName } = req.query;
  if (!eventName) {
    return res
      .status(400)
      .json({ success: false, message: 'Event Name is required' });
  }
  if (!EVENT_NAME_PATTERN.test(eventName)) {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid event name' });
  }
  try {
    const data = await getCasinoTable(eventName, BETTING_DATA_MAX_AGE_MS);
    return res.status(200).json({
      message: 'Casino Betting data fetched Successfully',
      data: data,
    });
  } catch (error) {
    if (error?.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'This game is not available right now',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};

//Fetch CasinoResult data
// In-memory cache for casino results
const resultCache = new Map();
const RESULT_CACHE_TTL = 3000; // 3 seconds

export const getCasinoResultData = async (req, res) => {
  const { gameId } = req.query;
  if (!gameId) {
    return res
      .status(400)
      .json({ success: false, message: 'Game Id is required' });
  }

  try {
    // Check cache first
    const cached = resultCache.get(gameId);
    if (cached && Date.now() - cached.timestamp < RESULT_CACHE_TTL) {
      return res.status(200).json({ success: true, data: cached.data });
    }

    const json = await fetchCasinoResultApi(gameId);
    if (json.success) {
      // Cache the successful result
      resultCache.set(gameId, { data: json.data, timestamp: Date.now() });
      return res.status(200).json({ success: true, data: json.data });
    } else {
      // Return cached data if provider returns bad response
      if (cached) {
        return res.status(200).json({ success: true, data: cached.data });
      }
      return res
        .status(502)
        .json({ success: false, message: 'Invalid Response from API' });
    }
  } catch (error) {
    console.error('Error in getCasinoResultData:', error?.message);
    const cached = resultCache.get(gameId);
    if (cached) {
      return res.status(200).json({ success: true, data: cached.data });
    }
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};
export const getCasinoResultDetailData = async (req, res) => {
  try {
    const { gameId, mid } = req.query;
    if (!gameId || !mid) {
      return res.status(400).json({ message: 'GameId or mid is missing' });
    }
    const json = await fetchCasinoDetailResultApi(gameId, mid);
    return res.status(200).json({ message: 'Success', data: json?.data?.t1 });
  } catch (error) {
    console.error('Error in fetchingCasinoResultBettingData', error?.message);
    res.status(500).json({
      success: false,
      message: 'Internal server Error,error?.message ',
    });
  }
};
