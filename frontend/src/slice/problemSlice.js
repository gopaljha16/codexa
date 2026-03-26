import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient';

export const fetchSolvedProblems = createAsyncThunk(
  'problems/fetchSolvedProblems',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      if (!state.auth.user) return [];
      
      const response = await axiosClient.get('/problem/problemsSolvedByUser');
      
      // Handle the new response format
      if (response.data && response.data.success) {
        return response.data.problems;
      } else {
        // Handle old response format for backward compatibility
        if (Array.isArray(response.data)) {
          return response.data;
        }
        
        console.error('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching solved problems:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      return rejectWithValue(error.response?.data || 'Failed to fetch solved problems');
    }
  }
);

const problemSlice = createSlice({
  name: 'problems',
  initialState: {
    solvedProblems: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSolvedProblems(state, action) {
      state.solvedProblems = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSolvedProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSolvedProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.solvedProblems = action.payload || [];
        state.error = null;
      })
      .addCase(fetchSolvedProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch solved problems';
        console.error('Failed to fetch solved problems:', action.payload);
      });
  },
});

export const { setSolvedProblems } = problemSlice.actions;

export default problemSlice.reducer;
