// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tyrxsvjgzfgifbwkbkkp.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cnhzdmpnemZnaWZid2tia2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDU2MTIsImV4cCI6MjA4ODQ4MTYxMn0.E04v2gL7o9sE2mK7z2jRMVjcltEa7JffJ5Yuh6JFdGM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const signUp = async (email, password, nama) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (data.user) {
    await supabase.from('profiles').insert({ id: data.user.id, email, nama }).select()
  }
  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const loadHafalan = async (userId) => {
  const { data, error } = await supabase.from('hafalan').select('*').eq('user_id', userId)
  if (error) throw error
  return data
}

export const upsertHafalan = async (userId, surahId, payload) => {
  const { error } = await supabase.from('hafalan').upsert({
    user_id: userId, surah_id: surahId, ...payload, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,surah_id' })
  if (error) throw error
}

export const insertMurajaLog = async (userId, surahId, quality, durationSeconds = 0) => {
  const { error } = await supabase.from('muraja_log').insert({
    user_id: userId, surah_id: surahId, quality, duration_seconds: durationSeconds,
  })
  if (error) throw error
}

export const loadReminders = async (userId) => {
  const { data, error } = await supabase.from('jadwal_reminder').select('*').eq('user_id', userId)
  if (error) throw error
  return data
}

export const upsertReminder = async (userId, sesi, aktif) => {
  const { error } = await supabase.from('jadwal_reminder').upsert({
    user_id: userId, sesi, aktif, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,sesi' })
  if (error) throw error
}
