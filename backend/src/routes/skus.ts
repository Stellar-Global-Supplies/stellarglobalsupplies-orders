import { Router, Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate, AuthRequest } from '../middleware/authenticate.js'

const router = Router()

// Get all SKUs
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('top_sku')
      .select('*')
      .order('sku', { ascending: true })

    if (error) throw error

    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch SKUs' })
  }
})

export default router
