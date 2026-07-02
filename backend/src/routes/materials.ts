import { Router, Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate, AuthRequest } from '../middleware/authenticate.js'

const router = Router()

// Get all materials
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('material_spilt')
      .select('*')
      .order('material', { ascending: true })

    if (error) throw error

    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch materials' })
  }
})

export default router
