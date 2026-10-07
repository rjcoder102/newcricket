import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api';

export const fetchHorseRacingData = createAsyncThunk(
  'horseRacing/fetchHorseRacingData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/horse-racing');
      if (!response.data?.success || !Array.isArray(response.data.data)) {
        return rejectWithValue(
          response.data?.message || 'Invalid horse racing response'
        );
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch horse racing data'
      );
    }
  }
);

export const fetchHorseRacingBettingData = createAsyncThunk(
  'horseRacingBet/fetchBettingData',
  async (gameid, { rejectWithValue }) => {
    try {
      const response = await api.get('/horse-racing/betting', {
        params: { gameid },
      });

      if (
        !response.data?.success ||
        !Array.isArray(response.data?.data?.data)
      ) {
        return rejectWithValue(
          response.data?.message || 'Invalid horse racing betting response'
        );
      }

      return response.data.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch horse racing betting data'
      );
    }
  }
);

const horseRacingSlice = createSlice({
  name: 'horseRacing',
  initialState: {
    venues: [],
    bettingData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHorseRacingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHorseRacingData.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload;
      })
      .addCase(fetchHorseRacingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      }) 
      .addCase(fetchHorseRacingBettingData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bettingData = [];
      })
      .addCase(fetchHorseRacingBettingData.fulfilled, (state, action) => {
        state.loading = false;
        state.bettingData = action.payload;
      })
      .addCase(fetchHorseRacingBettingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default horseRacingSlice.reducer;
