const nlpService = require('../services/nlpService');

class NLPController {
  async processQuery(req, res) {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const result = await nlpService.analyzeQuery(query);
      res.json(result);
    } catch (error) {
      console.error('Error processing query:', error);
      res.status(500).json({ error: 'Failed to process query' });
    }
  }
}

module.exports = new NLPController();