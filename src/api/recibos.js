import supabase from '../lib/supabase'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, startOfYear } from 'date-fns'

export async function uploadRecibo(file, data) {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${timestamp}_${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('recibos-pdf')
    .upload(path, file, { contentType: 'application/pdf' })

  if (uploadError) throw uploadError

  const { data: record, error: insertError } = await supabase
    .from('recibos')
    .insert({
      nombre_archivo: file.name,
      ruta_archivo: path,
      monto: parseFloat(data.monto),
      operador: data.operador,
      fecha: data.fecha,
      notas: data.notas || null,
    })
    .select()
    .single()

  if (insertError) {
    await supabase.storage.from('recibos-pdf').remove([path])
    throw insertError
  }

  return record
}

export async function getRecibos({ mes, operador, page = 1, pageSize = 20 } = {}) {
  let query = supabase.from('recibos').select('*', { count: 'exact' })

  if (mes) {
    const [year, month] = mes.split('-')
    const start = `${year}-${month}-01`
    const end = format(endOfMonth(new Date(year, parseInt(month) - 1, 1)), 'yyyy-MM-dd')
    query = query.gte('fecha', start).lte('fecha', end)
  }

  if (operador && operador !== 'TODOS') {
    query = query.eq('operador', operador)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .order('fecha', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { data, count }
}

export async function getReciboById(id) {
  const { data, error } = await supabase
    .from('recibos')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function deleteRecibo(id) {
  const { data: recibo } = await supabase
    .from('recibos')
    .select('ruta_archivo')
    .eq('id', id)
    .single()

  if (recibo?.ruta_archivo) {
    await supabase.storage.from('recibos-pdf').remove([recibo.ruta_archivo])
  }

  const { error } = await supabase.from('recibos').delete().eq('id', id)
  if (error) throw error
}

export async function getResumen() {
  const now = new Date()
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const prevWeekStart = format(startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const prevWeekEnd = format(endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const yearStart = format(startOfYear(now), 'yyyy-MM-dd')
  const yearEnd = format(now, 'yyyy-MM-dd')

  const [semanaActual, semanaAnterior, mes, anio] = await Promise.all([
    supabase.from('recibos').select('monto').gte('fecha', weekStart).lte('fecha', weekEnd),
    supabase.from('recibos').select('monto').gte('fecha', prevWeekStart).lte('fecha', prevWeekEnd),
    supabase.from('recibos').select('monto').gte('fecha', monthStart).lte('fecha', monthEnd),
    supabase.from('recibos').select('monto').gte('fecha', yearStart).lte('fecha', yearEnd),
  ])

  const sum = (rows) => (rows.data || []).reduce((acc, r) => acc + parseFloat(r.monto), 0)

  return {
    semanaActual: sum(semanaActual),
    semanaAnterior: sum(semanaAnterior),
    mes: sum(mes),
    anio: sum(anio),
  }
}

export async function getWeeklySummary() {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const { data, error } = await supabase
    .from('recibos')
    .select('fecha, monto')
    .gte('fecha', format(weekStart, 'yyyy-MM-dd'))
    .lte('fecha', format(weekEnd, 'yyyy-MM-dd'))

  if (error) throw error

  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const result = days.map((day, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const total = (data || [])
      .filter(r => r.fecha === dateStr)
      .reduce((acc, r) => acc + parseFloat(r.monto), 0)
    return { day, total, date: dateStr }
  })

  return result
}

export async function getMonthlySummary() {
  const now = new Date()
  const yearStart = format(startOfYear(now), 'yyyy-MM-dd')
  const yearEnd = format(now, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('recibos')
    .select('fecha, monto')
    .gte('fecha', yearStart)
    .lte('fecha', yearEnd)

  if (error) throw error

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const result = months.map((month, i) => {
    const total = (data || [])
      .filter(r => {
        const d = new Date(r.fecha + 'T00:00:00')
        return d.getMonth() === i && d.getFullYear() === now.getFullYear()
      })
      .reduce((acc, r) => acc + parseFloat(r.monto), 0)
    return { month, total }
  })

  return result
}

export async function getOperatorSummary() {
  const { data, error } = await supabase.from('recibos').select('operador, monto')
  if (error) throw error

  const operadores = ['NT', 'JOSUE', 'LS']
  const colors = ['#FFD700', '#374151', '#9CA3AF']

  return operadores.map((op, i) => {
    const total = (data || [])
      .filter(r => r.operador === op)
      .reduce((acc, r) => acc + parseFloat(r.monto), 0)
    return { name: op, value: total, color: colors[i] }
  })
}

export async function getDailySummaryCurrentMonth() {
  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('recibos')
    .select('fecha, monto')
    .gte('fecha', monthStart)
    .lte('fecha', monthEnd)

  if (error) throw error

  const daysInMonth = endOfMonth(now).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateStr = format(new Date(now.getFullYear(), now.getMonth(), day), 'yyyy-MM-dd')
    const total = (data || [])
      .filter(r => r.fecha === dateStr)
      .reduce((acc, r) => acc + parseFloat(r.monto), 0)
    return { day, total, date: dateStr }
  })
}

export async function getComparisonMonths() {
  const now = new Date()
  const prevMonth = subMonths(now, 1)

  const [currentData, prevData] = await Promise.all([
    supabase
      .from('recibos')
      .select('fecha, monto')
      .gte('fecha', format(startOfMonth(now), 'yyyy-MM-dd'))
      .lte('fecha', format(endOfMonth(now), 'yyyy-MM-dd')),
    supabase
      .from('recibos')
      .select('fecha, monto')
      .gte('fecha', format(startOfMonth(prevMonth), 'yyyy-MM-dd'))
      .lte('fecha', format(endOfMonth(prevMonth), 'yyyy-MM-dd')),
  ])

  const daysInMonth = Math.max(endOfMonth(now).getDate(), endOfMonth(prevMonth).getDate())

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const currDate = format(new Date(now.getFullYear(), now.getMonth(), day), 'yyyy-MM-dd')
    const prevDate = format(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day), 'yyyy-MM-dd')

    const curr = (currentData.data || [])
      .filter(r => r.fecha === currDate)
      .reduce((acc, r) => acc + parseFloat(r.monto), 0)
    const prev = (prevData.data || [])
      .filter(r => r.fecha === prevDate)
      .reduce((acc, r) => acc + parseFloat(r.monto), 0)

    return { day, actual: curr, anterior: prev }
  })
}

export function getPdfUrl(ruta_archivo) {
  const { data } = supabase.storage.from('recibos-pdf').getPublicUrl(ruta_archivo)
  return data.publicUrl
}
